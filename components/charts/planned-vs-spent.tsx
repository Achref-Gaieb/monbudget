"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK, CHART_TOOLTIP_STYLE } from "./chart-card";
import { usageColor, type CategoryStat } from "@/lib/calculations";
import { useI18n } from "@/lib/use-i18n";

export function PlannedVsSpent({ stats }: { stats: CategoryStat[] }) {
  const { fmt, t } = useI18n();
  const data = stats.map((s) => ({
    name:
      s.category.name.length > 14
        ? s.category.name.slice(0, 13) + "…"
        : s.category.name,
    planned: Math.round(s.allowed),
    spent: Math.round(s.spent),
    usage: s.usage,
    color: s.category.color,
  }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v: number) => fmt(v)}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            formatter={(value, name) => [
              fmt(Number(value ?? 0)),
              name === "planned" ? t("dash.planned") : t("dash.spent"),
            ]}
          />
          <Legend
            formatter={(value: string) =>
              value === "planned" ? t("dash.planned") : t("dash.spent")
            }
            wrapperStyle={{ fontSize: 13 }}
          />
          <Bar dataKey="planned" fill="var(--muted-foreground)" opacity={0.35} radius={[6, 6, 0, 0]} />
          <Bar dataKey="spent" radius={[6, 6, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={usageColor(entry.usage, entry.color)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
