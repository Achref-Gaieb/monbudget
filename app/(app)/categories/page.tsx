"use client";

import { motion, Reorder, useDragControls } from "framer-motion";
import { Check, FolderKanban, GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppIcon } from "@/components/app-icon";
import { ColorPicker } from "@/components/color-picker";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { IconPicker } from "@/components/icon-picker";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
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
import { Switch } from "@/components/ui/switch";
import {
  categoryStats,
  totalIncome,
  usageColor,
  type CategoryStat,
} from "@/lib/calculations";
import { METHOD_PRESETS, PALETTE } from "@/lib/presets";
import { COLOR, softBg } from "@/lib/tokens";
import { useBudgetStore, useCurrentMonth } from "@/lib/store";
import type { Category } from "@/lib/types";
import { useI18n } from "@/lib/use-i18n";
import { cn } from "@/lib/utils";

function CategoryRow({
  stat,
  income,
  onEdit,
  onDelete,
}: {
  stat: CategoryStat;
  income: number;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { t, fmt } = useI18n();
  const updateCategory = useBudgetStore((s) => s.updateCategory);
  const controls = useDragControls();
  const { category, allowed, spent, remaining, usage, expenseCount, forecast, forecastGap } =
    stat;
  const barColor = usageColor(usage, category.color);
  const usageLabel = Number.isFinite(usage) ? `${Math.round(usage)}%` : "∞";

  const cells: { label: string; value: string; color?: string }[] = [
    { label: t("cats.budget"), value: fmt(allowed) },
    { label: t("cats.spentShort"), value: fmt(spent) },
    {
      label: t("cats.remainingShort"),
      value: fmt(remaining),
      color: remaining < 0 ? COLOR.negative : undefined,
    },
    { label: t("cats.forecast"), value: fmt(forecast) },
    {
      label: t("cats.gap"),
      value: `${forecastGap >= 0 ? "+" : "−"}${fmt(Math.abs(forecastGap))}`,
      color: forecastGap >= 0 ? COLOR.positive : COLOR.negative,
    },
  ];

  return (
    <Reorder.Item
      value={category.id}
      dragListener={false}
      dragControls={controls}
      className="list-none"
    >
      <Card className="py-4 transition-shadow hover:shadow-md">
        <CardContent className="grid gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
              onPointerDown={(e) => controls.start(e)}
              aria-label={t("cats.dragHint")}
            >
              <GripVertical className="size-4.5" />
            </button>
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: softBg(category.color), color: category.color }}
            >
              <AppIcon name={category.icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate font-semibold">
                {category.name}
                {category.isSavings && (
                  <Badge variant="secondary" className="text-[10px]">
                    {t("dash.savings")}
                  </Badge>
                )}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("cats.expensesCount", { n: expenseCount })}
              </p>
            </div>
            {/* People budget in euros, not in percentages — so that is what
                they type. The share is derived and shown as a hint. */}
            {income > 0 ? (
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={10}
                    value={Math.round(allowed)}
                    onChange={(e) => {
                      const amount = Math.max(0, Number(e.target.value) || 0);
                      updateCategory(category.id, {
                        percentage: Math.min(100, (amount / income) * 100),
                      });
                    }}
                    className="h-11 w-28 pr-7 text-right tabular-nums"
                    aria-label={`${category.name} — ${t("cats.budget")}`}
                  />
                  <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-sm text-muted-foreground">
                    €
                  </span>
                </div>
                <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                  {Math.round(category.percentage)}%
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={Math.round(category.percentage)}
                  onChange={(e) =>
                    updateCategory(category.id, {
                      percentage: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                    })
                  }
                  className="h-11 w-16 text-right"
                  aria-label={`${category.name} — ${t("cats.percentage")}`}
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            )}
            <div className="flex gap-1">
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

          {/* Always-visible category metrics */}
          <div className="grid grid-cols-3 gap-2 pl-8 sm:grid-cols-5">
            {cells.map((cell) => (
              <div key={cell.label} className="rounded-lg bg-muted/50 px-2.5 py-1.5">
                <p className="text-[11px] text-muted-foreground">{cell.label}</p>
                <p
                  className="truncate text-sm font-semibold tabular-nums"
                  style={cell.color ? { color: cell.color } : undefined}
                >
                  {cell.value}
                </p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pl-8">
            <div
              className="h-2 flex-1 overflow-hidden rounded-full bg-muted"
              role="progressbar"
              aria-valuenow={Math.round(Math.min(Number.isFinite(usage) ? usage : 100, 100))}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${category.name} — ${usageLabel}`}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: barColor }}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(Number.isFinite(usage) ? usage : 100, 100)}%`,
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>
            <span
              className="w-11 text-right text-xs font-semibold tabular-nums"
              style={{ color: barColor }}
            >
              {usageLabel}
            </span>
          </div>
        </CardContent>
      </Card>
    </Reorder.Item>
  );
}

export default function CategoriesPage() {
  const { t, fmt } = useI18n();
  const month = useCurrentMonth();
  const setMethod = useBudgetStore((s) => s.setMethod);
  const addCategory = useBudgetStore((s) => s.addCategory);
  const updateCategory = useBudgetStore((s) => s.updateCategory);
  const removeCategory = useBudgetStore((s) => s.removeCategory);
  const reorderCategories = useBudgetStore((s) => s.reorderCategories);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [percentage, setPercentage] = useState("10");
  const [color, setColor] = useState(PALETTE[0]);
  const [icon, setIcon] = useState("wallet");
  const [isSavings, setIsSavings] = useState(false);
  const [error, setError] = useState("");

  // Reset the form fields when the dialog opens (event-driven, not an effect).
  const openDialog = (cat: Category | null) => {
    setEditing(cat);
    setName(cat?.name ?? "");
    setPercentage(String(cat?.percentage ?? 10));
    setColor(cat?.color ?? PALETTE[(month?.categories.length ?? 0) % PALETTE.length]);
    setIcon(cat?.icon ?? "wallet");
    setIsSavings(cat?.isSavings ?? false);
    setError("");
    setDialogOpen(true);
  };

  if (!month) {
    return (
      <EmptyState
        icon={FolderKanban}
        title={t("dash.noData")}
        ctaLabel={t("dash.startBudget")}
        ctaHref="/"
      />
    );
  }

  const stats = categoryStats(month);
  const statsById = new Map(stats.map((s) => [s.category.id, s]));
  const income = totalIncome(month);
  const pctTotal = month.categories.reduce((s, c) => s + c.percentage, 0);
  // Tolerant of the rounding introduced by entering euros rather than shares.
  const pctValid = Math.abs(pctTotal - 100) < 0.5;
  const unallocated = income * ((100 - pctTotal) / 100);

  const submit = () => {
    const pct = Number(percentage);
    if (!name.trim()) return setError(t("common.required"));
    if (Number.isNaN(pct) || pct < 0 || pct > 100)
      return setError(t("wizard.totalMustBe100"));
    const payload = {
      name: name.trim(),
      percentage: pct,
      color,
      icon,
      isSavings: isSavings || undefined,
    };
    if (editing) {
      updateCategory(editing.id, payload);
      toast.success(t("toast.saved"));
    } else {
      addCategory(payload);
      toast.success(t("toast.categoryAdded"));
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("cats.title")}
        subtitle={t("cats.subtitle")}
        actions={
          <Button onClick={() => openDialog(null)} className="gap-2">
            <Plus className="size-4" aria-hidden />
            {t("cats.add")}
          </Button>
        }
      />

      {/* Method presets */}
      <Card>
        <CardContent className="space-y-4">
          <p className="text-sm font-medium">{t("cats.method")}</p>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("cats.method")}>
            {METHOD_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                role="radio"
                aria-checked={month.method === preset.id}
                onClick={() => {
                  setMethod(preset.id);
                  if (month.categories.length > 3)
                    toast.info(t("cats.presetApplied"));
                }}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  month.method === preset.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:border-primary/50"
                )}
              >
                {preset.label}
              </button>
            ))}
            <span
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium",
                month.method === "custom"
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              {t("landing.custom")}
            </span>
          </div>

          {/* 100% indicator */}
          <div>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
              {month.categories.map((c) => (
                <motion.div
                  key={c.id}
                  animate={{ width: `${Math.min(c.percentage, 100)}%` }}
                  transition={{ duration: 0.4 }}
                  style={{ backgroundColor: c.color }}
                />
              ))}
            </div>
            <p
              className={cn(
                "mt-2 flex items-center gap-1.5 text-sm font-medium",
                pctValid
                  ? "text-positive"
                  : "text-negative"
              )}
              role="status"
            >
              {pctValid ? (
                <>
                  <Check className="size-4" aria-hidden />
                  {t("cats.allAllocated")}
                </>
              ) : (
                <>
                  <X className="size-4" aria-hidden />
                  {/* Euros are concrete; a percentage gap is not. */}
                  {income > 0
                    ? unallocated > 0
                      ? t("cats.leftToAllocate", { amount: fmt(unallocated) })
                      : t("cats.overAllocated", { amount: fmt(-unallocated) })
                    : pctTotal > 100
                      ? t("cats.pctOver", { diff: Math.round(pctTotal - 100) })
                      : t("cats.pctUnder", { diff: Math.round(100 - pctTotal) })}
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">{t("cats.dragHint")}</p>

      <Reorder.Group
        axis="y"
        values={month.categories.map((c) => c.id)}
        onReorder={reorderCategories}
        className="space-y-3"
      >
        {month.categories.map((category) => {
          const stat = statsById.get(category.id);
          if (!stat) return null;
          return (
            <CategoryRow
              key={category.id}
              stat={stat}
              income={income}
              onEdit={() => openDialog(category)}
              onDelete={() => setDeleting(category)}
            />
          );
        })}
      </Reorder.Group>

      {/* Add / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? t("cats.edit") : t("cats.add")}</DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="cat-name">{t("common.name")}</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cat-pct">{t("cats.percentage")}</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cat-pct"
                  type="number"
                  min={0}
                  max={100}
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t("common.color")}</Label>
              <ColorPicker value={color} onChange={setColor} />
            </div>
            <div className="grid gap-2">
              <Label>{t("common.icon")}</Label>
              <IconPicker value={icon} onChange={setIcon} color={color} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <Label htmlFor="cat-savings">{t("cats.isSavings")}</Label>
              <Switch
                id="cat-savings"
                checked={isSavings}
                onCheckedChange={setIsSavings}
              />
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
                {editing ? t("common.save") : t("common.add")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("common.confirmDelete")}
        description={
          deleting ? `${deleting.name} — ${t("cats.deleteWarning")}` : undefined
        }
        onConfirm={() => {
          if (deleting) {
            removeCategory(deleting.id);
            toast.success(t("toast.deleted"));
          }
        }}
      />
    </div>
  );
}
