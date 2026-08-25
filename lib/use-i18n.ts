"use client";

import { useCallback } from "react";
import { formatCurrency, formatDate, formatMonth } from "./format";
import { translate, type TranslationKey } from "./i18n";
import { useBudgetStore } from "./store";

/**
 * Translation + locale-aware formatting, bound to the user's settings.
 */
export function useI18n() {
  const language = useBudgetStore((s) => s.settings.language);
  const currency = useBudgetStore((s) => s.settings.currency);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language]
  );

  const fmt = useCallback(
    (value: number, decimals = 0) =>
      formatCurrency(value, currency, language, decimals),
    [currency, language]
  );

  /**
   * Shows cents only when there are any: a 8.50 expense must never be echoed
   * back as "9 €", while a 1 665 € budget stays free of ",00".
   */
  const fmtAuto = useCallback(
    (value: number) =>
      formatCurrency(
        value,
        currency,
        language,
        Math.abs(value % 1) > 0.004 ? 2 : 0
      ),
    [currency, language]
  );

  const fmtMonth = useCallback(
    (month: string) => formatMonth(month, language),
    [language]
  );

  const fmtDate = useCallback(
    (iso: string) => formatDate(iso, language),
    [language]
  );

  /** "Aujourd'hui" / "Hier" when it applies — a date is harder to place. */
  const fmtDayLabel = useCallback(
    (iso: string) => {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const y = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      const yesterday = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, "0")}-${String(y.getDate()).padStart(2, "0")}`;
      if (iso === today) return translate(language, "common.today");
      if (iso === yesterday) return translate(language, "common.yesterday");
      return formatDate(iso, language);
    },
    [language]
  );

  return { t, fmt, fmtAuto, fmtMonth, fmtDate, fmtDayLabel, language, currency };
}
