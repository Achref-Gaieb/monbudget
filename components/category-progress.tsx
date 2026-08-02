"use client";

import { motion } from "framer-motion";
import { AppIcon } from "./app-icon";
import { usageColor, type CategoryStat } from "@/lib/calculations";
import { COLOR, softBg } from "@/lib/tokens";
import { useI18n } from "@/lib/use-i18n";

/** Animated progress bar for one category: "650€ sur 1000€ · 65%". */
export function CategoryProgress({
  stat,
  index = 0,
}: {
  stat: CategoryStat;
  index?: number;
}) {
  const { fmt, t } = useI18n();
  const { category, allowed, spent, usage } = stat;
  const color = usageColor(usage, category.color);
  const width = Math.min(100, usage);

  return (
    <div>
      <div className="mb-1.5 flex items-center gap-2 text-sm">
        <span
          className="flex size-6 items-center justify-center rounded-md"
          style={{ backgroundColor: softBg(category.color), color: category.color }}
        >
          <AppIcon name={category.icon} className="size-3.5" />
        </span>
        <span className="truncate font-medium">{category.name}</span>
        <span className="ml-auto text-muted-foreground tabular-nums">
          {fmt(spent)} {t("common.of")} {fmt(allowed)}
        </span>
        <span
          className="w-12 text-right font-semibold tabular-nums"
          style={{ color }}
        >
          {Number.isFinite(usage) ? Math.round(usage) : "∞"}%
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={Math.round(Math.min(usage, 100))}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={category.name}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Number.isFinite(width) ? width : 100}%` }}
          transition={{ duration: 0.8, delay: index * 0.08, ease: "easeOut" }}
        />
      </div>
      <p className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>
          {t("cats.forecast")} : <span className="tabular-nums">{fmt(stat.forecast)}</span>
        </span>
        <span
          className="font-medium tabular-nums"
          style={{ color: stat.forecastGap >= 0 ? COLOR.positive : COLOR.negative }}
        >
          {t("cats.gap")} : {stat.forecastGap >= 0 ? "+" : "−"}
          {fmt(Math.abs(stat.forecastGap))}
        </span>
      </p>
    </div>
  );
}
