import type { Lang } from "./types";

export function localeOf(lang: Lang): string {
  return lang === "fr" ? "fr-FR" : "en-US";
}

export function formatCurrency(
  value: number,
  currency: string,
  lang: Lang,
  decimals = 0
): string {
  try {
    return new Intl.NumberFormat(localeOf(lang), {
      style: "currency",
      currency,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  } catch {
    return `${value.toFixed(decimals)} ${currency}`;
  }
}

export function formatNumber(value: number, lang: Lang, decimals = 0): string {
  return new Intl.NumberFormat(localeOf(lang), {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** "2026-07" -> "juillet 2026" */
export function formatMonth(month: string, lang: Lang): string {
  const [y, m] = month.split("-").map(Number);
  const label = new Date(y, m - 1, 1).toLocaleDateString(localeOf(lang), {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

/** "2026-07-15" -> "15 juil. 2026" */
export function formatDate(iso: string, lang: Lang): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(localeOf(lang), {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function monthKey(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

export function daysInMonth(month: string): number {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

/** Shift "2026-07" by n months -> "2026-08" */
export function shiftMonth(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return monthKey(d);
}

export function uid(): string {
  return crypto.randomUUID();
}
