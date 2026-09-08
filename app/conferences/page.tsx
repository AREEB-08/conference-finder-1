import type { Metadata } from "next";
import { Suspense } from "react";

import ConferenceTable from "@/components/ConferenceTable";
import DataSourceNotice from "@/components/DataSourceNotice";
import ListingStats from "@/components/ListingStats";
import Pagination from "@/components/Pagination";
import SortSelect from "@/components/SortSelect";
import EmptyState from "@/components/EmptyState";
import { CardGridSkeleton } from "@/components/LoadingState";
import { ConferenceResultsGrid } from "@/components/SearchResults";
import SearchBar from "@/components/search/SearchBar";
import QuickChips from "@/components/search/QuickChips";
import ViewToggle from "@/components/search/ViewToggle";
import { ConferenceFilterPanel } from "@/components/search/FilterPanel";
import { ButtonLink } from "@/components/ui/Button";
import { getConferences } from "@/lib/data";
import { getDeadlineInfo } from "@/lib/dates";
import {
  buildConferenceFacets,
  parseConferenceParams,
  searchConferences,
} from "@/lib/search";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Conferences",
  description:
    "Browse academic conferences with submission deadlines, locations, participation modes and topics. Filter by country, mode, topic and year.",
  alternates: { canonical: "/conferences" },
};

const sortOptions = [
  { value: "deadline", label: "Deadline" },
  { value: "name", label: "Name" },
  { value: "date", label: "Conference date" },
  { value: "recent", label: "Recently updated" },
];

export default async function ConferencesPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const filters = parseConferenceParams(searchParams);

  const { items, status } = await getConferences();
  const facets = buildConferenceFacets(items);
  const results = searchConferences(items, filters);

  const view =
    (Array.isArray(searchParams.view) ? searchParams.view[0] : searchParams.view) ===
    "table"
      ? "table"
      : "cards";

  // Counts are derived from the live dataset, never hardcoded.
  const deadlineStates = items.map((item) =>
    getDeadlineInfo(item.submissionDeadlineDate),
  );
  const openCount = deadlineStates.filter((info) =>
    ["open", "soon", "urgent", "today"].includes(info.status),
  ).length;
  const closingSoon = deadlineStates.filter((info) =>
    ["soon", "urgent", "today"].includes(info.status),
  ).length;

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      const single = Array.isArray(value) ? value[0] : value;
      if (single) params.set(key, single);
    }
    if (page > 1) params.set("page", String(page));
    else params.delete("page");

    const query = params.toString();
    return query ? `/conferences?${query}` : "/conferences";
  };

  // Only offer a chip when the underlying value exists in the data.
  const chips = [
    { param: "deadline", value: "open", label: "Open for submissions" },
    ...facets.modes
      .filter((mode) => mode.value !== "Unspecified" && mode.count > 0)
      .slice(0, 3)
      .map((mode) => ({
        param: "mode",
        value: mode.value,
        label: mode.value,
      })),
    ...facets.countries.slice(0, 2).map((country) => ({
      param: "country",
      value: country.value,
      label: country.value,
    })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 border-b border-[var(--rule)] pb-6">
        <p className="eyebrow">Calls for papers</p>
        <h1 className="mt-2 font-serif text-4xl font-normal">Conferences</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
          Calls for papers with the nearest submission deadlines first. Filter by
          country, participation mode, topic or year, then open a listing for the
          full set of dates.
        </p>
      </header>

      <DataSourceNotice status={status} />

      <ListingStats
        stats={[
          { label: "Conferences listed", value: items.length },
          {
            label: "Open for submissions",
            value: openCount,
            hint: "Deadline still ahead",
          },
          {
            label: "Closing within 30 days",
            value: closingSoon,
            hint: closingSoon > 0 ? "Worth checking first" : undefined,
          },
          { label: "Countries", value: facets.countries.length },
        ]}
      />

      <div className="mb-5">
        {/* useSearchParams needs a Suspense boundary during prerender. */}
        <Suspense fallback={<div className="h-12 rounded cf-skeleton" />}>
          <SearchBar placeholder="Search conferences, topics, organisers or places" />
        </Suspense>
      </div>

      <Suspense fallback={<div className="mb-5 h-9 rounded cf-skeleton" />}>
        <QuickChips chips={chips} label="Common filters" />
      </Suspense>

      <Suspense fallback={<div className="mb-6 h-28 rounded cf-skeleton" />}>
        <ConferenceFilterPanel facets={facets} />
      </Suspense>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Suspense fallback={null}>
          <ViewToggle />
        </Suspense>
        <Suspense fallback={null}>
          <SortSelect options={sortOptions} />
        </Suspense>
      </div>

      <Suspense fallback={<CardGridSkeleton />}>
        {view === "table" ? (
          results.total === 0 ? (
            <EmptyState
              title="No conferences match these filters"
              description="Try removing a filter, or search a broader term such as a research area rather than a full conference name."
              action={
                <ButtonLink href="/conferences" variant="secondary" size="sm">
                  Clear filters
                </ButtonLink>
              }
            />
          ) : (
            <>
              <p className="mb-4 text-sm text-[var(--ink-muted)]">
                Showing{" "}
                <span className="tnum text-[var(--ink)]">
                  {results.items.length}
                </span>{" "}
                of <span className="tnum text-[var(--ink)]">{results.total}</span>{" "}
                conferences
              </p>
              <ConferenceTable conferences={results.items} />
              <Pagination
                page={results.page}
                totalPages={results.totalPages}
                buildHref={buildHref}
              />
            </>
          )
        ) : (
          <ConferenceResultsGrid results={results} buildHref={buildHref} />
        )}
      </Suspense>
    </div>
  );
}
