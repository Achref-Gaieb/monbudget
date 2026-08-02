"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, X } from "lucide-react";
import { AnimatedNumber } from "@/components/animated-number";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uid } from "@/lib/format";
import { useI18n } from "@/lib/use-i18n";
import type { TranslationKey } from "@/lib/i18n";

export interface IncomeRow {
  id: string;
  name: string;
  amount: string;
}

export function makeIncomeRow(name: string, amount = ""): IncomeRow {
  return { id: uid(), name, amount };
}

export function parseAmount(value: string): number {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function sumIncomes(rows: IncomeRow[]): number {
  return rows.reduce((sum, row) => sum + parseAmount(row.amount), 0);
}

const QUICK_ADD: { key: TranslationKey }[] = [
  { key: "home.salary" },
  { key: "home.bonus" },
  { key: "home.freelance" },
  { key: "home.otherIncome" },
];

interface IncomeStepProps {
  rows: IncomeRow[];
  onChange: (rows: IncomeRow[]) => void;
}

export function IncomeStep({ rows, onChange }: IncomeStepProps) {
  const { t, fmt } = useI18n();
  const total = sumIncomes(rows);

  const patch = (id: string, changes: Partial<IncomeRow>) =>
    onChange(rows.map((row) => (row.id === id ? { ...row, ...changes } : row)));

  return (
    <div className="space-y-4">
      <ul className="space-y-2.5">
        <AnimatePresence initial={false}>
          {rows.map((row) => (
            <motion.li
              key={row.id}
              layout
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.97 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex items-center gap-2"
            >
              <Input
                value={row.name}
                onChange={(e) => patch(row.id, { name: e.target.value })}
                placeholder={t("home.incomeName")}
                aria-label={t("home.incomeName")}
                className="h-11 flex-1"
              />
              <div className="relative w-32 shrink-0 sm:w-36">
                <Input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="10"
                  value={row.amount}
                  onChange={(e) => patch(row.id, { amount: e.target.value })}
                  placeholder="0"
                  aria-label={`${row.name || t("home.incomeName")} — ${t("common.amount")}`}
                  className="h-11 pr-2 text-right font-medium tabular-nums"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 shrink-0"
                aria-label={t("common.delete")}
                disabled={rows.length === 1}
                onClick={() => onChange(rows.filter((r) => r.id !== row.id))}
              >
                <X className="size-4 text-muted-foreground" />
              </Button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">{t("home.quickAdd")}</span>
        {QUICK_ADD.map(({ key }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange([...rows, makeIncomeRow(t(key))])}
            className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:border-primary/50 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Plus className="size-3" aria-hidden />
            {t(key)}
          </button>
        ))}
      </div>

      <motion.div
        layout
        className="flex items-baseline justify-between rounded-xl bg-muted/60 px-4 py-3"
      >
        <span className="text-sm text-muted-foreground">
          {t("home.monthlyIncome")}
        </span>
        <span className="text-2xl font-bold text-primary tabular-nums">
          <AnimatedNumber value={total} format={(v) => fmt(v)} duration={0.45} />
        </span>
      </motion.div>
    </div>
  );
}
