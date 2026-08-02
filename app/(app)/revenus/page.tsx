"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus, Trash2, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AnimatedNumber } from "@/components/animated-number";
import { ChartCard } from "@/components/charts/chart-card";
import { IncomePie } from "@/components/charts/income-pie";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
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
import { totalIncome } from "@/lib/calculations";
import { useBudgetStore, useCurrentMonth } from "@/lib/store";
import type { Income } from "@/lib/types";
import { useI18n } from "@/lib/use-i18n";

export default function IncomesPage() {
  const { t, fmt, fmtMonth } = useI18n();
  const month = useCurrentMonth();
  const addIncome = useBudgetStore((s) => s.addIncome);
  const updateIncome = useBudgetStore((s) => s.updateIncome);
  const removeIncome = useBudgetStore((s) => s.removeIncome);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Income | null>(null);
  const [deleting, setDeleting] = useState<Income | null>(null);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  if (!month) {
    return (
      <EmptyState
        icon={Wallet}
        title={t("dash.noData")}
        ctaLabel={t("dash.startBudget")}
        ctaHref="/creer"
      />
    );
  }

  const total = totalIncome(month);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setAmount("");
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (income: Income) => {
    setEditing(income);
    setName(income.name);
    setAmount(String(income.amount));
    setError("");
    setDialogOpen(true);
  };

  const submit = () => {
    const parsed = Number(amount.replace(",", "."));
    if (!name.trim()) return setError(t("common.required"));
    if (!amount || Number.isNaN(parsed) || parsed <= 0)
      return setError(t("common.positive"));
    if (editing) {
      updateIncome(editing.id, { name: name.trim(), amount: parsed });
      toast.success(t("toast.saved"));
    } else {
      addIncome({ name: name.trim(), amount: parsed });
      toast.success(t("toast.incomeAdded"));
    }
    setDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("incomes.title")}
        subtitle={t("incomes.subtitle", { month: fmtMonth(month.month) })}
        actions={
          <Button onClick={openAdd} className="gap-2">
            <Plus className="size-4" aria-hidden />
            {t("incomes.add")}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-positive/10 text-positive">
                    <Wallet className="size-5" aria-hidden />
                  </span>
                  <p className="font-medium">{t("incomes.monthlyTotal")}</p>
                </div>
                <p className="text-2xl font-bold text-positive tabular-nums sm:text-3xl">
                  <AnimatedNumber value={total} format={(v) => fmt(v)} />
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {month.incomes.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title={t("incomes.empty")}
              ctaLabel={t("incomes.add")}
              onCta={openAdd}
            />
          ) : (
            <ul className="space-y-3">
              <AnimatePresence initial={false}>
                {month.incomes.map((income) => (
                  <motion.li
                    key={income.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                  >
                    <Card className="py-4 transition-shadow hover:shadow-md">
                      <CardContent className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 font-bold text-primary">
                          {income.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="flex-1 truncate font-medium">
                          {income.name}
                        </span>
                        <span className="font-bold tabular-nums">
                          {fmt(income.amount)}
                        </span>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("common.edit")}
                            onClick={() => openEdit(income)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("common.delete")}
                            onClick={() => setDeleting(income)}
                          >
                            <Trash2 className="size-4 text-negative" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>

        <ChartCard title={t("dash.incomeBreakdown")}>
          <IncomePie incomes={month.incomes} />
        </ChartCard>
      </div>

      {/* Add / edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editing ? t("incomes.edit") : t("incomes.add")}
            </DialogTitle>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="income-name">{t("common.name")}</Label>
              <Input
                id="income-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("wizard.incomePlaceholder")}
                autoFocus
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="income-amount">{t("common.amount")}</Label>
              <Input
                id="income-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
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
        description={deleting?.name}
        onConfirm={() => {
          if (deleting) {
            removeIncome(deleting.id);
            toast.success(t("toast.deleted"));
          }
        }}
      />
    </div>
  );
}
