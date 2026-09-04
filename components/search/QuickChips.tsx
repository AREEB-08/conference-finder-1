"use client";

import { useQueryState } from "./useQueryState";
import { cn } from "@/lib/utils";

/**
 * One-tap shortcuts for the filters people reach for most.
 *
 * Each chip toggles a single query parameter, so tapping an active chip clears
 * it. Only chips whose value actually exists in the data are passed in by the
 * server, so a chip never leads to an empty result set.
 */
export default function QuickChips({
  chips,
  label,
}: {
  chips: { param: string; value: string; label: string }[];
  label: string;
}) {
  const { get, setParams } = useQueryState();

  if (chips.length === 0) return null;

  return (
    <div className="mb-5">
      <h2 className="sr-only">{label}</h2>
      <ul className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const active = get(chip.param) === chip.value;

          return (
            <li key={`${chip.param}-${chip.value}`}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() =>
                  setParams({ [chip.param]: active ? "" : chip.value })
                }
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "border-[var(--rule-strong)] bg-[var(--surface)] text-[var(--ink-muted)] hover:border-[var(--accent-line)] hover:bg-[var(--accent-wash)] hover:text-[var(--accent)]",
                )}
              >
                {chip.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
