import type { Conference } from "@/types/conference";
import type { Journal } from "@/types/journal";
import type {
  ConferenceFacets,
  ConferenceFilters,
  ConferenceSort,
  FacetOption,
  JournalFacets,
  JournalFilters,
  JournalSort,
  Paginated,
} from "@/types/search";
import { CONFERENCE_SORTS, JOURNAL_SORTS } from "@/types/search";
import { getDeadlineInfo, todayIso } from "@/lib/dates";
import { clamp } from "@/lib/utils";

/**
 * Filtering, sorting, faceting and pagination.
 *
 * These are pure functions over already-fetched arrays: no fetching, no React,
 * no request context. That keeps them unit-testable and lets the same code run
 * in a route handler and in a server component.
 */

export const DEFAULT_PER_PAGE = 12;
const MAX_PER_PAGE = 60;
const MAX_QUERY_LENGTH = 120;

function normalise(value: string): string {
  return value.toLowerCase().trim();
}

/** Split a query into terms; every term must match somewhere (AND semantics). */
function queryTerms(query: string): string[] {
  return normalise(query.slice(0, MAX_QUERY_LENGTH))
    .split(/\s+/)
    .filter(Boolean);
}

function matchesAllTerms(haystack: string, terms: string[]): boolean {
  if (terms.length === 0) return true;
  const text = haystack.toLowerCase();
  return terms.every((term) => text.includes(term));
}

/** Every field a conference keyword search looks at. */
export function conferenceSearchText(conference: Conference): string {
  return [
    conference.name,
    conference.acronym,
    conference.organizer,
    conference.description,
    conference.topics.join(" "),
    conference.field,
    conference.place,
    conference.city,
    conference.country,
    conference.mode,
    conference.modeKind,
    conference.indexing,
    conference.status,
    conference.submissionDeadline,
    conference.conferenceDate,
    conference.year ? String(conference.year) : "",
  ].join(" ");
}

/** Every field a journal keyword search looks at. */
export function journalSearchText(journal: Journal): string {
  return [
    journal.name,
    journal.abbreviation,
    journal.publisher,
    journal.description,
    journal.issn,
    journal.eissn,
    journal.field,
    journal.subjects.join(" "),
    journal.indexing.join(" "),
    journal.quartile,
    journal.openAccess,
    journal.accessKind,
    journal.submissionType,
    journal.impactFactorText,
  ].join(" ");
}

export const defaultConferenceFilters: ConferenceFilters = {
  q: "",
  country: "",
  city: "",
  mode: "",
  topic: "",
  organizer: "",
  year: "",
  deadline: "",
  verifiedOnly: false,
  sort: "deadline",
  page: 1,
  perPage: DEFAULT_PER_PAGE,
};

export const defaultJournalFilters: JournalFilters = {
  q: "",
  publisher: "",
  subject: "",
  indexing: "",
  access: "",
  quartile: "",
  minImpact: "",
  verifiedOnly: false,
  sort: "name",
  page: 1,
  perPage: DEFAULT_PER_PAGE,
};

/**
 * Build filters from URL search params. Unknown values fall back to defaults
 * rather than erroring, so a hand-edited or stale share link still renders.
 */
export function parseConferenceParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): ConferenceFilters {
  const get = paramReader(params);
  const sort = get("sort") as ConferenceSort;

  return {
    q: get("q").slice(0, MAX_QUERY_LENGTH),
    country: get("country"),
    city: get("city"),
    mode: get("mode"),
    topic: get("topic"),
    organizer: get("organizer"),
    year: get("year").replace(/\D/g, "").slice(0, 4),
    deadline: ["open", "passed"].includes(get("deadline")) ? get("deadline") : "",
    verifiedOnly: get("verified") === "1" || get("verified") === "true",
    sort: CONFERENCE_SORTS.includes(sort) ? sort : "deadline",
    page: parsePage(get("page")),
    perPage: parsePerPage(get("perPage")),
  };
}

export function parseJournalParams(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): JournalFilters {
  const get = paramReader(params);
  const sort = get("sort") as JournalSort;

  return {
    q: get("q").slice(0, MAX_QUERY_LENGTH),
    publisher: get("publisher"),
    subject: get("subject"),
    indexing: get("indexing"),
    access: get("access"),
    quartile: get("quartile"),
    minImpact: get("minImpact").replace(/[^\d.]/g, "").slice(0, 6),
    verifiedOnly: get("verified") === "1" || get("verified") === "true",
    sort: JOURNAL_SORTS.includes(sort) ? sort : "name",
    page: parsePage(get("page")),
    perPage: parsePerPage(get("perPage")),
  };
}

