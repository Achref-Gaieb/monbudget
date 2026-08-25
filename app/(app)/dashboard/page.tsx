"use client";

import { motion } from "framer-motion";
import { ArrowRight, LayoutDashboard, Plus, Receipt } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AlertsBanner } from "@/components/alerts-banner";
import { AnimatedNumber } from "@/components/animated-number";
import { AppIcon } from "@/components/app-icon";
import { CategoryProgress } from "@/components/category-progress";
import { EmptyState } from "@/components/empty-state";
import { QuickExpense } from "@/components/quick-expense";
import { Button } from "@/components/ui/button";
import {
  categoryStats,
  totalIncome,
  totalSpent,
} from "@/lib/calculations";
import { goalProgress } from "@/lib/goals";
import { COLOR, softBg } from "@/lib/tokens";
import { useBudgetStore, useCurrentMonth } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";

/**
 * The home screen answers four questions and stops there: what came in,
 * what went out, what is left, and where it went. Everything else lives
 * one tap away in /analyse.
 */
export default function DashboardPage() {
  const { t, fmt, fmtMonth } = useI18n();
  const month = useCurrentMonth();
  const goals = useBudgetStore((s) => s.goals);
  const userName = useBudgetStore((s) => s.settings.userName);
  const [addOpen, setAddOpen] = useState(false);

  // Two at most: the least advanced ones, where attention is worth something.
  const topGoals = useMemo(
    () =>
      [...goals]
        .filter((g) => g.target > 0 && !goalProgress(g).reached)
        .sort((a, b) => goalProgress(b).percent - goalProgress(a).percent)
        .slice(0, 2),
    [goals]
  );

  const stats = useMemo(() => categoryStats(month), [month]);
  const income = totalIncome(month);
  const spent = totalSpent(month);
  const remaining = income - spent;
  const usage = income > 0 ? Math.min(100, (spent / income) * 100) : 0;

  if (!month) {
    return (
      <EmptyState
        icon={LayoutDashboard}
        title={t("dash.noData")}
        ctaLabel={t("dash.startBudget")}
        ctaHref="/"
      />
    );
  }

  const noExpensesYet = month.expenses.length === 0;

  return (
    <div className="mx-auto w-full max-w-3xl space-y-7">
      <div>
        <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
          {t("dash.greeting")}
          {userName ? ` ${userName}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">{fmtMonth(month.month)}</p>
      </div>

      {/* Level 1 — the single number that matters */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-2xl border bg-card p-6 sm:p-7"
        aria-labelledby="remaining-label"
      >
        <p id="remaining-label" className="text-sm text-muted-foreground">
          {t("dash.remaining")}
        </p>
        <p
          className="mt-1 text-4xl font-bold tracking-tight tabular-nums sm:text-5xl"
          style={{ color: remaining < 0 ? COLOR.negative : undefined }}
        >
          <AnimatedNumber value={remaining} format={(v) => fmt(v)} />
        </p>

        <div
          className="mt-5 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(usage)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t("dash.usage")}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: remaining < 0 ? COLOR.negative : COLOR.primary,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${usage}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>

        {/* Level 2 — the two figures that explain it */}
        <div className="mt-4 flex items-baseline justify-between text-sm">
          <span className="text-muted-foreground">
            {t("dash.income")}{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {fmt(income)}
            </span>
          </span>
          <span className="text-muted-foreground">
            {t("dash.spent")}{" "}
            <span className="font-semibold text-foreground tabular-nums">
              {fmt(spent)}
            </span>
          </span>
        </div>
      </motion.section>

      <AlertsBanner stats={stats} />

      {/* Level 2 — where the money went */}
      <section aria-labelledby="breakdown-title">
        <h2 id="breakdown-title" className="mb-4 text-sm font-semibold">
          {t("dash.whereMoneyGoes")}
        </h2>

        {noExpensesYet ? (
          <div className="rounded-2xl border border-dashed px-6 py-10 text-center">
            <p className="font-medium">{t("dash.monthStartsHere")}</p>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
              {t("dash.monthStartsHereHint")}
            </p>
            <Button onClick={() => setAddOpen(true)} className="mt-5 h-11 gap-2">
              <Plus className="size-4" aria-hidden />
              {t("quick.fab")}
            </Button>
          </div>
        ) : (
          <div className="space-y-5 rounded-2xl border bg-card p-5 sm:p-6">
            {stats.map((s, i) => (
              <CategoryProgress key={s.category.id} stat={s} index={i} compact />
            ))}
          </div>
        )}
      </section>

      {/* Goals, deliberately capped at two lines so the screen stays readable */}
      {topGoals.length > 0 && (
        <section aria-labelledby="goals-title">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="goals-title" className="text-sm font-semibold">
              {t("goals.title")}
            </h2>
            <Link
              href="/objectifs"
              className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {t("dash.seeGoals")}
            </Link>
          </div>
          <ul className="divide-y overflow-hidden rounded-2xl border bg-card">
            {topGoals.map((goal) => {
              const { percent } = goalProgress(goal);
              return (
                <li key={goal.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className="flex size-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: softBg(goal.color), color: goal.color }}
                  >
                    <AppIcon name={goal.icon} className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{goal.name}</p>
                    <p className="text-xs text-muted-foreground tabular-nums">
                      {fmt(goal.saved)} / {fmt(goal.target)}
                    </p>
                  </div>
                  <div className="w-20 shrink-0">
                    <div
                      className="h-1.5 overflow-hidden rounded-full bg-muted"
                      role="progressbar"
                      aria-valuenow={Math.round(percent)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={goal.name}
                    >
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: goal.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                  <span className="w-9 shrink-0 text-right text-xs font-semibold tabular-nums">
                    {Math.round(percent)}%
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Level 3 — the door to everything else */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          nativeButton={false}
          render={<Link href="/analyse" />}
          className="h-11 gap-2"
        >
          {t("dash.seeAnalysis")}
          <ArrowRight className="size-4" aria-hidden />
        </Button>
        <Button
          variant="ghost"
          nativeButton={false}
          render={<Link href="/depenses" />}
          className="h-11 gap-2"
        >
          <Receipt className="size-4" aria-hidden />
          {t("nav.transactions")}
        </Button>
      </div>

      <QuickExpense open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
