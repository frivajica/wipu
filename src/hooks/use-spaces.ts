"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useSpaceStore } from "@/stores/space-store";
import { mockDb } from "@/lib/data";
import { User } from "@/lib/types";
import { simulateDelay } from "@/lib/api-simulation";
import { useMutationWithToast } from "@/hooks/shared/use-mutation-with-toast";
import { useToastStore } from "@/components/ui/toast";

export function useSpaces() {
  const user = useAuthStore((s) => s.user);
  const activeSpaceId = useSpaceStore((s) => s.activeSpaceId);
  const setActiveSpace = useSpaceStore((s) => s.setActiveSpace);

  const { addToast } = useToastStore();

  // Single source of truth: TanStack Query
  const { data: spaces = [], isLoading } = useQuery({
    queryKey: ["spaces", user?.id],
    queryFn: async () => {
      if (!user) return [];
      await simulateDelay(300);
      return mockDb.getSpacesByUserId(user.id);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const createSpace = useMutationWithToast({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("Not authenticated");
      const space = mockDb.createSpace({
        name,
        ownerId: user.id,
        members: [user.id],
        maxMembers: 8,
        isPersonal: false,
      });
      return space;
    },
    successMessage: "Space created",
    invalidateKeys: [["spaces"]],
  });

  const updateSpaceName = useMutationWithToast({
    mutationFn: async ({ spaceId, name }: { spaceId: string; name: string }) => {
      const space = mockDb.updateSpaceName(spaceId, name);
      if (!space) throw new Error("Space not found");
      return space;
    },
    successMessage: "Space name updated",
    invalidateKeys: [["spaces"]],
  });

  const removeMember = useMutationWithToast({
    mutationFn: async ({ spaceId, userId }: { spaceId: string; userId: string }) => {
      mockDb.removeMember(spaceId, userId);
      return Promise.resolve();
    },
    successMessage: "Member removed",
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

  // Enrich member IDs with user data — called by presentation layer
  const getSpaceMembers = (spaceId: string): User[] => {
    const space = spaces.find((s) => s.id === spaceId);
    if (!space) return [];
    return space.members
      .map((memberId) => mockDb.getUserById(memberId))
      .filter((u): u is User => u !== undefined);
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
    getSpaceMembers,
    isCreating: createSpace.isPending,
    isUpdating: updateSpaceName.isPending,
    isRemovingMember: removeMember.isPending,
    isDeleting: deleteSpace.isPending,
    isLeaving: leaveSpace.isPending,
  };
}
