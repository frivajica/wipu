"use client";

import { Toggle } from "@/components/ui/toggle";

interface SmartDateToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SmartDateToggle({ checked, onChange }: SmartDateToggleProps) {
  return (
    <Toggle
      checked={checked}
      onChange={onChange}
      label="Smart Date Inheritance"
    />
  );
}
