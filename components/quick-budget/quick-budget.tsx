"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
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

/** Small disclosure trigger used to keep the first screen to one question. */
function Disclosure({
  open,
  onToggle,
  label,
}: {
  open: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
    >
      <ChevronDown
        className={cn("size-3.5 transition-transform", open && "rotate-180")}
        aria-hidden
      />
      {label}
    </button>
  );
}

/**
 * Onboarding asks one thing: how much comes in each month. The recommended
 * 50/30/20 split is applied by default and previewed live; multiple income
 * sources and other splits stay one disclosure away for those who want them.
 */
export function QuickBudget() {
  const router = useRouter();
  const { t, currency } = useI18n();
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

  // Anyone returning with several sources gets them shown, not hidden.
  const [showSources, setShowSources] = useState(rows.length > 1);
  const [showMethods, setShowMethods] = useState(false);

  const income = sumIncomes(rows);
  const splitValid = split[0] + split[1] + split[2] === 100;
  const ready = income > 0 && splitValid;

  const start = () => {
    if (!ready) return;
    const incomes = rows
      .filter((row) => parseAmount(row.amount) > 0)
      .map((row) => ({
        id: uid(),
        name: row.name.trim() || t("home.salary"),
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
      // Keep existing categories and expenses; refresh incomes only…
      createMonth(key, { incomes, method });
      // …and re-apply the split when the budget still uses the 3 envelopes.
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
        <StepCard step={1} title={t("home.oneQuestion")} done={income > 0}>
          {showSources ? (
            <IncomeStep rows={rows} onChange={setRows} />
          ) : (
            <div className="flex items-baseline justify-center gap-2 py-2">
              <input
                value={rows[0]?.amount ?? ""}
                onChange={(e) =>
                  setRows(([first, ...rest]) => [
                    { ...first, amount: e.target.value.replace(/[^\d.,]/g, "") },
                    ...rest,
                  ])
                }
                inputMode="decimal"
                placeholder="0"
                aria-label={t("home.monthlyIncome")}
                className="w-full max-w-[8ch] bg-transparent text-center text-5xl font-bold tabular-nums outline-none placeholder:text-muted-foreground/40"
              />
              <span className="text-2xl font-semibold text-muted-foreground">
                {currency === "EUR" ? "€" : currency}
              </span>
            </div>
          )}

          <div className="mt-4">
            <Disclosure
              open={showSources}
              onToggle={() => setShowSources((v) => !v)}
              label={t("home.severalSources")}
            />
          </div>
        </StepCard>

        <StepCard
          step={2}
          title={t("home.yourSplit")}
          hint={t("home.splitHint")}
          locked={income <= 0}
          done={income > 0 && splitValid}
          delay={0.06}
        >
          <AnimatePresence initial={false}>
            {showMethods && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <div className="pb-4">
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
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Disclosure
            open={showMethods}
            onToggle={() => setShowMethods((v) => !v)}
            label={t("home.otherSplit")}
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
          <Skeleton className="mb-5 h-6 w-56" />
          <Skeleton className="mx-auto h-14 w-40" />
          <Skeleton className="mt-4 h-4 w-48" />
        </div>
        <div className="rounded-2xl border bg-card p-5 sm:p-6">
          <Skeleton className="mb-5 h-6 w-44" />
          <Skeleton className="h-4 w-56" />
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
