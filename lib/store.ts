"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { daysInMonth, monthKey, todayISO, uid } from "./format";
import { defaultCategories, METHOD_PRESETS } from "./presets";
import { storageAdapter } from "./storage";
import type { BudgetTemplate } from "./templates";
import type {
  Category,
  Expense,
  Goal,
  Income,
  MethodId,
  MonthBudget,
  PersistedData,
  PlanId,
  ProfileData,
  ProfileMeta,
  Settings,
} from "./types";

export const DEFAULT_SETTINGS: Settings = {
  userName: "",
  currency: "EUR",
  language: "fr",
  // Light by default: a first visit never inherits the OS preference.
  // "system" stays available as an explicit choice in Settings.
  theme: "light",
  accent: "indigo",
};

function defaultProfileMeta(): ProfileMeta {
  return {
    id: "default",
    name: "Personnel",
    icon: "user",
    createdAt: todayISO(),
  };
}

interface BudgetState extends PersistedData {
  hasHydrated: boolean;
  plan: PlanId;
  profiles: ProfileMeta[];
  activeProfileId: string;
  inactiveProfiles: Record<string, ProfileData>;

  setHasHydrated: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  setCurrentMonth: (month: string) => void;
  createMonth: (month: string, data?: Partial<MonthBudget>) => void;

  addIncome: (income: Omit<Income, "id">) => void;
  updateIncome: (id: string, patch: Partial<Omit<Income, "id">>) => void;
  removeIncome: (id: string) => void;

  setMethod: (method: MethodId) => void;
  setCustomSplit: (percentages: number[]) => void;
  addCategory: (cat: Omit<Category, "id">) => void;
  updateCategory: (id: string, patch: Partial<Omit<Category, "id">>) => void;
  removeCategory: (id: string) => void;
  reorderCategories: (orderedIds: string[]) => void;

  addExpense: (exp: Omit<Expense, "id">) => void;
  updateExpense: (id: string, patch: Partial<Omit<Expense, "id">>) => void;
  removeExpense: (id: string) => void;

  addGoal: (goal: Omit<Goal, "id">) => void;
  updateGoal: (id: string, patch: Partial<Omit<Goal, "id">>) => void;
  removeGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;

  updateSettings: (patch: Partial<Settings>) => void;
  setPlan: (plan: PlanId) => void;

  createProfile: (
    name: string,
    icon: string,
    template: BudgetTemplate | null
  ) => void;
  switchProfile: (id: string) => void;
  renameProfile: (id: string, name: string, icon?: string) => void;
  deleteProfile: (id: string) => void;

  importData: (data: PersistedData) => void;
  resetAll: () => void;
}

function clampDay(month: string, day: number): string {
  const dim = daysInMonth(month);
  return `${month}-${String(Math.min(day, dim)).padStart(2, "0")}`;
}

/** Build a new month, carrying over structure and recurring expenses. */
function buildMonth(
  month: string,
  months: Record<string, MonthBudget>
): MonthBudget {
  const keys = Object.keys(months).sort();
  const sourceKey =
    [...keys].reverse().find((k) => k < month) ?? keys[keys.length - 1];
  if (!sourceKey) {
    return {
      month,
      method: "50-30-20",
      incomes: [],
      categories: defaultCategories(),
      expenses: [],
    };
  }
  const src = months[sourceKey];
  return {
    month,
    method: src.method,
    incomes: src.incomes.map((i) => ({ ...i, id: uid() })),
    categories: src.categories.map((c) => ({ ...c })),
    expenses: src.expenses
      .filter((e) => e.recurring)
      .map((e) => ({
        ...e,
        id: uid(),
        date: clampDay(month, Number(e.date.slice(8, 10)) || 1),
      })),
  };
}

/** Fresh profile data, optionally seeded from a template. */
function buildProfileData(template: BudgetTemplate | null): ProfileData {
  const month = monthKey();
  const categories = template
    ? template.categories.map((c) => ({ ...c, id: uid() }))
    : defaultCategories();
  return {
    months: {
      [month]: {
        month,
        method: template?.method ?? "50-30-20",
        incomes: [],
        categories,
        expenses: [],
      },
    },
    currentMonth: month,
    goals: [],
  };
}

/** Immutably patch the current month. */
function patchMonth(
  state: Pick<BudgetState, "months" | "currentMonth">,
  fn: (m: MonthBudget) => MonthBudget
): Partial<BudgetState> {
  const current = state.months[state.currentMonth];
  if (!current) return {};
  return {
    months: { ...state.months, [state.currentMonth]: fn(current) },
  };
}

