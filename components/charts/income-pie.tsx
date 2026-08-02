"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_TOOLTIP_STYLE } from "./chart-card";
import { PALETTE } from "@/lib/presets";
import type { Income } from "@/lib/types";
import { useI18n } from "@/lib/use-i18n";

export function IncomePie({ incomes }: { incomes: Income[] }) {
  const { fmt, t } = useI18n();
  const total = incomes.reduce((s, i) => s + i.amount, 0);
  const data = incomes
    .filter((i) => i.amount > 0)
    .map((i, idx) => ({
      name: i.name,
      value: i.amount,
      color: PALETTE[(idx * 3 + 8) % PALETTE.length],
    }));

  if (data.length === 0)
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        {t("incomes.empty")}
      </p>
    );

  return (
    <div>
      <div className="relative h-52">
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
            >
              {data.map((entry, idx) => (
                <Cell key={idx} fill={entry.color} />
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
          <span className="text-lg font-bold tabular-nums">{fmt(total)}</span>
        </div>
      </div>
      <ul className="mt-4 grid gap-1.5">
        {data.map((d, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: d.color }}
            />
            <span className="truncate text-muted-foreground">{d.name}</span>
            <span className="ml-auto font-medium tabular-nums">{fmt(d.value)}</span>
            <span className="w-10 text-right text-xs text-muted-foreground">
              {total > 0 ? Math.round((d.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
