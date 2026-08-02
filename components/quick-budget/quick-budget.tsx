"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { deriveEnvelopeSplit } from "@/lib/calculations";
import { monthKey, uid } from "@/lib/format";
import { defaultCategories } from "@/lib/presets";
import { useBudgetStore } from "@/lib/store";
import type { MethodId } from "@/lib/types";
import { useI18n } from "@/lib/use-i18n";
import {
  IncomeStep,
  makeIncomeRow,
  parseAmount,
  sumIncomes,
  type IncomeRow,
} from "./income-step";
import { HOME_METHODS, MethodStep, type Split } from "./method-step";
import { SimulationPanel } from "./simulation-panel";
import { StepCard } from "./step-card";

/**
 * The homepage's fast path: income → allocation → live preview → start.
 * Mounted only after hydration so its initial state can be seeded from an
 * existing budget without an effect.
 */
export function QuickBudget() {
  const router = useRouter();
  const { t } = useI18n();
  const onboarded = useBudgetStore((s) => s.onboarded);
  const createMonth = useBudgetStore((s) => s.createMonth);
  const setOnboarded = useBudgetStore((s) => s.setOnboarded);
  const setMethod = useBudgetStore((s) => s.setMethod);
  const setCustomSplit = useBudgetStore((s) => s.setCustomSplit);

  const [rows, setRows] = useState<IncomeRow[]>(() => {
    const { months, currentMonth } = useBudgetStore.getState();
    const existing = months[currentMonth]?.incomes ?? [];
    return existing.length > 0
      ? existing.map((i) => makeIncomeRow(i.name, String(i.amount)))
      : [makeIncomeRow(t("home.salary"))];
  });

  const [method, setMethodId] = useState<MethodId>(() => {
    const { months, currentMonth } = useBudgetStore.getState();
    const existing = months[currentMonth]?.method;
    return existing && HOME_METHODS.some((m) => m.id === existing)
      ? existing
      : existing
        ? "custom"
        : "50-30-20";
  });

  const [split, setSplit] = useState<Split>(() => {
    const { months, currentMonth } = useBudgetStore.getState();
    const existing = months[currentMonth];
    return existing ? deriveEnvelopeSplit(existing) : [50, 30, 20];
  });

  const income = sumIncomes(rows);
  const splitValid = split[0] + split[1] + split[2] === 100;
  const ready = income > 0 && splitValid;

  const start = () => {
    if (!ready) return;
    const incomes = rows
      .filter((row) => parseAmount(row.amount) > 0)
      .map((row) => ({
        id: uid(),
        name: row.name.trim() || t("home.otherIncome"),
        amount: parseAmount(row.amount),
      }));
    const key = monthKey();

    if (!onboarded) {
      createMonth(key, {
        incomes,
        categories: defaultCategories(split),
        expenses: [],
        method,
      });
      setOnboarded(true);
      toast.success(t("home.created"));
    } else {
      // Keep existing categories and expenses; only refresh incomes…
      createMonth(key, { incomes, method });
      // …and re-apply the split when the budget still uses the 3 envelopes,
      // so a customised category list is never flattened.
      const current = useBudgetStore.getState().months[key];
      if (current && current.categories.length <= 3) {
        const preset = HOME_METHODS.find((m) => m.id === method);
        if (preset) setMethod(preset.id);
        else setCustomSplit([...split]);
      }
      toast.success(t("home.updated"));
    }
    router.push("/dashboard");
  };

  return (
    <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
      <div className="space-y-5 lg:col-span-3">
        <StepCard step={1} title={t("home.step1")} hint={t("home.step1Hint")} done={income > 0}>
          <IncomeStep rows={rows} onChange={setRows} />
        </StepCard>

        <StepCard
          step={2}
          title={t("home.step2")}
          hint={t("home.step2Hint")}
          locked={income <= 0}
          done={income > 0 && splitValid}
          delay={0.06}
        >
          <MethodStep
            method={method}
            split={split}
            income={income}
            onSelect={(nextMethod, nextSplit) => {
              setMethodId(nextMethod);
              if (nextMethod !== "custom") setSplit(nextSplit);
            }}
            onCustomChange={setSplit}
          />
        </StepCard>
      </div>

      <div className="lg:col-span-2">
        <StepCard
          step={3}
          title={t("home.step3")}
          hint={t("home.step3Hint")}
          delay={0.12}
          className="lg:sticky lg:top-24"
        >
          <SimulationPanel
            income={income}
            split={split}
            ctaLabel={onboarded ? t("home.updateBudget") : t("home.startTracking")}
            ctaDisabled={!ready}
            onStart={start}
          />
        </StepCard>
      </div>
    </div>
  );
}

/** Placeholder with the same rhythm as the real module, shown while hydrating. */
export function QuickBudgetSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-5 lg:gap-6">
      <div className="space-y-5 lg:col-span-3">
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <Skeleton className="mb-5 h-6 w-40" />
          <div className="space-y-2.5">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
          <Skeleton className="mt-4 h-14 w-full" />
        </div>
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <Skeleton className="mb-5 h-6 w-44" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <Skeleton className="mb-5 h-6 w-32" />
          <Skeleton className="mx-auto size-44 rounded-full" />
          <div className="mt-5 space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
          <Skeleton className="mt-5 h-12 w-full" />
        </div>
      </div>
    </div>
  );
}
