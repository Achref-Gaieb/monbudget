"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  CalendarRange,
  Coins,
  Flame,
  FlaskConical,
  History,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { AnimatedNumber } from "@/components/animated-number";
import { BudgetPie } from "@/components/charts/budget-pie";
import { ChartCard } from "@/components/charts/chart-card";
import { EvolutionLine } from "@/components/charts/evolution-line";
import { SpendingHeatmap } from "@/components/charts/heatmap";
import { IncomePie } from "@/components/charts/income-pie";
import { PlannedVsSpent } from "@/components/charts/planned-vs-spent";
import { EmptyState } from "@/components/empty-state";
import { InsightsPanel } from "@/components/insights-panel";
import { MiniStat } from "@/components/mini-stat";
import { PageHeader } from "@/components/page-header";
import { PremiumGate } from "@/components/premium";
import { ScoreCard } from "@/components/score-card";
import { Button } from "@/components/ui/button";
import {
  categoryStats,
  computeForecast,
  dailySpending,
  evolutionData,
  periodStats,
  totalIncome,
} from "@/lib/calculations";
import { computeInsights } from "@/lib/insights";
import { ACCENTS } from "@/lib/presets";
import { computeScore } from "@/lib/score";
import { useBudgetStore, useCurrentMonth } from "@/lib/store";
import { COLOR, softBg } from "@/lib/tokens";
import { useI18n } from "@/lib/use-i18n";

/**
 * Everything that used to crowd the home screen. Reaching it is a deliberate
 * act, so density is welcome here — it is not on the daily loop.
 */
export default function AnalysisPage() {
  const { t, fmt } = useI18n();
  const month = useCurrentMonth();
  const months = useBudgetStore((s) => s.months);
  const currentMonthKey = useBudgetStore((s) => s.currentMonth);
  const goals = useBudgetStore((s) => s.goals);
  const accent = useBudgetStore((s) => s.settings.accent);

  const stats = useMemo(() => categoryStats(month), [month]);
  const income = totalIncome(month);
  const forecast = useMemo(() => computeForecast(month), [month]);
  const evolution = useMemo(() => evolutionData(months), [months]);
  const daily = useMemo(() => dailySpending(month), [month]);
  const period = useMemo(() => periodStats(month), [month]);
  const score = useMemo(
    () => computeScore(months, currentMonthKey, goals),
    [months, currentMonthKey, goals]
  );
  const insights = useMemo(
    () =>
      computeInsights({
        months,
        currentKey: currentMonthKey,
        formatAmount: (v) => fmt(v),
      }),
    [months, currentMonthKey, fmt]
  );
  const accentColor = ACCENTS.find((a) => a.id === accent)?.value ?? ACCENTS[0].value;
  const forecastColor = forecast.endBalance >= 0 ? COLOR.positive : COLOR.negative;

  if (!month) {
    return (
      <EmptyState
        icon={BarChart3}
        title={t("dash.noData")}
        ctaLabel={t("dash.startBudget")}
        ctaHref="/"
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t("analysis.title")} subtitle={t("analysis.subtitle")} />

      {/* Forecast */}
      {forecast.isCurrentMonth && income > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5"
          style={{
            background: `linear-gradient(120deg, ${softBg(forecastColor)}, transparent 60%)`,
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: softBg(forecastColor), color: forecastColor }}
            >
              {forecast.endBalance >= 0 ? (
                <TrendingUp className="size-5" aria-hidden />
              ) : (
                <TrendingDown className="size-5" aria-hidden />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold">{t("dash.forecast")}</p>
              <p className="text-sm text-muted-foreground">
                {t("dash.forecastPositive")}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: forecastColor }}
            >
              <AnimatedNumber
                value={forecast.endBalance}
                format={(v) => `${v >= 0 ? "+" : ""}${fmt(v)}`}
              />
            </p>
            <p className="text-xs text-muted-foreground">
              {t("dash.forecastSpend")} : {fmt(forecast.projectedSpend)}
            </p>
          </div>
        </motion.div>
      )}

      {/* This month at a glance */}
      <section aria-label={t("analysis.thisMonth")}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <MiniStat index={0} label={t("dash.today")} value={fmt(period.spentToday)} icon={CalendarDays} />
          <MiniStat index={1} label={t("dash.thisWeek")} value={fmt(period.spentThisWeek)} icon={CalendarRange} />
          <MiniStat
            index={2}
            label={t("dash.dailyAvg")}
            value={fmt(period.dailyAverage)}
            hint={`${t("dash.weeklyAvg")} : ${fmt(period.weeklyAverage)}`}
            icon={Activity}
          />
          <MiniStat
            index={3}
            label={t("dash.biggestExpense")}
            value={period.biggestExpense ? fmt(period.biggestExpense.amount) : "—"}
            hint={period.biggestExpense?.name}
            icon={TrendingUp}
          />
          <MiniStat
            index={4}
            label={t("dash.topCategory")}
            value={period.topCategory?.category.name ?? "—"}
            hint={period.topCategory ? fmt(period.topCategory.spent) : undefined}
            icon={Flame}
          />
          <MiniStat
            index={5}
            label={t("dash.disposable")}
            value={fmt(period.disposable)}
            hint={t("dash.disposableHint")}
            icon={Coins}
          />
        </div>
      </section>

      {/* Score + insights */}
      <div className="grid gap-4 lg:grid-cols-3">
        <PremiumGate feature="budgetScore">
          <ScoreCard score={score} />
        </PremiumGate>
        <PremiumGate feature="smartInsights" className="lg:col-span-2">
          <InsightsPanel insights={insights} />
        </PremiumGate>
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ChartCard title={t("dash.budgetSplit")}>
          <BudgetPie stats={stats} totalIncome={income} />
        </ChartCard>
        <ChartCard title={t("dash.plannedVsSpent")} delay={0.05}>
          <PlannedVsSpent stats={stats} />
        </ChartCard>
        <ChartCard title={t("dash.incomeBreakdown")} delay={0.1}>
          <IncomePie incomes={month.incomes} />
        </ChartCard>
        <ChartCard
          title={t("dash.monthlyEvolution")}
          className="lg:col-span-2"
          delay={0.05}
        >
          <EvolutionLine points={evolution} />
        </ChartCard>
        <ChartCard
          title={t("dash.heatmap")}
          description={t("dash.heatmapDesc")}
          delay={0.1}
        >
          <SpendingHeatmap month={month.month} daily={daily} accentColor={accentColor} />
        </ChartCard>
      </div>

      {/* Doors to the specialised tools */}
      <section aria-label={t("analysis.tools")} className="grid gap-2 sm:grid-cols-3">
        {[
          { href: "/simulateur", icon: FlaskConical, label: t("analysis.simulator") },
          { href: "/historique", icon: History, label: t("analysis.history") },
          { href: "/revenus", icon: Wallet, label: t("analysis.incomes") },
        ].map(({ href, icon: Icon, label }) => (
          <Button
            key={href}
            variant="outline"
            nativeButton={false}
            render={<Link href={href} />}
            className="h-12 justify-start gap-2.5"
          >
            <Icon className="size-4 shrink-0 text-primary" aria-hidden />
            <span className="flex-1 truncate text-left">{label}</span>
            <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          </Button>
        ))}
      </section>
    </div>
  );
}
