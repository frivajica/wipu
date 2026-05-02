import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UIState, PeriodType } from "@/lib/types";
import { STORAGE_KEYS, DEFAULT_PERIOD_TYPE } from "@/lib/constants";

interface UIStore extends UIState {
  setPeriodType: (periodType: PeriodType) => void;
  setSmartDateInheritance: (enabled: boolean) => void;
  setCustomDateRange: (range: { start: string; end: string } | null) => void;
  setSortByDate: (sort: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      periodType: DEFAULT_PERIOD_TYPE,
      smartDateInheritance: false,
      customDateRange: null,
      sortByDate: true,

      setPeriodType: (periodType) => set({ periodType }),

      setSmartDateInheritance: (smartDateInheritance) =>
        set({ smartDateInheritance }),

      setCustomDateRange: (customDateRange) => set({ customDateRange }),

      setSortByDate: (sortByDate) => set({ sortByDate }),
    }),
    {
      name: STORAGE_KEYS.UI_STATE,
    }
  )
);
