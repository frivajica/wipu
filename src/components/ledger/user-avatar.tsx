"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LedgerItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { mockDb } from "@/lib/data";
import { DateTime } from "luxon";

interface UserAvatarProps {
  userId: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function UserAvatar({ userId, size = "sm", className }: UserAvatarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const user = mockDb.getUserById(userId);

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 rounded-full",
          className
        )}
      >
        <Avatar name={user.name} size={size} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute right-0 top-full mt-2 w-48 bg-surface rounded-xl border border-border shadow-lg p-3 z-50"
            >
              <div className="flex items-center gap-3 mb-2">
                <Avatar name={user.name} size="md" />
                <div>
                  <p className="text-sm font-medium text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-secondary">{user.email}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs text-text-secondary">
                  Last modified: {DateTime.now().toFormat("MMM d, yyyy")}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
