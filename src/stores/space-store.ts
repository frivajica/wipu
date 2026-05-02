import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SpaceState } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/constants";

interface SpaceStore extends SpaceState {
  hasHydrated: boolean;
  setSpaces: (spaces: SpaceState["spaces"]) => void;
  setActiveSpace: (spaceId: string | null) => void;
  addSpace: (space: SpaceState["spaces"][0]) => void;
  removeSpace: (spaceId: string) => void;
}

export const useSpaceStore = create<SpaceStore>()(
  persist(
    (set) => ({
      spaces: [],
      activeSpaceId: null,
      hasHydrated: false,

      setSpaces: (spaces) => set({ spaces }),

      setActiveSpace: (activeSpaceId) => set({ activeSpaceId }),

      addSpace: (space) =>
        set((state) => ({
          spaces: [...state.spaces, space],
        })),

      removeSpace: (spaceId) =>
        set((state) => ({
          spaces: state.spaces.filter((s) => s.id !== spaceId),
          activeSpaceId:
            state.activeSpaceId === spaceId
              ? null
              : state.activeSpaceId,
        })),
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
