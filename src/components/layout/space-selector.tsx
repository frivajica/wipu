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
      className="w-60"
      trigger={
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium cursor-pointer",
            "bg-surface-elevated border border-border/70 hover:border-primary-accent/40 hover:bg-surface-warm",
            "shadow-card hover:shadow-card-hover transition-all duration-200 ease-out",
            "focus-visible:outline-none focus-visible:shadow-glow-focus"
          )}
        >
          <Wallet className="h-4 w-4 text-primary-accent" />
          <span className="max-w-[120px] truncate">{activeSpace.name}</span>
          <ChevronDown className={cn("h-3 w-3 text-text-tertiary transition-transform", isOpen && "rotate-180")} />
        </button>
      }
    >
      <div className="px-3.5 py-2 text-[11px] font-bold text-text-tertiary uppercase tracking-wider">
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
            "w-full text-left mx-1 w-[calc(100%-8px)] rounded-lg px-3 py-2 text-sm transition-all duration-150 flex items-center gap-2 cursor-pointer",
            space.id === activeSpace.id
              ? "bg-primary-accent/8 text-primary-accent font-medium"
              : "text-text-primary hover:bg-surface-elevated"
          )}
        >
          <Wallet className="h-4 w-4 shrink-0" />
          <span className="truncate">{space.name}</span>
        </button>
      ))}
      <div className="border-t border-border/60 my-1.5 mx-3" />
      <button
        onClick={() => {
          setIsOpen(false);
          router.push("/spaces");
        }}
        className="w-full text-left mx-1 w-[calc(100%-8px)] rounded-lg px-3 py-2 text-sm text-text-tertiary hover:text-text-secondary hover:bg-surface-elevated transition-all duration-150 flex items-center gap-2 cursor-pointer"
      >
        <LayoutGrid className="h-4 w-4 shrink-0" />
        Manage Spaces
      </button>
    </Dropdown>
  );
}
