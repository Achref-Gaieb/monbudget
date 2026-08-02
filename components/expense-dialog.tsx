"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ColorPicker } from "./color-picker";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { monthKey, todayISO } from "@/lib/format";
import { PALETTE } from "@/lib/presets";
import { useBudgetStore, useCurrentMonth } from "@/lib/store";
import type { Expense } from "@/lib/types";
import { useI18n } from "@/lib/use-i18n";

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this expense instead of creating one. */
  expense?: Expense;
  defaultCategoryId?: string;
}

export function ExpenseDialog({
  open,
  onOpenChange,
  expense,
  defaultCategoryId,
}: ExpenseDialogProps) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? t("exp.edit") : t("exp.add")}</DialogTitle>
        </DialogHeader>
        {/* Mounted only while open so the form state resets on each opening. */}
        {open && (
          <ExpenseForm
            key={expense?.id ?? "new"}
            expense={expense}
            defaultCategoryId={defaultCategoryId}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ExpenseForm({
  expense,
  defaultCategoryId,
  onClose,
}: {
  expense?: Expense;
  defaultCategoryId?: string;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const month = useCurrentMonth();
  const addExpense = useBudgetStore((s) => s.addExpense);
  const updateExpense = useBudgetStore((s) => s.updateExpense);
  const currentMonthKey = useBudgetStore((s) => s.currentMonth);

  const firstCat = month?.categories[0];
  const [name, setName] = useState(expense?.name ?? "");
  const [amount, setAmount] = useState(expense ? String(expense.amount) : "");
  const [categoryId, setCategoryId] = useState(
    expense?.categoryId ?? defaultCategoryId ?? firstCat?.id ?? ""
  );
  const [date, setDate] = useState(
    expense?.date ??
      (currentMonthKey === monthKey() ? todayISO() : `${currentMonthKey}-01`)
  );
  const [description, setDescription] = useState(expense?.description ?? "");
  const [recurring, setRecurring] = useState(expense?.recurring ?? false);
  const [color, setColor] = useState(
    expense?.color ?? firstCat?.color ?? PALETTE[0]
  );
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  const submit = () => {
    const parsed = Number(amount.replace(",", "."));
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = t("common.required");
    if (!amount || Number.isNaN(parsed) || parsed <= 0)
      nextErrors.amount = t("common.positive");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !categoryId) return;

    const payload = {
      name: name.trim(),
      amount: parsed,
      categoryId,
      date: date || todayISO(),
      description: description.trim() || undefined,
      recurring,
      color,
    };
    if (expense) {
      updateExpense(expense.id, payload);
      toast.success(t("toast.saved"));
    } else {
      addExpense(payload);
      toast.success(t("toast.expenseAdded"));
    }
    onClose();
  };

  return (
    <form
      className="grid gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-2">
        <Label htmlFor="exp-name">{t("common.name")}</Label>
        <Input
          id="exp-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex : Loyer, Netflix, Courses…"
          aria-invalid={!!errors.name}
          autoFocus
        />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">
          <Label htmlFor="exp-amount">{t("common.amount")}</Label>
          <Input
            id="exp-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
            aria-invalid={!!errors.amount}
          />
          {errors.amount && (
            <p className="text-xs text-destructive">{errors.amount}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="exp-date">{t("common.date")}</Label>
          <Input
            id="exp-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label>{t("exp.category")}</Label>
        <Select
          value={categoryId}
          onValueChange={(v) => v !== null && setCategoryId(v)}
          items={Object.fromEntries(
            (month?.categories ?? []).map((c) => [c.id, c.name])
          )}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {month?.categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                <span
                  className="inline-block size-2.5 rounded-full"
                  style={{ backgroundColor: c.color }}
                />
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="exp-desc">{t("common.description")}</Label>
        <Textarea
          id="exp-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label htmlFor="exp-recurring">{t("exp.recurringLabel")}</Label>
          <p className="text-xs text-muted-foreground">
            {t("exp.recurringHint")}
          </p>
        </div>
        <Switch
          id="exp-recurring"
          checked={recurring}
          onCheckedChange={setRecurring}
        />
      </div>

      <div className="grid gap-2">
        <Label>{t("common.color")}</Label>
        <ColorPicker value={color} onChange={setColor} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {t("common.cancel")}
        </Button>
        <Button type="submit">
          {expense ? t("common.save") : t("common.add")}
        </Button>
      </div>
    </form>
  );
}
