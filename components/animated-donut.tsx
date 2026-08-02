"use client";

import { motion, useReducedMotion } from "framer-motion";

export interface DonutSegment {
  key: string;
  label: string;
  value: number;
  /** Any CSS color, including var(--envelope-needs) */
  color: string;
}

interface AnimatedDonutProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel: string;
  centerValue: string;
  activeKey?: string | null;
  onActiveChange?: (key: string | null) => void;
}

/** Gap between segments, in degrees of arc. */
const GAP_DEG = 2.5;

/**
 * Donut whose arcs grow and re-flow smoothly whenever the values change.
 * The transition lives in CSS (stroke-dasharray/offset) so it stays fluid
 * even when the data updates on every keystroke.
 */
export function AnimatedDonut({
  segments,
  size = 200,
  thickness = 22,
  centerLabel,
  centerValue,
  activeKey = null,
  onActiveChange,
}: AnimatedDonutProps) {
  const reduced = useReducedMotion();
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const gap = (GAP_DEG / 360) * circumference;

  let cumulative = 0;
  const arcs = segments.map((segment) => {
    const fraction = total > 0 ? Math.max(0, segment.value) / total : 0;
    const rawLength = fraction * circumference;
    // Leave a surface gap between fills, but never swallow a small segment.
    const length = rawLength > gap * 1.5 ? rawLength - gap : rawLength;
    const offset = -cumulative;
    cumulative += rawLength;
    return { ...segment, length, offset, fraction };
  });

  const transition = reduced
    ? undefined
    : "stroke-dasharray 620ms cubic-bezier(0.22, 1, 0.36, 1), stroke-dashoffset 620ms cubic-bezier(0.22, 1, 0.36, 1), stroke-width 180ms ease, opacity 180ms ease";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        initial={reduced ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        role="img"
        aria-label={`${centerLabel} ${centerValue}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={thickness}
        />
        {total > 0 &&
          arcs.map((arc) => {
            const isActive = activeKey === arc.key;
            const dimmed = activeKey !== null && !isActive;
            return (
              <circle
                key={arc.key}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={isActive ? thickness + 5 : thickness}
                strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                strokeDashoffset={arc.offset}
                strokeLinecap="butt"
                opacity={dimmed ? 0.35 : 1}
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                style={{ transition, cursor: onActiveChange ? "pointer" : undefined }}
                onMouseEnter={() => onActiveChange?.(arc.key)}
                onMouseLeave={() => onActiveChange?.(null)}
              />
            );
          })}
      </motion.svg>

      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-6 text-center">
        <span className="text-xs text-muted-foreground">{centerLabel}</span>
        <span className="text-xl font-bold tabular-nums sm:text-2xl">
          {centerValue}
        </span>
      </div>
    </div>
  );
}
