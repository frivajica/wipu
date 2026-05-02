"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { HighlightText } from "./highlight-text";

interface SuggestionDropdownProps {
  suggestions: string[];
  highlightedIndex: number;
  query: string;
  isOpen: boolean;
  onSelect: (suggestion: string) => void;
  onHover: (index: number) => void;
  className?: string;
}

export function SuggestionDropdown({
  suggestions,
  highlightedIndex,
  query,
  isOpen,
  onSelect,
  onHover,
  className,
}: SuggestionDropdownProps) {
  return (
    <AnimatePresence>
      {isOpen && suggestions.length > 0 && (
        <motion.ul
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute z-50 w-full mt-1 bg-surface rounded-lg border border-border shadow-lg overflow-hidden",
            className
          )}
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              role="option"
              aria-selected={index === highlightedIndex}
              onClick={() => onSelect(suggestion)}
              onMouseEnter={() => onHover(index)}
              className={cn(
                "px-3 py-2 text-sm cursor-pointer transition-colors",
                index === highlightedIndex
                  ? "bg-primary-accent/10 text-text-primary"
                  : "text-text-secondary hover:bg-surface-elevated"
              )}
            >
              <HighlightText text={suggestion} query={query} />
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );
}
