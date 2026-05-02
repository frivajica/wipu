"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Space, User } from "@/lib/types";
import { Crown, UserMinus, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_DEFAULT } from "@/lib/animations";

interface SpaceNameEditorProps {
  space: Space;
  onUpdateName: (spaceId: string, name: string) => Promise<void>;
  isUpdating: boolean;
}

function SpaceNameEditor({ space, onUpdateName, isUpdating }: SpaceNameEditorProps) {
  const [name, setName] = React.useState(space.name);
  const hasChanges = name.trim() !== "" && name.trim() !== space.name;

  const handleSave = async () => {
    if (!hasChanges) return;
    await onUpdateName(space.id, name.trim());
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Space name"
        className="flex-1"
      />
      <Button
        onClick={handleSave}
        disabled={!hasChanges || isUpdating}
        isLoading={isUpdating}
        size="sm"
      >
        Save
      </Button>
    </div>
  );
}

interface SpaceManageModalProps {
  space: Space;
  currentUserId: string;
  members: User[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateName: (spaceId: string, name: string) => Promise<void>;
  onRemoveMember: (spaceId: string, userId: string) => Promise<void>;
  isUpdating: boolean;
  isRemovingMember: boolean;
}

export function SpaceManageModal({
  space,
  currentUserId,
  members,
  isOpen,
  onClose,
  onUpdateName,
  onRemoveMember,
  isUpdating,
  isRemovingMember,
}: SpaceManageModalProps) {
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const isOwner = currentUserId === space.ownerId;

  const handleRemove = async (userId: string) => {
    setRemovingId(userId);
    try {
      await onRemoveMember(space.id, userId);
    } finally {
      setRemovingId(null);
    }
  };

  const otherMembers = members.filter((m) => m.id !== currentUserId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Manage "${space.name}"`}>
      <div className="space-y-6">
        {/* Rename Section */}
        <div className="space-y-3">
          <label htmlFor="space-name" className="text-sm font-medium text-text-primary">
            Space Name
          </label>
          <SpaceNameEditor
            key={space.id}
            space={space}
            onUpdateName={onUpdateName}
            isUpdating={isUpdating}
          />
        </div>

        {/* Members Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-text-secondary" />
            <h3 className="text-sm font-medium text-text-primary">
              Members ({members.length}/{space.maxMembers})
            </h3>
          </div>

          <div className="space-y-2">
            {members.map((member) => {
              const isSelf = member.id === currentUserId;
              const canRemove = isOwner && !isSelf;

              return (
                <motion.div
                  key={member.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={SPRING_DEFAULT}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border border-border bg-surface",
                    "transition-colors"
                  )}
                >
                  <Avatar name={member.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-text-primary truncate">
                        {member.name}
                      </span>
                      {isSelf && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary-accent">
                          <Crown className="h-3 w-3" />
                          You (Owner)
                        </span>
                      )}
                      {!isSelf && member.id === space.ownerId && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary-accent">
                          <Crown className="h-3 w-3" />
                          Owner
                        </span>
                      )}
                      {!isSelf && member.id !== space.ownerId && (
                        <span className="text-xs text-text-secondary">Member</span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary truncate">{member.email}</p>
                  </div>
                  {canRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(member.id)}
                      disabled={isRemovingMember}
                      isLoading={isRemovingMember && removingId === member.id}
                      className="text-error hover:text-error shrink-0"
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Empty state for additional spaces with no other members */}
          <AnimatePresence>
            {!space.isPersonal && otherMembers.length === 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center py-4 text-sm text-text-secondary"
              >
                No other members yet. Invite someone to collaborate!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Modal>
  );
}