export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      months: {},
      currentMonth: monthKey(),
      goals: [],
      settings: DEFAULT_SETTINGS,
      onboarded: false,
      hasHydrated: false,
      plan: "free",
      profiles: [defaultProfileMeta()],
      activeProfileId: "default",
      inactiveProfiles: {},

      setHasHydrated: (v) => set({ hasHydrated: v }),
      setOnboarded: (v) => set({ onboarded: v }),

      setCurrentMonth: (month) => {
        const { months } = get();
        if (!months[month]) {
          set({
            months: { ...months, [month]: buildMonth(month, months) },
            currentMonth: month,
          });
        } else {
          set({ currentMonth: month });
        }
      },

      createMonth: (month, data) => {
        const { months } = get();
        const base = months[month] ?? buildMonth(month, months);
        set({
          months: { ...months, [month]: { ...base, ...data, month } },
          currentMonth: month,
        });
      },

      addIncome: (income) =>
        set((s) =>
          patchMonth(s, (m) => ({
            ...m,
            incomes: [...m.incomes, { ...income, id: uid() }],
          }))
        ),
      updateIncome: (id, patch) =>
        set((s) =>
          patchMonth(s, (m) => ({
            ...m,
            incomes: m.incomes.map((i) => (i.id === id ? { ...i, ...patch } : i)),
          }))
        ),
      removeIncome: (id) =>
        set((s) =>
          patchMonth(s, (m) => ({
            ...m,
            incomes: m.incomes.filter((i) => i.id !== id),
          }))
        ),

      setMethod: (method) =>
        set((s) =>
          patchMonth(s, (m) => {
            const preset = METHOD_PRESETS.find((p) => p.id === method);
            if (!preset) return { ...m, method };
            const categories = m.categories.map((c, i) => ({
              ...c,
              percentage: i < 3 ? preset.split[i] : 0,
            }));
            return { ...m, method, categories };
          })
        ),

      setCustomSplit: (percentages) =>
        set((s) =>
          patchMonth(s, (m) => ({
            ...m,
            method: "custom",
            categories: m.categories.map((c, i) => ({
              ...c,
              percentage: percentages[i] ?? c.percentage,
            })),
          }))
        ),

      addCategory: (cat) =>
        set((s) =>
          patchMonth(s, (m) => ({
            ...m,
            method: "custom",
            categories: [...m.categories, { ...cat, id: uid() }],
          }))
        ),
      updateCategory: (id, patch) =>
        set((s) =>
          patchMonth(s, (m) => ({
            ...m,
            method: patch.percentage !== undefined ? "custom" : m.method,
            categories: m.categories.map((c) =>
              c.id === id ? { ...c, ...patch } : c
            ),
          }))
        ),
      removeCategory: (id) =>
        set((s) =>
          patchMonth(s, (m) => ({
            ...m,
            method: "custom",
            categories: m.categories.filter((c) => c.id !== id),
            expenses: m.expenses.filter((e) => e.categoryId !== id),
          }))
        ),
      reorderCategories: (orderedIds) =>
        set((s) =>
          patchMonth(s, (m) => {
            const byId = new Map(m.categories.map((c) => [c.id, c]));
            const ordered = orderedIds
              .map((id) => byId.get(id))
              .filter((c): c is Category => c !== undefined);
            return ordered.length === m.categories.length
              ? { ...m, categories: ordered }
              : m;
          })
        ),

      addExpense: (exp) =>
        set((s) =>
          patchMonth(s, (m) => ({
            ...m,
            expenses: [...m.expenses, { ...exp, id: uid() }],
          }))
        ),
      updateExpense: (id, patch) =>
        set((s) =>
          patchMonth(s, (m) => ({
            ...m,
            expenses: m.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
          }))
        ),
      removeExpense: (id) =>
        set((s) =>
          patchMonth(s, (m) => ({
            ...m,
            expenses: m.expenses.filter((e) => e.id !== id),
          }))
        ),

      addGoal: (goal) =>
        set((s) => ({ goals: [...s.goals, { ...goal, id: uid() }] })),
      updateGoal: (id, patch) =>
        set((s) => ({
          goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),
      removeGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),
      contributeToGoal: (id, amount) =>
        set((s) => ({
          goals: s.goals.map((g) =>
            g.id === id
              ? { ...g, saved: Math.min(g.target, g.saved + amount) }
              : g
          ),
        })),

      updateSettings: (patch) =>
        set((s) => ({ settings: { ...s.settings, ...patch } })),

      setPlan: (plan) => set({ plan }),

      createProfile: (name, icon, template) => {
        const s = get();
        const meta: ProfileMeta = {
          id: uid(),
          name: name.trim() || "Budget",
          icon,
          createdAt: todayISO(),
        };
        set({
          // Stash the active profile's data before switching
          inactiveProfiles: {
            ...s.inactiveProfiles,
            [s.activeProfileId]: {
              months: s.months,
              currentMonth: s.currentMonth,
              goals: s.goals,
            },
          },
          profiles: [...s.profiles, meta],
          activeProfileId: meta.id,
          ...buildProfileData(template),
          onboarded: true,
        });
      },

      switchProfile: (id) => {
        const s = get();
        if (id === s.activeProfileId) return;
        if (!s.profiles.some((p) => p.id === id)) return;
        const target = s.inactiveProfiles[id] ?? buildProfileData(null);
        const nextInactive = { ...s.inactiveProfiles };
        delete nextInactive[id];
        nextInactive[s.activeProfileId] = {
          months: s.months,
          currentMonth: s.currentMonth,
          goals: s.goals,
        };
        set({
          inactiveProfiles: nextInactive,
          activeProfileId: id,
          months: target.months,
          currentMonth: target.currentMonth,
          goals: target.goals,
        });
      },

      renameProfile: (id, name, icon) =>
        set((s) => ({
          profiles: s.profiles.map((p) =>
            p.id === id
              ? { ...p, name: name.trim() || p.name, icon: icon ?? p.icon }
              : p
          ),
        })),

      deleteProfile: (id) => {
        const s = get();
        if (s.profiles.length <= 1) return;
        if (id === s.activeProfileId) {
          const fallback = s.profiles.find((p) => p.id !== id);
          if (!fallback) return;
          get().switchProfile(fallback.id);
        }
        const after = get();
        const nextInactive = { ...after.inactiveProfiles };
        delete nextInactive[id];
        set({
          profiles: after.profiles.filter((p) => p.id !== id),
          inactiveProfiles: nextInactive,
        });
      },

      importData: (data) =>
        set({
          months: data.months ?? {},
          currentMonth: data.currentMonth ?? monthKey(),
          goals: data.goals ?? [],
          settings: { ...DEFAULT_SETTINGS, ...data.settings },
          onboarded: data.onboarded ?? true,
          plan: data.plan ?? "free",
          profiles: data.profiles ?? [defaultProfileMeta()],
          activeProfileId: data.activeProfileId ?? "default",
          inactiveProfiles: data.inactiveProfiles ?? {},
        }),

      resetAll: () =>
        set({
          months: {},
          currentMonth: monthKey(),
          goals: [],
          settings: DEFAULT_SETTINGS,
          onboarded: false,
          plan: "free",
          profiles: [defaultProfileMeta()],
          activeProfileId: "default",
          inactiveProfiles: {},
        }),
    }),
    {
      name: "budget-app-v1",
      version: 2,
      storage: createJSONStorage(() => storageAdapter),
      migrate: (persisted, version) => {
        const state = persisted as Partial<BudgetState>;
        if (version < 2) {
          state.plan = "free";
          state.profiles = [defaultProfileMeta()];
          state.activeProfileId = "default";
          state.inactiveProfiles = {};
        }
        return state as BudgetState;
      },
      partialize: (s) => ({
        months: s.months,
        currentMonth: s.currentMonth,
        goals: s.goals,
        settings: s.settings,
        onboarded: s.onboarded,
        plan: s.plan,
        profiles: s.profiles,
        activeProfileId: s.activeProfileId,
        inactiveProfiles: s.inactiveProfiles,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/** Selector: the month currently being viewed (may be undefined pre-onboarding). */
export function useCurrentMonth(): MonthBudget | undefined {
  return useBudgetStore((s) => s.months[s.currentMonth]);
}

/** Snapshot of everything persisted — used by exports/backups. */
export function getPersistedSnapshot(): PersistedData {
  const s = useBudgetStore.getState();
  return {
    months: s.months,
    currentMonth: s.currentMonth,
    goals: s.goals,
    settings: s.settings,
    onboarded: s.onboarded,
    plan: s.plan,
    profiles: s.profiles,
    activeProfileId: s.activeProfileId,
    inactiveProfiles: s.inactiveProfiles,
  };
}
