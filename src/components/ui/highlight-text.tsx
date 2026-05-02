"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface HighlightTextProps {
  text: string;
  query: string;
  highlightClassName?: string;
}

export function HighlightText({
  text,
  query,
  highlightClassName,
}: HighlightTextProps) {
  if (!query.trim()) {
    return <>{text}</>;
  }

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escapedQuery})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            className={cn(
              "bg-primary-accent/20 text-text-primary font-medium rounded px-0.5",
              highlightClassName
            )}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
