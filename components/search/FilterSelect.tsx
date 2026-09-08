"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";

import type { FacetOption } from "@/types/search";
import { useQueryState } from "./useQueryState";

/**
 * One filter dropdown. Options come from the data itself, so a filter never
 * offers a value that would return nothing.
 */
export default function FilterSelect({
  param,
  label,
  options,
  allLabel = "All",
  showCounts = true,
  labels,
}: {
  param: string;
  label: string;
  options: FacetOption[];
  allLabel?: string;
  showCounts?: boolean;
  /** Display text for values that are not self-explanatory, e.g. "1" -> "3.0+". */
  labels?: Record<string, string>;
}) {
  const id = useId();
  const { get, setParams } = useQueryState();
  const value = get(param);

  if (options.length === 0) return null;

  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-[var(--ink-muted)]"
      >
        {label}
      </label>

      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => setParams({ [param]: event.target.value })}
          className="h-9 w-full appearance-none truncate rounded-full border border-[var(--rule)] bg-[var(--surface)] pl-3.5 pr-8 text-sm text-[var(--ink)] focus:border-[var(--accent)]"
        >
          <option value="">{allLabel}</option>

          {/* A value from the URL that is no longer in the data still needs to
              be selectable, or the control would silently misreport itself. */}
          {value && !options.some((option) => option.value === value) ? (
            <option value={value}>{labels?.[value] ?? value}</option>
          ) : null}

          {options.map((option) => {
            const text = labels?.[option.value] ?? option.value;
            return (
              <option key={option.value} value={option.value}>
                {showCounts ? `${text} (${option.count})` : text}
              </option>
            );
          })}
        </select>

        <ChevronDown
          size={14}
          aria-hidden="true"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--ink-subtle)]"
        />
      </div>
    </div>
  );
}
