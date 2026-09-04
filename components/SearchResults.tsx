import ConferenceCard from "@/components/ConferenceCard";
import JournalCard from "@/components/JournalCard";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import { ButtonLink } from "@/components/ui/Button";
import type { ConferenceResults, JournalResults } from "@/types/search";

/**
 * Results grid plus count and pagination. Server-rendered: only the page the
 * user is looking at is ever serialised to the browser, so the payload stays
 * flat as the spreadsheet grows.
 */
export function ConferenceResultsGrid({
  results,
  buildHref,
  clearHref = "/conferences",
}: {
  results: ConferenceResults;
  buildHref: (page: number) => string;
  clearHref?: string;
}) {
  if (results.total === 0) {
    return (
      <EmptyState
        title="No conferences match these filters"
        description="Try removing a filter, or search a broader term such as a research area rather than a full conference name."
        action={
          <ButtonLink href={clearHref} variant="secondary" size="sm">
            Clear filters
          </ButtonLink>
        }
      />
    );
  }

  return (
    <>
      <ResultCount results={results} noun="conference" />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.items.map((conference) => (
          <li key={conference.id} className="h-full">
            <ConferenceCard conference={conference} />
          </li>
        ))}
      </ul>

      <Pagination
        page={results.page}
        totalPages={results.totalPages}
        buildHref={buildHref}
      />
    </>
  );
}

export function JournalResultsGrid({
  results,
  buildHref,
  clearHref = "/journals",
}: {
  results: JournalResults;
  buildHref: (page: number) => string;
  clearHref?: string;
}) {
  if (results.total === 0) {
    return (
      <EmptyState
        title="No journals match these filters"
        description="Try a broader subject, or clear the impact factor and quartile filters — many records do not list those values."
        action={
          <ButtonLink href={clearHref} variant="secondary" size="sm">
            Clear filters
          </ButtonLink>
        }
      />
    );
  }

  return (
    <>
      <ResultCount results={results} noun="journal" />

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.items.map((journal) => (
          <li key={journal.id} className="h-full">
            <JournalCard journal={journal} />
          </li>
        ))}
      </ul>

      <Pagination
        page={results.page}
        totalPages={results.totalPages}
        buildHref={buildHref}
      />
    </>
  );
}

function ResultCount({
  results,
  noun,
}: {
  results: { total: number; page: number; perPage: number };
  noun: string;
}) {
  const first = (results.page - 1) * results.perPage + 1;
  const last = Math.min(results.page * results.perPage, results.total);

  return (
    <p
      aria-live="polite"
      className="mb-4 text-sm text-[var(--ink-muted)]"
    >
      Showing{" "}
      <span className="tnum text-[var(--ink)]">
        {first}–{last}
      </span>{" "}
      of <span className="tnum text-[var(--ink)]">{results.total}</span> {noun}
      {results.total === 1 ? "" : "s"}
    </p>
  );
}
