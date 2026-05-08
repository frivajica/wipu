import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium cursor-pointer",
          "transition-all duration-200 ease-out",
          "rounded-xl",
          "focus-visible:outline-none focus-visible:shadow-glow-focus",
          "active:scale-[0.97] active:shadow-inner-active",
          "disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 disabled:active:shadow-none",
          variant !== "ghost" && "hover:-translate-y-px hover:shadow-card-hover",
          {
            "bg-primary-accent text-white shadow-card hover:bg-primary-accent-hover": variant === "primary",
            "bg-surface-elevated text-text-primary border border-border shadow-card hover:bg-surface-warm hover:border-border-hover": variant === "secondary",
            "text-text-secondary hover:text-text-primary hover:bg-surface-elevated": variant === "ghost",
            "bg-error text-white shadow-card hover:bg-error-hover": variant === "danger",
          },
          {
            "h-8 px-3 text-sm rounded-lg": size === "sm",
            "h-10 px-5 text-base": size === "md",
            "h-12 px-7 text-lg": size === "lg",
          },
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
