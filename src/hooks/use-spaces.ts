"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useSpaceStore } from "@/stores/space-store";
import { useMutationWithToast } from "@/hooks/shared/use-mutation-with-toast";
import { useToastStore } from "@/components/ui/toast";
import { Space } from "@/lib/types";

export function useSpaces() {
  const user = useAuthStore((s) => s.user);
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);
  const setActiveSpace = useSpaceStore((s) => s.setActiveSpace);
  const { addToast } = useToastStore();

  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ["spaces", user?.id],
    queryFn: async (): Promise<Space[]> => {
      if (!user) return [];
      const res = await fetch("/api/spaces");
      if (!res.ok) throw new Error("Failed to fetch spaces");
      const data = await res.json();
      return data.spaces;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Auto-correct stale activeSpaceId (e.g., from mock data migration)
  React.useEffect(() => {
    if (spaces.length > 0 && activeSpaceId) {
      const valid = spaces.some((s) => s.id === activeSpaceId);
      if (!valid) {
        setActiveSpace(spaces[0].id);
      }
    }
  }, [spaces, activeSpaceId, setActiveSpace]);

  const createSpace = useMutationWithToast({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/spaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create space");
      return res.json();
    },
    successMessage: "Space created",
    invalidateKeys: [["spaces"]],
  });

  const updateSpaceName = useMutationWithToast({
    mutationFn: async ({ spaceId, name }: { spaceId: string; name: string }) => {
      const res = await fetch(`/api/spaces/${spaceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to update space");
      return res.json();
    },
    successMessage: "Space name updated",
    invalidateKeys: [["spaces"]],
  });

  const removeMember = useMutationWithToast({
    mutationFn: async ({ spaceId, userId }: { spaceId: string; userId: string }) => {
      const res = await fetch(`/api/spaces/${spaceId}/members`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to remove member");
    },
    successMessage: "Member removed",
    invalidateKeys: [["spaces"]],
  });

  const deleteSpace = useMutationWithToast({
    mutationFn: async (spaceId: string) => {
      const res = await fetch(`/api/spaces/${spaceId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete space");
    },
    successMessage: "Space deleted",
    invalidateKeys: [["spaces"]],
  });

  const leaveSpace = useMutationWithToast({
    mutationFn: async (spaceId: string) => {
      const res = await fetch(`/api/spaces/${spaceId}/leave`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to leave space");
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
    updateSpaceName: updateSpaceName.mutateAsync,
    removeMember: removeMember.mutateAsync,
    deleteSpace: deleteSpace.mutateAsync,
    leaveSpace: leaveSpace.mutateAsync,
    switchSpace,
    isCreating: createSpace.isPending,
    isUpdating: updateSpaceName.isPending,
    isRemovingMember: removeMember.isPending,
    isDeleting: deleteSpace.isPending,
    isLeaving: leaveSpace.isPending,
  };
}
