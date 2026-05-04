"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { SPRING_DEFAULT } from "@/lib/animations";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop: warmer, deeper blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Content: elevated card with warm shadow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={SPRING_DEFAULT}
            className={cn(
              "relative w-full max-w-md mx-auto",
              // Surface with elevated warm shadow
              "bg-surface rounded-2xl shadow-elevated",
              // Subtle warm border
              "border border-border/60",
              "p-6",
              className
            )}
          >
            <div className="flex items-center justify-between mb-5">
              {title && (
                <h2 className="text-lg font-semibold font-display text-text-primary">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className={cn(
                  "p-1.5 rounded-lg transition-colors cursor-pointer",
                  "text-text-tertiary hover:text-text-secondary hover:bg-surface-elevated",
                  "focus-visible:outline-none focus-visible:shadow-glow-focus"
                )}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