function paramReader(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): (key: string) => string {
  if (params instanceof URLSearchParams) {
    return (key) => (params.get(key) ?? "").trim();
  }

  return (key) => {
    const value = params[key];
    if (Array.isArray(value)) return (value[0] ?? "").trim();
    return (value ?? "").trim();
  };
}

function parsePage(value: string): number {
  const page = Number.parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? Math.min(page, 10_000) : 1;
}

function parsePerPage(value: string): number {
  const perPage = Number.parseInt(value, 10);
  if (!Number.isFinite(perPage) || perPage <= 0) return DEFAULT_PER_PAGE;
  return clamp(perPage, 1, MAX_PER_PAGE);
}

export function filterConferences(
  conferences: Conference[],
  filters: ConferenceFilters,
  now: Date = new Date(),
): Conference[] {
  const terms = queryTerms(filters.q);
  const today = todayIso(now);

  return conferences.filter((conference) => {
    if (!matchesAllTerms(conferenceSearchText(conference), terms)) return false;

    if (filters.country && normalise(conference.country) !== normalise(filters.country)) {
      return false;
    }

    if (filters.city && normalise(conference.city) !== normalise(filters.city)) {
      return false;
    }

    if (filters.mode && conference.modeKind !== filters.mode) return false;

    if (
      filters.topic &&
      !conference.topics.some((topic) => normalise(topic) === normalise(filters.topic))
    ) {
      return false;
    }

    if (
      filters.organizer &&
      normalise(conference.organizer) !== normalise(filters.organizer)
    ) {
      return false;
    }

    if (filters.year && String(conference.year ?? "") !== filters.year) {
      return false;
    }

    if (filters.verifiedOnly && !conference.verified) return false;

    if (filters.deadline) {
      const iso = conference.submissionDeadlineDate;
      // Records with no parseable deadline are excluded from both sides of the
      // filter rather than guessed into one of them.
      if (!iso) return false;
      const isOpen = iso >= today;
      if (filters.deadline === "open" && !isOpen) return false;
      if (filters.deadline === "passed" && isOpen) return false;
    }

    return true;
  });
}

