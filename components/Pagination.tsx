import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Page links are real hrefs rather than buttons, so results stay shareable and
 * work without JavaScript.
 */
export default function Pagination({
  page,
  totalPages,
  buildHref,
}: {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}) {
  if (totalPages <= 1) return null;

  const pages = pageWindow(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex items-center justify-center gap-1"
    >
      <PageLink
        href={buildHref(page - 1)}
        disabled={page <= 1}
        label="Previous page"
      >
        <ChevronLeft size={16} aria-hidden="true" />
      </PageLink>

      {pages.map((entry, index) =>
        entry === "gap" ? (
          <span
            key={`gap-${index}`}
            className="px-2 text-sm text-[var(--ink-subtle)]"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <Link
            key={entry}
            href={buildHref(entry)}
            aria-current={entry === page ? "page" : undefined}
            aria-label={`Page ${entry}`}
            className={cn(
              "tnum flex h-9 min-w-9 items-center justify-center rounded-full border px-2 text-sm transition-colors",
              entry === page
                ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]"
                : "border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]",
            )}
          >
            {entry}
          </Link>
        ),
      )}

      <PageLink
        href={buildHref(page + 1)}
        disabled={page >= totalPages}
        label="Next page"
      >
        <ChevronRight size={16} aria-hidden="true" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  const className =
    "flex h-9 w-9 items-center justify-center rounded-full border border-[var(--rule)] bg-[var(--surface)] text-[var(--ink-muted)] transition-colors";

  if (disabled) {
    return (
      <span
        aria-disabled="true"
        aria-label={label}
        className={`${className} opacity-40`}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className={`${className} hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]`}
    >
      {children}
    </Link>
  );
}

/** Show first, last, and a window around the current page. */
export function pageWindow(
  page: number,
  totalPages: number,
): (number | "gap")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const result: (number | "gap")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) result.push("gap");
  for (let index = start; index <= end; index += 1) result.push(index);
  if (end < totalPages - 1) result.push("gap");

  result.push(totalPages);
  return result;
}
