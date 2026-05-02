"use client";

import * as React from "react";
import { create } from "zustand";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

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
      toasts: [...state.toasts, { id: Math.random().toString(36), message, type }],
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
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-secondary" />,
    error: <XCircle className="h-5 w-5 text-error" />,
    info: <Info className="h-5 w-5 text-primary-accent" />,
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg bg-surface shadow-lg border px-4 py-3 min-w-[300px]",
        "transform transition-all duration-200 animate-in slide-in-from-bottom-2"
      )}
    >
      {icons[toast.type]}
      <span className="text-sm text-text-primary flex-1">{toast.message}</span>
      <button
        onClick={onClose}
        className="p-1 rounded hover:bg-surface-elevated transition-colors"
      >
        <X className="h-4 w-4 text-text-secondary" />
      </button>
    </div>
  );
}
