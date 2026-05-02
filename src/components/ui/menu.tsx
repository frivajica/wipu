"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Menu({ trigger, children, className }: MenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ type: "spring" as const, stiffness: 400, damping: 30 }}
              className={cn(
                "absolute right-0 mt-2 w-48 rounded-lg bg-surface shadow-lg border border-border py-1 z-50 overflow-hidden",
                className
              )}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface MenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  danger?: boolean;
}

export function MenuItem({ className, danger, children, ...props }: MenuItemProps) {
  return (
    <button
      className={cn(
        "w-full text-left px-4 py-2 text-sm transition-colors active:scale-[0.98]",
        "hover:bg-surface-elevated",
        danger ? "text-error" : "text-text-primary",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
