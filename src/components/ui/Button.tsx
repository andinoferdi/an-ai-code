import React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "ghost" | "ghost-danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon-sm" | "icon-md";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--accent-text)] hover:bg-[var(--accent-hover)] active:scale-[0.97]",
  ghost:
    "bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] active:scale-[0.97]",
  "ghost-danger":
    "bg-transparent text-[var(--text-muted)] hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 active:scale-[0.97]",
  outline:
    "border border-[var(--border)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] active:scale-[0.97]",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-7 px-3 text-xs rounded-lg gap-1.5 font-medium",
  md: "h-9 px-4 text-sm rounded-xl gap-2 font-medium",
  lg: "h-10 px-5 text-sm rounded-xl gap-2 font-medium",
  "icon-sm": "h-7 w-7 rounded-lg flex-none",
  "icon-md": "h-8 w-8 rounded-xl flex-none",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "ghost",
      size = "md",
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center",
          "transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1",
          "disabled:pointer-events-none disabled:opacity-40",
          "select-none cursor-pointer",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-r-transparent animate-spin" />
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
