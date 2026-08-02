import { daysInMonth, monthKey, shiftMonth, uid } from "./format";
import { DEFAULT_SETTINGS } from "./store";
import type {
  Category,
  Expense,
  MonthBudget,
  PersistedData,
  Settings,
} from "./types";

interface ExpenseTemplate {
  name: string;
  amount: number;
  day: number;
  recurring: boolean;
  cat: 0 | 1 | 2;
  description?: string;
}

const TEMPLATES: ExpenseTemplate[] = [
  // Charges (Besoins)
  { name: "Loyer", amount: 850, day: 2, recurring: true, cat: 0 },
  { name: "EDF", amount: 95, day: 5, recurring: true, cat: 0 },
  { name: "Eau", amount: 38, day: 5, recurring: true, cat: 0 },
  { name: "Internet", amount: 40, day: 7, recurring: true, cat: 0 },
  { name: "Assurance", amount: 65, day: 10, recurring: true, cat: 0 },
  { name: "Courses", amount: 120, day: 3, recurring: false, cat: 0 },
  { name: "Courses", amount: 95, day: 11, recurring: false, cat: 0 },
  { name: "Courses", amount: 135, day: 18, recurring: false, cat: 0 },
  { name: "Courses", amount: 88, day: 26, recurring: false, cat: 0 },
  { name: "Essence", amount: 62, day: 6, recurring: false, cat: 0 },
  { name: "Essence", amount: 58, day: 20, recurring: false, cat: 0 },
  // Plaisirs
  { name: "Netflix", amount: 18, day: 3, recurring: true, cat: 1 },
  { name: "Spotify", amount: 11, day: 3, recurring: true, cat: 1 },
  { name: "Restaurant", amount: 45, day: 6, recurring: false, cat: 1 },
  { name: "Restaurant", amount: 62, day: 14, recurring: false, cat: 1 },
  { name: "Shopping", amount: 89, day: 16, recurring: false, cat: 1 },
  { name: "Cinéma", amount: 24, day: 22, recurring: false, cat: 1 },
  { name: "Sortie bar", amount: 38, day: 27, recurring: false, cat: 1 },
  // Épargne
  { name: "Livret A", amount: 300, day: 1, recurring: true, cat: 2 },
  { name: "ETF Monde", amount: 200, day: 1, recurring: true, cat: 2, description: "PEA — MSCI World" },
  { name: "Assurance vie", amount: 100, day: 4, recurring: true, cat: 2 },
  { name: "Crypto", amount: 50, day: 15, recurring: false, cat: 2 },
];

/** Deterministic per-month variation for one-time amounts. */
const VARIATION = [0.92, 1.06, 0.97, 1.0];

/**
 * Four months of realistic sample data.
 * `keepSettings` carries over the visitor's current appearance preferences.
 */
export function buildDemoData(keepSettings?: Partial<Settings>): PersistedData {
  const now = new Date();
  const currentMonth = monthKey(now);
  const categories: Category[] = [
    { id: uid(), name: "Charges (Besoins)", percentage: 50, color: "#6366f1", icon: "home" },
    { id: uid(), name: "Plaisirs", percentage: 30, color: "#ec4899", icon: "sparkles" },
    { id: uid(), name: "Épargne / Investissement", percentage: 20, color: "#10b981", icon: "piggy-bank", isSavings: true },
  ];

  const months: Record<string, MonthBudget> = {};

  for (let offset = 3; offset >= 0; offset--) {
    const month = shiftMonth(currentMonth, -offset);
    const isCurrent = month === currentMonth;
    const factor = VARIATION[(3 - offset) % VARIATION.length];
    const dim = daysInMonth(month);

    const expenses: Expense[] = TEMPLATES.filter(
      (tpl) =>
        tpl.day <= dim && (!isCurrent || tpl.day <= now.getDate())
    ).map((tpl) => ({
      id: uid(),
      categoryId: categories[tpl.cat].id,
      name: tpl.name,
      amount: tpl.recurring
        ? tpl.amount
        : Math.round(tpl.amount * factor),
      description: tpl.description,
      date: `${month}-${String(tpl.day).padStart(2, "0")}`,
      recurring: tpl.recurring,
      color: categories[tpl.cat].color,
    }));

    // A one-off holiday in the current month to showcase over-budget alerts
    if (isCurrent && now.getDate() >= 5) {
      expenses.push({
        id: uid(),
        categoryId: categories[1].id,
        name: "Voyage Lisbonne",
        amount: 1090,
        description: "Vol + hôtel 3 nuits",
        date: `${month}-05`,
        recurring: false,
        color: categories[1].color,
      });
    }

    months[month] = {
      month,
      method: "50-30-20",
      incomes: [
        { id: uid(), name: "Salaire", amount: 2200 },
        { id: uid(), name: "Prime", amount: 350 },
        { id: uid(), name: "CAF", amount: 180 },
        { id: uid(), name: "Freelance", amount: 600 },
      ],
      categories: categories.map((c) => ({ ...c })),
      expenses,
    };
  }

  return {
    months,
    currentMonth,
    goals: [
      { id: uid(), name: "Épargner 5000€", icon: "piggy-bank", color: "#10b981", target: 5000, saved: 2150, monthly: 300 },
      { id: uid(), name: "Acheter une voiture", icon: "car", color: "#3b82f6", target: 15000, saved: 4200, monthly: 400 },
      { id: uid(), name: "Vacances d'été", icon: "plane", color: "#f59e0b", target: 1800, saved: 950, monthly: 150 },
    ],
    // Appearance preferences belong to the user, not to the sample data:
    // loading the demo must never flip someone's theme or language.
    settings: {
      ...DEFAULT_SETTINGS,
      ...keepSettings,
      userName: "Alex",
    },
    onboarded: true,
    // The demo showcases the full product, premium features included
    plan: "premium",
    profiles: [
      { id: "default", name: "Personnel", icon: "user", createdAt: `${currentMonth}-01` },
    ],
    activeProfileId: "default",
    inactiveProfiles: {},
  };
}
