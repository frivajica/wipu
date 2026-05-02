"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useSpaces } from "@/hooks/use-spaces";
import { Dropdown } from "@/components/ui/dropdown";
import { Wallet, LayoutGrid, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function SpaceSelector() {
  const router = useRouter();
  const { activeSpace, spaces, switchSpace } = useSpaces();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!activeSpace) return null;

  return (
    <Dropdown
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      align="right"
      className="w-56"
      trigger={
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium cursor-pointer",
            "bg-surface-elevated border border-border hover:border-primary-accent transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-accent focus-visible:ring-offset-2"
          )}
        >
          <Wallet className="h-4 w-4 text-primary-accent" />
          <span className="max-w-[120px] truncate">{activeSpace.name}</span>
          <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
        </button>
      }
    >
      <div className="px-3 py-2 text-xs font-medium text-text-secondary uppercase tracking-wider">
        Switch Space
      </div>
      {spaces.map((space) => (
        <button
          key={space.id}
          onClick={() => {
            switchSpace(space.id);
            setIsOpen(false);
            router.push("/ledger");
          }}
          className={cn(
            "w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2 cursor-pointer",
            space.id === activeSpace.id
              ? "bg-primary-accent/10 text-primary-accent"
              : "text-text-primary hover:bg-surface-elevated"
          )}
        >
          <Wallet className="h-4 w-4" />
          <span className="truncate">{space.name}</span>
        </button>
      ))}
      <div className="border-t border-border my-1" />
      <button
        onClick={() => {
          setIsOpen(false);
          router.push("/spaces");
        }}
        className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-surface-elevated transition-colors flex items-center gap-2 cursor-pointer"
      >
        <LayoutGrid className="h-4 w-4" />
        Manage Spaces
      </button>
    </Dropdown>
  );
}
