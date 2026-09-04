import "server-only";

import type { DataSourceStatus } from "@/types/api";
import { rowsFromValues, type SheetRow } from "./rows";

/**
 * Google Sheets access. Three adapters, tried in priority order:
 *
 *   1. Service account (googleapis) — works with private sheets, reads every
 *      tab, returns typed values. Preferred for production.
 *   2. Apps Script web app URL — the integration this project started with.
 *      Kept so existing deployments keep working without reconfiguration.
 *   3. None configured — the caller falls back to local sample data in
 *      development, and surfaces an error in production.
 *
 * Everything in this file is server-only. Credentials are read from
 * `process.env` at call time and never returned to the caller.
 */

export type SheetKind = "conferences" | "journals";

export interface SheetFetchResult {
  rows: SheetRow[];
  source: DataSourceStatus["source"];
}

/**
 * Network calls get a hard ceiling so a hanging sheet cannot hang a render.
 *
 * Apps Script endpoints cold-start slowly and redirect through
 * googleusercontent.com, so the first request of the day can be slow. Raise
 * SHEETS_FETCH_TIMEOUT_MS if you see "timed out" on an otherwise valid URL.
 */
function fetchTimeoutMs(): number {
  const configured = Number(process.env.SHEETS_FETCH_TIMEOUT_MS);
  return Number.isFinite(configured) && configured > 0 ? configured : 20_000;
}

function tabNameFor(kind: SheetKind): string {
  if (kind === "conferences") {
    return process.env.GOOGLE_SHEETS_CONFERENCES_TAB || "Sheet1";
  }
  return process.env.GOOGLE_SHEETS_JOURNALS_TAB || "Sheet2";
}

export function hasServiceAccountConfig(): boolean {
  return Boolean(
    process.env.GOOGLE_SHEETS_ID &&
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_PRIVATE_KEY,
  );
}

export function hasApiUrlConfig(): boolean {
  return Boolean(process.env.GOOGLE_SHEETS_API_URL);
}

export function isSheetsConfigured(): boolean {
  return hasServiceAccountConfig() || hasApiUrlConfig();
}

/**
 * Private keys are stored in env vars with literal "\n" sequences because most
 * hosts (Vercel included) cannot hold real newlines in a variable value.
 */
function normalisePrivateKey(key: string): string {
  const trimmed = key.trim().replace(/^["']|["']$/g, "");
  return trimmed.replace(/\\n/g, "\n");
}

async function readViaServiceAccount(kind: SheetKind): Promise<SheetRow[]> {
  // Imported lazily so the (large) googleapis bundle is only loaded when the
  // service-account adapter is actually configured.
  const { google } = await import("googleapis");

  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: normalisePrivateKey(process.env.GOOGLE_PRIVATE_KEY ?? ""),
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    range: tabNameFor(kind),
    // UNFORMATTED_VALUE keeps dates as Excel serial numbers, which parse
    // far more reliably than locale-formatted display strings.
    valueRenderOption: "UNFORMATTED_VALUE",
    dateTimeRenderOption: "SERIAL_NUMBER",
  });

  return rowsFromValues((response.data.values ?? []) as unknown[][]);
}

async function readViaApiUrl(kind: SheetKind): Promise<SheetRow[]> {
  const base = process.env.GOOGLE_SHEETS_API_URL as string;

  const url = new URL(base);
  // The Apps Script endpoint selects a tab from the query string. Older
  // deployments ignore it and return conferences, which is the safe default.
  url.searchParams.set("sheet", kind);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), fetchTimeoutMs());

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      // Apps Script /exec responds with a 302 to googleusercontent.com, so
      // redirects must be followed for that adapter to work at all.
      redirect: "follow",
      headers: { accept: "application/json" },
      // Caching is handled one layer up by `unstable_cache`.
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Sheets endpoint responded with ${response.status}`);
    }

    const payload: unknown = await response.json();
    return rowsFromApiPayload(payload, kind);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Accept the shapes an Apps Script endpoint realistically returns:
 *   { success, conferences: [...] } | { journals: [...] } | { data: [...] }
 *   | { values: [[...]] } | [...]
 */
export function rowsFromApiPayload(
  payload: unknown,
  kind: SheetKind,
): SheetRow[] {
  if (Array.isArray(payload)) {
    return normaliseRecordArray(payload);
  }

  if (!payload || typeof payload !== "object") {
    throw new Error("Sheets endpoint returned an unexpected payload");
  }

  const record = payload as Record<string, unknown>;

  if (record.success === false) {
    throw new Error("Sheets endpoint reported a failure");
  }

  const keyed =
    (kind === "conferences" ? record.conferences : record.journals) ??
    record.rows ??
    record.data ??
    record.items;

  if (Array.isArray(keyed)) {
    return normaliseRecordArray(keyed);
  }

  if (Array.isArray(record.values)) {
    return rowsFromValues(record.values as unknown[][]);
  }

  // The endpoint is reachable but has no data for this tab.
  return [];
}

function normaliseRecordArray(items: unknown[]): SheetRow[] {
  return items
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(item) && typeof item === "object" && !Array.isArray(item),
    )
    .map((item) => {
      const row: SheetRow = {};
      for (const [key, value] of Object.entries(item)) {
        if (value === null || value === undefined) {
          row[key] = "";
        } else if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          row[key] = value;
        } else {
          row[key] = String(value);
        }
      }
      return row;
    })
    .filter((row) =>
      Object.values(row).some((value) => String(value ?? "").trim()),
    );
}

/**
 * Fetch one tab using whichever adapter is configured.
 * Throws when nothing is configured, or when the configured adapter fails —
 * the data layer above decides whether to fall back or surface the error.
 */
export async function fetchSheetRows(
  kind: SheetKind,
): Promise<SheetFetchResult> {
  if (hasServiceAccountConfig()) {
    return {
      rows: await readViaServiceAccount(kind),
      source: "google-service-account",
    };
  }

  if (hasApiUrlConfig()) {
    return { rows: await readViaApiUrl(kind), source: "google-sheets-api" };
  }

  throw new Error("NO_SHEETS_CONFIG");
}
