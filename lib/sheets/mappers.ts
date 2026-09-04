import type { Conference, ConferenceMode } from "@/types/conference";
import type { Journal, JournalAccess } from "@/types/journal";
import {
  cleanMultiline,
  cleanString,
  parseBoolean,
  parseIndexing,
  parseIssnPair,
  parseList,
  parseNumber,
  parsePlace,
  parseQuartile,
} from "@/lib/parse";
import { extractYear, parseSheetDate } from "@/lib/dates";
import { extractUrls, slugify, uniqueSlug } from "@/lib/utils";
import { cell, type SheetRow } from "./rows";

/**
 * Row -> domain mapping.
 *
 * Header aliases below cover the live sheet ("CONFERENCE NAME") plus the
 * tidier names a future sheet might use ("name"), so renaming a column in
 * Google Sheets does not break the site.
 */

/** Derive "INDICON 2026" from a long conference title. */
function deriveAcronym(name: string): string {
  const parenthesised = name.match(/\(([^)]{2,20})\)/);
  if (parenthesised) return parenthesised[1].trim();

  const leading = name.match(/^([A-Z][A-Za-z]*[A-Z][A-Za-z0-9-]*(?:\s+\d{4})?)/);
  if (leading) return leading[1].trim();

  const beforeDash = name.split(/\s+[–—-]\s+/)[0];
  if (beforeDash && beforeDash.length <= 24) return beforeDash.trim();

  return "";
}

/** Collapse the many free-text mode spellings into four filterable values. */
export function normaliseMode(value: string): ConferenceMode {
  const text = value.toLowerCase();
  if (!text.trim()) return "Unspecified";

  const mentionsOnline = /online|virtual|remote/.test(text);
  const mentionsPhysical = /in[-\s]?person|physical|offline|on[-\s]?site|venue/.test(
    text,
  );

  if (/hybrid/.test(text)) return "Hybrid";
  if (mentionsOnline && mentionsPhysical) {
    // "Physical venue; online mode not specified" is in-person only.
    return /not specified|no online|tbd/.test(text) ? "In-person" : "Hybrid";
  }
  if (mentionsOnline) return "Online";
  if (mentionsPhysical) return "In-person";

  return "Unspecified";
}

/** Collapse open-access prose into four filterable values. */
export function normaliseAccess(value: string): JournalAccess {
  const text = value.toLowerCase();
  if (!text.trim()) return "Unspecified";

  if (/hybrid/.test(text)) return "Hybrid";
  if (/fully open|gold open|^open access/.test(text)) return "Open Access";
  if (/subscription/.test(text) && /open access/.test(text)) return "Hybrid";
  if (/open access/.test(text)) return "Open Access";
  if (/subscription|closed|paywall/.test(text)) return "Subscription";

  return "Unspecified";
}

export function mapConferenceRow(
  row: SheetRow,
  takenIds: Set<string>,
): Conference | null {
  const name = cleanString(cell(row, "CONFERENCE NAME", "name", "conference"));

  // A row without a name cannot be linked to or displayed; skip it.
  if (!name) return null;

  const linkCell = cleanString(cell(row, "CONFERENCE LINK", "website", "link"));
  const links = extractUrls(linkCell);

  const submissionDeadlineRaw = cell(
    row,
    "Last Date - Paper Submission",
    "submission_deadline",
    "deadline",
  );
  const conferenceDateRaw = cell(
    row,
    "CONFERENCE DATE",
    "conference_date",
    "dates",
  );

  const submissionDeadline = cleanString(submissionDeadlineRaw);
  const conferenceDate = cleanString(conferenceDateRaw);

  const { place, city, country } = parsePlace(
    cell(row, "CONFERENCE PLACE", "location", "place", "venue"),
  );

  const modeRaw = cleanString(cell(row, "MODE", "mode", "participation"));
  const topics = parseList(cell(row, "CONFERENCE TOPICS", "topics", "areas"));

  const explicitId = cleanString(cell(row, "id"));
  const id = uniqueSlug(explicitId || slugify(name), takenIds);

  return {
    id,
    name,
    acronym:
      cleanString(cell(row, "acronym", "short_name")) || deriveAcronym(name),
    organizer: cleanString(cell(row, "organizer", "ORGANIZER", "organiser")),
    description: cleanMultiline(cell(row, "description", "DESCRIPTION")),

    link: links[0] ?? "",
    links,

    submissionDeadline,
    submissionDeadlineDate: parseSheetDate(submissionDeadlineRaw),

    conferenceDate,
    conferenceStartDate: parseSheetDate(conferenceDateRaw),

    notificationDate: cleanString(
      cell(row, "notification_date", "NOTIFICATION DATE"),
    ),
    registrationDeadline: cleanString(
      cell(row, "registration_deadline", "REGISTRATION DEADLINE"),
    ),

    paperSize: cleanString(cell(row, "PAPER SIZE", "paper_size")),
    paperFormat: cleanString(cell(row, "PAPER FORMAT", "paper_format")),

    topics,
    field: cleanString(cell(row, "field", "FIELD")) || topics[0] || "",

    mode: modeRaw,
    modeKind: normaliseMode(modeRaw),

    place,
    city: cleanString(cell(row, "city", "CITY")) || city,
    country: cleanString(cell(row, "country", "COUNTRY")) || country,

    fees: cleanString(cell(row, "CONFERENCE FEES", "fees", "registration_fee")),
    indexing: cleanString(cell(row, "indexing", "INDEXING")),
    ranking: cleanString(cell(row, "ranking", "RANKING")),
    status: cleanString(cell(row, "status", "STATUS")),

    year: extractYear(conferenceDate, submissionDeadline, name),

    featured: parseBoolean(cell(row, "featured", "FEATURED")),
    verified: parseBoolean(cell(row, "verified", "VERIFIED")),
    lastUpdated: parseSheetDate(cell(row, "last_updated", "LAST UPDATED")),
  };
}

