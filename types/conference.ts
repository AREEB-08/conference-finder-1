/**
 * Domain model for a conference record.
 *
 * Every field maps to a column in the "Conferences" sheet. Because the sheet is
 * hand-maintained, almost everything is optional at the source; the parser
 * normalises missing values to `""`, `[]` or `null` so the UI never has to
 * guard against `undefined`.
 */
export interface Conference {
  /** Stable slug derived from the conference name. Used in URLs. */
  id: string;

  name: string;
  /** Short form such as "INDICON 2026", derived from the name when absent. */
  acronym: string;
  organizer: string;
  description: string;

  /** First valid http(s) URL found in the link column. Empty when none. */
  link: string;
  /** Every valid URL found in the link column (sheets often hold several). */
  links: string[];

  /** Raw human text from the sheet, e.g. "December 18-20, 2026". */
  submissionDeadline: string;
  /** ISO `YYYY-MM-DD`, or null when the text could not be parsed. */
  submissionDeadlineDate: string | null;

  conferenceDate: string;
  conferenceStartDate: string | null;

  notificationDate: string;
  registrationDeadline: string;

  paperSize: string;
  paperFormat: string;

  topics: string[];
  field: string;

  /** Raw mode text from the sheet. */
  mode: string;
  /** Normalised participation mode used by filters and badges. */
  modeKind: ConferenceMode;

  place: string;
  city: string;
  country: string;

  fees: string;
  indexing: string;
  ranking: string;
  status: string;

  /** Four digit year inferred from dates or the name. */
  year: number | null;

  featured: boolean;
  verified: boolean;
  lastUpdated: string | null;
}

export const CONFERENCE_MODES = [
  "In-person",
  "Online",
  "Hybrid",
  "Unspecified",
] as const;

export type ConferenceMode = (typeof CONFERENCE_MODES)[number];

/** Deadline urgency, computed at render time from the parsed deadline date. */
export type DeadlineStatus =
  | "unknown"
  | "passed"
  | "today"
  | "urgent"
  | "soon"
  | "open";

export interface DeadlineInfo {
  status: DeadlineStatus;
  /** Whole days remaining. Negative once the deadline has passed. */
  daysLeft: number | null;
  /** Short human label, e.g. "12 days left" or "Deadline passed". */
  label: string;
  /** ISO date the label was computed from, when one is known. */
  isoDate: string | null;
}
