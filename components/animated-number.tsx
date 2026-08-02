"use client";

import { animate, useMotionValue, useReducedMotion } from "framer-motion";
import { useEffect, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  format: (v: number) => string;
  className?: string;
  duration?: number;
}

/**
 * Counter that animates towards its value on mount and on every change.
 *
 * The span is rendered without React children on purpose: the effect owns
 * its text content. Letting React render children into the same node while
 * writing to it imperatively detaches the text node React tracks, which
 * silently freezes the display on a stale value.
 */
export function AnimatedNumber({
  value,
  format,
  className,
  duration = 0.7,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const write = (v: number) => {
      node.textContent = format(v);
    };

    if (reduced) {
      motionValue.set(value);
      write(value);
      return;
    }

    const unsubscribe = motionValue.on("change", write);
    write(motionValue.get());
    const controls = animate(motionValue, value, {
      duration,
      ease: "easeOut",
      onComplete: () => write(value),
    });

    // Frame-independent safety net: animations are driven by
    // requestAnimationFrame, which is paused in hidden or non-compositing
    // tabs. This guarantees the exact value is displayed either way.
    const settle = window.setTimeout(
      () => {
        motionValue.set(value);
        write(value);
      },
      duration * 1000 + 60
    );

    return () => {
      controls.stop();
      unsubscribe();
      window.clearTimeout(settle);
    };
  }, [value, format, duration, motionValue, reduced]);

  return <span ref={ref} className={className} suppressHydrationWarning />;
}
