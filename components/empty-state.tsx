"use client";

import { motion } from "framer-motion";
import { ArrowRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
  onCta?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  ctaLabel,
  ctaHref,
  onCta,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center"
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-6" aria-hidden />
      </div>
      <p className="mt-4 max-w-sm text-sm text-muted-foreground">{title}</p>
      {ctaLabel &&
        (ctaHref ? (
          <Button
            className="mt-5 gap-2"
            nativeButton={false}
            render={<Link href={ctaHref} />}
          >
            {ctaLabel}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        ) : (
          <Button onClick={onCta} className="mt-5 gap-2">
            {ctaLabel}
            <ArrowRight className="size-4" aria-hidden />
          </Button>
        ))}
    </motion.div>
  );
}
