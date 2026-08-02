"use client";

import { motion } from "framer-motion";
import { ArrowRight, Wallet } from "lucide-react";
import { useState } from "react";
import { AnimatedDonut } from "@/components/animated-donut";
import { AnimatedNumber } from "@/components/animated-number";
import { Button } from "@/components/ui/button";
import { ENVELOPE_TOKENS } from "@/lib/tokens";
import { useI18n } from "@/lib/use-i18n";
import type { Split } from "./method-step";

interface SimulationPanelProps {
  income: number;
  split: Split;
  ctaLabel: string;
  ctaDisabled: boolean;
  onStart: () => void;
}

export function SimulationPanel({
  income,
  split,
  ctaLabel,
  ctaDisabled,
  onStart,
}: SimulationPanelProps) {
  const { t, fmt } = useI18n();
  const [active, setActive] = useState<string | null>(null);

  const labels = [t("landing.needs"), t("landing.wants"), t("landing.savings")];
  const amounts = split.map((pct) => (income * pct) / 100);

  const segments = labels.map((label, i) => ({
    key: `envelope-${i}`,
    label,
    value: amounts[i],
    color: ENVELOPE_TOKENS[i],
  }));

  const activeIndex = segments.findIndex((s) => s.key === active);
  const centerLabel =
    activeIndex >= 0 ? labels[activeIndex] : t("home.monthlyIncome");
  const centerValue =
    activeIndex >= 0 ? fmt(amounts[activeIndex]) : fmt(income);

  const tiles = [
    { label: t("home.available"), value: income },
    { label: t("home.advised"), value: amounts[2] },
    { label: t("home.leftToLive"), value: income - amounts[0] },
  ];

  return (
    <div className="space-y-5">
      {income > 0 ? (
        <>
          <div className="flex justify-center">
            <AnimatedDonut
              segments={segments}
              size={188}
              thickness={20}
              centerLabel={centerLabel}
              centerValue={centerValue}
              activeKey={active}
              onActiveChange={setActive}
            />
          </div>

          <ul className="space-y-2">
            {labels.map((label, i) => (
              <li
                key={label}
                onMouseEnter={() => setActive(`envelope-${i}`)}
                onMouseLeave={() => setActive(null)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted/60"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: ENVELOPE_TOKENS[i] }}
                  aria-hidden
                />
                <span className="truncate text-muted-foreground">{label}</span>
                <span className="ml-auto font-semibold tabular-nums">
                  <AnimatedNumber
                    value={amounts[i]}
                    format={(v) => fmt(v)}
                    duration={0.45}
                  />
                </span>
                <span className="w-9 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                  {split[i]}%
                </span>
              </li>
            ))}
          </ul>

          <div className="grid grid-cols-3 gap-2 border-t pt-4">
            {tiles.map((tile) => (
              <div key={tile.label}>
                <p className="truncate text-[11px] text-muted-foreground">
                  {tile.label}
                </p>
                <p className="mt-0.5 text-sm font-bold tabular-nums">
                  <AnimatedNumber
                    value={tile.value}
                    format={(v) => fmt(v)}
                    duration={0.45}
                  />
                </p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-3 py-12 text-center"
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Wallet className="size-5" aria-hidden />
          </span>
          <p className="max-w-[15rem] text-sm text-muted-foreground">
            {t("home.enterIncome")}
          </p>
        </motion.div>
      )}

      <Button
        size="lg"
        className="h-12 w-full gap-2 text-base"
        disabled={ctaDisabled}
        onClick={onStart}
      >
        {ctaLabel}
        <ArrowRight className="size-4" aria-hidden />
      </Button>
    </div>
  );
}
