"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "ledger", label: "Ledger", href: "/ledger", icon: BookOpen },
  { id: "debt", label: "Debt", href: "/debt", icon: CreditCard },
];

export function TabNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 rounded-lg bg-surface-strong p-1">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        const Icon = tab.icon;

        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "relative flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-text"
                : "text-text-secondary hover:text-text"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-0 rounded-md bg-surface shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <Icon className="relative h-4 w-4" />
            <span className="relative">{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
