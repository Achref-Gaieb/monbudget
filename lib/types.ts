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
}

export interface Category {
  id: string;
  name: string;
  /** Share of total income, 0-100 */
  percentage: number;
  color: string;
  /** Key into the icon registry */
  icon: string;
  /** Expenses in this category count as savings (Épargne card) */
  isSavings?: boolean;
}

export interface MonthBudget {
  /** YYYY-MM */
  month: string;
  method: MethodId;
  incomes: Income[];
  categories: Category[];
  expenses: Expense[];
}

export interface Goal {
  id: string;
  name: string;
  icon: string;
  color: string;
  target: number;
  saved: number;
  /** Planned monthly contribution, used for the time estimate */
  monthly: number;
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
