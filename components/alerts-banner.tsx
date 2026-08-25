"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import type { CategoryStat } from "@/lib/calculations";
import { COLOR, softBg } from "@/lib/tokens";
import { useI18n } from "@/lib/use-i18n";

/**
 * At most two messages, and never silence when things go well: seeing
 * "you're on track" is as useful as seeing a warning.
 */
export function AlertsBanner({
  stats,
  maxItems = 2,
}: {
  stats: CategoryStat[];
  maxItems?: number;
}) {
  const { fmt, t } = useI18n();

  const over = stats.filter((s) => s.allowed > 0 && s.spent > s.allowed);
  const warning = stats.filter(
    (s) => s.allowed > 0 && s.usage >= 80 && s.spent <= s.allowed
  );
  const tracked = stats.filter((s) => s.allowed > 0);
  const hasSpending = stats.some((s) => s.spent > 0);

  const messages = [
    ...over.map((s) => ({
      id: s.category.id,
      color: COLOR.negative,
      Icon: AlertTriangle,
      text: t("dash.overBudget", {
        name: s.category.name,
        amount: fmt(s.spent - s.allowed),
      }),
    })),
    ...warning.map((s) => ({
      id: s.category.id,
      color: COLOR.warning,
      Icon: TrendingUp,
      text: t("dash.almostOver", {
        name: s.category.name,
        pct: Math.round(s.usage),
      }),
    })),
  ].slice(0, maxItems);

  // Nothing to warn about — say so rather than showing an empty space.
  if (messages.length === 0) {
    if (tracked.length === 0 || !hasSpending) return null;
    return (
      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-sm font-medium"
        style={{ color: COLOR.positive }}
        role="status"
      >
        <CheckCircle2 className="size-4 shrink-0" aria-hidden />
        {t("dash.onTrack")}
      </motion.p>
    );
  }

  return (
    <div className="grid gap-2">
      {messages.map(({ id, color, Icon, text }, i) => (
        <motion.div
          key={id}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm"
          style={{
            borderColor: softBg(color, 25),
            backgroundColor: softBg(color, 8),
            color,
          }}
          role="alert"
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="text-foreground">{text}</span>
        </motion.div>
      ))}
    </div>
  );
}
