import Link from "next/link";
import { BookOpen } from "lucide-react";

import VerifiedBadge from "@/components/VerifiedBadge";
import Badge from "@/components/ui/Badge";
import { truncate } from "@/lib/utils";
import type { Journal } from "@/types/journal";

/**
 * Journals are chosen on different criteria than conferences: reach and cost
 * rather than dates. The impact factor therefore gets the anchor position.
 */
export default function JournalCard({ journal }: { journal: Journal }) {
  const indexes = journal.indexing.slice(0, 3);
  const remaining = journal.indexing.length - indexes.length;

  return (
    <article className="group relative flex h-full flex-col rounded border border-[var(--rule)] bg-[var(--surface)] p-5 transition-colors hover:border-[var(--rule-strong)]">
      <div className="flex flex-wrap items-center gap-2">
        {journal.accessKind !== "Unspecified" ? (
          <Badge tone={journal.accessKind === "Open Access" ? "open" : "neutral"}>
            {journal.accessKind}
          </Badge>
        ) : null}
        {journal.quartile ? <Badge tone="accent">{journal.quartile}</Badge> : null}
        <VerifiedBadge verified={journal.verified} />
      </div>

      <h3 className="mt-3 text-base leading-6">
        <Link
          href={`/journal/${journal.id}`}
          className="after:absolute after:inset-0 after:content-[''] hover:text-[var(--accent)]"
        >
          {truncate(journal.name, 100)}
        </Link>
      </h3>

      <dl className="mt-3 space-y-2 text-sm text-[var(--ink-muted)]">
        {journal.publisher ? (
          <div className="flex items-start gap-2">
            <dt className="sr-only">Publisher</dt>
            <BookOpen
              size={14}
              className="mt-0.5 shrink-0 text-[var(--ink-subtle)]"
              aria-hidden="true"
            />
            <dd>{truncate(journal.publisher, 60)}</dd>
          </div>
        ) : null}

        {journal.issn ? (
          <div className="flex gap-2">
            <dt className="text-[var(--ink-subtle)]">ISSN</dt>
            <dd className="tnum">{journal.issn}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto pt-4">
        {indexes.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {indexes.map((index) => (
              <li key={index}>
                <Badge tone="neutral">{index}</Badge>
              </li>
            ))}
            {remaining > 0 ? (
              <li>
                <Badge tone="neutral">+{remaining}</Badge>
              </li>
            ) : null}
          </ul>
        ) : null}

        {journal.impactFactor !== null ? (
          <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-[var(--rule)] pt-3 text-sm">
            <span className="text-[var(--ink-subtle)]">Impact factor</span>
            <span className="tnum text-[var(--ink)]">
              {journal.impactFactor.toFixed(1)}
            </span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
