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
  const [showSuccess, setShowSuccess] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    setShowSuccess(false);
    onSubmit(e);
  };

  React.useEffect(() => {
    if (!isLoading && !error && showSuccess) {
      // Success state handled by parent redirect
    }
  }, [isLoading, error, showSuccess]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <motion.div
        animate={showSuccess ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Button type="submit" className="w-full" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </motion.div>

      {footer}
    </form>
  );
}
