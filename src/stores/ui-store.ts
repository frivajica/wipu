import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UIState, PeriodType } from "@/lib/types";
import { STORAGE_KEYS, DEFAULT_PERIOD_TYPE } from "@/lib/constants";

interface UIStore extends UIState {
  setPeriodType: (periodType: PeriodType) => void;
  setReorderByDate: (enabled: boolean) => void;
  setCustomDateRange: (range: { start: string; end: string } | null) => void;
  setSortByDate: (sort: boolean) => void;
  setIncludesDebt: (includes: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      periodType: DEFAULT_PERIOD_TYPE,
      reorderByDate: false,
      customDateRange: null,
      sortByDate: true,
      includesDebt: true,

      setPeriodType: (periodType) => set({ periodType }),

      setReorderByDate: (reorderByDate) =>
        set((state) => ({
          reorderByDate,
          sortByDate: reorderByDate ? true : state.sortByDate,
        })),

      setCustomDateRange: (customDateRange) => set({ customDateRange }),

      setSortByDate: (sortByDate) =>
        set((state) => ({
          sortByDate,
          reorderByDate: sortByDate ? state.reorderByDate : false,
        })),

      setIncludesDebt: (includesDebt) => set({ includesDebt }),
    }),
    {
      name: STORAGE_KEYS.UI_STATE,
    }
  )
);
