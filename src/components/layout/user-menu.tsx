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
  );
}
