"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { AppIcon } from "./app-icon";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Textarea } from "./ui/textarea";
import { categoryStats } from "@/lib/calculations";
import { monthKey, todayISO } from "@/lib/format";
import { useBudgetStore, useCurrentMonth } from "@/lib/store";
import { softBg } from "@/lib/tokens";
import { useI18n } from "@/lib/use-i18n";
import { cn } from "@/lib/utils";

/**
 * The app's most frequent action, reduced to two decisions: how much, and
 * what for. Everything else is either derived (date = today, colour = the
 * category's) or hidden behind "more options".
 */
export function QuickExpense({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useI18n();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-auto bottom-0 max-h-[90vh] max-w-full translate-y-0 gap-3 overflow-y-auto rounded-b-none rounded-t-2xl p-5 sm:top-1/2 sm:bottom-auto sm:max-w-md sm:-translate-y-1/2 sm:rounded-2xl"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-base">{t("quick.title")}</DialogTitle>
        </DialogHeader>
        {/* Remounts on each opening so the form always starts blank. */}
        {open && <QuickExpenseForm onClose={() => onOpenChange(false)} />}
      </DialogContent>
    </Dialog>
  );
}

function QuickExpenseForm({ onClose }: { onClose: () => void }) {
  const { t, fmt, fmtAuto, currency } = useI18n();
  const month = useCurrentMonth();
  const addExpense = useBudgetStore((s) => s.addExpense);
  const currentMonthKey = useBudgetStore((s) => s.currentMonth);

  const categories = month?.categories ?? [];
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [showMore, setShowMore] = useState(false);
  const [name, setName] = useState("");
  const [date, setDate] = useState(
    currentMonthKey === monthKey() ? todayISO() : `${currentMonthKey}-01`
  );
  const [note, setNote] = useState("");
  const [recurring, setRecurring] = useState(false);

  const value = Number(amount.replace(",", ".")) || 0;
  const category = categories.find((c) => c.id === categoryId);
  const canSubmit = value > 0 && Boolean(category);

  const submit = () => {
    if (!canSubmit || !category) return;
    addExpense({
      // The category name is a sensible label — asking for one would add a
      // mandatory field to the app's most repeated action.
      name: name.trim() || category.name,
      amount: value,
      categoryId: category.id,
      date,
      description: note.trim() || undefined,
      recurring,
      color: category.color,
    });

    // Tell the user what their action changed, not just that it worked.
    const stat = categoryStats(
      useBudgetStore.getState().months[currentMonthKey]
    ).find((s) => s.category.id === category.id);
    const description =
      stat && stat.allowed > 0
        ? stat.remaining >= 0
          ? t("quick.remaining", {
              amount: fmt(stat.remaining),
              name: category.name,
            })
          : t("quick.over", {
              name: category.name,
              amount: fmt(Math.abs(stat.remaining)),
            })
        : `${category.name} · ${fmtAuto(value)}`;

    toast.success(`${t("quick.added")} · ${fmtAuto(value)}`, { description });
    onClose();
  };

  return (
    <form
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {/* Amount — the hero of this screen */}
      <div className="flex items-baseline justify-center gap-2 pt-1">
        <input
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
          inputMode="decimal"
          placeholder="0"
          autoFocus
          aria-label={t("common.amount")}
          className="w-full max-w-[7ch] bg-transparent text-center text-5xl font-bold tabular-nums outline-none placeholder:text-muted-foreground/40"
        />
        <span className="text-2xl font-semibold text-muted-foreground">
          {currency === "EUR" ? "€" : currency}
        </span>
      </div>

      {/* Category — one tap */}
      <div className="grid gap-2">
        <Label className="text-xs text-muted-foreground">{t("quick.where")}</Label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t("quick.where")}>
          {categories.map((c) => {
            const selected = c.id === categoryId;
            return (
              <button
                key={c.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setCategoryId(c.id)}
                className={cn(
                  "flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                  selected ? "border-transparent" : "hover:bg-muted"
                )}
                style={
                  selected
                    ? { backgroundColor: softBg(c.color, 18), color: c.color, borderColor: c.color }
                    : undefined
                }
              >
                <AppIcon name={c.icon} className="size-4" />
                <span className="max-w-32 truncate">{c.name}</span>
                {selected && <Check className="size-3.5" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Everything else, out of the way until asked for */}
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
          {t("quick.more")}
        </button>

        <AnimatePresence initial={false}>
          {showMore && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="grid gap-3 pt-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="q-name" className="text-xs">
                    {t("quick.nameOptional")}
                  </Label>
                  <Input
                    id="q-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={category?.name ?? ""}
                    className="h-11"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="q-date" className="text-xs">
                    {t("common.date")}
                  </Label>
                  <Input
                    id="q-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="q-note" className="text-xs">
                    {t("common.description")}
                  </Label>
                  <Textarea
                    id="q-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={2}
                  />
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <Label htmlFor="q-recurring" className="text-sm font-normal">
                    {t("exp.recurringLabel")}
                  </Label>
                  <Switch
                    id="q-recurring"
                    checked={recurring}
                    onCheckedChange={setRecurring}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          variant="ghost"
          className="h-12"
          onClick={onClose}
        >
          {t("common.cancel")}
        </Button>
        <Button type="submit" className="h-12 flex-1 gap-2 text-base" disabled={!canSubmit}>
          <Plus className="size-4" aria-hidden />
          {t("quick.add")}
        </Button>
      </div>
    </form>
  );
}
