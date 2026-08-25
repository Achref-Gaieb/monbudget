"use client";

import { motion } from "framer-motion";
import {
  Home,
  PieChart,
  PiggyBank,
  Plus,
  Receipt,
  Settings,
  Target,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MonthPicker } from "./month-picker";
import { QuickExpense } from "./quick-expense";
import { ThemeToggle } from "./theme-toggle";
import { useBudgetStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Five destinations, one per job to be done. Anything more specialised
 * (income, analysis, history, simulator) is reached from the screen it
 * belongs to, so the main navigation stays scannable.
 */
const NAV: { href: string; icon: typeof Home; key: TranslationKey }[] = [
  { href: "/dashboard", icon: Home, key: "nav.home" },
  { href: "/depenses", icon: Receipt, key: "nav.transactions" },
  { href: "/categories", icon: PieChart, key: "nav.allocation" },
  { href: "/objectifs", icon: Target, key: "nav.goals" },
  { href: "/parametres", icon: Settings, key: "nav.settings" },
];

function SidebarLinks() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Navigation principale">
      {NAV.map(({ href, icon: Icon, key }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-lg bg-primary"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="relative z-10 size-4 shrink-0" aria-hidden />
            <span className="relative z-10">{t(key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}

/** Thumb-reachable tabs: every screen is one tap, with no menu to open first. */
function BottomTabs() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Navigation principale"
    >
      <ul className="flex">
        {NAV.map(({ href, icon: Icon, key }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="size-5" aria-hidden />
                <span className="max-w-full truncate">{t(key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [addOpen, setAddOpen] = useState(false);
  const userName = useBudgetStore((s) => s.settings.userName);
  const hasHydrated = useBudgetStore((s) => s.hasHydrated);
  const { t } = useI18n();

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"
          role="status"
          aria-label="Chargement"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r bg-sidebar lg:flex">
        <Link href="/dashboard" className="flex items-center gap-2 px-6 py-5">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <PiggyBank className="size-4.5" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight">
            {t("nav.appName")}
          </span>
        </Link>
        <SidebarLinks />
        {userName && (
          <div className="mt-auto border-t px-6 py-4">
            <p className="text-xs text-muted-foreground">Connecté en local</p>
            <p className="truncate text-sm font-semibold">{userName}</p>
          </div>
        )}
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold lg:hidden">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PiggyBank className="size-4" aria-hidden />
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-1.5">
            <MonthPicker />
            <ThemeToggle />
          </div>
        </header>

        {/* Bottom padding leaves room for the tab bar and the add button */}
        <main className="mx-auto w-full max-w-7xl px-4 py-6 pb-32 sm:px-6 sm:py-8 lg:pb-8">
          {children}
        </main>
      </div>

      {/* The one action that matters daily, always within reach */}
      <motion.button
        type="button"
        onClick={() => setAddOpen(true)}
        whileTap={{ scale: 0.94 }}
        aria-label={t("quick.fab")}
        className="fixed right-4 bottom-20 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-shadow hover:shadow-xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none sm:right-6 lg:bottom-6"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        <Plus className="size-6" aria-hidden />
      </motion.button>

      <BottomTabs />
      <QuickExpense open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
