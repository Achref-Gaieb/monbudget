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
 *
 * Everything is free today: there is nothing to sell yet, and gating degraded
 * the experience for every single user — blurred panels, locked history — to
 * rehearse a business model that does not exist. The plumbing stays, so the
 * day there is something to sell, flipping a value here is the whole change.
 */
export const FEATURE_MIN_PLAN: Record<FeatureId, Plan> = {
  budgetScore: "free",
  smartInsights: "free",
  multipleProfiles: "free",
  unlimitedHistory: "free",
  exports: "free",
  premiumThemes: "free",
  cloudSync: "free", // future
  aiAssistant: "free", // future
};

/** Months of history visible when `unlimitedHistory` is gated. */
export const FREE_HISTORY_MONTHS = 3;

export function isFeatureEnabled(plan: Plan, feature: FeatureId): boolean {
  return FEATURE_MIN_PLAN[feature] === "free" || plan === "premium";
}

/** Reactive hook: true when the active plan unlocks the feature. */
export function useFeature(feature: FeatureId): boolean {
  const plan = useBudgetStore((s) => s.plan);
  return isFeatureEnabled(plan, feature);
}
