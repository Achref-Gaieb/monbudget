"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Plus, Receipt, RefreshCw, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppIcon } from "@/components/app-icon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { ExpenseDialog } from "@/components/expense-dialog";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { filterExpenses } from "@/lib/calculations";
import { useBudgetStore, useCurrentMonth } from "@/lib/store";
import { softBg } from "@/lib/tokens";
import type { Expense } from "@/lib/types";
import { useI18n } from "@/lib/use-i18n";

type SortKey = "date" | "amount" | "name";

export default function ExpensesPage() {
  const { t, fmt, fmtDate, fmtMonth } = useI18n();
  const month = useCurrentMonth();
  const removeExpense = useBudgetStore((s) => s.removeExpense);

  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [type, setType] = useState<"all" | "recurring" | "one-time">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>(undefined);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const filtered = useMemo(() => {
    if (!month) return [];
    const result = filterExpenses(month.expenses, {
      query,
      categoryId,
      type,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
    });
    return [...result].sort((a, b) => {
      if (sortKey === "amount") return b.amount - a.amount;
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return b.date.localeCompare(a.date);
    });
  }, [month, query, categoryId, type, sortKey, minAmount, maxAmount]);

  if (!month) {
    return (
      <EmptyState
        icon={Receipt}
        title={t("dash.noData")}
        ctaLabel={t("dash.startBudget")}
        ctaHref="/creer"
      />
    );
  }

  const categoriesById = new Map(month.categories.map((c) => [c.id, c]));
  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("exp.title")}
        subtitle={t("exp.subtitle", { month: fmtMonth(month.month) })}
        actions={
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="size-4" aria-hidden />
            {t("exp.add")}
          </Button>
        }
      />

      {/* Filters */}
      <Card>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative sm:col-span-2">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("common.search")}
              className="pl-9"
              aria-label={t("common.search")}
            />
          </div>
          <Select
            value={categoryId}
            onValueChange={(v) => v !== null && setCategoryId(v)}
            items={{
              all: t("exp.allCategories"),
              ...Object.fromEntries(month.categories.map((c) => [c.id, c.name])),
            }}
          >
            <SelectTrigger className="w-full" aria-label={t("exp.category")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("exp.allCategories")}</SelectItem>
              {month.categories.map((c) => (
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
          <Select
            value={type}
            onValueChange={(v) => v !== null && setType(v as typeof type)}
            items={{
              all: t("exp.allTypes"),
              recurring: t("exp.recurring"),
              "one-time": t("exp.oneTime"),
            }}
          >
            <SelectTrigger className="w-full" aria-label={t("exp.allTypes")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("exp.allTypes")}</SelectItem>
              <SelectItem value="recurring">{t("exp.recurring")}</SelectItem>
              <SelectItem value="one-time">{t("exp.oneTime")}</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortKey}
            onValueChange={(v) => v !== null && setSortKey(v as SortKey)}
            items={{
              date: `${t("exp.sortBy")} : ${t("exp.sortDate")}`,
              amount: `${t("exp.sortBy")} : ${t("exp.sortAmount")}`,
              name: `${t("exp.sortBy")} : ${t("exp.sortName")}`,
            }}
          >
            <SelectTrigger className="w-full" aria-label={t("exp.sortBy")}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">
                {t("exp.sortBy")} : {t("exp.sortDate")}
              </SelectItem>
              <SelectItem value="amount">
                {t("exp.sortBy")} : {t("exp.sortAmount")}
              </SelectItem>
              <SelectItem value="name">
                {t("exp.sortBy")} : {t("exp.sortName")}
              </SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder={t("exp.minAmount")}
              aria-label={t("exp.minAmount")}
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder={t("exp.maxAmount")}
              aria-label={t("exp.maxAmount")}
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground" role="status">
        {t("exp.results", { n: filtered.length, total: fmt(totalFiltered) })}
      </p>

      {/* List */}
      {month.expenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={t("exp.noExpenses")}
          ctaLabel={t("exp.add")}
          onCta={() => setAddOpen(true)}
        />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Search} title={t("exp.empty")} />
      ) : (
        <ul className="space-y-2">
          <AnimatePresence initial={false}>
            {filtered.map((expense) => {
              const category = categoriesById.get(expense.categoryId);
              return (
                <motion.li
                  key={expense.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="py-3 transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3">
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          backgroundColor: softBg(expense.color),
                          color: expense.color,
                        }}
                      >
                        <AppIcon
                          name={category?.icon ?? "wallet"}
                          className="size-4.5"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-x-2 font-medium">
                          <span className="truncate">{expense.name}</span>
                          {expense.recurring && (
                            <Badge
                              variant="secondary"
                              className="gap-1 text-[10px]"
                            >
                              <RefreshCw className="size-2.5" aria-hidden />
                              {t("exp.recurring")}
                            </Badge>
                          )}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {category && (
                            <span style={{ color: category.color }}>
                              {category.name}
                            </span>
                          )}
                          {" · "}
                          {fmtDate(expense.date)}
                          {expense.description && ` · ${expense.description}`}
                        </p>
                      </div>
                      <span className="font-bold tabular-nums">
                        {fmt(expense.amount, 2)}
                      </span>
                      <div className="flex gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("common.edit")}
                          onClick={() => setEditing(expense)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("common.delete")}
                          onClick={() => setDeleting(expense)}
                        >
                          <Trash2 className="size-4 text-negative" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      <ExpenseDialog open={addOpen} onOpenChange={setAddOpen} />
      <ExpenseDialog
        open={editing !== undefined}
        onOpenChange={(open) => !open && setEditing(undefined)}
        expense={editing}
      />
      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title={t("common.confirmDelete")}
        description={deleting?.name}
        onConfirm={() => {
          if (deleting) {
            removeExpense(deleting.id);
            toast.success(t("toast.deleted"));
          }
        }}
      />
    </div>
  );
}
