/**
 * Domain model for a journal record, mapping the "Journals" sheet.
 * As with conferences, every optional field is normalised rather than absent.
 */
export interface Journal {
  id: string;

  name: string;
  abbreviation: string;
  publisher: string;
  description: string;

  link: string;
  links: string[];

  issn: string;
  eissn: string;

  /** Primary research field, derived from the first listed research area. */
  field: string;
  subjects: string[];

  frequency: string;

  /** Raw open-access text from the sheet. */
  openAccess: string;
  /** Normalised access model used by filters and badges. */
  accessKind: JournalAccess;

  apc: string;
  fees: string;
  paperSize: string;
  volume: string;

  indexing: string[];

  /** Numeric impact factor when one could be parsed, else null. */
  impactFactor: number | null;
  /** Full impact factor text as written in the sheet, including the year. */
  impactFactorText: string;

  citeScore: number | null;
  quartile: string;

  submissionType: string;

  featured: boolean;
  verified: boolean;
  lastUpdated: string | null;
}

export const JOURNAL_ACCESS_KINDS = [
  "Open Access",
  "Hybrid",
  "Subscription",
  "Unspecified",
] as const;

export type JournalAccess = (typeof JOURNAL_ACCESS_KINDS)[number];
