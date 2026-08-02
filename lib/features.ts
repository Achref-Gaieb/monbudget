"use client";

import { useBudgetStore } from "./store";

export type Plan = "free" | "premium";

export type FeatureId =
  | "budgetScore"
  | "smartInsights"
  | "multipleProfiles"
  | "unlimitedHistory"
  | "exports"
  | "premiumThemes"
  | "cloudSync"
  | "aiAssistant";

/**
 * Single source of truth for the Free / Premium split.
 * Flip a value here to move a feature between plans — nothing else changes.
 *
 * Free keeps: unlimited categories, overspend alerts, scenario simulator,
 * essential charts, 1 profile, 3-month history, JSON backup (data ownership).
 */
export const FEATURE_MIN_PLAN: Record<FeatureId, Plan> = {
  budgetScore: "premium",
  smartInsights: "premium",
  multipleProfiles: "premium",
  unlimitedHistory: "premium",
  exports: "premium",
  premiumThemes: "premium",
  cloudSync: "premium", // future
  aiAssistant: "premium", // future
};

/** Months of history visible on the free plan. */
export const FREE_HISTORY_MONTHS = 3;

export function isFeatureEnabled(plan: Plan, feature: FeatureId): boolean {
  return FEATURE_MIN_PLAN[feature] === "free" || plan === "premium";
}

/** Reactive hook: true when the active plan unlocks the feature. */
export function useFeature(feature: FeatureId): boolean {
  const plan = useBudgetStore((s) => s.plan);
  return isFeatureEnabled(plan, feature);
}
