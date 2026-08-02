import {
  categoryStats,
  computeForecast,
  totalIncome,
  totalSpent,
} from "./calculations";
import { daysInMonth } from "./format";
import type { TranslationKey } from "./i18n";
import type { MonthBudget } from "./types";

export type InsightSeverity = "positive" | "info" | "warning" | "critical";
export type InsightKind = "recommendation" | "anomaly";

export interface Insight {
  id: string;
  kind: InsightKind;
  severity: InsightSeverity;
  /** Icon registry key (lib/icons.ts) */
  icon: string;
  messageKey: TranslationKey;
  params: Record<string, string | number>;
}

const SEVERITY_ORDER: Record<InsightSeverity, number> = {
  critical: 0,
  warning: 1,
  positive: 2,
  info: 3,
};

interface InsightInput {
  months: Record<string, MonthBudget>;
  currentKey: string;
  /** Formats a raw amount into a display string ("398 €") */
  formatAmount: (v: number) => string;
  now?: Date;
  maxInsights?: number;
}

/**
 * Rule-based recommendation & anomaly engine. Pure function of the data —
 * re-runs instantly whenever an expense changes.
 */
export function computeInsights({
  months,
  currentKey,
  formatAmount,
  now = new Date(),
  maxInsights = 6,
}: InsightInput): Insight[] {
  const m = months[currentKey];
  if (!m) return [];

  const insights: Insight[] = [];
  const income = totalIncome(m);
  const spent = totalSpent(m);
  if (income <= 0) return [];

  const stats = categoryStats(m, now);
  const forecast = computeForecast(m, now);
  const previousKeys = Object.keys(months)
    .filter((k) => k < currentKey)
    .sort();

  // 1. Biggest fixed expense as share of income (e.g. rent)
  const biggestFixed = m.expenses
    .filter((e) => e.recurring)
    .reduce<(typeof m.expenses)[number] | null>(
      (best, e) => (best === null || e.amount > best.amount ? e : best),
      null
    );
  if (biggestFixed && biggestFixed.amount > income * 0.05) {
    const pct = Math.round((biggestFixed.amount / income) * 100);
    insights.push({
      id: `fixed-share-${biggestFixed.id}`,
      kind: "recommendation",
      severity: pct <= 33 ? "positive" : "warning",
      icon: "home",
      messageKey: pct <= 33 ? "insight.fixedShareGood" : "insight.fixedShareHigh",
      params: { name: biggestFixed.name, pct },
    });
  }

  // 2. Total fixed expenses share
  const fixedTotal = m.expenses
    .filter((e) => e.recurring)
    .reduce((s, e) => s + e.amount, 0);
  if (fixedTotal > 0) {
    const pct = Math.round((fixedTotal / income) * 100);
    if (pct >= 60) {
      insights.push({
        id: "fixed-total-high",
        kind: "recommendation",
        severity: "warning",
        icon: "shield",
        messageKey: "insight.recurringShareHigh",
        params: { pct },
      });
    }
  }

  // 3. Extra saving potential from the projected end-of-month balance
  if (forecast.isCurrentMonth && forecast.endBalance > 20) {
    insights.push({
      id: "saving-potential",
      kind: "recommendation",
      severity: "positive",
      icon: "piggy-bank",
      messageKey: "insight.savingPotential",
      params: { amount: formatAmount(forecast.endBalance) },
    });
  }

  // 4. Categories projected to exceed their budget (before it happens)
  for (const s of stats) {
    if (s.allowed > 0 && s.spent <= s.allowed && s.forecast > s.allowed * 1.05) {
      insights.push({
        id: `pace-over-${s.category.id}`,
        kind: "anomaly",
        severity: "critical",
        icon: s.category.icon,
        messageKey: "insight.paceOver",
        params: {
          name: s.category.name,
          amount: formatAmount(s.forecast - s.allowed),
        },
      });
    }
  }

  // 5. Category spending vs historical average (needs >= 2 previous months)
  if (previousKeys.length >= 2) {
    for (const s of stats) {
      const history = previousKeys
        .map((k) => {
          const pm = months[k];
          const match = pm.categories.find((c) => c.name === s.category.name);
          if (!match) return null;
          return pm.expenses
            .filter((e) => e.categoryId === match.id)
            .reduce((sum, e) => sum + e.amount, 0);
        })
        .filter((v): v is number => v !== null && v > 0);
      if (history.length < 2) continue;
      const avg = history.reduce((a, b) => a + b, 0) / history.length;
      const ratio = s.forecast / avg;
      if (ratio >= 1.25) {
        insights.push({
          id: `above-avg-${s.category.id}`,
          kind: "anomaly",
          severity: "warning",
          icon: s.category.icon,
          messageKey: "insight.aboveAverage",
          params: { name: s.category.name, pct: Math.round((ratio - 1) * 100) },
        });
      }
    }
  }

  // 6. Unusually large single expense vs the category's own history
  const allExpensesByCatName = new Map<string, number[]>();
  for (const k of [...previousKeys, currentKey]) {
    const pm = months[k];
    for (const e of pm.expenses) {
      const cat = pm.categories.find((c) => c.id === e.categoryId);
      if (!cat || e.recurring) continue;
      const list = allExpensesByCatName.get(cat.name) ?? [];
      list.push(e.amount);
      allExpensesByCatName.set(cat.name, list);
    }
  }
  for (const e of m.expenses) {
    if (e.recurring) continue;
    const cat = m.categories.find((c) => c.id === e.categoryId);
    if (!cat) continue;
    const amounts = allExpensesByCatName.get(cat.name) ?? [];
    if (amounts.length < 5) continue;
    const sorted = [...amounts].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    if (median > 0 && e.amount >= median * 3 && e.amount > income * 0.05) {
      insights.push({
        id: `unusual-${e.id}`,
        kind: "anomaly",
        severity: "warning",
        icon: "zap",
        messageKey: "insight.unusualExpense",
        params: { name: e.name, amount: formatAmount(e.amount) },
      });
    }
  }

  // 7. Possible duplicate expenses (same name + amount within 2 days)
  const seen = new Map<string, string>();
  for (const e of [...m.expenses].sort((a, b) => a.date.localeCompare(b.date))) {
    const key = `${e.name.toLowerCase().trim()}|${e.amount}`;
    const prevDate = seen.get(key);
    if (prevDate !== undefined && !e.recurring) {
      const dayA = Number(prevDate.slice(8, 10));
      const dayB = Number(e.date.slice(8, 10));
      if (Math.abs(dayB - dayA) <= 2) {
        insights.push({
          id: `duplicate-${e.id}`,
          kind: "anomaly",
          severity: "warning",
          icon: "receipt",
          messageKey: "insight.duplicate",
          params: { name: e.name, amount: formatAmount(e.amount) },
        });
      }
    }
    seen.set(key, e.date);
  }

  // 8. Under-used category late in the month → margin to reallocate
  const dim = daysInMonth(m.month);
  const monthProgress = forecast.isCurrentMonth ? now.getDate() / dim : 1;
  if (monthProgress >= 0.5) {
    for (const s of stats) {
      if (
        s.allowed > income * 0.05 &&
        s.usage > 0 &&
        s.forecast < s.allowed * 0.6
      ) {
        insights.push({
          id: `margin-${s.category.id}`,
          kind: "recommendation",
          severity: "info",
          icon: s.category.icon,
          messageKey: "insight.unusedMargin",
          params: {
            name: s.category.name,
            amount: formatAmount(s.allowed - s.forecast),
          },
        });
      }
    }
  }

  // 9. Annualized saving idea on the biggest non-savings category
  const biggestVariable = stats
    .filter((s) => !s.category.isSavings && s.spent > 0)
    .sort((a, b) => b.spent - a.spent)[0];
  if (biggestVariable && spent > 0) {
    const yearly = biggestVariable.forecast * 0.15 * 12;
    if (yearly >= 100) {
      insights.push({
        id: `annual-saving-${biggestVariable.category.id}`,
        kind: "recommendation",
        severity: "info",
        icon: "trending-up",
        messageKey: "insight.annualSaving",
        params: {
          name: biggestVariable.category.name,
          amount: formatAmount(yearly),
        },
      });
    }
  }

  const deduped = insights.filter(
    (insight, i) => insights.findIndex((x) => x.id === insight.id) === i
  );
  return deduped
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity])
    .slice(0, maxInsights);
}
