"use client";

import Link from "next/link";
import { SpaceSelector } from "./space-selector";
import { UserMenu } from "./user-menu";
import { TabNav } from "./tab-nav";
import { MobileTabMenu } from "./mobile-tab-menu";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-[var(--color-surface)] border-b border-border/50">
      <div className="max-w-4xl mx-auto px-4 h-15 flex items-center">
        <Link
          href="/ledger"
          className="font-display font-bold text-xl text-text-primary tracking-tight hover:opacity-80 transition-opacity"
        >
          Wipu
				</Link>

      <div className="hidden md:flex max-w-4xl px-8">
        <TabNav />
      </div>

        <div className="flex items-center ml-auto gap-2">
          <SpaceSelector />
          <UserMenu />
          <MobileTabMenu />
        </div>
      </div>

    </header>
  );
}
