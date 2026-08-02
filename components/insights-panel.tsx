"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, Lightbulb, TrendingUp } from "lucide-react";
import { AppIcon } from "./app-icon";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import type { Insight, InsightSeverity } from "@/lib/insights";
import { COLOR, softBg } from "@/lib/tokens";
import { useI18n } from "@/lib/use-i18n";

const SEVERITY_STYLE: Record<
  InsightSeverity,
  { color: string; Icon: typeof Info }
> = {
  critical: { color: COLOR.negative, Icon: AlertTriangle },
  warning: { color: COLOR.warning, Icon: AlertTriangle },
  positive: { color: COLOR.positive, Icon: TrendingUp },
  info: { color: COLOR.info, Icon: Info },
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  const { t } = useI18n();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Lightbulb className="size-4 text-premium" aria-hidden />
          {t("insights.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insights.length === 0 ? (
          <p className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <CheckCircle2 className="size-4 text-positive" aria-hidden />
            {t("insights.empty")}
          </p>
        ) : (
          <ul className="grid gap-2.5">
            {insights.map((insight, i) => {
              const { color, Icon } = SEVERITY_STYLE[insight.severity];
              return (
                <motion.li
                  key={insight.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-3 rounded-xl border p-3"
                  style={{
                    borderColor: softBg(color, 20),
                    backgroundColor: softBg(color, 5),
                  }}
                >
                  <span
                    className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: softBg(color), color }}
                  >
                    <AppIcon name={insight.icon} className="size-3.5" />
                  </span>
                  <p className="flex-1 text-sm leading-snug">
                    {t(insight.messageKey, insight.params)}
                  </p>
                  <Icon
                    className="mt-0.5 size-3.5 shrink-0"
                    style={{ color }}
                    aria-hidden
                  />
                </motion.li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