export function mapJournalRow(
  row: SheetRow,
  takenIds: Set<string>,
): Journal | null {
  const name = cleanString(cell(row, "JOURNAL NAME", "name", "journal"));
  if (!name) return null;

  const linkCell = cleanString(
    cell(row, "JOURNAL LINK", "JOURNAL WEBSITE", "website", "link"),
  );
  const links = extractUrls(linkCell);

  const { issn, eissn } = parseIssnPair(cell(row, "ISSN", "issn"));
  const explicitEissn = cleanString(cell(row, "eISSN", "e_issn", "eissn"));

  const subjects = parseList(
    cell(row, "RESEARCH AREAS", "subjects", "research_areas"),
  );

  const openAccessRaw = cleanString(cell(row, "OPEN ACCESS", "open_access"));
  const impactFactorText = cleanString(
    cell(row, "IMPACT FACTOR", "impact_factor"),
  );

  const explicitId = cleanString(cell(row, "id"));
  const id = uniqueSlug(explicitId || slugify(name), takenIds);

  return {
    id,
    name,
    abbreviation: cleanString(cell(row, "abbreviation", "ABBREVIATION")),
    publisher: cleanString(cell(row, "PUBLISHER", "publisher")),
    description: cleanMultiline(
      cell(row, "JOURNAL SCOPE", "description", "scope"),
    ),

    link: links[0] ?? "",
    links,

    issn,
    eissn: explicitEissn || eissn,

    field: cleanString(cell(row, "field", "FIELD")) || subjects[0] || "",
    subjects,

    frequency: cleanString(
      cell(row, "PUBLICATION FREQUENCY", "frequency", "publication_frequency"),
    ),

    openAccess: openAccessRaw,
    accessKind: normaliseAccess(openAccessRaw),

    apc: cleanString(cell(row, "APC / PUBLICATION FEE", "APC", "apc")),
    fees: cleanString(cell(row, "JOURNAL FEES", "fees")),
    paperSize: cleanString(cell(row, "PAPER SIZE", "paper_size")),
    volume: cleanString(cell(row, "JOURNAL VOLUME", "volume")),

    indexing: parseIndexing(cell(row, "INDEXING", "indexing")),

    impactFactor: parseNumber(impactFactorText),
    impactFactorText,

    citeScore: parseNumber(cell(row, "CITE SCORE", "cite_score", "citescore")),
    quartile:
      parseQuartile(cell(row, "QUARTILE", "quartile")) ||
      parseQuartile(cell(row, "INDEXING", "indexing")),

    submissionType: cleanString(
      cell(row, "SUBMISSION TYPE", "submission_type"),
    ),

    featured: parseBoolean(cell(row, "featured", "FEATURED")),
    verified: parseBoolean(cell(row, "verified", "VERIFIED")),
    lastUpdated: parseSheetDate(cell(row, "last_updated", "LAST UPDATED")),
  };
}

/**
 * Map a whole sheet, skipping rows that cannot be mapped instead of throwing.
 * One malformed row must never take down the page.
 */
export function mapRows<T>(
  rows: SheetRow[],
  mapper: (row: SheetRow, taken: Set<string>) => T | null,
): T[] {
  const taken = new Set<string>();
  const results: T[] = [];

  for (const row of rows) {
    try {
      const mapped = mapper(row, taken);
      if (mapped) results.push(mapped);
    } catch {
      // Skip this row; the rest of the dataset is still usable.
    }
  }

  return results;
}
