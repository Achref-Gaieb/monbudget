import { categoryStats, totalIncome, totalSpent } from "./calculations";
import { formatMonth, localeOf } from "./format";
import type { Lang, MonthBudget, PersistedData } from "./types";

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function expenseRows(m: MonthBudget): string[][] {
  const catName = new Map(m.categories.map((c) => [c.id, c.name]));
  return m.expenses.map((e) => [
    e.date,
    e.name,
    catName.get(e.categoryId) ?? "—",
    e.amount.toFixed(2),
    e.recurring ? "Récurrente" : "Ponctuelle",
    e.description ?? "",
  ]);
}

const EXPENSE_HEADERS = ["Date", "Nom", "Catégorie", "Montant", "Type", "Description"];

export function exportCSV(m: MonthBudget): void {
  const escape = (v: string) => `"${v.replaceAll('"', '""')}"`;
  const lines = [
    EXPENSE_HEADERS.map(escape).join(";"),
    ...expenseRows(m).map((row) => row.map(escape).join(";")),
  ];
  // BOM so Excel opens UTF-8 accents correctly
  const blob = new Blob(["﻿" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8",
  });
  download(blob, `budget-${m.month}.csv`);
}

export async function exportExcel(m: MonthBudget): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  const stats = categoryStats(m);
  const summary = [
    ["Budget", formatMonth(m.month, "fr")],
    [],
    ["Revenus totaux", totalIncome(m)],
    ["Dépenses totales", totalSpent(m)],
    ["Solde", totalIncome(m) - totalSpent(m)],
    [],
    ["Catégorie", "%", "Budget autorisé", "Dépensé", "Restant"],
    ...stats.map((s) => [
      s.category.name,
      s.category.percentage,
      s.allowed,
      s.spent,
      s.remaining,
    ]),
  ];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(summary),
    "Résumé"
  );

  const incomes = [
    ["Nom", "Montant"],
    ...m.incomes.map((i) => [i.name, i.amount]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incomes), "Revenus");

  const expenses = [EXPENSE_HEADERS, ...expenseRows(m)];
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.aoa_to_sheet(expenses),
    "Dépenses"
  );

  XLSX.writeFile(wb, `budget-${m.month}.xlsx`);
}

export async function exportPDF(
  m: MonthBudget,
  currency: string,
  lang: Lang
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF();
  const money = (v: number) =>
    new Intl.NumberFormat(localeOf(lang), {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(v);

  doc.setFontSize(20);
  doc.text(`Budget — ${formatMonth(m.month, lang)}`, 14, 20);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(
    `Revenus : ${money(totalIncome(m))}   ·   Dépenses : ${money(totalSpent(m))}   ·   Solde : ${money(totalIncome(m) - totalSpent(m))}`,
    14,
    28
  );

  autoTable(doc, {
    startY: 36,
    head: [["Catégorie", "%", "Autorisé", "Dépensé", "Restant"]],
    body: categoryStats(m).map((s) => [
      s.category.name,
      `${s.category.percentage}%`,
      money(s.allowed),
      money(s.spent),
      money(s.remaining),
    ]),
    headStyles: { fillColor: [99, 102, 241] },
  });

  autoTable(doc, {
    head: [["Nom", "Montant"]],
    body: m.incomes.map((i) => [i.name, money(i.amount)]),
    headStyles: { fillColor: [16, 185, 129] },
  });

  const catName = new Map(m.categories.map((c) => [c.id, c.name]));
  autoTable(doc, {
    head: [["Date", "Nom", "Catégorie", "Montant", "Type"]],
    body: [...m.expenses]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => [
        e.date,
        e.name,
        catName.get(e.categoryId) ?? "—",
        money(e.amount),
        e.recurring ? "Récurrente" : "Ponctuelle",
      ]),
    headStyles: { fillColor: [236, 72, 153] },
  });

  doc.save(`budget-${m.month}.pdf`);
}

export function exportJSON(data: PersistedData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  download(blob, `budget-sauvegarde-${new Date().toISOString().slice(0, 10)}.json`);
}

export function parseImportedJSON(text: string): PersistedData | null {
  try {
    const data = JSON.parse(text) as PersistedData;
    if (!data || typeof data !== "object" || typeof data.months !== "object")
      return null;
    for (const m of Object.values(data.months)) {
      if (!Array.isArray(m.incomes) || !Array.isArray(m.categories) || !Array.isArray(m.expenses))
        return null;
    }
    return data;
  } catch {
    return null;
  }
}
