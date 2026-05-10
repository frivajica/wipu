import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UIState, PeriodType } from "@/lib/types";
import { STORAGE_KEYS, DEFAULT_PERIOD_TYPE } from "@/lib/constants";

interface UIStore extends UIState {
  setPeriodType: (periodType: PeriodType) => void;
  setReorderByDate: (enabled: boolean) => void;
  setCustomDateRange: (range: { start: string; end: string } | null) => void;
  setSort: (field: "date" | "amount" | "description" | "category" | "profile" | null, direction?: "asc" | "desc") => void;
  setIncludesDebt: (includes: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      periodType: DEFAULT_PERIOD_TYPE,
      reorderByDate: false,
      customDateRange: null,
      sortField: null,
      sortDirection: "desc",
      includesDebt: true,

      setPeriodType: (periodType) => set({ periodType }),

      setReorderByDate: (reorderByDate) =>
        set((state) => ({
          reorderByDate,
          sortField: reorderByDate ? "date" : state.sortField,
          sortDirection: reorderByDate ? "desc" : state.sortDirection,
        })),

      setCustomDateRange: (customDateRange) => set({ customDateRange }),

      setSort: (field, direction) =>
        set((state) => ({
          sortField: field,
          sortDirection: direction ?? state.sortDirection,
          reorderByDate: field !== null ? false : state.reorderByDate,
        })),

      setIncludesDebt: (includesDebt) => set({ includesDebt }),
    }),
    {
      name: STORAGE_KEYS.UI_STATE,
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(
            ([key]) => !["sortField", "sortDirection"].includes(key)
          )
        ),
    }
  )
);
