"use client";

import { Space } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Users, Crown, LogOut, Trash2 } from "lucide-react";

interface SpaceCardProps {
  space: Space;
  onDelete?: (spaceId: string) => void;
  onLeave?: (spaceId: string) => void;
  onInvite?: (space: Space) => void;
}

export function SpaceCard({ space, onDelete, onLeave, onInvite }: SpaceCardProps) {
  const { user } = useAuth();
  const isOwner = user?.id === space.ownerId;
  const isPersonal = space.name === "Personal";
  const memberCount = space.members.length;

  return (
    <div className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-text-primary">{space.name}</h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
            <Users className="h-4 w-4" />
            <span>
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
            {isOwner && (
              <span className="flex items-center gap-1 text-primary-accent">
                <Crown className="h-3 w-3" />
                Owner
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onInvite?.(space)}
        >
          Invite
        </Button>
        
        {!isPersonal && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLeave?.(space.id)}
            className="text-text-secondary"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Leave
          </Button>
        )}
        
        {isOwner && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete?.(space.id)}
            className="text-error hover:text-error"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
}
