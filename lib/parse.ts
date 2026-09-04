/**
 * Small, total normalisation helpers for spreadsheet cells.
 *
 * Every function here accepts `unknown` and always returns a usable value.
 * A malformed cell degrades to an empty string, an empty list, or null — it
 * never throws, so a single bad row cannot take down a page.
 */

/** Trim, collapse runs of whitespace, and normalise nullish input to "". */
export function cleanString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }
  if (typeof value === "boolean") return value ? "true" : "false";

  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Like cleanString but keeps paragraph breaks, for long description fields. */
export function cleanMultiline(value: unknown): string {
  if (value === null || value === undefined) return "";

  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+/g, " ")
    // Trim spaces around newlines without swallowing the newlines themselves,
    // so blank lines survive as paragraph breaks.
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Split a list cell. The sheet mostly uses semicolons, but commas, pipes and
 * newlines all appear, so all four are accepted as separators.
 */
export function parseList(value: unknown, separators = /[;|\n]/): string[] {
  const text = cleanString(value);
  if (!text) return [];

  const parts = text
    .split(separators)
    .flatMap((part) =>
      // Only fall back to comma-splitting when no other separator was found.
      part.includes(";") ? [part] : part.split(/,(?![^(]*\))/),
    )
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== "-" && part !== "N/A");

  return Array.from(new Set(parts));
}

const TRUTHY = new Set(["true", "yes", "y", "1", "✓", "x", "verified"]);
const FALSY = new Set(["false", "no", "n", "0", "", "-"]);

/** Parse a spreadsheet boolean. Unrecognised text yields `fallback`. */
export function parseBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;

  const text = cleanString(value).toLowerCase();
  if (TRUTHY.has(text)) return true;
  if (FALSY.has(text)) return false;
  return fallback;
}

/**
 * Pull the first number out of a cell that may be prose.
 * "20.4 — 2025 Journal Impact Factor" -> 20.4
 */
export function parseNumber(value: unknown): number | null {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const text = cleanString(value);
  if (!text) return null;

  const match = text.match(/-?\d+(?:[.,]\d+)?/);
  if (!match) return null;

  const parsed = Number(match[0].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

const ISSN_PATTERN = /\b(\d{4})\s*-\s*(\d{3}[\dxX])\b/g;

/**
 * Split an ISSN cell into print and electronic ISSNs. The sheet writes these
 * as a single string, e.g. "0031-3203 (E-ISSN: 1873-5142)".
 */
export function parseIssnPair(value: unknown): {
  issn: string;
  eissn: string;
} {
  const text = cleanString(value);
  if (!text) return { issn: "", eissn: "" };

  const found = Array.from(text.matchAll(ISSN_PATTERN)).map(
    (match) => `${match[1]}-${match[2].toUpperCase()}`,
  );

  if (found.length === 0) return { issn: "", eissn: "" };

  // When the text labels one as electronic, respect that ordering.
  const electronicFirst = /^\s*(e-?issn|online|electronic)/i.test(text);

  if (found.length === 1) {
    return electronicFirst
      ? { issn: "", eissn: found[0] }
      : { issn: found[0], eissn: "" };
  }

  return { issn: found[0], eissn: found[1] };
}

/** Normalise a Scopus/WoS quartile mention into "Q1".."Q4", or "". */
export function parseQuartile(value: unknown): string {
  const text = cleanString(value).toUpperCase();
  const match = text.match(/\bQ([1-4])\b/);
  return match ? `Q${match[1]}` : "";
}

const INDEX_NAMES: Array<[RegExp, string]> = [
  [/\bscie\b|science citation index/i, "SCIE"],
  [/\bssci\b/i, "SSCI"],
  [/\besci\b/i, "ESCI"],
  [/web of science/i, "Web of Science"],
  [/\bscopus\b/i, "Scopus"],
  [/\bpubmed\b|medline/i, "PubMed"],
  [/\bdoaj\b/i, "DOAJ"],
  [/ieee xplore/i, "IEEE Xplore"],
  [/springer ?link/i, "SpringerLink"],
  [/science ?direct/i, "ScienceDirect"],
  [/\bacm\b/i, "ACM DL"],
  [/\bdblp\b/i, "DBLP"],
  [/google scholar/i, "Google Scholar"],
  [/\bei compendex\b|\bei\b/i, "EI Compendex"],
  [/\binspec\b/i, "INSPEC"],
];

/**
 * Recognise the indexing databases named in a free-text cell. Only known names
 * are returned, so prose around them ("widely indexed in...") is dropped rather
 * than surfaced as a bogus filter value.
 */
export function parseIndexing(value: unknown): string[] {
  const text = cleanString(value);
  if (!text) return [];

  const found = INDEX_NAMES.filter(([pattern]) => pattern.test(text)).map(
    ([, name]) => name,
  );

  if (found.length > 0) return Array.from(new Set(found));

  // Nothing recognised: fall back to the raw list so data is not lost.
  return parseList(text).filter((item) => item.length <= 40);
}

/**
 * Split a location such as "COEP Technological University, Pune,
 * Maharashtra, India" into a display city and country.
 */
export function parsePlace(value: unknown): {
  place: string;
  city: string;
  country: string;
} {
  const place = cleanString(value);
  if (!place) return { place: "", city: "", country: "" };

  const parts = place
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length === 0) return { place, city: "", country: "" };
  if (parts.length === 1) return { place, city: parts[0], country: "" };

  const country = parts[parts.length - 1];

  // Layouts seen in the sheet:
  //   [City, Country]                          -> city is second from last
  //   [Venue, City, Country]                   -> city is second from last
  //   [Venue, City, State, Country]            -> skip the state
  //   [Venue, Area, City, State, Country]      -> skip the state
  const city =
    parts.length >= 4 ? parts[parts.length - 3] : parts[parts.length - 2];

  return { place, city, country };
}
