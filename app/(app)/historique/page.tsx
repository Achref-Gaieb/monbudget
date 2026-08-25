"use client";

import { motion } from "framer-motion";
import { ArrowRight, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AXIS_TICK, CHART_TOOLTIP_STYLE, ChartCard } from "@/components/charts/chart-card";
import { EvolutionLine } from "@/components/charts/evolution-line";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { evolutionData } from "@/lib/calculations";
import { FREE_HISTORY_MONTHS, useFeature } from "@/lib/features";
import { monthKey } from "@/lib/format";
import { COLOR } from "@/lib/tokens";
import { useBudgetStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const router = useRouter();
  const { t, fmt, fmtMonth } = useI18n();
  const months = useBudgetStore((s) => s.months);
  const setCurrentMonth = useBudgetStore((s) => s.setCurrentMonth);
  const unlimitedHistory = useFeature("unlimitedHistory");

  const allPoints = useMemo(() => evolutionData(months), [months]);
  const points = useMemo(
    () =>
      unlimitedHistory ? allPoints : allPoints.slice(-FREE_HISTORY_MONTHS),
    [allPoints, unlimitedHistory]
  );
  const sortedDesc = useMemo(() => [...points].reverse(), [points]);
  const realCurrent = monthKey();

  const [selected, setSelected] = useState<string[]>(() =>
    points.slice(-3).map((p) => p.month)
  );

  const compareData = points
    .filter((p) => selected.includes(p.month))
    .map((p) => ({
      label: fmtMonth(p.month),
      income: Math.round(p.income),
      spent: Math.round(p.spent),
      savings: Math.round(p.savings),
    }));

  const labels: Record<string, string> = {
    income: t("dash.income"),
    spent: t("dash.spent"),
    savings: t("dash.savings"),
  };

  if (points.length === 0) {
    return (
      <EmptyState
        icon={History}
        title={t("dash.noData")}
        ctaLabel={t("dash.startBudget")}
        ctaHref="/"
      />
    );
  }

  const toggle = (month: string) =>
    setSelected((sel) =>
      sel.includes(month) ? sel.filter((m) => m !== month) : [...sel, month]
    );

  return (
    <div className="space-y-6">
      <PageHeader title={t("hist.title")} subtitle={t("hist.subtitle")} />

      <ChartCard title={t("hist.evolution")}>
        <EvolutionLine points={points} />
      </ChartCard>

      {/* Month list */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sortedDesc.map((p, i) => (
          <motion.div
            key={p.month}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
          >
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{fmtMonth(p.month)}</p>
                  {p.month === realCurrent && (
                    <Badge>{t("hist.current")}</Badge>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("dash.income")}
                    </p>
                    <p className="font-bold text-positive tabular-nums">
                      {fmt(p.income)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("dash.spent")}
                    </p>
                    <p className="font-bold text-expense tabular-nums">
                      {fmt(p.spent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {t("hist.balance")}
                    </p>
                    <p
                      className={cn(
                        "font-bold tabular-nums",
                        p.balance >= 0 ? "text-positive" : "text-negative"
                      )}
                    >
                      {p.balance >= 0 ? "+" : ""}
                      {fmt(p.balance)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => {
                    setCurrentMonth(p.month);
                    router.push("/dashboard");
                  }}
                >
                  {t("hist.view")}
                  <ArrowRight className="size-3.5" aria-hidden />
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {points.length < 2 && (
        <p className="text-sm text-muted-foreground">{t("hist.empty")}</p>
      )}

      {/* Comparison */}
      {points.length >= 2 && (
        <ChartCard title={t("hist.compare")} description={t("hist.compareHint")}>
          <div className="mb-4 flex flex-wrap gap-2">
            {points.map((p) => (
              <button
                key={p.month}
                type="button"
                aria-pressed={selected.includes(p.month)}
                onClick={() => toggle(p.month)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                  selected.includes(p.month)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:border-primary/50"
                )}
              >
                {fmtMonth(p.month)}
              </button>
            ))}
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={compareData} barGap={4}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={46}
                  tickFormatter={(v: number) => fmt(v)}
                />
                <Tooltip
                  contentStyle={CHART_TOOLTIP_STYLE}
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  formatter={(value, name) => [
                    fmt(Number(value ?? 0)),
                    labels[String(name)] ?? String(name),
                  ]}
                />
                <Legend
                  formatter={(value: string) => labels[value] ?? value}
                  wrapperStyle={{ fontSize: 13 }}
                />
                <Bar dataKey="income" fill={COLOR.positive} radius={[6, 6, 0, 0]} />
                <Bar dataKey="spent" fill={COLOR.expense} radius={[6, 6, 0, 0]} />
                <Bar dataKey="savings" fill={COLOR.needs} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
