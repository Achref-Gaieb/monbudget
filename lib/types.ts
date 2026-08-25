export type MethodId =
  | "50-30-20"
  | "50-20-30"
  | "60-20-20"
  | "70-20-10"
  | "33-33-33"
  | "custom";

export type Lang = "fr" | "en";
export type Theme = "light" | "dark" | "system";

export type CurrencyCode = "EUR" | "USD" | "GBP" | "MAD" | "TND" | "CHF" | "CAD";

export interface Income {
  id: string;
  name: string;
  amount: number;
}

/**
 * What an outflow does to the money.
 *
 * - `expense`  — consumed: 500 € of rent is gone.
 * - `transfer` — moved: 500 € into savings, a goal or (later) an investment
 *   holding. Still leaves the month's spendable pool, but it is not
 *   consumption and must not be reported as such.
 *
 * Everything defaults to `expense`, so today's figures are unchanged. The
 * discriminator exists now so the Investments module can arrive without a
 * migration of every past record.
 */
export type FlowKind = "expense" | "transfer";

export interface Expense {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
  description?: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  recurring: boolean;
  color: string;
  /** Defaults to "expense" when absent. */
  kind?: FlowKind;
  /** What received the money: a goal id today, a holding id later. */
  destinationId?: string;
  /**
   * Currency of `amount` when it differs from the budget currency — reserved
   * for assets priced in USD and the like. Absent means the budget currency.
   */
  currency?: CurrencyCode;
}

export interface Category {
  id: string;
  name: string;
  /**
   * Share of total income, 0-100. Stays the single source of truth for every
   * budget calculation, including for pinned categories — `fixedAmount` only
   * decides what gets recomputed when the income changes.
   */
  percentage: number;
  color: string;
  /** Key into the icon registry */
  icon: string;
  /** Expenses in this category count as savings (Épargne card) */
  isSavings?: boolean;
  /**
   * Pinned budget in euros. When set, the amount is what the user chose and
   * `percentage` is recomputed from it whenever the income changes. When
   * absent, the share is what they chose and the amount follows the income.
   */
  fixedAmount?: number;
}

export interface MonthBudget {
  /** YYYY-MM */
  month: string;
  method: MethodId;
  incomes: Income[];
  categories: Category[];
  expenses: Expense[];
}

/**
 * A goal is generic on purpose: name + target + current + contribution.
 * "investment" is reserved for the future Investments module (retirement,
 * capital targets) and is not offered in the UI yet.
 */
export type GoalKind = "saving" | "debt" | "investment";

export interface Goal {
  id: string;
  name: string;
  icon: string;
  color: string;
  target: number;
  /** Amount reached: saved for a goal, repaid for a debt. */
  saved: number;
  /** Planned monthly contribution, used for the time estimate */
  monthly: number;
  /** Absent means "saving" — no migration needed for existing goals. */
  type?: GoalKind;
  /** Optional deadline, ISO date. */
  targetDate?: string;
}

export interface Settings {
  userName: string;
  currency: CurrencyCode;
  language: Lang;
  theme: Theme;
  /** Accent color id from the ACCENTS palette */
  accent: string;
}

export type PlanId = "free" | "premium";

export interface ProfileMeta {
  id: string;
  name: string;
  /** Key into the icon registry */
  icon: string;
  /** ISO date */
  createdAt: string;
}

/** Budget data belonging to one profile. */
export interface ProfileData {
  months: Record<string, MonthBudget>;
  currentMonth: string;
  goals: Goal[];
}

export interface PersistedData {
  months: Record<string, MonthBudget>;
  currentMonth: string;
  goals: Goal[];
  settings: Settings;
  onboarded: boolean;
  /** v2 fields — optional so v1 backups still import */
  plan?: PlanId;
  profiles?: ProfileMeta[];
  activeProfileId?: string;
  /** Data snapshots of the non-active profiles */
  inactiveProfiles?: Record<string, ProfileData>;
}
