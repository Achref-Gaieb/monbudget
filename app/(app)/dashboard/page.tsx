"use client";

import { motion } from "framer-motion";
import {
  Activity,
  Banknote,
  CalendarDays,
  CalendarRange,
  Coins,
  Flame,
  Gauge,
  LayoutDashboard,
  PiggyBank,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AlertsBanner } from "@/components/alerts-banner";
import { AnimatedNumber } from "@/components/animated-number";
import { CategoryProgress } from "@/components/category-progress";
import { BudgetPie } from "@/components/charts/budget-pie";
import { ChartCard } from "@/components/charts/chart-card";
import { EvolutionLine } from "@/components/charts/evolution-line";
import { SpendingHeatmap } from "@/components/charts/heatmap";
import { IncomePie } from "@/components/charts/income-pie";
import { PlannedVsSpent } from "@/components/charts/planned-vs-spent";
import { EmptyState } from "@/components/empty-state";
import { ExpenseDialog } from "@/components/expense-dialog";
import { InsightsPanel } from "@/components/insights-panel";
import { MiniStat } from "@/components/mini-stat";
import { PageHeader } from "@/components/page-header";
import { PremiumGate } from "@/components/premium";
import { ScoreCard } from "@/components/score-card";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import {
  categoryStats,
  computeForecast,
  dailySpending,
  evolutionData,
  periodStats,
  totalIncome,
  totalSavings,
  totalSpent,
} from "@/lib/calculations";
import { computeInsights } from "@/lib/insights";
import { ACCENTS } from "@/lib/presets";
import { computeScore } from "@/lib/score";
import { COLOR, softBg } from "@/lib/tokens";
import { useBudgetStore, useCurrentMonth } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";

export default function DashboardPage() {
  const { t, fmt, fmtMonth } = useI18n();
  const month = useCurrentMonth();
  const months = useBudgetStore((s) => s.months);
  const currentMonthKey = useBudgetStore((s) => s.currentMonth);
  const goals = useBudgetStore((s) => s.goals);
  const userName = useBudgetStore((s) => s.settings.userName);
  const accent = useBudgetStore((s) => s.settings.accent);
  const [addOpen, setAddOpen] = useState(false);

  const stats = useMemo(() => categoryStats(month), [month]);
  const income = totalIncome(month);
  const spent = totalSpent(month);
  const savings = totalSavings(month);
  const remaining = income - spent;
  const usage = income > 0 ? (spent / income) * 100 : 0;
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
  const forecastColor =
    forecast.endBalance >= 0 ? COLOR.positive : COLOR.negative;

  if (!month) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title={t("dash.noData")}
        ctaLabel={t("dash.startBudget")}
        ctaHref="/creer"
      />
    );
  }

  const pct = (v: number) => `${Math.round(v)}%`;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${t("dash.greeting")}${userName ? ` ${userName}` : ""} 👋`}
        subtitle={`${t("dash.overview")} — ${fmtMonth(month.month)}`}
        actions={
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="size-4" aria-hidden />
            {t("dash.addExpense")}
          </Button>
        }
      />

      <AlertsBanner stats={stats} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          index={0}
          label={t("dash.income")}
          value={income}
          format={(v) => fmt(v)}
          icon={Wallet}
          color={COLOR.positive}
        />
        <StatCard
          index={1}
          label={t("dash.spent")}
          value={spent}
          format={(v) => fmt(v)}
          icon={Receipt}
          color={COLOR.expense}
        />
        <StatCard
          index={2}
          label={t("dash.savings")}
          value={savings}
          format={(v) => fmt(v)}
          icon={PiggyBank}
          color={COLOR.needs}
        />
        <StatCard
          index={3}
          label={t("dash.remaining")}
          value={remaining}
          format={(v) => fmt(v)}
          icon={Banknote}
          color={COLOR.info}
          negative={remaining < 0}
        />
        <StatCard
          index={4}
          label={t("dash.usage")}
          value={usage}
          format={pct}
          icon={Gauge}
          color={COLOR.warning}
          negative={usage > 100}
        />
      </div>

      {/* Forecast */}
      {forecast.isCurrentMonth && income > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-5"
          style={{
            background: `linear-gradient(120deg, ${softBg(forecastColor)}, transparent 60%)`,
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 items-center justify-center rounded-xl"
              style={{
                backgroundColor: softBg(forecastColor),
                color: forecastColor,
              }}
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

      {/* Period stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <MiniStat
          index={0}
          label={t("dash.today")}
          value={fmt(period.spentToday)}
          icon={CalendarDays}
        />
        <MiniStat
          index={1}
          label={t("dash.thisWeek")}
          value={fmt(period.spentThisWeek)}
          icon={CalendarRange}
        />
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

      {/* Budget score + smart insights */}
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

        <ChartCard title={t("dash.categoryProgress")} delay={0.1}>
          {month.expenses.length === 0 && (
            <p className="mb-3 text-sm text-muted-foreground">
              {t("dash.noExpensesYet")}
            </p>
          )}
          <div className="space-y-5">
            {stats.map((s, i) => (
              <CategoryProgress key={s.category.id} stat={s} index={i} />
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title={t("dash.monthlyEvolution")}
          className="lg:col-span-2"
          delay={0.05}
        >
          <EvolutionLine points={evolution} />
        </ChartCard>

        <ChartCard title={t("dash.incomeBreakdown")} delay={0.1}>
          <IncomePie incomes={month.incomes} />
        </ChartCard>

        <ChartCard
          title={t("dash.heatmap")}
          description={t("dash.heatmapDesc")}
          className="lg:col-span-2 xl:col-span-1"
          delay={0.15}
        >
          <SpendingHeatmap
            month={month.month}
            daily={daily}
            accentColor={accentColor}
          />
        </ChartCard>
      </div>

      <ExpenseDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
