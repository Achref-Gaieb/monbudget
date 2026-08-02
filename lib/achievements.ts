import { categoryStats, totalIncome, totalSavings, totalSpent } from "./calculations";
import { monthKey } from "./format";
import type { TranslationKey } from "./i18n";
import type { Goal, MonthBudget } from "./types";

export interface Achievement {
  id: string;
  icon: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  unlocked: boolean;
  /** 0-1 progress toward unlocking (1 when unlocked) */
  progress: number;
}

/**
 * Gamification engine: achievements are derived from the data, so they
 * unlock (and update) instantly and never need separate persistence.
 */
export function computeAchievements(
  months: Record<string, MonthBudget>,
  currentKey: string,
  goals: Goal[],
  now: Date = new Date()
): Achievement[] {
  const keys = Object.keys(months).sort();
  const current = months[currentKey];
  const isRealCurrentMonth = currentKey === monthKey(now);
  const day = now.getDate();

  const hasBudget = keys.some((k) => totalIncome(months[k]) > 0);
  const hasExpense = keys.some((k) => months[k].expenses.length > 0);

  // 7 days into the current month without any category over budget
  const currentStats = current ? categoryStats(current, now) : [];
  const noOverspendNow = currentStats.every(
    (s) => s.allowed <= 0 || s.spent <= s.allowed
  );
  const weekNoOver =
    isRealCurrentMonth && day >= 7 && noOverspendNow && Boolean(current);
  const weekProgress = weekNoOver
    ? 1
    : isRealCurrentMonth && noOverspendNow
      ? Math.min(1, day / 7)
      : 0;

  // Cumulative savings across all months
  const savedTotal = keys.reduce((s, k) => s + totalSavings(months[k]), 0);

  // Longest run of consecutive months with a non-negative balance
  let bestRun = 0;
  let run = 0;
  for (const k of keys) {
    const m = months[k];
    const income = totalIncome(m);
    if (income > 0 && income - totalSpent(m) >= 0) {
      run += 1;
      bestRun = Math.max(bestRun, run);
    } else {
      run = 0;
    }
  }

  const goalReached = goals.some((g) => g.target > 0 && g.saved >= g.target);
  const bestGoalProgress = goals.reduce(
    (best, g) => Math.max(best, g.target > 0 ? Math.min(1, g.saved / g.target) : 0),
    0
  );

  return [
    {
      id: "first-budget",
      icon: "wallet",
      titleKey: "ach.firstBudget",
      descKey: "ach.firstBudgetDesc",
      unlocked: hasBudget,
      progress: hasBudget ? 1 : 0,
    },
    {
      id: "first-expense",
      icon: "receipt",
      titleKey: "ach.firstExpense",
      descKey: "ach.firstExpenseDesc",
      unlocked: hasExpense,
      progress: hasExpense ? 1 : 0,
    },
    {
      id: "week-no-overspend",
      icon: "shield",
      titleKey: "ach.weekNoOver",
      descKey: "ach.weekNoOverDesc",
      unlocked: weekNoOver,
      progress: weekProgress,
    },
    {
      id: "saver-1000",
      icon: "piggy-bank",
      titleKey: "ach.saver1000",
      descKey: "ach.saver1000Desc",
      unlocked: savedTotal >= 1000,
      progress: Math.min(1, savedTotal / 1000),
    },
    {
      id: "balanced-3",
      icon: "trending-up",
      titleKey: "ach.balanced3",
      descKey: "ach.balanced3Desc",
      unlocked: bestRun >= 3,
      progress: Math.min(1, bestRun / 3),
    },
    {
      id: "goal-reached",
      icon: "target",
      titleKey: "ach.goalReached",
      descKey: "ach.goalReachedDesc",
      unlocked: goalReached,
      progress: goalReached ? 1 : bestGoalProgress,
    },
    {
      id: "custom-budget",
      icon: "sparkles",
      titleKey: "ach.customBudget",
      descKey: "ach.customBudgetDesc",
      unlocked: current?.method === "custom",
      progress: current?.method === "custom" ? 1 : 0,
    },
    {
      id: "historian",
      icon: "line-chart",
      titleKey: "ach.historian",
      descKey: "ach.historianDesc",
      unlocked: keys.length >= 3,
      progress: Math.min(1, keys.length / 3),
    },
  ];
}
