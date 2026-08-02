"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { AnimatedNumber } from "./animated-number";
import { Card, CardContent } from "./ui/card";
import { softBg } from "@/lib/tokens";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  format: (v: number) => string;
  icon: LucideIcon;
  /** Any CSS colour — prefer a token from lib/tokens (e.g. COLOR.positive) */
  color: string;
  sub?: string;
  negative?: boolean;
  index?: number;
}

export function StatCard({
  label,
  value,
  format,
  icon: Icon,
  color,
  sub,
  negative,
  index = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: "easeOut" }}
      whileHover={{ y: -3 }}
    >
      <Card className="relative overflow-hidden transition-shadow hover:shadow-lg">
        <CardContent className="flex items-center gap-4">
          <div
            className="flex size-11 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: softBg(color), color }}
          >
            <Icon className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">{label}</p>
            <p
              className={cn(
                "text-xl font-bold tabular-nums sm:text-2xl",
                negative && "text-negative"
              )}
            >
              <AnimatedNumber value={value} format={format} />
            </p>
            {sub && (
              <p className="truncate text-xs text-muted-foreground">{sub}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
