"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

interface DragHandleProps extends React.HTMLAttributes<HTMLButtonElement> {
  isDragging?: boolean;
}

export function DragHandle({ isDragging, className, ...props }: DragHandleProps) {
  return (
    <button
      {...props}
      className={cn(
        "flex items-center justify-center text-text-secondary hover:text-text-primary",
        "transition-colors touch-none select-none",
        "md:w-8 md:h-8 w-11 h-11",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 rounded",
        isDragging ? "cursor-grabbing text-text-primary" : "cursor-grab",
        className
      )}
      aria-label="Drag to reorder"
    >
      <GripVertical className="h-5 w-5" />
    </button>
  );
}
