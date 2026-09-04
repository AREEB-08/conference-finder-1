import type { Metadata } from "next";
import { Suspense } from "react";

import DataSourceNotice from "@/components/DataSourceNotice";
import ListingStats from "@/components/ListingStats";
import SortSelect from "@/components/SortSelect";
import { CardGridSkeleton } from "@/components/LoadingState";
import { JournalResultsGrid } from "@/components/SearchResults";
import SearchBar from "@/components/search/SearchBar";
import QuickChips from "@/components/search/QuickChips";
import { JournalFilterPanel } from "@/components/search/FilterPanel";
import { getJournals } from "@/lib/data";
import {
  buildJournalFacets,
  parseJournalParams,
  searchJournals,
} from "@/lib/search";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Journals",
  description:
    "Browse academic journals with publisher, ISSN, indexing, quartile, impact factor, open access status and article processing charges.",
  alternates: { canonical: "/journals" },
};

const sortOptions = [
  { value: "name", label: "Name" },
  { value: "impact", label: "Impact factor" },
  { value: "publisher", label: "Publisher" },
];

export default async function JournalsPage(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const searchParams = await props.searchParams;
  const filters = parseJournalParams(searchParams);

  const { items, status } = await getJournals();
  const facets = buildJournalFacets(items);
  const results = searchJournals(items, filters);

  const withImpact = items.filter((item) => item.impactFactor !== null);
  const openAccessCount = items.filter(
    (item) => item.accessKind === "Open Access" || item.accessKind === "Hybrid",
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
    return query ? `/journals?${query}` : "/journals";
  };

  // Chips are built from facets, so each one is guaranteed to return results.
  const chips = [
    ...facets.indexing.slice(0, 3).map((index) => ({
      param: "indexing",
      value: index.value,
      label: `Indexed in ${index.value}`,
    })),
    ...facets.access
      .filter((access) => access.value === "Open Access" && access.count > 0)
      .map((access) => ({
        param: "access",
        value: access.value,
        label: access.value,
      })),
    ...facets.quartiles
      .filter((quartile) => quartile.value === "Q1")
      .map((quartile) => ({
        param: "quartile",
        value: quartile.value,
        label: "Q1 only",
      })),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8 border-b border-[var(--rule)] pb-6">
        <h1 className="text-3xl">Journals</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
          Journals with their publisher, indexing, access model and reported
          impact. Fields the spreadsheet does not record are left out rather than
          guessed at.
        </p>
      </header>

      <DataSourceNotice status={status} />

      <ListingStats
        stats={[
          { label: "Journals listed", value: items.length },
          {
            label: "Open or hybrid access",
            value: openAccessCount,
            hint: "Author-pays options exist",
          },
          {
            label: "With an impact factor",
            value: withImpact.length,
            hint: "As recorded in the sheet",
          },
          { label: "Publishers", value: facets.publishers.length },
        ]}
      />

      <div className="mb-5">
        <Suspense fallback={<div className="h-12 rounded cf-skeleton" />}>
          <SearchBar placeholder="Search journals, ISSN, publisher or subject" />
        </Suspense>
      </div>

      <Suspense fallback={<div className="mb-5 h-9 rounded cf-skeleton" />}>
        <QuickChips chips={chips} label="Common filters" />
      </Suspense>

      <Suspense fallback={<div className="mb-6 h-28 rounded cf-skeleton" />}>
        <JournalFilterPanel facets={facets} />
      </Suspense>

      <div className="mb-5 flex justify-end">
        <Suspense fallback={null}>
          <SortSelect options={sortOptions} />
        </Suspense>
      </div>

      <Suspense fallback={<CardGridSkeleton />}>
        <JournalResultsGrid results={results} buildHref={buildHref} />
      </Suspense>
    </div>
  );
}
