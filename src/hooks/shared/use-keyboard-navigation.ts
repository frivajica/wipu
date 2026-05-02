"use client";

import * as React from "react";

interface UseKeyboardNavigationOptions {
  itemCount: number;
  onSelect: (index: number) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function useKeyboardNavigation({
  itemCount,
  onSelect,
  onClose,
  isOpen,
}: UseKeyboardNavigationOptions) {
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < itemCount - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < itemCount) {
          onSelect(highlightedIndex);
        }
        break;
      case "Escape":
        onClose();
        break;
    }
  };

  const reset = () => setHighlightedIndex(-1);

  return { highlightedIndex, setHighlightedIndex, handleKeyDown, reset };
}
