"use client";

import { motion } from "framer-motion";
import { Space } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Users, Crown, LogOut, Trash2, Settings, UserPlus } from "lucide-react";

interface SpaceCardProps {
  space: Space;
  onDelete?: (spaceId: string) => void;
  onLeave?: (spaceId: string) => void;
  onInvite?: (space: Space) => void;
  onManage?: (space: Space) => void;
  onClick?: () => void;
}

export function SpaceCard({ space, onDelete, onLeave, onInvite, onManage, onClick }: SpaceCardProps) {
  const { user } = useAuth();
  const isDefault = space.isDefault ?? false;
  const isOwnedByUser = user?.id === space.ownerId;
  const memberCount = space.members.length;

  return (
    <motion.div
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onClick}
      className="bg-surface rounded-2xl border border-border/50 p-6 shadow-card hover:shadow-card-hover transition-all duration-200 ease-out cursor-pointer h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-5 flex-1">
        <div>
          <h3 className="text-lg font-bold text-text-primary tracking-tight">{space.name}</h3>
          <div className="flex items-center gap-2.5 mt-2 text-sm text-text-secondary">
            <Users className="h-4 w-4 text-text-tertiary" />
            <span>
              {memberCount} {memberCount === 1 ? "member" : "members"}
            </span>
            {isOwnedByUser && (
              <span className="flex items-center gap-1 text-primary-accent font-medium text-xs">
                <Crown className="h-3 w-3" />
                Owner
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap min-h-[36px]" onClick={(e) => e.stopPropagation()}>
        {!isDefault && isOwnedByUser && (
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onInvite?.(space)}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              Invite
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onManage?.(space)}
              className="text-text-secondary hover:text-text-primary"
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(space.id)}
              className="text-error hover:text-error-hover"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </>
        )}

        {!isDefault && !isOwnedByUser && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLeave?.(space.id)}
            className="text-text-tertiary hover:text-text-secondary"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Leave
          </Button>
        )}
      </div>
    </motion.div>
  );
}
