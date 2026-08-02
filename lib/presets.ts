import type { Category, CurrencyCode, MethodId } from "./types";

export interface MethodPreset {
  id: MethodId;
  label: string;
  split: [number, number, number];
}

export const METHOD_PRESETS: MethodPreset[] = [
  { id: "50-30-20", label: "50 / 30 / 20", split: [50, 30, 20] },
  { id: "50-20-30", label: "50 / 20 / 30", split: [50, 20, 30] },
  { id: "60-20-20", label: "60 / 20 / 20", split: [60, 20, 20] },
  { id: "70-20-10", label: "70 / 20 / 10", split: [70, 20, 10] },
  { id: "33-33-33", label: "33 / 33 / 33", split: [34, 33, 33] },
];

export const PALETTE = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#3b82f6", // blue
];

export const ACCENTS: { id: string; label: string; value: string }[] = [
  { id: "indigo", label: "Indigo", value: "#6366f1" },
  { id: "violet", label: "Violet", value: "#8b5cf6" },
  { id: "blue", label: "Bleu", value: "#3b82f6" },
  { id: "emerald", label: "Émeraude", value: "#10b981" },
  { id: "rose", label: "Rose", value: "#f43f5e" },
  { id: "amber", label: "Ambre", value: "#f59e0b" },
];

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: "EUR", symbol: "€", label: "Euro (€)" },
  { code: "USD", symbol: "$", label: "Dollar US ($)" },
  { code: "GBP", symbol: "£", label: "Livre sterling (£)" },
  { code: "MAD", symbol: "MAD", label: "Dirham marocain (MAD)" },
  { code: "TND", symbol: "TND", label: "Dinar tunisien (TND)" },
  { code: "CHF", symbol: "CHF", label: "Franc suisse (CHF)" },
  { code: "CAD", symbol: "$", label: "Dollar canadien ($)" },
];

export function defaultCategories(
  split: [number, number, number] = [50, 30, 20],
  lang: "fr" | "en" = "fr"
): Category[] {
  const names =
    lang === "fr"
      ? ["Charges (Besoins)", "Plaisirs", "Épargne / Investissement"]
      : ["Needs", "Wants", "Savings / Investing"];
  return [
    {
      id: crypto.randomUUID(),
      name: names[0],
      percentage: split[0],
      color: "#6366f1",
      icon: "home",
    },
    {
      id: crypto.randomUUID(),
      name: names[1],
      percentage: split[1],
      color: "#ec4899",
      icon: "sparkles",
    },
    {
      id: crypto.randomUUID(),
      name: names[2],
      percentage: split[2],
      color: "#10b981",
      icon: "piggy-bank",
      isSavings: true,
    },
  ];
}
