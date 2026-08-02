"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useBudgetStore } from "./store";

const MEDIA_QUERY = "(prefers-color-scheme: dark)";
/** Keep in sync with the .theme-transition duration in globals.css */
const TRANSITION_MS = 320;

function subscribeToSystem(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(MEDIA_QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

/**
 * The theme actually rendered: the user's explicit choice, or the OS
 * preference while the setting is "system" (the default).
 */
export function useResolvedTheme(): "light" | "dark" {
  const theme = useBudgetStore((s) => s.settings.theme);
  const systemTheme = useSyncExternalStore(
    subscribeToSystem,
    getSystemTheme,
    () => "light" as const
  );
  return theme === "system" ? systemTheme : theme;
}

/**
 * Toggles between light and dark, persisting the choice, and briefly
 * enables a global color transition so the switch feels smooth.
 */
export function useThemeToggle() {
  const resolved = useResolvedTheme();
  const updateSettings = useBudgetStore((s) => s.updateSettings);

  const toggle = useCallback(() => {
    const root = document.documentElement;
    root.classList.add("theme-transition");
    window.setTimeout(
      () => root.classList.remove("theme-transition"),
      TRANSITION_MS
    );
    updateSettings({ theme: resolved === "dark" ? "light" : "dark" });
  }, [resolved, updateSettings]);

  return { resolved, toggle };
}
