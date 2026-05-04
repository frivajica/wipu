"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { create } from "zustand";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import { SPRING_DEFAULT } from "@/lib/animations";

export type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = "info") =>
    set((state) => ({
      toasts: [...state.toasts, { id: Math.random().toString(36).slice(2), message, type }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-secondary" />,
    error: <XCircle className="h-5 w-5 text-error" />,
    info: <Info className="h-5 w-5 text-primary-accent" />,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.15 } }}
      transition={SPRING_DEFAULT}
      className={cn(
        "flex items-center gap-3 rounded-xl bg-surface shadow-elevated border border-border/60 px-4 py-3 min-w-[300px]"
      )}
    >
      {icons[toast.type]}
      <span className="text-sm text-text-primary flex-1 font-medium">{toast.message}</span>
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-surface-elevated transition-colors cursor-pointer focus-visible:outline-none focus-visible:shadow-glow-focus"
      >
        <X className="h-4 w-4 text-text-tertiary" />
      </button>
    </motion.div>
  );
}
