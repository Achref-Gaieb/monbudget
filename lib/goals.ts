import { categoryStats, type CategoryStat } from "./calculations";
import type { Goal, GoalKind, MonthBudget } from "./types";

/** Milestones are derived, never stored: they follow the target as it changes. */
export const MILESTONES = [25, 50, 75, 100] as const;

export interface GoalProgress {
  kind: GoalKind;
  /** 0-100, capped */
  percent: number;
  remaining: number;
  reached: boolean;
  /** Months left at the planned contribution, null when none is planned */
  monthsLeft: number | null;
  /** Highest milestone already passed, 0 when none */
  lastMilestone: number;
}

export function goalKind(goal: Goal): GoalKind {
  return goal.type ?? "saving";
}

export function goalProgress(goal: Goal): GoalProgress {
  const percent =
    goal.target > 0 ? Math.min(100, (goal.saved / goal.target) * 100) : 0;
  const remaining = Math.max(0, goal.target - goal.saved);
  const reached = goal.target > 0 && remaining === 0;
  return {
    kind: goalKind(goal),
    percent,
    remaining,
    reached,
    monthsLeft:
      goal.monthly > 0 && !reached ? Math.ceil(remaining / goal.monthly) : null,
    lastMilestone: MILESTONES.filter((m) => percent >= m).pop() ?? 0,
  };
}

export interface SavingsPlan {
  /** Budgeted savings for the month, from the categories flagged as savings */
  envelope: number;
  /** Sum of the monthly contributions planned on savings goals */
  allocated: number;
  /** envelope - allocated; negative means goals ask for more than budgeted */
  unallocated: number;
  hasSavingsCategory: boolean;
}

/**
 * Connects the budget to the goals: what the month sets aside for savings,
 * versus what the goals actually claim. Reported as information, never as
 * an error — a gap is a legitimate state.
 */
export function savingsPlan(
  month: MonthBudget | undefined,
  goals: Goal[],
  stats?: CategoryStat[]
): SavingsPlan {
  const categoryStatsList = stats ?? categoryStats(month);
  const savingsStats = categoryStatsList.filter((s) => s.category.isSavings);
  const envelope = savingsStats.reduce((sum, s) => sum + s.allowed, 0);
  // Debt repayment usually comes out of everyday spending, not the savings
  // envelope, so only savings goals are counted against it.
  const allocated = goals
    .filter((g) => goalKind(g) === "saving" && !goalProgress(g).reached)
    .reduce((sum, g) => sum + g.monthly, 0);
  return {
    envelope,
    allocated,
    unallocated: envelope - allocated,
    hasSavingsCategory: savingsStats.length > 0,
  };
}
