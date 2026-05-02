"use client";

import * as React from "react";
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
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-48 rounded-lg bg-surface shadow-lg border border-border py-1 z-50",
            "transform transition-all duration-150 origin-top-right",
            className
          )}
        >
          {children}
        </div>
      )}
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
        "w-full text-left px-4 py-2 text-sm transition-colors",
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
