"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-surface rounded-xl shadow-lg p-6 w-full max-w-md mx-4",
          "transform transition-all duration-200 scale-100",
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h2 className="text-lg font-semibold font-display text-text-primary">
              {title}
            </h2>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-surface-elevated transition-colors ml-auto"
          >
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
