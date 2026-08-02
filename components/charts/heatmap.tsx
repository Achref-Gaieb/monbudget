"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { daysInMonth, localeOf } from "@/lib/format";
import { COLOR, softBg } from "@/lib/tokens";
import { useI18n } from "@/lib/use-i18n";

interface HeatmapProps {
  month: string;
  /** Total spent per day, index 0 = day 1 */
  daily: number[];
  accentColor?: string;
}

/** Opacity ramp for the heatmap: light tint for a small day, solid for the peak. */
function intensityFill(color: string, intensity: number): string {
  return softBg(color, 12 + intensity * 78);
}

/** Calendar heatmap of spending intensity per day. Weeks start on Monday. */
export function SpendingHeatmap({
  month,
  daily,
  accentColor = COLOR.primary,
}: HeatmapProps) {
  const { fmt, language } = useI18n();
  const [hovered, setHovered] = useState<number | null>(null);

  const [y, m] = month.split("-").map(Number);
  const dim = daysInMonth(month);
  const max = Math.max(...daily, 1);
  // getDay(): 0=Sunday; convert to Monday-start offset
  const firstWeekday = (new Date(y, m - 1, 1).getDay() + 6) % 7;

  const weekdays = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, i + 1).toLocaleDateString(localeOf(language), {
      weekday: "narrow",
    })
  );

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {weekdays.map((d, i) => (
          <span
            key={i}
            className="text-center text-xs font-medium text-muted-foreground"
            aria-hidden
          >
            {d}
          </span>
        ))}
        {Array.from({ length: firstWeekday }).map((_, i) => (
          <span key={`empty-${i}`} aria-hidden />
        ))}
        {daily.slice(0, dim).map((amount, i) => {
          const intensity = amount / max;
          return (
            <motion.button
              key={i}
              type="button"
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.012, duration: 0.25 }}
              whileHover={{ scale: 1.12 }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              aria-label={`${i + 1}/${m} : ${fmt(amount)}`}
              className="relative flex aspect-square items-center justify-center rounded-md border text-[11px] tabular-nums"
              style={{
                backgroundColor:
                  amount > 0 ? intensityFill(accentColor, intensity) : "var(--muted)",
                color:
                  intensity > 0.55
                    ? "var(--primary-foreground)"
                    : "var(--muted-foreground)",
                borderColor: "transparent",
              }}
            >
              {i + 1}
              {hovered === i && (
                <span className="absolute -top-8 z-10 rounded-md border bg-popover px-2 py-1 text-xs font-medium whitespace-nowrap text-popover-foreground shadow-md">
                  {fmt(amount)}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <span>-</span>
        {[0.15, 0.35, 0.6, 0.85].map((v) => (
          <span
            key={v}
            className="size-3 rounded-sm"
            style={{ backgroundColor: intensityFill(accentColor, v) }}
          />
        ))}
        <span>+</span>
      </div>
    </div>
  );
}
