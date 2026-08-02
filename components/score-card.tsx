"use client";

import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, BadgeCheck, Info, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { AnimatedNumber } from "./animated-number";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import type { BudgetScore } from "@/lib/score";
import { COLOR } from "@/lib/tokens";
import { useI18n } from "@/lib/use-i18n";

/** Status color + icon for a score value — always paired with a text label. */
function scoreStatus(score: number) {
  if (score >= 70) return { color: COLOR.positive, Icon: BadgeCheck };
  if (score >= 50) return { color: COLOR.warning, Icon: AlertTriangle };
  return { color: COLOR.negative, Icon: ShieldAlert };
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreCard({ score }: { score: BudgetScore }) {
  const { t } = useI18n();
  const [explainOpen, setExplainOpen] = useState(false);
  const reduced = useReducedMotion();
  const { color, Icon } = scoreStatus(score.score);
  const target = CIRCUMFERENCE * (1 - score.score / 100);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-base">{t("score.title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 140 140" role="img" aria-label={`${t("score.title")} : ${score.score}/100`}>
            <circle
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              stroke="var(--muted)"
              strokeWidth="10"
            />
            <motion.circle
              cx="70"
              cy="70"
              r={RADIUS}
              fill="none"
              stroke={color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              transform="rotate(-90 70 70)"
              initial={{ strokeDashoffset: CIRCUMFERENCE }}
              animate={{ strokeDashoffset: target }}
              transition={
                reduced ? { duration: 0 } : { duration: 1, ease: "easeOut" }
              }
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums">
              <AnimatedNumber value={score.score} format={(v) => String(Math.round(v))} />
            </span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
          <Icon className="size-4" aria-hidden />
          {t(score.labelKey)}
        </p>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setExplainOpen(true)}
        >
          <Info className="size-3.5" aria-hidden />
          {t("score.explain")}
        </Button>
      </CardContent>

      <Dialog open={explainOpen} onOpenChange={setExplainOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("score.title")} — {score.score}/100
            </DialogTitle>
          </DialogHeader>
          <ul className="grid gap-3">
            {score.components.map((c) => {
              const ratio = c.max > 0 ? c.points / c.max : 0;
              return (
                <li key={c.labelKey}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium">{t(c.labelKey)}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {c.points} / {c.max}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor:
                          ratio >= 0.7
                            ? COLOR.positive
                            : ratio >= 0.4
                              ? COLOR.warning
                              : COLOR.negative,
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${ratio * 100}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
