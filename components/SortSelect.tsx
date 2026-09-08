"use client";

import { useId } from "react";
import { ArrowUpDown } from "lucide-react";

import { useQueryState } from "@/components/search/useQueryState";

/** Sort control. Writes to the URL like every other filter. */
export default function SortSelect({
  options,
}: {
  options: { value: string; label: string }[];
}) {
  const id = useId();
  const { get, setParams } = useQueryState();

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-sm text-[var(--ink-muted)]"
      >
        <ArrowUpDown size={14} aria-hidden="true" />
        Sort
      </label>

      <select
        id={id}
        value={get("sort") || options[0].value}
        onChange={(event) => setParams({ sort: event.target.value })}
        className="h-9 rounded-full border border-[var(--rule)] bg-[var(--surface)] px-3 text-sm focus:border-[var(--accent)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
