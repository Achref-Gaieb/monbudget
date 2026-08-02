"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepCardProps {
  step: number;
  title: string;
  hint?: string;
  /** Dimmed and non-interactive until the previous step is satisfied */
  locked?: boolean;
  done?: boolean;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export function StepCard({
  step,
  title,
  hint,
  locked = false,
  done = false,
  children,
  className,
  delay = 0,
}: StepCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      aria-labelledby={`step-${step}-title`}
      className={cn(
        "rounded-2xl border bg-card p-5 transition-all duration-300 sm:p-6",
        locked && "pointer-events-none opacity-45",
        className
      )}
    >
      <header className="mb-5 flex items-start gap-3">
        <motion.span
          animate={done ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.35 }}
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors",
            done
              ? "bg-positive text-background"
              : "bg-primary/10 text-primary"
          )}
          aria-hidden
        >
          {done ? <Check className="size-4" /> : step}
        </motion.span>
        <div className="min-w-0">
          <h2 id={`step-${step}-title`} className="font-semibold">
            {title}
          </h2>
          {hint && (
            <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>
          )}
        </div>
      </header>
      {children}
    </motion.section>
  );
}
