/**
 * Structured profile entries — LinkedIn-style education, experience and
 * publications.
 *
 * Stored as a JSON array in the existing `profiles` text columns, so no
 * schema migration is needed. Older profiles saved one entry per line of free
 * text; `parseEntries` still reads those, turning each line into an entry
 * with only a title, and the next save rewrites the column as JSON.
 *
 * Everything here is pure and runs on both server (validation before the
 * upsert) and client (the editor), so the same rules apply in both places.
 */

export type EntryKind = "education" | "experience" | "publications";

/** "YYYY" or "YYYY-MM"; empty string when unknown. */
export type YearMonth = string;

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  start: YearMonth;
  end: YearMonth;
  description: string;
}

export interface ExperienceEntry {
  id: string;
  title: string;
  organization: string;
  location: string;
  start: YearMonth;
  end: YearMonth;
  current: boolean;
  description: string;
}

export interface PublicationEntry {
  id: string;
  title: string;
  venue: string;
  authors: string;
  date: YearMonth;
  url: string;
  description: string;
}

export interface EntryMap {
  education: EducationEntry;
  experience: ExperienceEntry;
  publications: PublicationEntry;
}

export const MAX_ENTRIES = 25;
const SHORT = 200;
const LONG = 1500;

export const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

const YEAR_MONTH = /^(\d{4})(?:-(0[1-9]|1[0-2]))?$/;

export function newEntryId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function text(value: unknown, limit: number): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

export function cleanYearMonth(value: unknown): YearMonth {
  const raw = text(value, 7);
  const match = YEAR_MONTH.exec(raw);
  if (!match) return "";
  const year = Number(match[1]);
  return year >= 1900 && year <= 2100 ? raw : "";
}

/** Only http(s) links survive; bare domains get https:// added. */
export function cleanLink(value: unknown): string {
  const raw = text(value, SHORT);
  if (!raw) return "";
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function cleanId(value: unknown): string {
  return typeof value === "string" && /^[a-z0-9]{1,16}$/.test(value) ? value : newEntryId();
}

type Sanitiser<K extends EntryKind> = (raw: Record<string, unknown>) => EntryMap[K] | null;

const sanitisers: { [K in EntryKind]: Sanitiser<K> } = {
  education: (raw) => {
    const entry: EducationEntry = {
      id: cleanId(raw.id),
      school: text(raw.school, SHORT),
      degree: text(raw.degree, SHORT),
      field: text(raw.field, SHORT),
      start: cleanYearMonth(raw.start),
      end: cleanYearMonth(raw.end),
      description: text(raw.description, LONG),
    };
    return entry.school ? entry : null;
  },
  experience: (raw) => {
    const current = raw.current === true;
    const entry: ExperienceEntry = {
      id: cleanId(raw.id),
      title: text(raw.title, SHORT),
      organization: text(raw.organization, SHORT),
      location: text(raw.location, SHORT),
      start: cleanYearMonth(raw.start),
      end: current ? "" : cleanYearMonth(raw.end),
      current,
      description: text(raw.description, LONG),
    };
    return entry.title ? entry : null;
  },
  publications: (raw) => {
    const entry: PublicationEntry = {
      id: cleanId(raw.id),
      title: text(raw.title, SHORT * 2),
      venue: text(raw.venue, SHORT),
      authors: text(raw.authors, SHORT * 2),
      date: cleanYearMonth(raw.date),
      url: cleanLink(raw.url),
      description: text(raw.description, LONG),
    };
    return entry.title ? entry : null;
  },
};

/** The field that holds an entry's headline, used for legacy text lines. */
const titleField: Record<EntryKind, string> = {
  education: "school",
  experience: "title",
  publications: "title",
};

/**
 * Parse a stored column value. Accepts the JSON array this module writes,
 * or legacy newline-separated free text. Invalid items are dropped.
 */
export function parseEntries<K extends EntryKind>(
  kind: K,
  stored: string | null | undefined,
): EntryMap[K][] {
  const value = (stored ?? "").trim();
  if (!value) return [];

  let items: unknown[] | null = null;
  if (value.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) items = parsed;
    } catch {
      // Not JSON after all: fall through to the legacy text reading.
    }
  }

  const raws: Record<string, unknown>[] = items
    ? items.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item),
      )
    : value
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => ({ [titleField[kind]]: line }));

  const sanitise = sanitisers[kind] as Sanitiser<K>;
  return raws
    .slice(0, MAX_ENTRIES)
    .map((raw) => sanitise(raw))
    .filter((entry): entry is EntryMap[K] => entry !== null);
}

