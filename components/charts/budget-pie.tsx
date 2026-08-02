"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_TOOLTIP_STYLE } from "./chart-card";
import type { CategoryStat } from "@/lib/calculations";
import { useI18n } from "@/lib/use-i18n";

interface BudgetPieProps {
  stats: CategoryStat[];
  totalIncome: number;
}

/** Donut of the allowed budget per category. */
export function BudgetPie({ stats, totalIncome }: BudgetPieProps) {
  const { fmt, t } = useI18n();
  const data = stats
    .filter((s) => s.allowed > 0)
    .map((s) => ({
      name: s.category.name,
      value: Math.round(s.allowed * 100) / 100,
      color: s.category.color,
      pct: s.category.percentage,
    }));

  if (data.length === 0)
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t("dash.noData")}
      </p>
    );

  return (
    <div>
      <div className="relative h-56">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="65%"
              outerRadius="95%"
              paddingAngle={3}
              strokeWidth={0}
              isAnimationActive
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value, name) => [fmt(Number(value ?? 0)), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs text-muted-foreground">{t("common.total")}</span>
          <span className="text-lg font-bold tabular-nums">{fmt(totalIncome)}</span>
        </div>
      </div>
      <ul className="mt-4 grid gap-1.5">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="truncate text-muted-foreground">{d.name}</span>
            <span className="ml-auto font-medium tabular-nums">
              {fmt(d.value)}
            </span>
            <span className="w-10 text-right text-xs text-muted-foreground">
              {d.pct}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
