"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useBudgetStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { useThemeToggle } from "@/lib/use-theme";
import { cn } from "@/lib/utils";

/** Light/dark switch. Renders a placeholder until hydration to avoid a flash. */
export function ThemeToggle({ className }: { className?: string }) {
  const hasHydrated = useBudgetStore((s) => s.hasHydrated);
  const { resolved, toggle } = useThemeToggle();
  const { t } = useI18n();

  if (!hasHydrated) {
    return <div className={cn("size-9 shrink-0", className)} aria-hidden />;
  }

  const isDark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t("theme.toLight") : t("theme.toDark")}
      title={isDark ? t("theme.toLight") : t("theme.toDark")}
      className={cn(
        "relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className
      )}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.span
          key={isDark ? "moon" : "sun"}
          initial={{ y: 14, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 30 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="flex items-center justify-center"
        >
          {isDark ? (
            <Moon className="size-4.5 text-indigo-400" aria-hidden />
          ) : (
            <Sun className="size-4.5 text-premium" aria-hidden />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
