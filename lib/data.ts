import "server-only";
import { unstable_cache } from "next/cache";

import type { Conference } from "@/types/conference";
import type { Journal } from "@/types/journal";
import type { DataSourceStatus } from "@/types/api";
import { fetchSheetRows, isSheetsConfigured } from "@/lib/sheets/client";
import { mapConferenceRow, mapJournalRow, mapRows } from "@/lib/sheets/mappers";
import { sampleConferenceRows } from "@/data/sample-conferences";
import { sampleJournalRows } from "@/data/sample-journals";

/**
 * The cached data layer.
 *
 * Update path: edit the spreadsheet -> the cache entry expires after
 * `REVALIDATE_SECONDS` -> the next request re-reads the sheet -> new data
 * renders. This is not push-based, so changes appear within the revalidation
 * window (10 minutes by default), not instantly. `POST /api/revalidate` forces
 * it immediately.
 */

export const CACHE_TAG = "sheets-data";

export const REVALIDATE_SECONDS = (() => {
  const configured = Number(process.env.SHEETS_REVALIDATE_SECONDS);
  return Number.isFinite(configured) && configured >= 0 ? configured : 600;
})();

export interface DataResult<T> {
  items: T[];
  status: DataSourceStatus;
}

const isProduction = process.env.NODE_ENV === "production";

const NOT_CONFIGURED_MESSAGE =
  "Google Sheets is not configured, so these are bundled sample records.";

let warnedUnconfigured = false;

/**
 * Missing configuration is a setup mistake, not a runtime failure, so it does
 * not break the build or the page. It is still loud: a one-time build/server
 * log, plus a banner on every page via `DataSourceNotice`. Nothing is hidden.
 */
function warnUnconfigured(): void {
  if (warnedUnconfigured) return;
  warnedUnconfigured = true;

  console.warn(
    `[conference-finder] ${NOT_CONFIGURED_MESSAGE} ` +
      "Set GOOGLE_SHEETS_API_URL, or GOOGLE_SHEETS_ID with service account " +
      "credentials, to publish your own listings. See .env.example.",
  );
}

/**
 * Fetch and map one tab. On failure, fall back to the bundled snapshot in
 * development, but let the error propagate in production so a broken
 * spreadsheet connection is visible rather than silently masked.
 */
export async function loadConferences(): Promise<DataResult<Conference>> {
  const fetchedAt = new Date().toISOString();

  if (!isSheetsConfigured()) {
    warnUnconfigured();

    return {
      items: mapRows(sampleConferenceRows, mapConferenceRow),
      status: {
        source: "sample-data",
        isFallback: true,
        fetchedAt,
        warning: NOT_CONFIGURED_MESSAGE,
      },
    };
  }

  try {
    const { rows, source } = await fetchSheetRows("conferences");
    return {
      items: mapRows(rows, mapConferenceRow),
      status: { source, isFallback: false, fetchedAt },
    };
  } catch (error) {
    if (isProduction) throw error;

    return {
      items: mapRows(sampleConferenceRows, mapConferenceRow),
      status: {
        source: "sample-data",
        isFallback: true,
        fetchedAt,
        warning: `Could not reach Google Sheets (${describeError(error)}); showing bundled sample data.`,
      },
    };
  }
}

export async function loadJournals(): Promise<DataResult<Journal>> {
  const fetchedAt = new Date().toISOString();

  if (!isSheetsConfigured()) {
    warnUnconfigured();

    return {
      items: mapRows(sampleJournalRows, mapJournalRow),
      status: {
        source: "sample-data",
        isFallback: true,
        fetchedAt,
        warning: NOT_CONFIGURED_MESSAGE,
      },
    };
  }

  try {
    const { rows, source } = await fetchSheetRows("journals");
    return {
      items: mapRows(rows, mapJournalRow),
      status: { source, isFallback: false, fetchedAt },
    };
  } catch (error) {
    if (isProduction) throw error;

    return {
      items: mapRows(sampleJournalRows, mapJournalRow),
      status: {
        source: "sample-data",
        isFallback: true,
        fetchedAt,
        warning: `Could not reach Google Sheets (${describeError(error)}); showing bundled sample data.`,
      },
    };
  }
}

/** Never leak credentials or stack traces into a user-visible message. */
function describeError(error: unknown): string {
  if (error instanceof Error && error.name === "AbortError") return "timed out";
  if (error instanceof Error && error.message === "NO_SHEETS_CONFIG") {
    return "not configured";
  }
  return "request failed";
}

export const getConferences = unstable_cache(
  loadConferences,
  ["conferences-v1"],
  { tags: [CACHE_TAG], revalidate: REVALIDATE_SECONDS },
);

export const getJournals = unstable_cache(loadJournals, ["journals-v1"], {
  tags: [CACHE_TAG],
  revalidate: REVALIDATE_SECONDS,
});

export async function getConferenceById(
  id: string,
): Promise<Conference | null> {
  if (!id || typeof id !== "string") return null;
  const { items } = await getConferences();
  return items.find((item) => item.id === id) ?? null;
}

export async function getJournalById(id: string): Promise<Journal | null> {
  if (!id || typeof id !== "string") return null;
  const { items } = await getJournals();
  return items.find((item) => item.id === id) ?? null;
}