export function sortConferences(
  conferences: Conference[],
  sort: ConferenceSort,
  now: Date = new Date(),
): Conference[] {
  const items = [...conferences];
  const today = todayIso(now);

  switch (sort) {
    case "name":
      return items.sort((a, b) => a.name.localeCompare(b.name));

    case "date":
      return items.sort((a, b) =>
        compareNullableIso(a.conferenceStartDate, b.conferenceStartDate),
      );

    case "recent":
      return items.sort((a, b) => {
        const byUpdate = compareNullableIso(b.lastUpdated, a.lastUpdated);
        return byUpdate !== 0 ? byUpdate : a.name.localeCompare(b.name);
      });

    case "deadline":
    default:
      // Soonest still-open deadline first, then passed deadlines, then
      // records with no deadline at all.
      return items.sort((a, b) => {
        const rankA = deadlineRank(a.submissionDeadlineDate, today);
        const rankB = deadlineRank(b.submissionDeadlineDate, today);
        if (rankA.bucket !== rankB.bucket) return rankA.bucket - rankB.bucket;
        if (rankA.key !== rankB.key) return rankA.key < rankB.key ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  }
}

function deadlineRank(iso: string | null, today: string) {
  if (!iso) return { bucket: 2, key: "" };
  if (iso >= today) return { bucket: 0, key: iso };
  // Passed deadlines: most recently passed first.
  return { bucket: 1, key: invertIso(iso) };
}

function invertIso(iso: string): string {
  return String(99999999 - Number(iso.replace(/-/g, ""))).padStart(8, "0");
}

function compareNullableIso(a: string | null, b: string | null): number {
  if (a && b) return a < b ? -1 : a > b ? 1 : 0;
  if (a) return -1;
  if (b) return 1;
  return 0;
}

export function filterJournals(
  journals: Journal[],
  filters: JournalFilters,
): Journal[] {
  const terms = queryTerms(filters.q);
  const minImpact = filters.minImpact ? Number(filters.minImpact) : null;

  return journals.filter((journal) => {
    if (!matchesAllTerms(journalSearchText(journal), terms)) return false;

    if (
      filters.publisher &&
      normalise(journal.publisher) !== normalise(filters.publisher)
    ) {
      return false;
    }

    if (
      filters.subject &&
      !journal.subjects.some(
        (subject) => normalise(subject) === normalise(filters.subject),
      )
    ) {
      return false;
    }

    if (
      filters.indexing &&
      !journal.indexing.some(
        (index) => normalise(index) === normalise(filters.indexing),
      )
    ) {
      return false;
    }

    if (filters.access && journal.accessKind !== filters.access) return false;

    if (filters.quartile && journal.quartile !== filters.quartile) return false;

    if (filters.verifiedOnly && !journal.verified) return false;

    if (minImpact !== null && Number.isFinite(minImpact)) {
      // Journals with no recorded impact factor cannot satisfy a minimum.
      if (journal.impactFactor === null) return false;
      if (journal.impactFactor < minImpact) return false;
    }

    return true;
  });
}

export function sortJournals(journals: Journal[], sort: JournalSort): Journal[] {
  const items = [...journals];

  switch (sort) {
    case "impact":
      return items.sort((a, b) => {
        const impactA = a.impactFactor ?? -1;
        const impactB = b.impactFactor ?? -1;
        if (impactA !== impactB) return impactB - impactA;
        return a.name.localeCompare(b.name);
      });

    case "publisher":
      return items.sort((a, b) => {
        const byPublisher = a.publisher.localeCompare(b.publisher);
        return byPublisher !== 0 ? byPublisher : a.name.localeCompare(b.name);
      });

    case "name":
    default:
      return items.sort((a, b) => a.name.localeCompare(b.name));
  }
}

/** Slice a result set, clamping the page into range so it is never empty by accident. */
export function paginate<T>(items: T[], page: number, perPage: number): Paginated<T> {
  const size = clamp(perPage, 1, MAX_PER_PAGE);
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = clamp(page, 1, totalPages);
  const start = (current - 1) * size;

  return {
    items: items.slice(start, start + size),
    total: items.length,
    page: current,
    perPage: size,
    totalPages,
  };
}

export function searchConferences(
  conferences: Conference[],
  filters: ConferenceFilters,
  now: Date = new Date(),
): Paginated<Conference> {
  const filtered = filterConferences(conferences, filters, now);
  const sorted = sortConferences(filtered, filters.sort, now);
  return paginate(sorted, filters.page, filters.perPage);
}

export function searchJournals(
  journals: Journal[],
  filters: JournalFilters,
): Paginated<Journal> {
  const filtered = filterJournals(journals, filters);
  const sorted = sortJournals(filtered, filters.sort);
  return paginate(sorted, filters.page, filters.perPage);
}

/** Count occurrences and return them sorted by frequency, then alphabetically. */
function tally(values: string[], limit = 60): FacetOption[] {
  const counts = new Map<string, number>();

  for (const raw of values) {
    const value = raw.trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, limit);
}

/** Facets are derived from the data, so filters only ever offer real options. */
export function buildConferenceFacets(
  conferences: Conference[],
): ConferenceFacets {
  return {
    countries: tally(conferences.map((item) => item.country)),
    cities: tally(conferences.map((item) => item.city)),
    modes: tally(conferences.map((item) => item.modeKind)),
    topics: tally(conferences.flatMap((item) => item.topics), 80),
    organizers: tally(conferences.map((item) => item.organizer)),
    years: tally(
      conferences.map((item) => (item.year ? String(item.year) : "")),
    ).sort((a, b) => a.value.localeCompare(b.value)),
  };
}

export function buildJournalFacets(journals: Journal[]): JournalFacets {
  return {
    publishers: tally(journals.map((item) => item.publisher)),
    subjects: tally(journals.flatMap((item) => item.subjects), 80),
    indexing: tally(journals.flatMap((item) => item.indexing)),
    access: tally(journals.map((item) => item.accessKind)),
    quartiles: tally(journals.map((item) => item.quartile)).sort((a, b) =>
      a.value.localeCompare(b.value),
    ),
  };
}

/** Conferences whose deadline is still open, soonest first. Used on the home page. */
export function upcomingConferences(
  conferences: Conference[],
  limit: number,
  now: Date = new Date(),
): Conference[] {
  const open = conferences.filter((conference) => {
    const info = getDeadlineInfo(conference.submissionDeadlineDate, now);
    return info.status !== "passed" && info.status !== "unknown";
  });

  const ranked = sortConferences(open, "deadline", now);

  // Prefer explicitly featured records, keeping deadline order within groups.
  const featured = ranked.filter((item) => item.featured);
  const rest = ranked.filter((item) => !item.featured);

  const combined = [...featured, ...rest];

  // If nothing has an open deadline, still show something rather than nothing.
  if (combined.length === 0) {
    return sortConferences(conferences, "deadline", now).slice(0, limit);
  }

  return combined.slice(0, limit);
}

/** Featured journals, falling back to the highest impact factor on record. */
export function featuredJournals(journals: Journal[], limit: number): Journal[] {
  const featured = journals.filter((item) => item.featured);
  const rest = sortJournals(
    journals.filter((item) => !item.featured),
    "impact",
  );

  return [...sortJournals(featured, "impact"), ...rest].slice(0, limit);
}
