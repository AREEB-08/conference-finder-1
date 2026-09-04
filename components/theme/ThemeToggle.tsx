"use client";

import { Monitor, Moon, Sun } from "lucide-react";

import { useTheme, type ThemeMode } from "./ThemeProvider";
import { cn } from "@/lib/utils";

const options: { mode: ThemeMode; label: string; Icon: typeof Sun }[] = [
  { mode: "light", label: "Light", Icon: Sun },
  { mode: "dark", label: "Dark", Icon: Moon },
  { mode: "system", label: "System", Icon: Monitor },
];

/**
 * Three-way theme switch built as a radiogroup so arrow keys and screen
 * readers behave the way users expect from a segmented control.
 */
export default function ThemeToggle({ className }: { className?: string }) {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn(
        "inline-flex items-center gap-0.5 rounded border border-[var(--rule)] bg-[var(--surface)] p-0.5",
        className,
      )}
    >
      {options.map(({ mode: value, label, Icon }) => {
        const active = mode === value;

        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={`${label} theme`}
            title={`${label} theme`}
            onClick={() => setMode(value)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-sm transition-colors",
              active
                ? "bg-[var(--accent-wash)] text-[var(--accent)]"
                : "text-[var(--ink-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]",
            )}
          >
            <Icon size={15} aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
