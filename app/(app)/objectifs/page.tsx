"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  ChevronDown,
  CreditCard,
  Pencil,
  PiggyBank,
  Plus,
  Target,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AnimatedNumber } from "@/components/animated-number";
import { AppIcon } from "@/components/app-icon";
import { ColorPicker } from "@/components/color-picker";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { IconPicker } from "@/components/icon-picker";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { localeOf } from "@/lib/format";
import { goalKind, goalProgress, MILESTONES, savingsPlan } from "@/lib/goals";
import { PALETTE } from "@/lib/presets";
import { useBudgetStore, useCurrentMonth } from "@/lib/store";
import { COLOR, softBg } from "@/lib/tokens";
import type { Goal, GoalKind } from "@/lib/types";
import { useI18n } from "@/lib/use-i18n";
import { cn } from "@/lib/utils";

/** Four dots on the bar. Enough to feel progress, not enough to feel like a game. */
function Milestones({ percent, color }: { percent: number; color: string }) {
  return (
    <div className="mt-2 flex items-center justify-between">
      {MILESTONES.map((m) => {
        const passed = percent >= m;
        return (
          <span
            key={m}
            className={cn(
              "flex items-center gap-1 text-[11px] tabular-nums transition-colors",
              passed ? "font-semibold" : "text-muted-foreground"
            )}
            style={passed ? { color } : undefined}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ backgroundColor: passed ? color : "var(--muted-foreground)" }}
              aria-hidden
            />
            {m === 100 ? "🎉" : `${m}%`}
          </span>
        );
      })}
    </div>
  );
}

