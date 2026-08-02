"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  FlaskConical,
  FolderKanban,
  LayoutDashboard,
  History,
  Menu,
  PiggyBank,
  Receipt,
  Settings,
  Target,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MonthPicker } from "./month-picker";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui/button";
import { useBudgetStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import type { TranslationKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV: { href: string; icon: typeof LayoutDashboard; key: TranslationKey }[] = [
  { href: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
  { href: "/revenus", icon: Wallet, key: "nav.incomes" },
  { href: "/categories", icon: FolderKanban, key: "nav.categories" },
  { href: "/depenses", icon: Receipt, key: "nav.expenses" },
  { href: "/simulateur", icon: FlaskConical, key: "nav.simulator" },
  { href: "/objectifs", icon: Target, key: "nav.goals" },
  { href: "/historique", icon: History, key: "nav.history" },
  { href: "/parametres", icon: Settings, key: "nav.settings" },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
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
            onClick={onNavigate}
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

function Logo() {
  const { t } = useI18n();
  return (
    <Link href="/" className="flex items-center gap-2 px-6 py-5">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <PiggyBank className="size-4.5" aria-hidden />
      </span>
      <span className="text-lg font-bold tracking-tight">{t("nav.appName")}</span>
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const userName = useBudgetStore((s) => s.settings.userName);
  const hasHydrated = useBudgetStore((s) => s.hasHydrated);

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
        <Logo />
        <NavLinks />
        {userName && (
          <div className="mt-auto border-t px-6 py-4">
            <p className="text-xs text-muted-foreground">Connecté en local</p>
            <p className="truncate text-sm font-semibold">{userName}</p>
          </div>
        )}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: "spring", stiffness: 400, damping: 36 }}
              className="fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-sidebar lg:hidden"
            >
              <div className="flex items-center justify-between pr-3">
                <Logo />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Fermer le menu"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="size-5" />
          </Button>
          <div className="ml-auto flex items-center gap-1.5">
            <MonthPicker />
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
