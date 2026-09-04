import type { Conference } from "./conference";
import type { Journal } from "./journal";

export type SearchType = "conference" | "journal";

export const CONFERENCE_SORTS = [
  "deadline",
  "name",
  "date",
  "recent",
] as const;

export const JOURNAL_SORTS = [
  "name",
  "impact",
  "publisher",
] as const;

export type ConferenceSort = (typeof CONFERENCE_SORTS)[number];
export type JournalSort = (typeof JOURNAL_SORTS)[number];

export interface ConferenceFilters {
  q: string;
  country: string;
  city: string;
  mode: string;
  topic: string;
  organizer: string;
  year: string;
  /** "open" hides passed deadlines, "passed" shows only those, "" shows all. */
  deadline: string;
  verifiedOnly: boolean;
  sort: ConferenceSort;
  page: number;
  perPage: number;
}

export interface JournalFilters {
  q: string;
  publisher: string;
  subject: string;
  indexing: string;
  access: string;
  quartile: string;
  /** Minimum impact factor, as a string so an empty value is representable. */
  minImpact: string;
  verifiedOnly: boolean;
  sort: JournalSort;
  page: number;
  perPage: number;
}

export interface FacetOption {
  value: string;
  count: number;
}

export interface ConferenceFacets {
  countries: FacetOption[];
  cities: FacetOption[];
  modes: FacetOption[];
  topics: FacetOption[];
  organizers: FacetOption[];
  years: FacetOption[];
}

export interface JournalFacets {
  publishers: FacetOption[];
  subjects: FacetOption[];
  indexing: FacetOption[];
  access: FacetOption[];
  quartiles: FacetOption[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export type ConferenceResults = Paginated<Conference>;
export type JournalResults = Paginated<Journal>;
