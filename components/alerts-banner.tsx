"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, TrendingUp } from "lucide-react";
import type { CategoryStat } from "@/lib/calculations";
import { useI18n } from "@/lib/use-i18n";

/**
 * Smart alerts: red card when a category is over budget,
 * amber warning when it crosses 80% / 90%.
 */
export function AlertsBanner({ stats }: { stats: CategoryStat[] }) {
  const { fmt, t } = useI18n();

  const over = stats.filter((s) => s.allowed > 0 && s.spent > s.allowed);
  const warning = stats.filter(
    (s) => s.allowed > 0 && s.usage >= 80 && s.spent <= s.allowed
  );

  if (over.length === 0 && warning.length === 0) return null;

  return (
    <div className="grid gap-2">
      <AnimatePresence>
        {over.map((s) => (
          <motion.div
            key={s.category.id}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-xl border border-negative/30 bg-negative/10 px-4 py-3 text-sm text-negative"
            role="alert"
          >
            <AlertTriangle className="size-4.5 shrink-0" aria-hidden />
            <span>
              {t("dash.overBudget", {
                name: s.category.name,
                amount: fmt(s.spent - s.allowed),
              })}
            </span>
          </motion.div>
        ))}
        {warning.map((s) => (
          <motion.div
            key={s.category.id}
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning"
            role="alert"
          >
            <TrendingUp className="size-4.5 shrink-0" aria-hidden />
            <span>
              {t("dash.almostOver", {
                name: s.category.name,
                pct: Math.round(s.usage),
              })}
            </span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
