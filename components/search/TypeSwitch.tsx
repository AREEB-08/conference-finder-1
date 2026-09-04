"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * Conferences / journals switch at the top of the search page.
 *
 * Switching drops type-specific filters, because a publisher filter is
 * meaningless once you are looking at conferences. The keyword is kept.
 */
export default function TypeSwitch({ type }: { type: "conference" | "journal" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const switchTo = (next: "conference" | "journal") => {
    if (next === type) return;

    const params = new URLSearchParams();
    const query = searchParams.get("q");
    if (query) params.set("q", query);
    params.set("type", next);

    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  return (
    <div
      role="radiogroup"
      aria-label="What to search"
      className="inline-flex rounded border border-[var(--rule-strong)] bg-[var(--surface)] p-0.5"
    >
      {(["conference", "journal"] as const).map((value) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={type === value}
          onClick={() => switchTo(value)}
          className={cn(
            "rounded-sm px-4 py-1.5 text-sm transition-colors",
            type === value
              ? "bg-[var(--accent)] font-medium text-[var(--accent-ink)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]",
          )}
        >
          {value === "conference" ? "Conferences" : "Journals"}
        </button>
      ))}
    </div>
  );
}
