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
        "flex items-center justify-center text-text-tertiary hover:text-text-secondary",
        "transition-colors touch-none select-none",
        "focus-visible:outline-none focus-visible:shadow-glow-focus rounded-md",
        isDragging ? "cursor-grabbing text-text-primary" : "cursor-grab",
        className
      )}
      aria-label="Drag to reorder"
    >
      <GripVertical className="h-4 w-4" />
    </button>
  );
}
