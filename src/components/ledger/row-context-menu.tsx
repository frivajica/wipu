"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { useClickOutside } from "@/hooks/shared/use-click-outside";
import { useLongPress } from "@/hooks/shared/use-long-press";
import { SPRING_DEFAULT } from "@/lib/animations";

interface RowContextMenuProps {
  children: React.ReactNode;
  onDelete: () => void;
  requiresConfirmation?: boolean;
}

export function RowContextMenu({
  children,
  onDelete,
  requiresConfirmation = false,
}: RowContextMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setIsOpen(false), [
    "mousedown",
    "touchstart",
  ]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const handleLongPress = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setPosition({ x: touch.clientX, y: touch.clientY });
    setIsOpen(true);
  };

  const { onTouchStart, onTouchEnd, onTouchMove } = useLongPress(
    handleLongPress,
    600
  );

  const handleDeleteClick = () => {
    setIsOpen(false);
    if (requiresConfirmation) {
      setShowConfirm(true);
    } else {
      onDelete();
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        onContextMenu={handleContextMenu}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
      >
        {children}

        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={SPRING_DEFAULT}
                style={{
                  position: "fixed",
                  left: Math.min(position.x, window.innerWidth - 160),
                  top: Math.min(position.y, window.innerHeight - 80),
                }}
                className="z-50 w-40 bg-surface rounded-lg border border-border shadow-lg py-1 overflow-hidden"
              >
                <button
                  onClick={handleDeleteClick}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm flex items-center gap-2",
                    "text-error hover:bg-error/10 transition-colors"
                  )}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <DeleteConfirmationModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={onDelete}
        title="Delete this item?"
        description="This action cannot be undone. The item will be permanently removed from the ledger."
      />
    </>
  );
}
