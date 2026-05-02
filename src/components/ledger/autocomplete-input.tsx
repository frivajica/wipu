"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  inputRef?: React.Ref<HTMLInputElement>;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  required?: boolean;
  type?: string;
  id?: string;
}

export function AutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
  inputRef,
  onKeyDown,
  required,
  type = "text",
  id,
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filteredSuggestions = React.useMemo(() => {
    if (!value.trim()) return suggestions.slice(0, 5);
    return suggestions
      .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 5);
  }, [value, suggestions]);

  const showDropdown = isOpen && filteredSuggestions.length > 0;

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) {
      onKeyDown?.(e);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredSuggestions.length) {
          onChange(filteredSuggestions[highlightedIndex]);
          setIsOpen(false);
          setHighlightedIndex(-1);
        } else {
          onKeyDown?.(e);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      case "Tab":
        setIsOpen(false);
        onKeyDown?.(e);
        break;
      default:
        onKeyDown?.(e);
    }
  };

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Highlight matched text in suggestions
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-primary-accent/20 text-text-primary font-medium rounded px-0.5">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        id={id}
        type={type}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => {
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className={cn(
          "flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base",
          "transition-colors duration-200",
          "placeholder:text-text-secondary",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 focus-visible:border-primary-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />

      <AnimatePresence>
        {showDropdown && (
          <motion.ul
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-1 bg-surface rounded-lg border border-border shadow-lg overflow-hidden"
            role="listbox"
          >
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={suggestion}
                role="option"
                aria-selected={index === highlightedIndex}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  "px-3 py-2 text-sm cursor-pointer transition-colors",
                  index === highlightedIndex
                    ? "bg-primary-accent/10 text-text-primary"
                    : "text-text-secondary hover:bg-surface-elevated"
                )}
              >
                {highlightMatch(suggestion, value)}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
