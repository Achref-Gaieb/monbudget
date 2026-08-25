import type { TranslationKey } from "./i18n";
import type { Category, MethodId } from "./types";

export interface BudgetTemplate {
  id: string;
  icon: string;
  titleKey: TranslationKey;
  descKey: TranslationKey;
  method: MethodId;
  /** Categories without ids — ids are generated at profile creation */
  categories: Omit<Category, "id">[];
}

const needs = (name: string, percentage: number): Omit<Category, "id"> => ({
  name,
  percentage,
  color: "#6366f1",
  icon: "home",
});
const wants = (name: string, percentage: number): Omit<Category, "id"> => ({
  name,
  percentage,
  color: "#ec4899",
  icon: "sparkles",
});
const savings = (name: string, percentage: number): Omit<Category, "id"> => ({
  name,
  percentage,
  color: "#10b981",
  icon: "piggy-bank",
  isSavings: true,
});

/**
 * Ready-to-use budget models — suggestions, never a structure. Every category
 * can be renamed, recoloured, reordered, deleted or added to afterwards.
 */
export const BUDGET_TEMPLATES: BudgetTemplate[] = [
  {
    id: "detailed",
    icon: "list-checks",
    titleKey: "tpl.detailed",
    descKey: "tpl.detailedDesc",
    method: "custom",
    categories: [
      { name: "Loyer", percentage: 28, color: "#6366f1", icon: "home" },
      { name: "Charges", percentage: 7, color: "#3b82f6", icon: "zap" },
      { name: "Abonnements", percentage: 4, color: "#06b6d4", icon: "wifi" },
      { name: "Charges familiales", percentage: 6, color: "#8b5cf6", icon: "baby" },
      { name: "Courses", percentage: 12, color: "#14b8a6", icon: "shopping-cart" },
      { name: "Transport", percentage: 8, color: "#84cc16", icon: "car" },
      { name: "Restaurants", percentage: 8, color: "#ec4899", icon: "utensils" },
      { name: "Loisirs", percentage: 7, color: "#f43f5e", icon: "gamepad-2" },
      {
        name: "Épargne",
        percentage: 20,
        color: "#10b981",
        icon: "piggy-bank",
        isSavings: true,
      },
    ],
  },
  {
    id: "student",
    icon: "graduation-cap",
    titleKey: "tpl.student",
    descKey: "tpl.studentDesc",
    method: "custom",
    categories: [
      needs("Charges (Besoins)", 60),
      wants("Plaisirs", 25),
      savings("Épargne", 15),
    ],
  },
  {
    id: "young-pro",
    icon: "briefcase",
    titleKey: "tpl.youngPro",
    descKey: "tpl.youngProDesc",
    method: "50-30-20",
    categories: [
      needs("Charges (Besoins)", 50),
      wants("Plaisirs", 30),
      savings("Épargne / Investissement", 20),
    ],
  },
  {
    id: "family",
    icon: "baby",
    titleKey: "tpl.family",
    descKey: "tpl.familyDesc",
    method: "custom",
    categories: [
      needs("Charges (Besoins)", 45),
      { name: "Enfants", percentage: 15, color: "#f59e0b", icon: "baby" },
      wants("Plaisirs", 20),
      savings("Épargne", 20),
    ],
  },
  {
    id: "couple",
    icon: "heart",
    titleKey: "tpl.couple",
    descKey: "tpl.coupleDesc",
    method: "50-30-20",
    categories: [
      needs("Charges communes", 50),
      wants("Plaisirs", 30),
      savings("Épargne commune", 20),
    ],
  },
  {
    id: "freelance",
    icon: "line-chart",
    titleKey: "tpl.freelance",
    descKey: "tpl.freelanceDesc",
    method: "custom",
    categories: [
      needs("Charges (Besoins)", 40),
      { name: "Charges pro & impôts", percentage: 20, color: "#06b6d4", icon: "briefcase" },
      wants("Plaisirs", 15),
      savings("Épargne / Trésorerie", 25),
    ],
  },
  {
    id: "minimalist",
    icon: "shield",
    titleKey: "tpl.minimalist",
    descKey: "tpl.minimalistDesc",
    method: "custom",
    categories: [
      needs("Essentiel", 50),
      wants("Plaisirs", 10),
      savings("Épargne", 40),
    ],
  },
  {
    id: "fire",
    icon: "trending-up",
    titleKey: "tpl.fire",
    descKey: "tpl.fireDesc",
    method: "custom",
    categories: [
      needs("Charges (Besoins)", 40),
      wants("Plaisirs", 10),
      savings("Investissement FIRE", 50),
    ],
  },
];
