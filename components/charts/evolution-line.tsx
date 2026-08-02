"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK, CHART_TOOLTIP_STYLE } from "./chart-card";
import type { MonthPoint } from "@/lib/calculations";
import { localeOf } from "@/lib/format";
import { COLOR } from "@/lib/tokens";
import { useI18n } from "@/lib/use-i18n";

export function EvolutionLine({ points }: { points: MonthPoint[] }) {
  const { fmt, t, language } = useI18n();

  const shortMonth = (key: string) => {
    const [y, m] = key.split("-").map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString(localeOf(language), {
      month: "short",
    });
  };

  const labels: Record<string, string> = {
    income: t("dash.income"),
    spent: t("dash.spent"),
    savings: t("dash.savings"),
  };

  const data = points.map((p) => ({ ...p, label: shortMonth(p.month) }));

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(v: number) => fmt(v)}
          />
          <Tooltip
            contentStyle={CHART_TOOLTIP_STYLE}
            formatter={(value, name) => [
              fmt(Number(value ?? 0)),
              labels[String(name)] ?? String(name),
            ]}
          />
          <Legend
            formatter={(value: string) => labels[value] ?? value}
            wrapperStyle={{ fontSize: 13 }}
          />
          <Line
            type="monotone"
            dataKey="income"
            stroke={COLOR.positive}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="spent"
            stroke={COLOR.expense}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="savings"
            stroke={COLOR.needs}
            strokeWidth={2.5}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