/** Serialise for storage; null when there is nothing to keep. */
export function serializeEntries<K extends EntryKind>(
  kind: K,
  entries: unknown,
): string | null {
  const list = Array.isArray(entries) ? entries : [];
  const clean = parseEntries(kind, JSON.stringify(list));
  return clean.length ? JSON.stringify(clean) : null;
}

/** Sort key: ongoing entries first, then by most recent end/start date. */
function recency(entry: EntryMap[EntryKind]): string {
  if ("current" in entry && entry.current) return "9999-99";
  if ("date" in entry) return entry.date || "0000";
  return entry.end || entry.start || "0000";
}

/** Newest first, like a CV. Stable for entries with equal dates. */
export function sortEntries<T extends EntryMap[EntryKind]>(entries: T[]): T[] {
  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const byDate = recency(b.entry).localeCompare(recency(a.entry));
      return byDate || a.index - b.index;
    })
    .map(({ entry }) => entry);
}

export function formatYearMonth(value: YearMonth): string {
  const match = YEAR_MONTH.exec(value);
  if (!match) return "";
  return match[2] ? `${MONTHS[Number(match[2]) - 1]} ${match[1]}` : match[1];
}

/** Whole months between two YearMonths; null when either lacks a month. */
function monthsBetween(start: YearMonth, end: YearMonth): number | null {
  const a = YEAR_MONTH.exec(start);
  const b = YEAR_MONTH.exec(end);
  if (!a?.[2] || !b?.[2]) return null;
  return (Number(b[1]) - Number(a[1])) * 12 + (Number(b[2]) - Number(a[2])) + 1;
}

function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const parts = [];
  if (years) parts.push(`${years} yr${years > 1 ? "s" : ""}`);
  if (rest) parts.push(`${rest} mo${rest > 1 ? "s" : ""}`);
  return parts.join(" ");
}

export interface EntrySummary {
  /** Headline: school, role or paper title. */
  primary: string;
  /** Second line: degree and field, organisation, or venue. */
  secondary: string;
  /** Dates line, already formatted. */
  dates: string;
  /** Extra muted line: location or authors. */
  detail: string;
  url: string;
  description: string;
}

/** One display shape for all three kinds, shared by editor and public page. */
export function summarizeEntry<K extends EntryKind>(
  kind: K,
  entry: EntryMap[K],
  today?: Date,
): EntrySummary {
  if (kind === "education") {
    const e = entry as EducationEntry;
    return {
      primary: e.school,
      secondary: [e.degree, e.field].filter(Boolean).join(", "),
      dates: formatDateRange(e.start, e.end, false, today),
      detail: "",
      url: "",
      description: e.description,
    };
  }

  if (kind === "experience") {
    const e = entry as ExperienceEntry;
    return {
      primary: e.title,
      secondary: e.organization,
      dates: formatDateRange(e.start, e.end, e.current, today),
      detail: e.location,
      url: "",
      description: e.description,
    };
  }

  const e = entry as PublicationEntry;
  return {
    primary: e.title,
    secondary: e.venue,
    dates: formatYearMonth(e.date),
    detail: e.authors,
    url: e.url,
    description: e.description,
  };
}

/**
 * "Jan 2022 – Present · 2 yrs 3 mos", "2018 – 2022", "Sep 2024".
 * `today` is injectable for tests.
 */
export function formatDateRange(
  start: YearMonth,
  end: YearMonth,
  current = false,
  today: Date = new Date(),
): string {
  const from = formatYearMonth(start);
  const to = current ? "Present" : formatYearMonth(end);

  if (!from && !to) return "";
  if (!from) return to;
  if (!to) return from;

  const endValue = current
    ? `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`
    : end;
  const months = monthsBetween(start, endValue);
  const duration = months && months > 0 ? ` · ${formatDuration(months)}` : "";

  return `${from} – ${to}${duration}`;
}
