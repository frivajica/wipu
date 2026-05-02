"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useSpaceStore } from "@/stores/space-store";
import { mockDb } from "@/lib/data";
import { simulateDelay } from "@/lib/api-simulation";
import { useMutationWithToast } from "@/hooks/shared/use-mutation-with-toast";
import { useToastStore } from "@/components/ui/toast";

export function useSpaces() {
  const { user } = useAuthStore();
  const { spaces, activeSpaceId, setSpaces, setActiveSpace, addSpace, removeSpace } = useSpaceStore();
  const { addToast } = useToastStore();

  const { data: spacesData, isLoading } = useQuery({
    queryKey: ["spaces", user?.id],
    queryFn: async () => {
      if (!user) return [];
      await simulateDelay(300);
      return mockDb.getSpacesByUserId(user.id);
    },
    enabled: !!user,
  });

  React.useEffect(() => {
    if (spacesData) setSpaces(spacesData);
  }, [spacesData, setSpaces]);

  const createSpace = useMutationWithToast({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Not authenticated");
      const space = mockDb.createSpace({
        name,
        ownerId: user.id,
        members: [user.id],
        maxMembers: 8,
      });
      return space;
    },
    successMessage: "Space created",
    invalidateKeys: [["spaces"]],
  });

  const deleteSpace = useMutationWithToast({
    mutationFn: async (spaceId: string) => {
      mockDb.deleteSpace(spaceId);
      return Promise.resolve();
    },
    successMessage: "Space deleted",
    invalidateKeys: [["spaces"]],
  });

  const leaveSpace = useMutationWithToast({
    mutationFn: async (spaceId: string) => {
      if (!user) throw new Error("Not authenticated");
      mockDb.leaveSpace(spaceId, user.id);
      return Promise.resolve();
    },
    successMessage: "You left the space",
    invalidateKeys: [["spaces"]],
  });

  const switchSpace = (spaceId: string) => {
    const space = spaces.find((s) => s.id === spaceId);
    setActiveSpace(spaceId);
    if (space) addToast(`Switched to ${space.name}`, "info");
  };

  return {
    spaces,
    activeSpaceId,
    activeSpace: spaces.find((s) => s.id === activeSpaceId),
    isLoading,
    createSpace: createSpace.mutateAsync,
    deleteSpace: deleteSpace.mutateAsync,
    leaveSpace: leaveSpace.mutateAsync,
    switchSpace,
    isCreating: createSpace.isPending,
    isDeleting: deleteSpace.isPending,
    isLeaving: leaveSpace.isPending,
  };
}
