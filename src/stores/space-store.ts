import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";

interface SpaceStore {
  activeSpaceId: string | null;
  setActiveSpace: (spaceId: string | null) => void;
}

export const useSpaceStore = create<SpaceStore>()(
  persist(
    (set) => ({
      activeSpaceId: null,
      setActiveSpace: (activeSpaceId) => set({ activeSpaceId }),
    }),
    {
      name: STORAGE_KEYS.SPACES,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
