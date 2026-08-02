"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { shiftMonth } from "@/lib/format";
import { useBudgetStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";

export function MonthPicker() {
  const currentMonth = useBudgetStore((s) => s.currentMonth);
  const setCurrentMonth = useBudgetStore((s) => s.setCurrentMonth);
  const { t, fmtMonth } = useI18n();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("month.previous")}
        onClick={() => setCurrentMonth(shiftMonth(currentMonth, -1))}
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-32 text-center text-sm font-semibold sm:min-w-36">
        {fmtMonth(currentMonth)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t("month.next")}
        onClick={() => setCurrentMonth(shiftMonth(currentMonth, 1))}
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}
