"use client";

import React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useSpaceStore } from "@/stores/space-store";
import { mockDb } from "@/lib/data";
import { useToastStore } from "@/components/ui/toast";

export function useSpaces() {
  const { user } = useAuthStore();
  const { spaces, activeSpaceId, setSpaces, setActiveSpace, addSpace, removeSpace } = useSpaceStore();
  const queryClient = useQueryClient();
  const { addToast } = useToastStore();

  const { data: spacesData, isLoading } = useQuery({
    queryKey: ["spaces", user?.id],
    queryFn: async () => {
      if (!user) return [];
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockDb.getSpacesByUserId(user.id);
    },
    enabled: !!user,
  });

  // Sync query data with store
  React.useEffect(() => {
    if (spacesData) {
      setSpaces(spacesData);
    }
  }, [spacesData, setSpaces]);

  const createSpaceMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Not authenticated");
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const space = mockDb.createSpace({
        name,
        ownerId: user.id,
        members: [user.id],
        maxMembers: 8,
      });
      
      return space;
    },
    onSuccess: (space) => {
      addSpace(space);
      setActiveSpace(space.id);
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      addToast(`Space "${space.name}" created`, "success");
    },
  });

  const deleteSpaceMutation = useMutation({
    mutationFn: async (spaceId: string) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      mockDb.deleteSpace(spaceId);
    },
    onSuccess: (_, spaceId) => {
      removeSpace(spaceId);
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      addToast("Space deleted", "success");
    },
  });

  const leaveSpaceMutation = useMutation({
    mutationFn: async (spaceId: string) => {
      if (!user) throw new Error("Not authenticated");
      await new Promise((resolve) => setTimeout(resolve, 300));
      mockDb.leaveSpace(spaceId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      addToast("You left the space", "info");
    },
  });

  const switchSpace = (spaceId: string) => {
    const space = spaces.find((s) => s.id === spaceId);
    setActiveSpace(spaceId);
    if (space) {
      addToast(`Switched to ${space.name}`, "info");
    }
  };

  return {
    spaces,
    activeSpaceId,
    activeSpace: spaces.find((s) => s.id === activeSpaceId),
    isLoading,
    createSpace: createSpaceMutation.mutateAsync,
    deleteSpace: deleteSpaceMutation.mutateAsync,
    leaveSpace: leaveSpaceMutation.mutateAsync,
    switchSpace,
    isCreating: createSpaceMutation.isPending,
    isDeleting: deleteSpaceMutation.isPending,
    isLeaving: leaveSpaceMutation.isPending,
  };
}
