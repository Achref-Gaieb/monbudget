"use client";

import { motion } from "framer-motion";
import { ArrowRight, Check, FlaskConical, Wand2, X } from "lucide-react";
import { useMemo, useState } from "react";
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
import { AnimatedNumber } from "@/components/animated-number";
import { AXIS_TICK, CHART_TOOLTIP_STYLE, ChartCard } from "@/components/charts/chart-card";
import { EmptyState } from "@/components/empty-state";
import { MiniDonut } from "@/components/mini-donut";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { deriveEnvelopeSplit, totalIncome } from "@/lib/calculations";
import { localeOf } from "@/lib/format";
import { METHOD_PRESETS } from "@/lib/presets";
import { COLOR, ENVELOPE_TOKENS, softBg } from "@/lib/tokens";
import { useBudgetStore, useCurrentMonth } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { cn } from "@/lib/utils";

const ENVELOPE_COLORS = [...ENVELOPE_TOKENS];

const SIM_PRESETS: { label: string; split: [number, number, number] }[] = [
  { label: "50 / 30 / 20", split: [50, 30, 20] },
  { label: "60 / 20 / 20", split: [60, 20, 20] },
  { label: "40 / 30 / 30", split: [40, 30, 30] },
  { label: "70 / 20 / 10", split: [70, 20, 10] },
  { label: "33 / 33 / 33", split: [34, 33, 33] },
];

function DeltaChip({ value, format }: { value: number; format: (v: number) => string }) {
  const positive = value >= 0;
  return (
    <span
      className="rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums"
      style={{
        color: positive ? COLOR.positive : COLOR.negative,
        backgroundColor: softBg(positive ? COLOR.positive : COLOR.negative),
      }}
    >
      {positive ? "+" : "−"}
      {format(Math.abs(value))}
    </span>
  );
}

