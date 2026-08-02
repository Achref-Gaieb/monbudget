/**
 * AI assistant architecture — interfaces and context building only.
 * No model is called yet: a future provider (Claude API via a backend,
 * local LLM…) just needs to implement AssistantProvider and register
 * itself with setAssistantProvider(). The UI can then be built against
 * these stable contracts.
 */
import { categoryStats, computeForecast, periodStats, totalIncome, totalSpent } from "./calculations";
import type { Insight } from "./insights";
import type { BudgetScore } from "./score";
import type { Goal, MonthBudget } from "./types";

/** Structured, model-friendly snapshot of the user's finances. */
export interface AssistantContext {
  month: string;
  currency: string;
  income: number;
  spent: number;
  balance: number;
  forecastEndBalance: number;
  dailyAverage: number;
  categories: {
    name: string;
    allowed: number;
    spent: number;
    forecast: number;
    usagePct: number;
  }[];
  goals: { name: string; target: number; saved: number; monthly: number }[];
  score?: BudgetScore;
  insights?: Insight[];
  historyMonths: number;
}

export interface AssistantMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AssistantProvider {
  readonly id: string;
  ask(
    question: string,
    context: AssistantContext,
    history?: AssistantMessage[]
  ): Promise<string>;
}

/** Questions the future assistant UI will suggest. */
export const SUGGESTED_QUESTIONS = [
  "Où part mon argent ?",
  "Comment économiser 300 € ?",
  "Quel scénario est le meilleur ?",
  "Pourquoi ai-je dépassé mon budget ?",
] as const;

export function buildAssistantContext(
  months: Record<string, MonthBudget>,
  currentKey: string,
  goals: Goal[],
  currency: string,
  extras?: { score?: BudgetScore; insights?: Insight[] },
  now: Date = new Date()
): AssistantContext {
  const m = months[currentKey];
  const income = totalIncome(m);
  const spent = totalSpent(m);
  const forecast = computeForecast(m, now);
  const period = periodStats(m, now);

  return {
    month: currentKey,
    currency,
    income,
    spent,
    balance: income - spent,
    forecastEndBalance: forecast.endBalance,
    dailyAverage: period.dailyAverage,
    categories: categoryStats(m, now).map((s) => ({
      name: s.category.name,
      allowed: Math.round(s.allowed),
      spent: Math.round(s.spent),
      forecast: Math.round(s.forecast),
      usagePct: Number.isFinite(s.usage) ? Math.round(s.usage) : -1,
    })),
    goals: goals.map((g) => ({
      name: g.name,
      target: g.target,
      saved: g.saved,
      monthly: g.monthly,
    })),
    score: extras?.score,
    insights: extras?.insights,
    historyMonths: Object.keys(months).length,
  };
}

let provider: AssistantProvider | null = null;

export function setAssistantProvider(p: AssistantProvider): void {
  provider = p;
}

export function getAssistantProvider(): AssistantProvider | null {
  return provider;
}

export function isAssistantConfigured(): boolean {
  return provider !== null;
}
