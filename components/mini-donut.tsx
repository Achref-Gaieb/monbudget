"use client";

import { ENVELOPE_TOKENS } from "@/lib/tokens";

const DEFAULT_COLORS = [...ENVELOPE_TOKENS];

interface MiniDonutProps {
  split: number[];
  size?: number;
  colors?: string[];
}

/** Simple conic-gradient donut used as a compact allocation preview. */
export function MiniDonut({ split, size = 72, colors = DEFAULT_COLORS }: MiniDonutProps) {
  const stops = split
    .map((value, i) => {
      const from = split.slice(0, i).reduce((a, b) => a + b, 0);
      const to = from + value;
      return `${colors[i % colors.length]} ${from}% ${to}%`;
    })
    .join(", ");
  return (
    <div
      className="relative shrink-0 rounded-full"
      style={{ width: size, height: size, background: `conic-gradient(${stops})` }}
      aria-hidden
    >
      <div className="absolute inset-[22%] rounded-full bg-card" />
    </div>
  );
}
