"use client";

import { useAuth } from "@/hooks/use-auth";
import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuItem } from "@/components/ui/menu";
import { LogOut } from "lucide-react";

export function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <Menu
      trigger={
        <button className="focus-visible:outline-none focus-visible:shadow-glow-focus rounded-full transition-transform active:scale-95 cursor-pointer">
          <Avatar name={user.name} size="sm" />
        </button>
      }
    >
      <div className="px-4 py-2.5 border-b border-border/60">
        <p className="text-sm font-semibold text-text-primary">{user.name}</p>
        <p className="text-xs text-text-tertiary mt-0.5">{user.email}</p>
      </div>
      <div className="py-1">
        <MenuItem onClick={logout}>
          <LogOut className="h-4 w-4 mr-2 text-text-tertiary" />
          Sign out
        </MenuItem>
      </div>
    </Menu>
  );
}
