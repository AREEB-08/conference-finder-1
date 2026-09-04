import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge conditional class names, letting later Tailwind classes win. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Turn arbitrary text into a URL-safe slug. Returns "" for empty input. */
export function slugify(value: string): string {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Ensure slugs are unique across a dataset. Duplicates get a numeric suffix so
 * two conferences with the same name still get distinct detail-page URLs.
 */
export function uniqueSlug(base: string, taken: Set<string>): string {
  const seed = base || "record";
  if (!taken.has(seed)) {
    taken.add(seed);
    return seed;
  }

  let counter = 2;
  while (taken.has(`${seed}-${counter}`)) counter += 1;

  const next = `${seed}-${counter}`;
  taken.add(next);
  return next;
}

/** Truncate on a word boundary, appending an ellipsis when text was cut. */
export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > max * 0.6 ? lastSpace : max).trimEnd()}…`;
}

/** Initials for avatar placeholders, e.g. "Computer Vision" -> "CV". */
export function initials(value: string): string {
  const words = String(value ?? "")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

/** Clamp a number into a range; NaN falls back to `min`. */
export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Only allow http(s) links out of the app. Anything else (javascript:, data:,
 * a bare "#", a title pasted into the link column) yields "" so the UI can hide
 * the button rather than render an unsafe or broken href.
 */
export function safeExternalUrl(value: string): string {
  const raw = String(value ?? "").trim();
  if (!raw || raw === "#") return "";

  const candidate = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    if (!url.hostname.includes(".")) return "";
    return url.toString();
  } catch {
    return "";
  }
}

/** Extract every http(s) URL from a cell that may contain several. */
export function extractUrls(value: string): string[] {
  const text = String(value ?? "");
  const matches = text.match(/https?:\/\/[^\s,;|]+/gi) ?? [];

  const cleaned = matches
    .map((match) => match.replace(/[.,;)\]]+$/, ""))
    .map(safeExternalUrl)
    .filter(Boolean);

  if (cleaned.length === 0) {
    const single = safeExternalUrl(text);
    return single ? [single] : [];
  }

  return Array.from(new Set(cleaned));
}

/** Display host for a URL, e.g. "ieee.org". Empty when the URL is invalid. */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}
