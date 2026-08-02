"use client";

import { createElement } from "react";
import { getIcon } from "@/lib/icons";

interface AppIconProps {
  /** Key into the icon registry (lib/icons.ts) */
  name: string;
  className?: string;
}

/**
 * Renders an icon from the registry by key. createElement keeps the
 * component reference stable for the react-hooks/static-components rule.
 */
export function AppIcon({ name, className }: AppIconProps) {
  return createElement(getIcon(name), { className, "aria-hidden": true });
}
