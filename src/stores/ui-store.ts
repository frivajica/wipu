import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UIState, PeriodType } from "@/lib/types";
import { STORAGE_KEYS, DEFAULT_PERIOD_TYPE } from "@/lib/constants";

interface UIStore extends UIState {
  setPeriodType: (periodType: PeriodType) => void;
  setCustomDateRange: (range: { start: string; end: string } | null) => void;
  setSort: (field: "date" | "amount" | "description" | "category" | "profile" | null, direction?: "asc" | "desc") => void;
  setBalanceCutoffDate: (date: string | null) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      periodType: DEFAULT_PERIOD_TYPE,
      customDateRange: null,
      sortField: "date",
      sortDirection: "desc",
      balanceCutoffDate: null,

      setPeriodType: (periodType) => set({ periodType }),

      setCustomDateRange: (customDateRange) => set({ customDateRange }),

      setSort: (field, direction) =>
        set((state) => ({
          sortField: field,
          sortDirection: direction ?? state.sortDirection,
        })),

      setBalanceCutoffDate: (balanceCutoffDate) => set({ balanceCutoffDate }),
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
