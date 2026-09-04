import type { Metadata } from "next";
import { Suspense } from "react";

import DataSourceNotice from "@/components/DataSourceNotice";
import SortSelect from "@/components/SortSelect";
import { CardGridSkeleton } from "@/components/LoadingState";
import {
  ConferenceResultsGrid,
  JournalResultsGrid,
} from "@/components/SearchResults";
import SearchBar from "@/components/search/SearchBar";
import TypeSwitch from "@/components/search/TypeSwitch";
import {
  ConferenceFilterPanel,
  JournalFilterPanel,
} from "@/components/search/FilterPanel";
import { getConferences, getJournals } from "@/lib/data";
import {
  buildConferenceFacets,
  buildJournalFacets,
  parseConferenceParams,
  parseJournalParams,
  searchConferences,
  searchJournals,
} from "@/lib/search";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search conferences and journals together by keyword, then narrow by topic, deadline, location, publisher, indexing or impact factor.",
  alternates: { canonical: "/search" },
};

const conferenceSorts = [
  { value: "deadline", label: "Deadline" },
  { value: "name", label: "Name" },
  { value: "date", label: "Conference date" },
];

const journalSorts = [
  { value: "name", label: "Name" },
  { value: "impact", label: "Impact factor" },
  { value: "publisher", label: "Publisher" },
];

export default async function SearchPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;

  const rawType = Array.isArray(searchParams.type)
    ? searchParams.type[0]
    : searchParams.type;
  const type = rawType === "journal" ? "journal" : "conference";

  const buildHref = (page: number) => {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      const single = Array.isArray(value) ? value[0] : value;
      if (single) params.set(key, single);
    }
    params.set("type", type);
    if (page > 1) params.set("page", String(page));
    else params.delete("page");
    return `/search?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-6">
        <h1 className="text-3xl">Search</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
          Search one list at a time. Every filter is stored in the address bar,
          so you can bookmark a search or send it to someone.
        </p>
      </header>

      <div className="mb-5">
        <Suspense fallback={<div className="h-9 w-56 rounded cf-skeleton" />}>
          <TypeSwitch type={type} />
        </Suspense>
      </div>

      <div className="mb-6">
        <Suspense fallback={<div className="h-12 rounded cf-skeleton" />}>
          <SearchBar
            placeholder={
              type === "conference"
                ? "Search conferences, topics, organisers or places"
                : "Search journals, ISSN, publisher or subject"
            }
          />
        </Suspense>
      </div>

      {type === "conference" ? (
        <ConferenceSearch searchParams={searchParams} buildHref={buildHref} />
      ) : (
        <JournalSearch searchParams={searchParams} buildHref={buildHref} />
      )}
    </div>
  );
}

async function ConferenceSearch({
  searchParams,
  buildHref,
}: {
  searchParams: Record<string, string | string[] | undefined>;
  buildHref: (page: number) => string;
}) {
  const filters = parseConferenceParams(searchParams);
  const { items, status } = await getConferences();
  const results = searchConferences(items, filters);

  return (
    <>
      <DataSourceNotice status={status} />

      <Suspense fallback={<div className="mb-6 h-28 rounded cf-skeleton" />}>
        <ConferenceFilterPanel facets={buildConferenceFacets(items)} />
      </Suspense>

      <div className="mb-5 flex justify-end">
        <Suspense fallback={null}>
          <SortSelect options={conferenceSorts} />
        </Suspense>
      </div>

      <Suspense fallback={<CardGridSkeleton />}>
        <ConferenceResultsGrid
          results={results}
          buildHref={buildHref}
          clearHref="/search?type=conference"
        />
      </Suspense>
    </>
  );
}

async function JournalSearch({
  searchParams,
  buildHref,
}: {
  searchParams: Record<string, string | string[] | undefined>;
  buildHref: (page: number) => string;
}) {
  const filters = parseJournalParams(searchParams);
  const { items, status } = await getJournals();
  const results = searchJournals(items, filters);

  return (
    <>
      <DataSourceNotice status={status} />

      <Suspense fallback={<div className="mb-6 h-28 rounded cf-skeleton" />}>
        <JournalFilterPanel facets={buildJournalFacets(items)} />
      </Suspense>

      <div className="mb-5 flex justify-end">
        <Suspense fallback={null}>
          <SortSelect options={journalSorts} />
        </Suspense>
      </div>

      <Suspense fallback={<CardGridSkeleton />}>
        <JournalResultsGrid
          results={results}
          buildHref={buildHref}
          clearHref="/search?type=journal"
        />
      </Suspense>
    </>
  );
}
