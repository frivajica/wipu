"use client";

import * as React from "react";
import { motion, useMotionValue, useTransform, animate, PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

interface SwipeToDeleteProps {
  children: React.ReactNode;
  onDelete: () => void;
  className?: string;
  requiresConfirmation?: boolean;
}

export function SwipeToDelete({ children, onDelete, className, requiresConfirmation = false }: SwipeToDeleteProps) {
  const [isConfirming, setIsConfirming] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-150, -100, 0], [1, 0.5, 0]);
  const scale = useTransform(x, [-150, -100, 0], [1, 0.8, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x < -100) {
      if (requiresConfirmation) {
        setShowModal(true);
        animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      } else {
        onDelete();
      }
    } else {
      animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
      setIsConfirming(false);
    }
  };

  const handleConfirmDelete = () => {
    onDelete();
    setIsConfirming(false);
    setShowModal(false);
    animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
  };

  const handleCancel = () => {
    setIsConfirming(false);
    setShowModal(false);
    animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
  };

  return (
    <>
      <div className={cn("relative overflow-hidden", className)}>
        {/* Delete background layer */}
        <motion.div
          className="absolute inset-0 flex items-center justify-end pr-4 bg-error rounded-lg"
          style={{ opacity }}
        >
          <motion.div style={{ scale }}>
            <Trash2 className="h-6 w-6 text-white" />
          </motion.div>
        </motion.div>

        {/* Content layer */}
        <motion.div
          drag="x"
          dragConstraints={{ left: -150, right: 0 }}
          dragElastic={0.1}
          onDragEnd={handleDragEnd}
          style={{ x }}
          className="relative z-10 bg-surface"
        >
          {children}
        </motion.div>

        {/* Confirmation overlay */}
        {isConfirming && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-20 flex items-center justify-center gap-2 bg-error/95 rounded-lg"
          >
            <span className="text-white text-sm font-medium">Delete?</span>
            <button
              onClick={handleConfirmDelete}
              className="px-3 py-1 bg-white text-error rounded-md text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Yes
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1 bg-white/20 text-white rounded-md text-sm font-medium hover:bg-white/30 transition-colors"
            >
              No
            </button>
          </motion.div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          animate(x, 0, { type: "spring", stiffness: 500, damping: 30 });
        }}
        onConfirm={handleConfirmDelete}
        title="Delete this item?"
        description="This action cannot be undone. The item will be permanently removed from the ledger."
      />
    </>
  );
}
