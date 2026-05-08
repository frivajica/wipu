import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full px-3.5 py-2 text-base",
          "transition-all duration-200 ease-out",
          "rounded-lg",
          "bg-surface-warm border border-border",
          "placeholder:text-text-tertiary",
          "hover:border-border-hover",
          "focus-visible:outline-none focus-visible:border-primary-accent focus-visible:shadow-glow-focus focus-visible:bg-surface",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-surface-elevated",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
