"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Dropdown } from "./dropdown";

export interface MenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Menu({ trigger, children, className }: MenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggle = () => setIsOpen((prev) => !prev);
  const close = () => setIsOpen(false);

  return (
    <Dropdown
      trigger={<div onClick={toggle}>{trigger}</div>}
      isOpen={isOpen}
      onClose={close}
      className={cn("w-48 py-1", className)}
      align="right"
    >
      {children}
    </Dropdown>
  );
}

export interface MenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  danger?: boolean;
}

export function MenuItem({
  className,
  danger,
  children,
  ...props
}: MenuItemProps) {
  return (
    <button
      className={cn(
        "w-full text-left px-4 py-2 text-sm transition-colors active:scale-[0.98] cursor-pointer inline-flex items-center",
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
