"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

interface MiniStatProps {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  index?: number;
}

/** Compact stat tile — plain text tokens, no chart chrome. */
export function MiniStat({ label, value, icon: Icon, hint, index = 0 }: MiniStatProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.04, duration: 0.3 }}
      className="rounded-xl border bg-card px-3.5 py-3"
    >
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="size-3.5" aria-hidden />
        <span className="truncate">{label}</span>
      </p>
      <p className="mt-1 truncate text-sm font-bold tabular-nums sm:text-base">{value}</p>
      {hint && <p className="truncate text-[11px] text-muted-foreground">{hint}</p>}
    </motion.div>
  );
}
