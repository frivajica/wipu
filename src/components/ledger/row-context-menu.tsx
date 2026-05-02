"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface RowContextMenuProps {
  children: React.ReactNode;
  onDelete: () => void;
}

export function RowContextMenu({ children, onDelete }: RowContextMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null);
  const isLongPress = React.useRef(false);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPosition({ x: e.clientX, y: e.clientY });
    setIsOpen(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      const touch = e.touches[0];
      setPosition({ x: touch.clientX, y: touch.clientY });
      setIsOpen(true);
    }, 600);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  React.useEffect(() => {
    function handleClickOutside(event: Event) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  const handleDelete = () => {
    setIsOpen(false);
    onDelete();
  };

  return (
    <div
      ref={containerRef}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {children}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              style={{
                position: "fixed",
                left: Math.min(position.x, window.innerWidth - 160),
                top: Math.min(position.y, window.innerHeight - 80),
              }}
              className="z-50 w-40 bg-surface rounded-lg border border-border shadow-lg py-1 overflow-hidden"
            >
              <button
                onClick={handleDelete}
                className={cn(
                  "w-full text-left px-3 py-2 text-sm flex items-center gap-2",
                  "text-error hover:bg-error/10 transition-colors"
                )}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
