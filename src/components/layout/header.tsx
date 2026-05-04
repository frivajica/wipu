"use client";

import Link from "next/link";
import { SpaceSelector } from "./space-selector";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-surface/75 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-4xl mx-auto px-4 h-[60px] flex items-center justify-between">
        <Link
          href="/ledger"
          className="font-display font-bold text-xl text-text-primary tracking-tight hover:opacity-80 transition-opacity"
        >
          Wipu
        </Link>

        <div className="flex items-center gap-3">
          <SpaceSelector />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
