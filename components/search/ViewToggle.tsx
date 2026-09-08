"use client";

import { LayoutGrid, Rows3 } from "lucide-react";

import { useQueryState } from "./useQueryState";
import { cn } from "@/lib/utils";

/**
 * Cards or table. Cards suit browsing; the table suits comparing many
 * deadlines at once, which is what people do close to a submission window.
 * The choice lives in the URL so a shared link keeps it.
 */
export default function ViewToggle() {
  const { get, setParams } = useQueryState();
  const view = get("view") === "table" ? "table" : "cards";

  const options = [
    { value: "cards", label: "Card view", Icon: LayoutGrid },
    { value: "table", label: "Table view", Icon: Rows3 },
  ] as const;

  return (
    <div
      role="radiogroup"
      aria-label="Result layout"
      className="inline-flex items-center gap-0.5 rounded-full border border-[var(--rule)] bg-[var(--surface)] p-0.5"
    >
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={view === value}
          aria-label={label}
          title={label}
          // Changing layout should not move the reader to another page.
          onClick={() => setParams({ view: value === "cards" ? "" : value })}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            view === value
              ? "bg-[var(--accent-wash)] text-[var(--accent)]"
              : "text-[var(--ink-subtle)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]",
          )}
        >
          <Icon size={15} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
