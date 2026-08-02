"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarClock,
  Lock,
  Pencil,
  PiggyBank,
  Plus,
  Target,
  Trash2,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AnimatedNumber } from "@/components/animated-number";
import { AppIcon } from "@/components/app-icon";
import { AXIS_TICK, CHART_TOOLTIP_STYLE, ChartCard } from "@/components/charts/chart-card";
import { ColorPicker } from "@/components/color-picker";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { IconPicker } from "@/components/icon-picker";
import { MiniStat } from "@/components/mini-stat";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { computeAchievements } from "@/lib/achievements";
import { localeOf } from "@/lib/format";
import { PALETTE } from "@/lib/presets";
import { COLOR, softBg } from "@/lib/tokens";
import { useBudgetStore } from "@/lib/store";
import type { Goal } from "@/lib/types";
import { useI18n } from "@/lib/use-i18n";
import { cn } from "@/lib/utils";

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
  const { t, fmt, language } = useI18n();
  const progress = goal.target > 0 ? Math.min(100, (goal.saved / goal.target) * 100) : 0;
  const remaining = Math.max(0, goal.target - goal.saved);
  const reached = remaining === 0;
  const monthsLeft =
    goal.monthly > 0 ? Math.ceil(remaining / goal.monthly) : null;
  const eta =
    monthsLeft !== null && !reached
      ? new Date(
          new Date().getFullYear(),
          new Date().getMonth() + monthsLeft,
          1
        ).toLocaleDateString(localeOf(language), { month: "long", year: "numeric" })
      : null;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -3 }}
    >
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardContent className="flex h-full flex-col gap-4">
          <div className="flex items-center gap-3">
            <span
              className="flex size-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: softBg(goal.color), color: goal.color }}
            >
              <AppIcon name={goal.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{goal.name}</p>
              <p className="text-sm text-muted-foreground tabular-nums">
                <AnimatedNumber value={goal.saved} format={(v) => fmt(v)} />{" "}
                {t("common.of")} {fmt(goal.target)}
              </p>
            </div>
            <div className="flex gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                aria-label={t("common.edit")}
                onClick={onEdit}
              >
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
            <div className="mb-1 flex justify-between text-xs text-muted-foreground">
              <span>{t("goals.progress")}</span>
              <span className="font-semibold" style={{ color: goal.color }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div
              className="h-2.5 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={goal.name}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: goal.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="text-xs text-muted-foreground">{t("goals.remaining")}</p>
              <p className="font-bold tabular-nums">{fmt(remaining)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 px-3 py-2">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarClock className="size-3" aria-hidden />
                {t("goals.estimate")}
              </p>
              <p className="truncate font-bold">
                {reached
                  ? t("goals.reached")
                  : monthsLeft !== null
                    ? `${t("goals.months", { n: monthsLeft })}${eta ? ` · ${eta}` : ""}`
                    : "—"}
              </p>
            </div>
          </div>

          {!reached && (
            <Button
              variant="outline"
              className="mt-auto gap-2"
              onClick={onContribute}
            >
              <TrendingUp className="size-4" aria-hidden />
              {t("goals.addContribution")}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function GoalsPage() {
  const { t, fmt, language } = useI18n();
  const goals = useBudgetStore((s) => s.goals);
  const months = useBudgetStore((s) => s.months);
  const currentMonthKey = useBudgetStore((s) => s.currentMonth);
  const addGoal = useBudgetStore((s) => s.addGoal);
  const updateGoal = useBudgetStore((s) => s.updateGoal);
  const removeGoal = useBudgetStore((s) => s.removeGoal);
  const contributeToGoal = useBudgetStore((s) => s.contributeToGoal);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [deleting, setDeleting] = useState<Goal | null>(null);
  const [contributing, setContributing] = useState<Goal | null>(null);
  const [contribution, setContribution] = useState("");

  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("0");
  const [monthly, setMonthly] = useState("");
  const [color, setColor] = useState(PALETTE[8]);
  const [icon, setIcon] = useState("target");
  const [error, setError] = useState("");

  // Reset the form fields when the dialog opens (event-driven, not an effect).
  const openDialog = (goal: Goal | null) => {
    setEditing(goal);
    setName(goal?.name ?? "");
    setTarget(goal ? String(goal.target) : "");
    setSaved(goal ? String(goal.saved) : "0");
    setMonthly(goal ? String(goal.monthly) : "");
    setColor(goal?.color ?? PALETTE[8]);
    setIcon(goal?.icon ?? "piggy-bank");
    setError("");
    setDialogOpen(true);
  };

  const achievements = useMemo(
    () => computeAchievements(months, currentMonthKey, goals),
    [months, currentMonthKey, goals]
  );
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalSaved = goals.reduce((s, g) => s + g.saved, 0);
  const monthlyPlanned = goals.reduce(
    (s, g) => s + (g.saved >= g.target ? 0 : g.monthly),
    0
  );
  const projectionData = useMemo(() => {
    const points = [];
    const start = new Date();
    for (let i = 0; i <= 12; i++) {
      const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
      points.push({
        label: d.toLocaleDateString(localeOf(language), { month: "short" }),
        saved: Math.round(totalSaved + monthlyPlanned * i),
      });
    }
    return points;
  }, [totalSaved, monthlyPlanned, language]);

  const submit = () => {
    const targetN = Number(target.replace(",", "."));
    const savedN = Number(saved.replace(",", ".")) || 0;
    const monthlyN = Number(monthly.replace(",", ".")) || 0;
    if (!name.trim()) return setError(t("common.required"));
    if (Number.isNaN(targetN) || targetN <= 0)
      return setError(t("common.positive"));
    const payload = {
      name: name.trim(),
      target: targetN,
      saved: Math.max(0, savedN),
      monthly: Math.max(0, monthlyN),
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
    <div className="space-y-6">
      <PageHeader
        title={t("goals.title")}
        subtitle={t("goals.subtitle")}
        actions={
          <Button onClick={() => openDialog(null)} className="gap-2">
            <Plus className="size-4" aria-hidden />
            {t("goals.add")}
          </Button>
        }
      />

      {goals.length === 0 ? (
        <EmptyState
          icon={Target}
          title={t("goals.empty")}
          ctaLabel={t("goals.add")}
          onCta={() => openDialog(null)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {goals.map((goal, i) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={i}
                onEdit={() => {
                  openDialog(goal);
                }}
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

      {/* Savings projection */}
      {goals.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="grid content-start gap-3">
            <MiniStat
              index={0}
              label={t("goals.totalSaved")}
              value={fmt(totalSaved)}
              icon={PiggyBank}
            />
            <MiniStat
              index={1}
              label={t("goals.monthlyPlanned")}
              value={fmt(monthlyPlanned)}
              hint={t("common.perMonth")}
              icon={TrendingUp}
            />
          </div>
          <ChartCard title={t("goals.projection")} className="lg:col-span-2">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={projectionData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={AXIS_TICK}
                    tickLine={false}
                    axisLine={false}
                    width={54}
                    tickFormatter={(v: number) => fmt(v)}
                  />
                  <Tooltip
                    contentStyle={CHART_TOOLTIP_STYLE}
                    formatter={(value) => [fmt(Number(value ?? 0)), t("dash.savings")]}
                  />
                  <Line
                    type="monotone"
                    dataKey="saved"
                    stroke={COLOR.positive}
                    strokeWidth={2.5}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      )}

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4 text-premium" aria-hidden />
            {t("ach.title")}
            <span className="ml-auto text-xs font-normal text-muted-foreground">
              {t("ach.unlocked", { n: unlockedCount, total: achievements.length })}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {achievements.map((ach, i) => (
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn(
                  "rounded-xl border p-3.5",
                  ach.unlocked
                    ? "border-premium/30 bg-premium/5"
                    : "opacity-70"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      ach.unlocked
                        ? "bg-premium/15 text-premium"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {ach.unlocked ? (
                      <AppIcon name={ach.icon} className="size-4.5" />
                    ) : (
                      <Lock className="size-4" aria-hidden />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {t(ach.titleKey)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {t(ach.descKey)}
                    </p>
                  </div>
                </div>
                {!ach.unlocked && ach.progress > 0 && (
                  <div
                    className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-muted"
                    role="progressbar"
                    aria-valuenow={Math.round(ach.progress * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t(ach.titleKey)}
                  >
                    <motion.div
                      className="h-full rounded-full bg-premium/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${ach.progress * 100}%` }}
                      transition={{ duration: 0.6 }}
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add / edit goal */}
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
                placeholder="Ex : Épargner 5000€, Acheter une voiture…"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="goal-target">{t("goals.target")}</Label>
                <Input
                  id="goal-target"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="5000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="goal-saved">{t("goals.saved")}</Label>
                <Input
                  id="goal-saved"
                  type="number"
                  inputMode="decimal"
                  min="0"
                  value={saved}
                  onChange={(e) => setSaved(e.target.value)}
                />
              </div>
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
                placeholder="300"
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
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit">
                {editing ? t("common.save") : t("common.create")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Contribution dialog */}
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
                toast.success(t("toast.saved"));
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
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setContributing(null)}
              >
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
