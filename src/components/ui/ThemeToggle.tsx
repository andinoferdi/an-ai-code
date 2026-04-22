"use client";

import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md";
}

const themeOptions = [
  { value: "system", label: "System", icon: Laptop },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const;

export function ThemeToggle({ className, size = "md" }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();

  if (!theme || !resolvedTheme) {
    return (
      <span
        className={cn(
          "inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)]",
          size === "sm" ? "h-8 w-[96px]" : "h-9 w-[114px]",
          className,
        )}
      />
    );
  }

  const currentTheme = theme ?? "system";
  const resolvedLabel = resolvedTheme === "dark" ? "gelap" : "terang";

  return (
    <div
      role="group"
      aria-label={`Pilih tema, mode aktif ${currentTheme}, sistem ${resolvedLabel}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[var(--border)]",
        "bg-[var(--surface)] p-1 shadow-[0_1px_2px_rgb(0_0_0_/_0.04)]",
        className,
      )}
    >
      {themeOptions.map(({ value, label, icon: Icon }) => {
        const isActive = currentTheme === value;

        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            aria-label={`Gunakan ${label.toLowerCase()} mode`}
            title={
              value === "system"
                ? `System mode, saat ini ${resolvedLabel}`
                : `${label} mode`
            }
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex items-center justify-center rounded-full",
              "transition-colors duration-150 focus-visible:outline-none",
              "focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1",
              size === "sm" ? "h-6 w-6" : "h-7 w-7",
              isActive
                ? "bg-[var(--surface-raised)] text-[var(--text-primary)] shadow-[0_1px_2px_rgb(0_0_0_/_0.08)]"
                : "text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]",
            )}
          >
            <Icon
              size={size === "sm" ? 13 : 15}
              strokeWidth={1.9}
              className={cn(
                value === "system" && resolvedTheme === "dark" && !isActive
                  ? "text-[var(--text-secondary)]"
                  : undefined,
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