function GoalCard({
  goal,
  index,
  onEdit,
  onDelete,
  onContribute,
}: {
  goal: Goal;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  onContribute: () => void;
}) {
  const { t, fmt, fmtAuto, language } = useI18n();
  const contributeToGoal = useBudgetStore((s) => s.contributeToGoal);
  const { kind, percent, remaining, reached, monthsLeft } = goalProgress(goal);
  const isDebt = kind === "debt";

  const eta =
    monthsLeft !== null
      ? new Date(
          new Date().getFullYear(),
          new Date().getMonth() + monthsLeft,
          1
        ).toLocaleDateString(localeOf(language), { month: "long", year: "numeric" })
      : null;

  /** One tap contributes the planned monthly amount — the common case. */
  const quickContribute = () => {
    contributeToGoal(goal.id, Math.min(goal.monthly, remaining));
    const after = Math.min(goal.target, goal.saved + goal.monthly);
    const pct = goal.target > 0 ? Math.round((after / goal.target) * 100) : 0;
    toast.success(`${goal.name} · ${fmtAuto(after)}`, {
      description: `🎯 ${pct}%${eta ? ` · ${t("goals.byDate", { date: eta })}` : ""}`,
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="h-full">
        <CardContent className="flex h-full flex-col gap-3.5">
          <div className="flex items-center gap-3">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: softBg(goal.color), color: goal.color }}
            >
              <AppIcon name={goal.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate font-semibold">
                {goal.name}
                {isDebt && (
                  <CreditCard
                    className="size-3.5 shrink-0 text-muted-foreground"
                    aria-label={t("goals.debt")}
                  />
                )}
              </p>
              <p className="text-sm text-muted-foreground tabular-nums">
                <AnimatedNumber value={goal.saved} format={(v) => fmt(v)} />
                {" / "}
                {fmt(goal.target)}
                {isDebt ? ` ${t("goals.repaid")}` : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-0.5">
              <Button variant="ghost" size="icon" aria-label={t("common.edit")} onClick={onEdit}>
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("common.delete")}
                onClick={onDelete}
              >
                <Trash2 className="size-4 text-negative" />
              </Button>
            </div>
          </div>

          <div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={Math.round(percent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={goal.name}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: goal.color }}
                initial={{ width: 0 }}
                animate={{ width: `${percent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <Milestones percent={percent} color={goal.color} />
          </div>

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-semibold tabular-nums">
              {Math.round(percent)}%
            </span>
            <span className="text-muted-foreground">
              {isDebt ? t("goals.debtRemaining") : t("goals.remaining")} :{" "}
              <span className="font-medium text-foreground tabular-nums">
                {fmt(remaining)}
              </span>
            </span>
            {eta && !reached && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <CalendarClock className="size-3.5" aria-hidden />
                {eta}
              </span>
            )}
          </p>

          {reached ? (
            <p
              className="mt-auto text-sm font-medium"
              style={{ color: COLOR.positive }}
            >
              {t("goals.reached")}
            </p>
          ) : (
            <div className="mt-auto flex flex-wrap gap-2">
              {goal.monthly > 0 && (
                <Button className="h-11 flex-1 gap-2" onClick={quickContribute}>
                  <Plus className="size-4" aria-hidden />
                  {t("goals.quickAdd", { amount: fmtAuto(goal.monthly) })}
                </Button>
              )}
              <Button
                variant="outline"
                className={cn("h-11 gap-2", goal.monthly <= 0 && "flex-1")}
                onClick={onContribute}
              >
                {goal.monthly > 0 ? t("goals.otherAmount") : t("goals.addContribution")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function GoalsPage() {
  const { t, fmt, fmtAuto } = useI18n();
  const goals = useBudgetStore((s) => s.goals);
  const month = useCurrentMonth();
  const addGoal = useBudgetStore((s) => s.addGoal);
  const updateGoal = useBudgetStore((s) => s.updateGoal);
  const removeGoal = useBudgetStore((s) => s.removeGoal);
  const contributeToGoal = useBudgetStore((s) => s.contributeToGoal);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);
  const [contributing, setContributing] = useState<Goal | null>(null);
  const [contribution, setContribution] = useState("");

  // Three fields up front; the rest is folded away.
  const [showMore, setShowMore] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [monthly, setMonthly] = useState("");
  const [saved, setSaved] = useState("0");
  const [kind, setKind] = useState<GoalKind>("saving");
  const [color, setColor] = useState(PALETTE[8]);
  const [icon, setIcon] = useState("target");
  const [targetDate, setTargetDate] = useState("");
  const [error, setError] = useState("");

  const plan = useMemo(() => savingsPlan(month, goals), [month, goals]);

  const openDialog = (goal: Goal | null) => {
    setEditing(goal);
    setName(goal?.name ?? "");
    setTarget(goal ? String(goal.target) : "");
    setMonthly(goal ? String(goal.monthly) : "");
    setSaved(goal ? String(goal.saved) : "0");
    setKind(goal ? goalKind(goal) : "saving");
    setColor(goal?.color ?? PALETTE[8]);
    setIcon(goal?.icon ?? "target");
    setTargetDate(goal?.targetDate ?? "");
    setShowMore(false);
    setError("");
    setDialogOpen(true);
  };

  const submit = () => {
    const targetN = Number(target.replace(",", "."));
    if (!name.trim()) return setError(t("common.required"));
    if (Number.isNaN(targetN) || targetN <= 0) return setError(t("common.positive"));
    const payload = {
      name: name.trim(),
      target: targetN,
      saved: Math.max(0, Number(saved.replace(",", ".")) || 0),
      monthly: Math.max(0, Number(monthly.replace(",", ".")) || 0),
      type: kind,
      targetDate: targetDate || undefined,
      color,
      icon,
    };
    if (editing) {
      updateGoal(editing.id, payload);
      toast.success(t("toast.saved"));
    } else {
      addGoal(payload);
      toast.success(t("toast.goalAdded"));
    }
    setDialogOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <PageHeader
        title={t("goals.title")}
        subtitle={t("goals.subtitle")}
        actions={
          <Button onClick={() => openDialog(null)} className="h-11 gap-2">
            <Plus className="size-4" aria-hidden />
            {t("goals.add")}
          </Button>
        }
      />

      {/* Budget ↔ goals: information, never a blocking error */}
      {plan.hasSavingsCategory && goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border bg-card p-4"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <PiggyBank className="size-4" aria-hidden />
              {t("goals.savingsPlan")}
            </p>
            <p className="text-lg font-bold tabular-nums">{fmt(plan.envelope)}</p>
          </div>
          <p className="mt-1 text-sm">
            <span className="text-muted-foreground">
              {t("goals.allocated")} : {fmt(plan.allocated)}
            </span>
            {" · "}
            <span
              className="font-medium"
              style={{
                color:
                  plan.unallocated < -0.5
                    ? COLOR.warning
                    : Math.abs(plan.unallocated) < 0.5
                      ? COLOR.positive
                      : undefined,
              }}
            >
              {Math.abs(plan.unallocated) < 0.5
                ? t("goals.fullyAllocated")
                : plan.unallocated > 0
                  ? t("goals.unallocated", { amount: fmt(plan.unallocated) })
                  : t("goals.overAllocated", { amount: fmt(-plan.unallocated) })}
            </span>
          </p>
        </motion.div>
      )}

      {goals.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-12 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Target className="size-6" aria-hidden />
          </span>
          <p className="mt-4 font-medium">{t("goals.emptyTitle")}</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            {t("goals.emptyHint")}
          </p>
          <Button onClick={() => openDialog(null)} className="mt-5 h-11 gap-2">
            <Plus className="size-4" aria-hidden />
            {t("goals.add")}
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false}>
            {goals.map((goal, i) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={i}
                onEdit={() => openDialog(goal)}
                onDelete={() => setDeleting(goal)}
                onContribute={() => {
                  setContributing(goal);
                  setContribution("");
                }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Create / edit — three fields, then everything else on demand */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? t("goals.edit") : t("goals.add")}</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="goal-name">{t("common.name")}</Label>
              <Input
                id="goal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Acheter une maison, Fonds d'urgence…"
                className="h-11"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="goal-target">
                  {kind === "debt" ? t("goals.debtTarget") : t("goals.target")}
                </Label>
                <Input
                  id="goal-target"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="100000"
                  className="h-11"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goal-monthly">{t("goals.monthly")}</Label>
                <Input
                  id="goal-monthly"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={monthly}
                  onChange={(e) => setMonthly(e.target.value)}
                  placeholder="1000"
                  className="h-11"
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowMore((v) => !v)}
                aria-expanded={showMore}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronDown
                  className={cn("size-3.5 transition-transform", showMore && "rotate-180")}
                  aria-hidden
                />
                {t("goals.moreOptions")}
              </button>

              <AnimatePresence initial={false}>
                {showMore && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-3 pt-3">
                      <div className="grid gap-2">
                        <Label>{t("goals.kind")}</Label>
                        <div className="grid grid-cols-2 gap-2" role="radiogroup">
                          {(["saving", "debt"] as const).map((k) => (
                            <button
                              key={k}
                              type="button"
                              role="radio"
                              aria-checked={kind === k}
                              onClick={() => setKind(k)}
                              className={cn(
                                "flex h-11 items-center justify-center gap-2 rounded-lg border-2 text-sm font-medium transition-colors",
                                kind === k
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-border text-muted-foreground"
                              )}
                            >
                              {k === "saving" ? (
                                <PiggyBank className="size-4" aria-hidden />
                              ) : (
                                <CreditCard className="size-4" aria-hidden />
                              )}
                              {k === "saving" ? t("goals.saving") : t("goals.debt")}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="goal-saved">
                          {kind === "debt" ? t("goals.debtSaved") : t("goals.saved")}
                        </Label>
                        <Input
                          id="goal-saved"
                          type="number"
                          inputMode="decimal"
                          min="0"
                          value={saved}
                          onChange={(e) => setSaved(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="goal-date">{t("goals.targetDate")}</Label>
                        <Input
                          id="goal-date"
                          type="date"
                          value={targetDate}
                          onChange={(e) => setTargetDate(e.target.value)}
                          className="h-11"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t("common.color")}</Label>
                        <ColorPicker value={color} onChange={setColor} />
                      </div>
                      <div className="grid gap-2">
                        <Label>{t("common.icon")}</Label>
                        <IconPicker value={icon} onChange={setIcon} color={color} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit">
                {editing ? t("common.save") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Custom contribution */}
      <Dialog
        open={contributing !== null}
        onOpenChange={(open) => !open && setContributing(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {t("goals.addContribution")}
              {contributing ? ` — ${contributing.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              const amount = Number(contribution.replace(",", "."));
              if (contributing && amount > 0) {
                contributeToGoal(contributing.id, amount);
                const after = Math.min(
                  contributing.target,
                  contributing.saved + amount
                );
                const pct =
                  contributing.target > 0
                    ? Math.round((after / contributing.target) * 100)
                    : 0;
                toast.success(`${contributing.name} · ${fmtAuto(after)}`, {
                  description: `🎯 ${pct}%`,
                });
                setContributing(null);
              }
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="contribution">{t("goals.contribution")}</Label>
              <Input
                id="contribution"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                placeholder="100"
                className="h-11"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setContributing(null)}>
                {t("common.cancel")}
              </Button>
              <Button type="submit">{t("common.add")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("common.confirmDelete")}
        description={deleting?.name}
        onConfirm={() => {
          if (deleting) {
            removeGoal(deleting.id);
            toast.success(t("toast.deleted"));
          }
        }}
      />
    </div>
  );
}
