import { daysInMonth, monthKey } from "./format";
import { COLOR } from "./tokens";
import type { Category, Expense, MonthBudget } from "./types";

export interface CategoryStat {
  category: Category;
  allowed: number;
  spent: number;
  remaining: number;
  /** 0-100+, percentage of allowed budget used */
  usage: number;
  /** Number of expenses recorded in this category */
  expenseCount: number;
  /**
   * Projected end-of-month spend for this category: recurring expenses count
   * in full, variable spending is extrapolated from the daily pace so far.
   * Equals `spent` for past months.
   */
  forecast: number;
  /** allowed - forecast; positive = projected under budget */
  forecastGap: number;
}

export function totalIncome(m: MonthBudget | undefined): number {
  if (!m) return 0;
  return m.incomes.reduce((s, i) => s + i.amount, 0);
}

export function totalSpent(m: MonthBudget | undefined): number {
  if (!m) return 0;
  return m.expenses.reduce((s, e) => s + e.amount, 0);
}

export function totalSavings(m: MonthBudget | undefined): number {
  if (!m) return 0;
  const savingsIds = new Set(
    m.categories.filter((c) => c.isSavings).map((c) => c.id)
  );
  return m.expenses
    .filter((e) => savingsIds.has(e.categoryId))
    .reduce((s, e) => s + e.amount, 0);
}

export function categoryStats(
  m: MonthBudget | undefined,
  now: Date = new Date()
): CategoryStat[] {
  if (!m) return [];
  const income = totalIncome(m);
  const isCurrentMonth = monthKey(now) === m.month;
  const dim = daysInMonth(m.month);
  const day = Math.max(1, Math.min(now.getDate(), dim));

  return m.categories.map((category) => {
    const expenses = m.expenses.filter((e) => e.categoryId === category.id);
    const allowed = (income * category.percentage) / 100;
    const spent = expenses.reduce((s, e) => s + e.amount, 0);
    const recurring = expenses
      .filter((e) => e.recurring)
      .reduce((s, e) => s + e.amount, 0);
    const variable = spent - recurring;
    const forecast = isCurrentMonth
      ? recurring + (variable / day) * dim
      : spent;
    return {
      category,
      allowed,
      spent,
      remaining: allowed - spent,
      usage: allowed > 0 ? (spent / allowed) * 100 : spent > 0 ? Infinity : 0,
      expenseCount: expenses.length,
      forecast,
      forecastGap: allowed - forecast,
    };
  });
}

/** Color for a usage level: category color below 80%, then warning / caution / danger. */
export function usageColor(usage: number, base: string): string {
  if (usage >= 100) return COLOR.negative;
  if (usage >= 90) return COLOR.caution;
  if (usage >= 80) return COLOR.warning;
  return base;
}

export interface Forecast {
  isCurrentMonth: boolean;
  projectedSpend: number;
  /** Projected end-of-month balance: income - projectedSpend */
  endBalance: number;
}

/**
 * Projection based on the current spending pace: recurring expenses count
 * in full, variable spending is extrapolated from the daily average so far.
 */
export function computeForecast(
  m: MonthBudget | undefined,
  now: Date = new Date()
): Forecast {
  if (!m) return { isCurrentMonth: false, projectedSpend: 0, endBalance: 0 };
  const income = totalIncome(m);
  const spent = totalSpent(m);
  const isCurrentMonth = monthKey(now) === m.month;
  if (!isCurrentMonth) {
    return { isCurrentMonth, projectedSpend: spent, endBalance: income - spent };
  }
  const dim = daysInMonth(m.month);
  const day = Math.max(1, now.getDate());
  const recurring = m.expenses
    .filter((e) => e.recurring)
    .reduce((s, e) => s + e.amount, 0);
  const variable = spent - recurring;
  const projectedSpend = recurring + (variable / day) * dim;
  return { isCurrentMonth, projectedSpend, endBalance: income - projectedSpend };
}

/** Total spent per day of month, for the heatmap. Index 0 = day 1. */
export function dailySpending(m: MonthBudget | undefined): number[] {
  if (!m) return [];
  const dim = daysInMonth(m.month);
  const days = new Array<number>(dim).fill(0);
  for (const e of m.expenses) {
    if (!e.date.startsWith(m.month)) continue;
    const day = Number(e.date.slice(8, 10));
    if (day >= 1 && day <= dim) days[day - 1] += e.amount;
  }
  return days;
}

export interface MonthPoint {
  month: string;
  income: number;
  spent: number;
  savings: number;
  balance: number;
}

export function evolutionData(months: Record<string, MonthBudget>): MonthPoint[] {
  return Object.keys(months)
    .sort()
    .map((key) => {
      const m = months[key];
      const income = totalIncome(m);
      const spent = totalSpent(m);
      return {
        month: key,
        income,
        spent,
        savings: totalSavings(m),
        balance: income - spent,
      };
    });
}

