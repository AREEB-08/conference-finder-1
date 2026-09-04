"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import FilterSelect from "./FilterSelect";
import { useQueryState } from "./useQueryState";
import type { ConferenceFacets, JournalFacets } from "@/types/search";
import { CONFERENCE_MODES } from "@/types/conference";
import { JOURNAL_ACCESS_KINDS } from "@/types/journal";

/**
 * The filter rail. Collapsed behind a button on small screens so results stay
 * the focus on a phone, always visible from `md` up.
 */
function PanelShell({
  activeCount,
  onClear,
  children,
}: {
  activeCount: number;
  onClear: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <section aria-label="Filters" className="mb-6">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="filter-fields"
          className="inline-flex h-9 items-center gap-2 rounded border border-[var(--rule-strong)] bg-[var(--surface)] px-3 text-sm"
        >
          <SlidersHorizontal size={15} aria-hidden="true" />
          Filters
          {activeCount > 0 ? (
            <span className="tnum rounded bg-[var(--accent)] px-1.5 text-xs text-[var(--accent-ink)]">
              {activeCount}
            </span>
          ) : null}
        </button>

        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 rounded text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            <X size={14} aria-hidden="true" />
            Clear
          </button>
        ) : null}
      </div>

      <div
        id="filter-fields"
        className={`${open ? "mt-3 block" : "hidden"} md:mt-0 md:block`}
      >
        <div className="rounded border border-[var(--rule)] bg-[var(--surface)] p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {children}
          </div>

          {activeCount > 0 ? (
            <div className="mt-4 hidden justify-end border-t border-[var(--rule)] pt-3 md:flex">
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 rounded text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                <X size={14} aria-hidden="true" />
                Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const CONFERENCE_KEYS = [
  "country",
  "city",
  "mode",
  "topic",
  "organizer",
  "year",
  "deadline",
  "verified",
];

export function ConferenceFilterPanel({ facets }: { facets: ConferenceFacets }) {
  const { get, setParams } = useQueryState();

  const activeCount = CONFERENCE_KEYS.filter((key) => get(key)).length;

  const clear = () =>
    setParams(Object.fromEntries(CONFERENCE_KEYS.map((key) => [key, ""])));

  return (
    <PanelShell activeCount={activeCount} onClear={clear}>
      <FilterSelect param="country" label="Country" options={facets.countries} allLabel="All countries" />
      <FilterSelect param="city" label="City" options={facets.cities} allLabel="All cities" />
      <FilterSelect
        param="mode"
        label="Participation"
        showCounts={false}
        allLabel="Any mode"
        options={CONFERENCE_MODES.filter((mode) => mode !== "Unspecified").map(
          (mode) => ({
            value: mode,
            count: facets.modes.find((facet) => facet.value === mode)?.count ?? 0,
          }),
        ).filter((option) => option.count > 0)}
      />
      <FilterSelect param="topic" label="Topic" options={facets.topics} allLabel="All topics" />
      <FilterSelect param="organizer" label="Organiser" options={facets.organizers} allLabel="All organisers" />
      <FilterSelect param="year" label="Year" options={facets.years} allLabel="All years" />
      <FilterSelect
        param="deadline"
        label="Deadline"
        showCounts={false}
        allLabel="Any deadline"
        options={[
          { value: "open", count: 0 },
          { value: "passed", count: 0 },
        ]}
        labels={{ open: "Still open", passed: "Already passed" }}
      />
      <FilterSelect
        param="verified"
        label="Record status"
        showCounts={false}
        allLabel="All records"
        options={[{ value: "1", count: 0 }]}
        labels={{ "1": "Checked only" }}
      />
    </PanelShell>
  );
}

const JOURNAL_KEYS = [
  "publisher",
  "subject",
  "indexing",
  "access",
  "quartile",
  "minImpact",
  "verified",
];

export function JournalFilterPanel({ facets }: { facets: JournalFacets }) {
  const { get, setParams } = useQueryState();

  const activeCount = JOURNAL_KEYS.filter((key) => get(key)).length;

  const clear = () =>
    setParams(Object.fromEntries(JOURNAL_KEYS.map((key) => [key, ""])));

  return (
    <PanelShell activeCount={activeCount} onClear={clear}>
      <FilterSelect param="publisher" label="Publisher" options={facets.publishers} allLabel="All publishers" />
      <FilterSelect param="subject" label="Subject" options={facets.subjects} allLabel="All subjects" />
      <FilterSelect param="indexing" label="Indexed in" options={facets.indexing} allLabel="Any index" />
      <FilterSelect
        param="access"
        label="Access"
        showCounts={false}
        allLabel="Any access model"
        options={JOURNAL_ACCESS_KINDS.filter((kind) => kind !== "Unspecified")
          .map((kind) => ({
            value: kind,
            count: facets.access.find((facet) => facet.value === kind)?.count ?? 0,
          }))
          .filter((option) => option.count > 0)}
      />
      <FilterSelect param="quartile" label="Quartile" options={facets.quartiles} allLabel="Any quartile" />
      <FilterSelect
        param="minImpact"
        label="Minimum impact factor"
        showCounts={false}
        allLabel="Any impact factor"
        options={[
          { value: "1", count: 0 },
          { value: "3", count: 0 },
          { value: "5", count: 0 },
          { value: "10", count: 0 },
        ]}
      />
    </PanelShell>
  );
}
