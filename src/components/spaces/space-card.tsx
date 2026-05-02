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
  const isOwner = user?.id === space.ownerId;
  const isPersonal = space.isPersonal ?? false;
  const memberCount = space.members.length;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      onClick={onClick}
      className="bg-surface rounded-xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col"
    >
      <div className="flex items-start justify-between mb-4 flex-1">
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

      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap min-h-[36px]" onClick={(e) => e.stopPropagation()}>
        {!isPersonal && isOwner && (
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
              className="text-text-primary"
            >
              <Settings className="h-4 w-4 mr-1" />
              Manage
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete?.(space.id)}
              className="text-error hover:text-error"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </>
        )}
        
        {!isPersonal && !isOwner && (
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
      </div>
    </motion.div>
  );
}
