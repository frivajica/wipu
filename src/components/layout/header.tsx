"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useSpaces } from "@/hooks/use-spaces";
import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuItem } from "@/components/ui/menu";
import { ChevronDown, LayoutGrid, LogOut, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { activeSpace, spaces, switchSpace } = useSpaces();
  const [isSpaceMenuOpen, setIsSpaceMenuOpen] = React.useState(false);

  const handleSpaceSwitch = (spaceId: string) => {
    switchSpace(spaceId);
    setIsSpaceMenuOpen(false);
    router.push("/ledger");
  };

  return (
    <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-border">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/ledger" className="font-display font-bold text-xl text-primary">
          Wipu
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Space Selector */}
          {activeSpace && (
            <div className="relative">
              <button
                onClick={() => setIsSpaceMenuOpen(!isSpaceMenuOpen)}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                  "bg-surface-elevated border border-border hover:border-primary-accent transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2"
                )}
              >
                <Wallet className="h-4 w-4 text-primary-accent" />
                <span className="max-w-[120px] truncate">{activeSpace.name}</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", isSpaceMenuOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isSpaceMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsSpaceMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ type: "spring" as const, stiffness: 400, damping: 30 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-xl border border-border shadow-lg py-1 z-50 overflow-hidden"
                    >
                      <div className="px-3 py-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
                        Switch Space
                      </div>
                      {spaces.map((space, index) => (
                        <motion.button
                          key={space.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => handleSpaceSwitch(space.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2",
                            space.id === activeSpace.id
                              ? "bg-primary-accent/10 text-primary-accent"
                              : "text-text-primary hover:bg-surface-elevated"
                          )}
                        >
                          <Wallet className="h-4 w-4" />
                          <span className="truncate">{space.name}</span>
                        </motion.button>
                      ))}
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => {
                          setIsSpaceMenuOpen(false);
                          router.push("/spaces");
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated transition-colors flex items-center gap-2"
                      >
                        <LayoutGrid className="h-4 w-4" />
                        Manage Spaces
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* User Menu */}
          {user && (
            <Menu
              trigger={
                <button className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2 rounded-full transition-transform active:scale-95">
                  <Avatar name={user.name} size="sm" />
                </button>
              }
            >
              <div className="px-4 py-2 border-b border-border">
                <p className="text-sm font-medium text-text-primary">{user.name}</p>
                <p className="text-xs text-text-secondary">{user.email}</p>
              </div>
              <MenuItem onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </MenuItem>
            </Menu>
          )}
        </div>
      </div>
    </header>
  );
}