export default function SimulatorPage() {
  const { t, fmt, language } = useI18n();
  const month = useCurrentMonth();
  const setMethod = useBudgetStore((s) => s.setMethod);
  const setCustomSplit = useBudgetStore((s) => s.setCustomSplit);

  const monthIncome = totalIncome(month);
  const [incomeInput, setIncomeInput] = useState<string | null>(null);
  const income =
    incomeInput !== null
      ? Number(incomeInput.replace(",", ".")) || 0
      : monthIncome;

  const currentSplit = useMemo(() => deriveEnvelopeSplit(month), [month]);
  const [split, setSplit] = useState<[number, number, number]>([50, 30, 20]);
  const [selectedPreset, setSelectedPreset] = useState<string | null>("50 / 30 / 20");

  const splitTotal = split[0] + split[1] + split[2];
  const splitValid = splitTotal === 100;

  const envelopes = [t("sim.needs"), t("sim.wants"), t("sim.savings")];
  const amountsA = currentSplit.map((p) => (income * p) / 100);
  const amountsB = split.map((p) => (income * p) / 100);

  const extraSavingsMonth = amountsB[2] - amountsA[2];
  const disposableB = income - amountsB[0];
  const disposableA = income - amountsA[0];

  const growthData = useMemo(() => {
    const points = [];
    const start = new Date();
    for (let i = 0; i <= 12; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      points.push({
        label: d.toLocaleDateString(localeOf(language), { month: "short" }),
        current: Math.round(amountsA[2] * i),
        simulated: Math.round(amountsB[2] * i),
      });
    }
    return points;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountsA[2], amountsB[2], language]);

  if (!month) {
    return (
      <EmptyState
        icon={FlaskConical}
        title={t("dash.noData")}
        ctaLabel={t("dash.startBudget")}
        ctaHref="/"
      />
    );
  }

  const canApply = month.categories.length === 3;
  const applyScenario = () => {
    if (!canApply || !splitValid) return;
    const preset = METHOD_PRESETS.find(
      (p) =>
        p.split[0] === split[0] && p.split[1] === split[1] && p.split[2] === split[2]
    );
    if (preset) setMethod(preset.id);
    else setCustomSplit([...split]);
    toast.success(t("sim.applied"));
  };

  const chartLabels: Record<string, string> = {
    current: t("sim.currentScenario"),
    simulated: t("sim.newScenario"),
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("sim.title")} subtitle={t("sim.subtitle")} />

      {/* Income input */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="grid gap-2">
            <Label htmlFor="sim-income">{t("sim.income")}</Label>
            <Input
              id="sim-income"
              type="number"
              inputMode="decimal"
              min="0"
              className="w-40"
              value={incomeInput ?? String(monthIncome || "")}
              onChange={(e) => setIncomeInput(e.target.value)}
            />
          </div>
          <p className="pb-2 text-sm text-muted-foreground">
            {envelopes.map((label, i) => (
              <span key={label} className="mr-3 inline-flex items-center gap-1.5">
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: ENVELOPE_COLORS[i] }}
                  aria-hidden
                />
                {label}
              </span>
            ))}
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Current scenario */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("sim.currentScenario")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-6">
            <MiniDonut split={currentSplit} size={110} colors={ENVELOPE_COLORS} />
            <ul className="flex-1 space-y-2">
              {envelopes.map((label, i) => (
                <li key={label} className="flex items-center gap-2 text-sm">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: ENVELOPE_COLORS[i] }}
                    aria-hidden
                  />
                  <span className="text-muted-foreground">{label}</span>
                  <span className="ml-auto font-semibold tabular-nums">
                    {fmt(amountsA[i])}
                  </span>
                  <span className="w-10 text-right text-xs text-muted-foreground">
                    {Math.round(currentSplit[i])}%
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* New scenario */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("sim.newScenario")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("sim.newScenario")}>
              {SIM_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  role="radio"
                  aria-checked={selectedPreset === preset.label}
                  onClick={() => {
                    setSplit(preset.split);
                    setSelectedPreset(preset.label);
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                    selectedPreset === preset.label
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:border-primary/50"
                  )}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                role="radio"
                aria-checked={selectedPreset === null}
                onClick={() => setSelectedPreset(null)}
                className={cn(
                  "rounded-full border border-dashed px-3 py-1 text-sm font-medium transition-colors",
                  selectedPreset === null
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:border-primary/50"
                )}
              >
                {t("landing.custom")}
              </button>
            </div>

            <div className="flex items-center gap-6">
              <MiniDonut split={split} size={110} colors={ENVELOPE_COLORS} />
              <div className="flex-1 space-y-2.5">
                {envelopes.map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <span
                      className="size-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: ENVELOPE_COLORS[i] }}
                      aria-hidden
                    />
                    <input
                      type="range"
                      min={0}
                      max={100}
                      value={split[i]}
                      onChange={(e) => {
                        const next = [...split] as [number, number, number];
                        next[i] = Number(e.target.value);
                        setSplit(next);
                        setSelectedPreset(null);
                      }}
                      className="flex-1 accent-[var(--primary)]"
                      aria-label={`${label} %`}
                    />
                    <span className="w-20 text-right text-sm font-semibold tabular-nums">
                      {fmt(amountsB[i])}
                    </span>
                    <span className="w-9 text-right text-xs text-muted-foreground tabular-nums">
                      {split[i]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <p
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium",
                splitValid ? "text-positive" : "text-negative"
              )}
              role="status"
            >
              {splitValid ? <Check className="size-3.5" /> : <X className="size-3.5" />}
              {splitTotal}% {splitValid ? "" : `— ${t("wizard.totalMustBe100")}`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Comparison summary */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {[
          {
            label: t("sim.extraSavingsMonth"),
            value: extraSavingsMonth,
            sub: `${t("sim.extraSavingsYear")} : ${extraSavingsMonth >= 0 ? "+" : "−"}${fmt(Math.abs(extraSavingsMonth * 12))}`,
          },
          {
            label: t("sim.disposable"),
            value: disposableB,
            delta: disposableB - disposableA,
            absolute: true,
          },
          {
            label: t("sim.available"),
            value: amountsB[1],
            delta: amountsB[1] - amountsA[1],
            absolute: true,
          },
          {
            label: t("sim.savings"),
            value: amountsB[2],
            delta: amountsB[2] - amountsA[2],
            absolute: true,
          },
        ].map((tile, i) => (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border bg-card px-4 py-3"
          >
            <p className="text-xs text-muted-foreground">{tile.label}</p>
            <p
              className="mt-1 text-lg font-bold tabular-nums"
              style={
                !tile.absolute
                  ? { color: tile.value >= 0 ? COLOR.positive : COLOR.negative }
                  : undefined
              }
            >
              {!tile.absolute && (tile.value >= 0 ? "+" : "−")}
              <AnimatedNumber
                value={Math.abs(tile.value)}
                format={(v) => fmt(v)}
              />
            </p>
            {tile.sub && (
              <p className="text-[11px] text-muted-foreground">{tile.sub}</p>
            )}
            {tile.delta !== undefined && (
              <div className="mt-1">
                <DeltaChip value={tile.delta} format={(v) => fmt(v)} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Savings growth over 12 months */}
      <ChartCard title={t("sim.savingsGrowth")}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis
                tick={AXIS_TICK}
                tickLine={false}
                axisLine={false}
                width={54}
                tickFormatter={(v: number) => fmt(v)}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(value, name) => [
                  fmt(Number(value ?? 0)),
                  chartLabels[String(name)] ?? String(name),
                ]}
              />
              <Legend
                formatter={(value: string) => chartLabels[value] ?? value}
                wrapperStyle={{ fontSize: 13 }}
              />
              <Line
                type="monotone"
                dataKey="current"
                stroke="var(--muted-foreground)"
                strokeWidth={2}
                strokeDasharray="6 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="simulated"
                stroke={COLOR.positive}
                strokeWidth={2.5}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Apply */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={applyScenario}
          disabled={!canApply || !splitValid}
          className="gap-2"
        >
          <Wand2 className="size-4" aria-hidden />
          {t("sim.apply")}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
        <p className="text-xs text-muted-foreground">{t("sim.applyHint")}</p>
      </div>
    </div>
  );
}