export interface PeriodStats {
  spentToday: number;
  /** Spending in the current calendar week (Monday-based), clamped to the month */
  spentThisWeek: number;
  /** Average spend per elapsed day */
  dailyAverage: number;
  weeklyAverage: number;
  biggestExpense: Expense | null;
  topCategory: { category: Category; spent: number } | null;
  /** Total of recurring (fixed) expenses */
  fixedExpenses: number;
  /** "Reste à vivre": income minus fixed expenses */
  disposable: number;
}

/** Day-level statistics for the dashboard. Uses full-month values for past months. */
export function periodStats(
  m: MonthBudget | undefined,
  now: Date = new Date()
): PeriodStats {
  const empty: PeriodStats = {
    spentToday: 0,
    spentThisWeek: 0,
    dailyAverage: 0,
    weeklyAverage: 0,
    biggestExpense: null,
    topCategory: null,
    fixedExpenses: 0,
    disposable: 0,
  };
  if (!m) return empty;

  const income = totalIncome(m);
  const spent = totalSpent(m);
  const isCurrentMonth = monthKey(now) === m.month;
  const dim = daysInMonth(m.month);
  const elapsed = isCurrentMonth ? Math.max(1, Math.min(now.getDate(), dim)) : dim;
  const todayIso = `${m.month}-${String(now.getDate()).padStart(2, "0")}`;

  // Monday-based start of the current week, clamped to the month
  const weekday = (now.getDay() + 6) % 7;
  const weekStartDay = Math.max(1, now.getDate() - weekday);
  const weekStartIso = `${m.month}-${String(weekStartDay).padStart(2, "0")}`;

  const biggestExpense = m.expenses.reduce<Expense | null>(
    (best, e) => (best === null || e.amount > best.amount ? e : best),
    null
  );

  const spentByCategory = new Map<string, number>();
  for (const e of m.expenses) {
    spentByCategory.set(
      e.categoryId,
      (spentByCategory.get(e.categoryId) ?? 0) + e.amount
    );
  }
  let topCategory: PeriodStats["topCategory"] = null;
  for (const category of m.categories) {
    const catSpent = spentByCategory.get(category.id) ?? 0;
    if (catSpent > 0 && (topCategory === null || catSpent > topCategory.spent)) {
      topCategory = { category, spent: catSpent };
    }
  }

  const fixedExpenses = m.expenses
    .filter((e) => e.recurring)
    .reduce((s, e) => s + e.amount, 0);

  return {
    spentToday: isCurrentMonth
      ? m.expenses
          .filter((e) => e.date === todayIso)
          .reduce((s, e) => s + e.amount, 0)
      : 0,
    spentThisWeek: isCurrentMonth
      ? m.expenses
          .filter((e) => e.date >= weekStartIso && e.date <= todayIso)
          .reduce((s, e) => s + e.amount, 0)
      : 0,
    dailyAverage: spent / elapsed,
    weeklyAverage: (spent / elapsed) * 7,
    biggestExpense,
    topCategory,
    fixedExpenses,
    disposable: income - fixedExpenses,
  };
}

/**
 * Collapses a month's categories into the three classic envelopes
 * (needs / wants / savings) for previews and simulations.
 */
export function deriveEnvelopeSplit(
  m: MonthBudget | undefined
): [number, number, number] {
  if (!m || m.categories.length === 0) return [50, 30, 20];
  const savings = m.categories
    .filter((c) => c.isSavings)
    .reduce((s, c) => s + c.percentage, 0);
  const nonSavings = m.categories.filter((c) => !c.isSavings);
  const needs = nonSavings.length
    ? Math.max(...nonSavings.map((c) => c.percentage))
    : 0;
  const wants = Math.max(0, 100 - savings - needs);
  return [needs, wants, savings];
}

export function filterExpenses(
  expenses: Expense[],
  opts: {
    query?: string;
    categoryId?: string;
    type?: "all" | "recurring" | "one-time";
    minAmount?: number;
    maxAmount?: number;
  }
): Expense[] {
  const q = (opts.query ?? "").trim().toLowerCase();
  return expenses.filter((e) => {
    if (q && !`${e.name} ${e.description ?? ""}`.toLowerCase().includes(q))
      return false;
    if (opts.categoryId && opts.categoryId !== "all" && e.categoryId !== opts.categoryId)
      return false;
    if (opts.type === "recurring" && !e.recurring) return false;
    if (opts.type === "one-time" && e.recurring) return false;
    if (opts.minAmount !== undefined && e.amount < opts.minAmount) return false;
    if (opts.maxAmount !== undefined && e.amount > opts.maxAmount) return false;
    return true;
  });
}
