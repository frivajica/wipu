"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CreditCard, Menu, Repeat, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SPRING_DEFAULT } from "@/lib/animations";
import React from "react";

const tabs = [
  { id: "ledger", label: "Ledger", href: "/ledger", icon: BookOpen },
  { id: "debt", label: "Debt", href: "/debt", icon: CreditCard },
  { id: "recurring", label: "Recurring", href: "/recurring", icon: Repeat },
];

export function MobileTabMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  const close = () => setIsOpen(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden flex items-center justify-center h-9 w-9 rounded-xl text-text-secondary hover:text-text hover:bg-surface-elevated transition-colors cursor-pointer"
        aria-label="Open navigation menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-50 bg-black/20 md:hidden"
              onClick={close}
            />
            <motion.div
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              transition={SPRING_DEFAULT}
              className="fixed right-0 top-0 bottom-0 z-50 w-72 max-w-[85vw] bg-surface shadow-elevated md:hidden"
            >
              <div className="flex items-center justify-between px-4 h-15 border-b border-border/50">
                <span className="font-display font-bold text-lg text-text-primary">
                  Navigate
                </span>
                <button
                  onClick={close}
                  className="flex items-center justify-center h-9 w-9 rounded-xl text-text-secondary hover:text-text hover:bg-surface-elevated transition-colors cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 p-3">
                {tabs.map((tab) => {
                  const isActive = pathname === tab.href;
                  const Icon = tab.icon;

                  return (
                    <Link
                      key={tab.id}
                      href={tab.href}
                      onClick={close}
                      className={cn(
                        "relative flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                        isActive
                          ? "text-text bg-surface-strong"
                          : "text-text-secondary hover:text-text hover:bg-surface-elevated"
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
