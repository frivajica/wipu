import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";

interface SpaceStore {
  activeSpaceId: string | null;
  hasHydrated: boolean;
  setActiveSpace: (spaceId: string | null) => void;
}

export const useSpaceStore = create<SpaceStore>()(
  persist(
    (set) => ({
      activeSpaceId: null,
      hasHydrated: false,

      setActiveSpace: (activeSpaceId) => set({ activeSpaceId }),
    }),
    {
      name: STORAGE_KEYS.SPACES,
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.hasHydrated = true;
        }
      },
    }
  )
);
