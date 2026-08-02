"use client";

import { Crown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useFeature, type FeatureId } from "@/lib/features";
import { useBudgetStore } from "@/lib/store";
import { useI18n } from "@/lib/use-i18n";
import { cn } from "@/lib/utils";

export function PremiumBadge({ className }: { className?: string }) {
  const { t } = useI18n();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-premium/15 px-2 py-0.5 text-[11px] font-semibold text-premium",
        className
      )}
    >
      <Crown className="size-3" aria-hidden />
      {t("premium.badge")}
    </span>
  );
}

interface PremiumGateProps {
  feature: FeatureId;
  children: React.ReactNode;
  className?: string;
}

/**
 * Gates a block behind a premium feature flag. Free users see a blurred
 * teaser with an unlock CTA (demo: flips the plan locally).
 */
export function PremiumGate({ feature, children, className }: PremiumGateProps) {
  const enabled = useFeature(feature);
  const setPlan = useBudgetStore((s) => s.setPlan);
  const { t } = useI18n();

  if (enabled) return <div className={className}>{children}</div>;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl", className)}>
      <div className="pointer-events-none select-none opacity-60 blur-[6px]" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-2xl border bg-background/70 p-6 text-center backdrop-blur-[2px]">
        <span className="flex size-11 items-center justify-center rounded-xl bg-premium/15 text-premium">
          <Crown className="size-5" aria-hidden />
        </span>
        <div>
          <p className="font-semibold">{t("premium.title")}</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {t("premium.desc")}
          </p>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            setPlan("premium");
            toast.success(t("premium.premiumName"));
          }}
        >
          <Crown className="size-3.5" aria-hidden />
          {t("premium.enable")}
        </Button>
      </div>
    </div>
  );
}
