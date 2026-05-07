"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const shakeVariants = {
  shake: {
    x: [-4, 4, -4, 4, 0],
    transition: { duration: 0.3 },
  },
};

interface AuthFormLayoutProps {
  onSubmit: (e: React.FormEvent) => void;
  error: Error | null;
  isLoading: boolean;
  submitLabel: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}

export function AuthFormLayout({
  onSubmit,
  error,
  isLoading,
  submitLabel,
  footer,
  children,
}: AuthFormLayoutProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="error"
            variants={shakeVariants}
            animate="shake"
            initial={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-error"
          >
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>

      <Button type="submit" className="w-full" isLoading={isLoading}>
        {submitLabel}
      </Button>

      {footer}
    </form>
  );
}
