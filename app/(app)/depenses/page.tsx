"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Pencil,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AppIcon } from "@/components/app-icon";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState } from "@/components/empty-state";
import { ExpenseDialog } from "@/components/expense-dialog";
import { PageHeader } from "@/components/page-header";
import { QuickExpense } from "@/components/quick-expense";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";

type SortKey = "date" | "amount" | "name";

/**
 * The daily question here is "what did I spend recently?", not "filter
 * between 20 and 50 €". Search stays out; the rest folds away until asked for.
 */
export default function ExpensesPage() {
  const { t, fmt, fmtAuto, fmtDayLabel, fmtMonth } = useI18n();
  const month = useCurrentMonth();
  const removeExpense = useBudgetStore((s) => s.removeExpense);

  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryId, setCategoryId] = useState("all");
  const [type, setType] = useState<"all" | "recurring" | "one-time">("all");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<Expense | undefined>(undefined);
  const [deleting, setDeleting] = useState<Expense | null>(null);

  const activeFilters =
    (categoryId !== "all" ? 1 : 0) +
    (type !== "all" ? 1 : 0) +
    (minAmount ? 1 : 0) +
    (maxAmount ? 1 : 0) +
    (sortKey !== "date" ? 1 : 0);

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

  /** Days, most recent first, each with its own total. */
  const days = useMemo(() => {
    const byDay = new Map<string, Expense[]>();
    for (const e of filtered) {
      const list = byDay.get(e.date) ?? [];
      list.push(e);
      byDay.set(e.date, list);
    }
    return [...byDay.entries()]
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, items]) => ({
        date,
        items,
        total: items.reduce((s, e) => s + e.amount, 0),
      }));
  }, [filtered]);

  if (!month) {
    return (
      <EmptyState
        icon={Receipt}
        title={t("dash.noData")}
        ctaLabel={t("dash.startBudget")}
        ctaHref="/"
      />
    );
  }

  const categoriesById = new Map(month.categories.map((c) => [c.id, c]));
  const totalFiltered = filtered.reduce((s, e) => s + e.amount, 0);

  const clearFilters = () => {
    setCategoryId("all");
    setType("all");
    setSortKey("date");
    setMinAmount("");
    setMaxAmount("");
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <PageHeader
        title={t("exp.title")}
        subtitle={fmtMonth(month.month)}
        actions={
          <Button onClick={() => setAddOpen(true)} className="h-11 gap-2">
            <Plus className="size-4" aria-hidden />
            {t("quick.add")}
          </Button>
        }
      />

      {/* Search is the everyday tool; filters are the exception */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("common.search")}
            className="h-11 pl-9"
            aria-label={t("common.search")}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className="h-11 gap-2"
        >
          <SlidersHorizontal className="size-4" aria-hidden />
          <span className="hidden sm:inline">{t("common.filters")}</span>
          {activeFilters > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
              {activeFilters}
            </span>
          )}
        </Button>
      </div>

      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
              <Select
                value={categoryId}
                onValueChange={(v) => v !== null && setCategoryId(v)}
                items={{
                  all: t("exp.allCategories"),
                  ...Object.fromEntries(month.categories.map((c) => [c.id, c.name])),
                }}
              >
                <SelectTrigger className="h-11 w-full" aria-label={t("exp.category")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("exp.allCategories")}</SelectItem>
                  {month.categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
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
                <SelectTrigger className="h-11 w-full" aria-label={t("exp.allTypes")}>
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
                <SelectTrigger className="h-11 w-full" aria-label={t("exp.sortBy")}>
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
                  className="h-11"
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
                  className="h-11"
                />
              </div>

              {activeFilters > 0 && (
                <Button
                  variant="ghost"
                  onClick={clearFilters}
                  className="h-11 justify-start gap-2 sm:col-span-2"
                >
                  <X className="size-4" aria-hidden />
                  {t("common.reset")}
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List */}
      {month.expenses.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-12 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Receipt className="size-6" aria-hidden />
          </span>
          <p className="mt-4 font-medium">{t("dash.monthStartsHere")}</p>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            {t("dash.monthStartsHereHint")}
          </p>
          <Button onClick={() => setAddOpen(true)} className="mt-5 h-11 gap-2">
            <Plus className="size-4" aria-hidden />
            {t("quick.fab")}
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">{t("exp.empty")}</p>
          {activeFilters > 0 && (
            <Button variant="outline" onClick={clearFilters} className="mt-4 h-11 gap-2">
              <X className="size-4" aria-hidden />
              {t("common.reset")}
            </Button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground" role="status">
            {t("exp.results", { n: filtered.length, total: fmt(totalFiltered) })}
          </p>

          <div className="space-y-6">
            {days.map(({ date, items, total }) => (
              <section key={date}>
                <header className="mb-2 flex items-baseline justify-between px-1">
                  <h2 className="text-sm font-semibold">{fmtDayLabel(date)}</h2>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {fmtAuto(total)}
                  </span>
                </header>

                <ul className="overflow-hidden rounded-2xl border bg-card">
                  <AnimatePresence initial={false}>
                    {items.map((expense, i) => {
                      const category = categoriesById.get(expense.categoryId);
                      return (
                        <motion.li
                          key={expense.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -24 }}
                          transition={{ duration: 0.18 }}
                          className={cn(
                            "group flex items-center gap-3 px-4 py-3",
                            i > 0 && "border-t"
                          )}
                        >
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
                                <Badge variant="secondary" className="gap-1 text-[10px]">
                                  <RefreshCw className="size-2.5" aria-hidden />
                                  {t("exp.recurring")}
                                </Badge>
                              )}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {category?.name}
                              {expense.description ? ` · ${expense.description}` : ""}
                            </p>
                          </div>

                          <span className="font-semibold tabular-nums">
                            {fmtAuto(expense.amount)}
                          </span>

                          <div className="flex shrink-0 gap-0.5">
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
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              </section>
            ))}
          </div>
        </>
      )}

      <QuickExpense open={addOpen} onOpenChange={setAddOpen} />
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
