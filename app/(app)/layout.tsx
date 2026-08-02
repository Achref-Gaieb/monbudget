"use client";

import { useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { useBudgetStore } from "@/lib/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const hasHydrated = useBudgetStore((s) => s.hasHydrated);
  const onboarded = useBudgetStore((s) => s.onboarded);
  const currentMonth = useBudgetStore((s) => s.currentMonth);
  const monthExists = useBudgetStore((s) => Boolean(s.months[s.currentMonth]));
  const setCurrentMonth = useBudgetStore((s) => s.setCurrentMonth);

  // Auto-create the viewed month (carries over structure + recurring expenses),
  // e.g. when a new calendar month starts.
  useEffect(() => {
    if (hasHydrated && onboarded && !monthExists) {
      setCurrentMonth(currentMonth);
    }
  }, [hasHydrated, onboarded, monthExists, currentMonth, setCurrentMonth]);

  return <AppShell>{children}</AppShell>;
}
