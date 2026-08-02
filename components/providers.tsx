"use client";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { accessibleAccent } from "@/lib/contrast";
import { ACCENTS } from "@/lib/presets";
import { useBudgetStore } from "@/lib/store";

function applyTheme(theme: string) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
  // Keep the browser chrome (mobile address bar) in sync with the surface.
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? "#0a0a0a" : "#ffffff");
}

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useBudgetStore((s) => s.settings.theme);
  const accent = useBudgetStore((s) => s.settings.accent);
  const language = useBudgetStore((s) => s.settings.language);
  const hasHydrated = useBudgetStore((s) => s.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    applyTheme(theme);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => theme === "system" && applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme, hasHydrated]);

  useEffect(() => {
    if (!hasHydrated) return;
    const color = ACCENTS.find((a) => a.id === accent)?.value ?? ACCENTS[0].value;
    // Derive a readable pairing so every accent clears WCAG AA on its label.
    const { surface, ink } = accessibleAccent(color);
    const root = document.documentElement.style;
    root.setProperty("--primary", surface);
    root.setProperty("--primary-foreground", ink);
    root.setProperty("--ring", surface);
    root.setProperty("--sidebar-primary", surface);
    root.setProperty("--sidebar-primary-foreground", ink);
  }, [accent, hasHydrated]);

  useEffect(() => {
    if (hasHydrated) document.documentElement.lang = language;
  }, [language, hasHydrated]);

  return (
    <>
      {children}
      <Toaster position="top-right" richColors />
    </>
  );
}
