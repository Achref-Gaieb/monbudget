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

  const fmtMonth = useCallback(
    (month: string) => formatMonth(month, language),
    [language]
  );

  const fmtDate = useCallback(
    (iso: string) => formatDate(iso, language),
    [language]
  );

  return { t, fmt, fmtMonth, fmtDate, language, currency };
}
