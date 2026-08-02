"use client";

import { motion } from "framer-motion";
import { Check, SlidersHorizontal } from "lucide-react";
import { MiniDonut } from "@/components/mini-donut";
import { Input } from "@/components/ui/input";
import { ENVELOPE_TOKENS } from "@/lib/tokens";
import type { MethodId } from "@/lib/types";
import { useI18n } from "@/lib/use-i18n";
import { cn } from "@/lib/utils";

export type Split = [number, number, number];

/** The three headline methods; the full set stays available in the app. */
export const HOME_METHODS: { id: MethodId; label: string; split: Split }[] = [
  { id: "50-30-20", label: "50 / 30 / 20", split: [50, 30, 20] },
  { id: "60-20-20", label: "60 / 20 / 20", split: [60, 20, 20] },
  { id: "70-20-10", label: "70 / 20 / 10", split: [70, 20, 10] },
];

interface MethodStepProps {
  method: MethodId;
  split: Split;
  income: number;
  onSelect: (method: MethodId, split: Split) => void;
  onCustomChange: (split: Split) => void;
}

export function MethodStep({
  method,
  split,
  income,
  onSelect,
  onCustomChange,
}: MethodStepProps) {
  const { t, fmt } = useI18n();
  const envelopes = [t("landing.needs"), t("landing.wants"), t("landing.savings")];
  const customTotal = split[0] + split[1] + split[2];
  const customValid = customTotal === 100;

  return (
    <div className="space-y-4">
      <div
        className="grid gap-3 sm:grid-cols-2"
        role="radiogroup"
        aria-label={t("home.step2")}
      >
        {HOME_METHODS.map((preset) => {
          const selected = method === preset.id;
          return (
            <motion.button
              key={preset.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(preset.id, preset.split)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.99 }}
              className={cn(
                "relative flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-colors",
                selected
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/40"
              )}
            >
              {selected && (
                <motion.span
                  layoutId="method-check"
                  className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground"
                  aria-hidden
                >
                  <Check className="size-3" />
                </motion.span>
              )}
              <MiniDonut
                split={preset.split}
                size={56}
                colors={[...ENVELOPE_TOKENS]}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{preset.label}</p>
                <ul className="mt-1.5 space-y-0.5">
                  {preset.split.map((pct, i) => (
                    <li
                      key={envelopes[i]}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: ENVELOPE_TOKENS[i] }}
                        aria-hidden
                      />
                      <span className="truncate">{envelopes[i]}</span>
                      <span className="ml-auto font-medium text-foreground tabular-nums">
                        {income > 0 ? fmt((income * pct) / 100) : `${pct}%`}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.button>
          );
        })}

        {/* Custom */}
        <motion.button
          type="button"
          role="radio"
          aria-checked={method === "custom"}
          onClick={() => onSelect("custom", split)}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          className={cn(
            "relative flex items-center gap-4 rounded-xl border-2 border-dashed p-4 text-left transition-colors",
            method === "custom"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/40"
          )}
        >
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-dashed text-muted-foreground">
            <SlidersHorizontal className="size-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">{t("landing.custom")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("home.customHint")}
            </p>
          </div>
        </motion.button>
      </div>

      {method === "custom" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="space-y-3 overflow-hidden rounded-xl border p-4"
        >
          {envelopes.map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: ENVELOPE_TOKENS[i] }}
                aria-hidden
              />
              <span className="w-16 shrink-0 text-sm sm:w-20">{label}</span>
              <input
                type="range"
                min={0}
                max={100}
                value={split[i]}
                onChange={(e) => {
                  const next = [...split] as Split;
                  next[i] = Number(e.target.value);
                  onCustomChange(next);
                }}
                className="h-1.5 flex-1 accent-[var(--primary)]"
                aria-label={`${label} %`}
              />
              <Input
                type="number"
                min={0}
                max={100}
                value={split[i]}
                onChange={(e) => {
                  const next = [...split] as Split;
                  next[i] = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                  onCustomChange(next);
                }}
                className="h-9 w-16 text-right tabular-nums"
                aria-label={`${label} — ${t("cats.percentage")}`}
              />
            </div>
          ))}
          <p
            className={cn(
              "text-xs font-medium",
              customValid
                ? "text-positive"
                : "text-destructive"
            )}
            role="status"
          >
            {customTotal}%
            {!customValid && ` — ${t("wizard.totalMustBe100")}`}
          </p>
        </motion.div>
      )}
    </div>
  );
}
