import { categoryStats, totalIncome, totalSavings, totalSpent } from "./calculations";
import type { TranslationKey } from "./i18n";
import type { Goal, MonthBudget } from "./types";

export interface ScoreComponent {
  labelKey: TranslationKey;
  points: number;
  max: number;
}

export interface BudgetScore {
  /** 0-100 */
  score: number;
  labelKey: TranslationKey;
  components: ScoreComponent[];
}

function round1(v: number): number {
  return Math.round(v * 10) / 10;
}

/**
 * Budget health score (0-100), fully explainable: each component reports
 * its earned points and its maximum. Pure function — recomputes instantly
 * whenever the data changes.
 */
export function computeScore(
  months: Record<string, MonthBudget>,
  currentKey: string,
  goals: Goal[],
  now: Date = new Date()
): BudgetScore {
  const m = months[currentKey];
  const components: ScoreComponent[] = [];

  if (!m || totalIncome(m) <= 0) {
    return { score: 0, labelKey: "score.poor", components };
  }

  const income = totalIncome(m);
  const spent = totalSpent(m);
  const stats = categoryStats(m, now);

  // 1. Savings rate — full points at 20% of income saved (25 pts)
  const savingsRate = totalSavings(m) / income;
  components.push({
    labelKey: "score.savings",
    points: round1(25 * Math.min(1, savingsRate / 0.2)),
    max: 25,
  });

  // 2. Overspending — categories over budget + global overshoot (25 pts)
  const catCount = Math.max(1, stats.length);
  const overCount = stats.filter((s) => s.allowed > 0 && s.spent > s.allowed).length;
  let overspendPoints = 25 * (1 - overCount / catCount);
  if (spent > income) overspendPoints = Math.max(0, overspendPoints - 10);
  components.push({
    labelKey: "score.overspend",
    points: round1(overspendPoints),
    max: 25,
  });

  // 3. Stability — variation of total spending across the last months (15 pts)
  const history = Object.keys(months)
    .filter((k) => k <= currentKey)
    .sort()
    .slice(-4)
    .map((k) => totalSpent(months[k]))
    .filter((v) => v > 0);
  let stabilityPoints = 10; // neutral default without enough history
  if (history.length >= 2) {
    const mean = history.reduce((a, b) => a + b, 0) / history.length;
    const variance =
      history.reduce((s, v) => s + (v - mean) ** 2, 0) / history.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 1;
    stabilityPoints = 15 * (1 - Math.min(1, cv * 2));
  }
  components.push({
    labelKey: "score.stability",
    points: round1(stabilityPoints),
    max: 15,
  });

  // 4. Unexpected expenses — big one-off expenses vs income (15 pts)
  const bigOneOffs = m.expenses.filter(
    (e) => !e.recurring && e.amount > income * 0.1
  ).length;
  components.push({
    labelKey: "score.surprises",
    points: Math.max(0, 15 - bigOneOffs * 5),
    max: 15,
  });

  // 5. Goals progress (10 pts, neutral 5 without goals)
  let goalPoints = 5;
  if (goals.length > 0) {
    const avg =
      goals.reduce((s, g) => s + Math.min(1, g.target > 0 ? g.saved / g.target : 0), 0) /
      goals.length;
    goalPoints = 10 * avg;
  }
  components.push({ labelKey: "score.goals", points: round1(goalPoints), max: 10 });

  // 6. Balanced allocation — percentages sum to 100 + a real savings envelope (10 pts)
  const pctTotal = m.categories.reduce((s, c) => s + c.percentage, 0);
  const savingsPct = m.categories
    .filter((c) => c.isSavings)
    .reduce((s, c) => s + c.percentage, 0);
  const balancePoints = (pctTotal === 100 ? 5 : 0) + (savingsPct >= 5 ? 5 : 0);
  components.push({ labelKey: "score.balance", points: balancePoints, max: 10 });

  const score = Math.round(
    Math.max(0, Math.min(100, components.reduce((s, c) => s + c.points, 0)))
  );

  const labelKey: TranslationKey =
    score >= 85
      ? "score.excellent"
      : score >= 70
        ? "score.good"
        : score >= 50
          ? "score.fair"
          : "score.poor";

  return { score, labelKey, components };
}
