import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rowsFromApiPayload } from "@/lib/sheets/client";

/**
 * The data layer decides between live Sheets data and the bundled snapshot.
 * These tests pin that decision down, including that no configuration is
 * required for the app to render.
 */

const SHEET_ENV_KEYS = [
  "GOOGLE_SHEETS_API_URL",
  "GOOGLE_SHEETS_ID",
  "GOOGLE_SERVICE_ACCOUNT_EMAIL",
  "GOOGLE_PRIVATE_KEY",
];

const originalEnv: Record<string, string | undefined> = {};

beforeEach(() => {
  vi.resetModules();
  for (const key of SHEET_ENV_KEYS) {
    originalEnv[key] = process.env[key];
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of SHEET_ENV_KEYS) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
  vi.unstubAllGlobals();
  vi.resetModules();
});

describe("adapter selection", () => {
  it("reports nothing configured by default", async () => {
    const { isSheetsConfigured, hasApiUrlConfig, hasServiceAccountConfig } =
      await import("@/lib/sheets/client");

    expect(isSheetsConfigured()).toBe(false);
    expect(hasApiUrlConfig()).toBe(false);
    expect(hasServiceAccountConfig()).toBe(false);
  });

  it("detects the Apps Script URL adapter", async () => {
    process.env.GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/x/exec";
    const { isSheetsConfigured, hasApiUrlConfig } = await import(
      "@/lib/sheets/client"
    );

    expect(hasApiUrlConfig()).toBe(true);
    expect(isSheetsConfigured()).toBe(true);
  });

  it("requires all three service account values", async () => {
    process.env.GOOGLE_SHEETS_ID = "sheet-id";
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "a@b.iam.gserviceaccount.com";

    const partial = await import("@/lib/sheets/client");
    expect(partial.hasServiceAccountConfig()).toBe(false);

    vi.resetModules();
    process.env.GOOGLE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\\nx\\n";
    const complete = await import("@/lib/sheets/client");
    expect(complete.hasServiceAccountConfig()).toBe(true);
  });
});

describe("rowsFromApiPayload", () => {
  it("reads the shape the existing Apps Script endpoint returns", () => {
    const rows = rowsFromApiPayload(
      {
        success: true,
        count: 1,
        conferences: [{ "CONFERENCE NAME": "INDICON", MODE: "Hybrid" }],
      },
      "conferences",
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]["CONFERENCE NAME"]).toBe("INDICON");
  });

  it("selects the tab that was asked for", () => {
    const payload = {
      conferences: [{ "CONFERENCE NAME": "A" }],
      journals: [{ "JOURNAL NAME": "B" }, { "JOURNAL NAME": "C" }],
    };

    expect(rowsFromApiPayload(payload, "conferences")).toHaveLength(1);
    expect(rowsFromApiPayload(payload, "journals")).toHaveLength(2);
  });

  it("accepts a bare array and a raw values grid", () => {
    expect(rowsFromApiPayload([{ name: "A" }], "conferences")).toHaveLength(1);
    expect(
      rowsFromApiPayload({ values: [["NAME"], ["A"], ["B"]] }, "conferences"),
    ).toHaveLength(2);
  });

  it("throws when the endpoint reports a failure", () => {
    expect(() => rowsFromApiPayload({ success: false }, "conferences")).toThrow();
    expect(() => rowsFromApiPayload("nonsense", "conferences")).toThrow();
  });

  it("returns an empty list when a tab has no rows", () => {
    expect(rowsFromApiPayload({ success: true }, "journals")).toEqual([]);
  });
});

describe("data layer fallback", () => {
  it("serves sample data when nothing is configured", async () => {
    const { getConferences, getJournals } = await import("@/lib/data");

    const conferences = await getConferences();
    const journals = await getJournals();

    expect(conferences.status.isFallback).toBe(true);
    expect(conferences.status.source).toBe("sample-data");
    expect(conferences.items.length).toBeGreaterThan(0);
    expect(journals.items.length).toBeGreaterThan(0);
  });

  it("falls back rather than throwing when a configured fetch fails", async () => {
    process.env.GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/x/exec";
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    const { getConferences } = await import("@/lib/data");
    const result = await getConferences();

    expect(result.status.isFallback).toBe(true);
    // The user-facing warning must not repeat the raw error text.
    expect(result.status.warning).not.toContain("network down");
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("uses live rows when the endpoint responds", async () => {
    process.env.GOOGLE_SHEETS_API_URL = "https://script.google.com/macros/s/x/exec";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            success: true,
            conferences: [
              {
                "CONFERENCE NAME": "Live Conference",
                "Last Date - Paper Submission": 46265,
                MODE: "Hybrid",
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      ),
    );

    const { getConferences } = await import("@/lib/data");
    const result = await getConferences();

    expect(result.status.isFallback).toBe(false);
    expect(result.status.source).toBe("google-sheets-api");
    expect(result.items[0].name).toBe("Live Conference");
    expect(result.items[0].submissionDeadlineDate).toBe("2026-08-31");
  });

  it("looks records up by id and returns null for unknown ids", async () => {
    const { getConferences, getConferenceById } = await import("@/lib/data");
    const { items } = await getConferences();

    expect(await getConferenceById(items[0].id)).not.toBeNull();
    expect(await getConferenceById("no-such-conference")).toBeNull();
    expect(await getConferenceById("")).toBeNull();
  });
});
