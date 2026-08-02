"use client";

import { motion } from "framer-motion";
import { ArrowRight, PiggyBank } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  QuickBudget,
  QuickBudgetSkeleton,
} from "@/components/quick-budget/quick-budget";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildDemoData } from "@/lib/demo";
import type { TranslationKey } from "@/lib/i18n";
import { useBudgetStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";

const NAV: { href: string; key: TranslationKey }[] = [
  { href: "/dashboard", key: "home.navDashboard" },
  { href: "/categories", key: "home.navBudget" },
  { href: "/depenses", key: "home.navExpenses" },
  { href: "/objectifs", key: "home.navGoals" },
  { href: "/historique", key: "home.navAnalysis" },
];

export default function HomePage() {
  const router = useRouter();
  const { t } = useI18n();
  const hasHydrated = useBudgetStore((s) => s.hasHydrated);
  const onboarded = useBudgetStore((s) => s.onboarded);
  const importData = useBudgetStore((s) => s.importData);
  const settings = useBudgetStore((s) => s.settings);

  const loadDemo = () => {
    importData(buildDemoData(settings));
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 font-semibold tracking-tight"
          >
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PiggyBank className="size-4.5" aria-hidden />
            </span>
            {t("nav.appName")}
          </Link>

          <nav
            className="mx-auto hidden items-center gap-1 md:flex"
            aria-label={t("nav.appName")}
          >
            {NAV.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className="rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <ThemeToggle />
            {hasHydrated && onboarded && (
              <Button
                variant="outline"
                nativeButton={false}
                render={<Link href="/dashboard" />}
                className="hidden sm:inline-flex"
              >
                {t("home.openDashboard")}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(680px circle at 50% -10%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 70%)",
          }}
          aria-hidden
        />
        <div className="mx-auto max-w-3xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24 sm:pb-16">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <Badge variant="secondary" className="mb-6 font-normal">
              {t("landing.badge")}
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
          >
            {t("home.heroTitle")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground text-pretty"
          >
            {t("home.heroSubtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.19 }}
            className="mt-8 flex flex-col items-center gap-3"
          >
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="#creer" />}
              className="h-12 w-full gap-2 px-7 text-base sm:w-auto"
            >
              {t("home.heroCta")}
              <ArrowRight className="size-4" aria-hidden />
            </Button>
            <button
              type="button"
              onClick={loadDemo}
              className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
            >
              {t("home.exploreDemo")}
            </button>
          </motion.div>
        </div>
      </section>

      {/* Quick budget builder */}
      <section
        id="creer"
        className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-16 sm:px-6 sm:pb-24"
      >
        {hasHydrated ? <QuickBudget /> : <QuickBudgetSkeleton />}
      </section>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground sm:px-6">
          <p>{t("home.advancedTools")}</p>
          <p className="text-xs">
            {t("nav.appName")} · {t("landing.footerNote")}
          </p>
        </div>
      </footer>
    </div>
  );
}
