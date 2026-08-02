"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  PiggyBank,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatedNumber } from "@/components/animated-number";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppIcon } from "@/components/app-icon";
import { monthKey, uid } from "@/lib/format";
import { defaultCategories, METHOD_PRESETS } from "@/lib/presets";
import { ENVELOPE_TOKENS, softBg } from "@/lib/tokens";
import { useBudgetStore } from "@/lib/store";
import type { MethodId } from "@/lib/types";
import { useI18n } from "@/lib/use-i18n";
import { cn } from "@/lib/utils";

interface IncomeRow {
  id: string;
  name: string;
  amount: string;
}

const CAT_LABELS = ["Besoins", "Plaisirs", "Épargne"];
const CAT_COLORS = [...ENVELOPE_TOKENS];

export default function CreateBudgetPage() {
  const router = useRouter();
  const { t, fmt } = useI18n();
  const createMonth = useBudgetStore((s) => s.createMonth);
  const setOnboarded = useBudgetStore((s) => s.setOnboarded);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  // Static id for the SSR-rendered initial row (uid() would break hydration);
  // real ids are generated in finish().
  const [incomes, setIncomes] = useState<IncomeRow[]>([
    { id: "income-initial", name: "Salaire", amount: "" },
  ]);
  const [method, setMethod] = useState<MethodId>("50-30-20");
  const [split, setSplit] = useState<[number, number, number]>([50, 30, 20]);

  const totalIncome = incomes.reduce(
    (s, i) => s + (Number(i.amount.replace(",", ".")) || 0),
    0
  );
  const splitTotal = split[0] + split[1] + split[2];
  const splitValid = splitTotal === 100;
  const validIncomes = incomes.filter(
    (i) => i.name.trim() && Number(i.amount.replace(",", ".")) > 0
  );

  const canNext =
    step === 0 ? validIncomes.length > 0 : step === 1 ? splitValid : true;

  const go = (dir: number) => {
    setDirection(dir);
    setStep((s) => Math.min(2, Math.max(0, s + dir)));
  };

  const pickPreset = (id: MethodId, presetSplit: [number, number, number]) => {
    setMethod(id);
    setSplit(presetSplit);
  };

  const finish = () => {
    const categories = defaultCategories(split);
    createMonth(monthKey(), {
      incomes: validIncomes.map((i) => ({
        id: uid(),
        name: i.name.trim(),
        amount: Number(i.amount.replace(",", ".")),
      })),
      categories,
      expenses: [],
      method,
    });
    setOnboarded(true);
    router.push("/dashboard");
  };

  const steps = [t("wizard.step1"), t("wizard.step2"), t("wizard.step3")];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PiggyBank className="size-4.5" aria-hidden />
          </span>
          {t("nav.appName")}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t("common.back")}
          nativeButton={false}
          render={<Link href="/" />}
        >
          <X className="size-4" />
        </Button>
      </header>

      {/* Stepper */}
      <div className="mx-auto mt-8 flex w-full max-w-lg items-center px-6">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                  i < step
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === step
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground"
                )}
              >
                {i < step ? <Check className="size-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  i === step ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="relative mx-2 mb-5 h-0.5 flex-1 rounded bg-border">
                <motion.div
                  className="absolute inset-y-0 left-0 rounded bg-primary"
                  animate={{ width: i < step ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: 40 * direction }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 * direction }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {step === 0 && (
              <section aria-labelledby="step-incomes">
                <h1 id="step-incomes" className="text-2xl font-bold sm:text-3xl">
                  {t("wizard.incomesTitle")}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {t("wizard.incomesSubtitle")}
                </p>

                <div className="mt-8 space-y-3">
                  {incomes.map((row, idx) => (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-end gap-2"
                    >
                      <div className="grid flex-1 gap-1.5">
                        {idx === 0 && (
                          <Label htmlFor={`inc-name-${row.id}`}>
                            {t("wizard.incomeName")}
                          </Label>
                        )}
                        <Input
                          id={`inc-name-${row.id}`}
                          value={row.name}
                          placeholder={t("wizard.incomePlaceholder")}
                          onChange={(e) =>
                            setIncomes((rows) =>
                              rows.map((r) =>
                                r.id === row.id ? { ...r, name: e.target.value } : r
                              )
                            )
                          }
                        />
                      </div>
                      <div className="grid w-32 gap-1.5 sm:w-40">
                        {idx === 0 && (
                          <Label htmlFor={`inc-amount-${row.id}`}>
                            {t("common.amount")}
                          </Label>
                        )}
                        <Input
                          id={`inc-amount-${row.id}`}
                          type="number"
                          inputMode="decimal"
                          min="0"
                          placeholder="0"
                          value={row.amount}
                          onChange={(e) =>
                            setIncomes((rows) =>
                              rows.map((r) =>
                                r.id === row.id
                                  ? { ...r, amount: e.target.value }
                                  : r
                              )
                            )
                          }
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("common.delete")}
                        disabled={incomes.length === 1}
                        onClick={() =>
                          setIncomes((rows) => rows.filter((r) => r.id !== row.id))
                        }
                      >
                        <Trash2 className="size-4 text-muted-foreground" />
                      </Button>
                    </motion.div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  className="mt-4 gap-2"
                  onClick={() =>
                    setIncomes((rows) => [
                      ...rows,
                      { id: uid(), name: "", amount: "" },
                    ])
                  }
                >
                  <Plus className="size-4" />
                  {t("wizard.addIncome")}
                </Button>

                <div className="mt-8 flex items-center justify-between rounded-xl border bg-muted/40 px-5 py-4">
                  <span className="font-medium">{t("wizard.totalIncome")}</span>
                  <span className="text-2xl font-bold text-primary tabular-nums">
                    <AnimatedNumber value={totalIncome} format={(v) => fmt(v)} />
                  </span>
                </div>
              </section>
            )}

            {step === 1 && (
              <section aria-labelledby="step-method">
                <h1 id="step-method" className="text-2xl font-bold sm:text-3xl">
                  {t("wizard.methodTitle")}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {t("wizard.methodSubtitle")}
                </p>

                <div
                  className="mt-8 grid gap-3 sm:grid-cols-2"
                  role="radiogroup"
                  aria-label={t("cats.method")}
                >
                  {METHOD_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      role="radio"
                      aria-checked={method === preset.id}
                      onClick={() => pickPreset(preset.id, preset.split)}
                      className={cn(
                        "flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:border-primary/50",
                        method === preset.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      )}
                    >
                      <div className="flex h-10 w-24 shrink-0 overflow-hidden rounded-md">
                        {preset.split.map((v, i) => (
                          <div
                            key={i}
                            style={{
                              width: `${v}%`,
                              backgroundColor: CAT_COLORS[i],
                            }}
                          />
                        ))}
                      </div>
                      <div>
                        <p className="font-bold">{preset.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {CAT_LABELS.join(" / ")}
                        </p>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={method === "custom"}
                    onClick={() => setMethod("custom")}
                    className={cn(
                      "flex items-center gap-4 rounded-xl border-2 border-dashed p-4 text-left transition-all hover:border-primary/50",
                      method === "custom"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    )}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                      <Sparkles className="size-5 text-primary" aria-hidden />
                    </div>
                    <div>
                      <p className="font-bold">{t("wizard.customSplit")}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("wizard.customSplitDesc")}
                      </p>
                    </div>
                  </button>
                </div>

                {method === "custom" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-6 space-y-4 rounded-xl border p-5"
                  >
                    {CAT_LABELS.map((label, i) => (
                      <div key={label} className="flex items-center gap-3">
                        <span
                          className="size-3 shrink-0 rounded-full"
                          style={{ backgroundColor: CAT_COLORS[i] }}
                          aria-hidden
                        />
                        <Label htmlFor={`split-${i}`} className="w-24">
                          {label}
                        </Label>
                        <input
                          id={`split-${i}`}
                          type="range"
                          min={0}
                          max={100}
                          value={split[i]}
                          onChange={(e) => {
                            const next = [...split] as [number, number, number];
                            next[i] = Number(e.target.value);
                            setSplit(next);
                          }}
                          className="flex-1 accent-[var(--primary)]"
                          aria-label={`${label} %`}
                        />
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={split[i]}
                          onChange={(e) => {
                            const next = [...split] as [number, number, number];
                            next[i] = Math.max(
                              0,
                              Math.min(100, Number(e.target.value) || 0)
                            );
                            setSplit(next);
                          }}
                          className="w-20 text-right"
                          aria-label={`${label} pourcentage`}
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* 100% indicator */}
                <div className="mt-6">
                  <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
                    {split.map((v, i) => (
                      <motion.div
                        key={i}
                        animate={{ width: `${Math.min(v, 100)}%` }}
                        transition={{ duration: 0.3 }}
                        style={{ backgroundColor: CAT_COLORS[i] }}
                      />
                    ))}
                  </div>
                  <p
                    className={cn(
                      "mt-2 flex items-center gap-1.5 text-sm font-medium",
                      splitValid ? "text-positive" : "text-negative"
                    )}
                    role="status"
                  >
                    {splitValid ? (
                      <>
                        <Check className="size-4" /> {splitTotal}% — {t("cats.pctOk")}
                      </>
                    ) : (
                      <>
                        <X className="size-4" /> {splitTotal}% — {t("wizard.totalMustBe100")}
                      </>
                    )}
                  </p>
                </div>
              </section>
            )}

            {step === 2 && (
              <section aria-labelledby="step-summary">
                <h1 id="step-summary" className="text-2xl font-bold sm:text-3xl">
                  {t("wizard.summaryTitle")}
                </h1>
                <p className="mt-2 text-muted-foreground">
                  {t("wizard.summarySubtitle")}
                </p>

                <div className="mt-8 rounded-xl border bg-muted/30 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{t("wizard.monthlyBudget")}</span>
                    <span className="text-2xl font-bold text-primary tabular-nums">
                      <AnimatedNumber value={totalIncome} format={(v) => fmt(v)} />
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {CAT_LABELS.map((label, i) => {
                    const allowed = (totalIncome * split[i]) / 100;
                    return (
                      <motion.div
                        key={label}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4 rounded-xl border p-4"
                      >
                        <span
                          className="flex size-10 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: softBg(CAT_COLORS[i]),
                            color: CAT_COLORS[i],
                          }}
                        >
                          <AppIcon
                            name={["home", "sparkles", "piggy-bank"][i]}
                            className="size-5"
                          />
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold">{label}</p>
                          <p className="text-sm text-muted-foreground">
                            {split[i]}% {t("common.perMonth")}
                          </p>
                        </div>
                        <span className="text-lg font-bold tabular-nums">
                          <AnimatedNumber value={allowed} format={(v) => fmt(v)} />
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <div className="mt-10 flex justify-between">
          <Button
            variant="ghost"
            onClick={() => go(-1)}
            disabled={step === 0}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            {t("common.back")}
          </Button>
          {step < 2 ? (
            <Button onClick={() => go(1)} disabled={!canNext} className="gap-2">
              {t("common.next")}
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button onClick={finish} size="lg" className="gap-2">
              <Check className="size-4" />
              {t("wizard.createBudget")}
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
