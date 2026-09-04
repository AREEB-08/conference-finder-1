import { describe, expect, it } from "vitest";

import {
  mapConferenceRow,
  mapJournalRow,
  mapRows,
  normaliseAccess,
  normaliseMode,
} from "@/lib/sheets/mappers";
import { cell, rowsFromValues } from "@/lib/sheets/rows";
import { sampleConferenceRows } from "@/data/sample-conferences";
import { sampleJournalRows } from "@/data/sample-journals";

describe("cell", () => {
  it("matches headers despite trailing spaces and casing", () => {
    // The live sheet really does have "CONFERENCE NAME " with a trailing space.
    const row = { "CONFERENCE NAME ": "INDICON", "conference_link": "x" };
    expect(cell(row, "CONFERENCE NAME")).toBe("INDICON");
    expect(cell(row, "conference link", "CONFERENCE LINK")).toBe("x");
  });

  it("tries aliases in order and returns '' when nothing matches", () => {
    const row = { name: "Fallback" };
    expect(cell(row, "CONFERENCE NAME", "name")).toBe("Fallback");
    expect(cell(row, "missing")).toBe("");
  });
});

describe("rowsFromValues", () => {
  it("keys rows by header and drops fully blank rows", () => {
    const rows = rowsFromValues([
      ["NAME", "MODE"],
      ["A", "Hybrid"],
      ["", ""],
      ["B", "Online"],
    ]);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ NAME: "A", MODE: "Hybrid" });
  });

  it("returns nothing when there is no data row", () => {
    expect(rowsFromValues([["NAME"]])).toEqual([]);
    expect(rowsFromValues([])).toEqual([]);
  });
});

describe("normaliseMode", () => {
  it("collapses the spellings found in the sheet", () => {
    expect(normaliseMode("In-person + Online/Virtual")).toBe("Hybrid");
    expect(normaliseMode("Hybrid")).toBe("Hybrid");
    expect(normaliseMode("IN PERSON")).toBe("In-person");
    expect(normaliseMode("Physical venue; online mode not specified")).toBe(
      "In-person",
    );
    expect(normaliseMode("Fully virtual")).toBe("Online");
    expect(normaliseMode("")).toBe("Unspecified");
  });
});

describe("normaliseAccess", () => {
  it("collapses open access prose", () => {
    expect(
      normaliseAccess(
        "Hybrid Open Access — authors can publish through the traditional subscription route or choose Open Access.",
      ),
    ).toBe("Hybrid");
    expect(normaliseAccess("Fully open access")).toBe("Open Access");
    expect(normaliseAccess("Subscription only")).toBe("Subscription");
    expect(normaliseAccess("")).toBe("Unspecified");
  });
});

describe("mapConferenceRow", () => {
  it("maps a real row from the spreadsheet", () => {
    const row = sampleConferenceRows.find((item) =>
      String(item["CONFERENCE NAME"]).includes("INDICON"),
    )!;

    const conference = mapConferenceRow(row, new Set())!;

    expect(conference.id).toBeTruthy();
    expect(conference.acronym).toBe("INDICON 2026");
    expect(conference.submissionDeadlineDate).toBe("2026-08-31");
    expect(conference.modeKind).toBe("Hybrid");
    expect(conference.country).toBe("India");
    expect(conference.city).toBe("Chennai");
    expect(conference.topics).toContain("Artificial Intelligence");
    expect(conference.year).toBe(2026);
    // The link cell holds two URLs; the first valid one is the primary.
    expect(conference.link.startsWith("https://")).toBe(true);
    expect(conference.links.length).toBeGreaterThan(1);
  });

  it("skips a row with no name", () => {
    expect(mapConferenceRow({ "CONFERENCE NAME": "" }, new Set())).toBeNull();
  });

  it("handles a nearly empty row without throwing", () => {
    const conference = mapConferenceRow(
      { "CONFERENCE NAME": "NEURA IPS", "CONFERENCE DATE": "date has been gone" },
      new Set(),
    )!;

    expect(conference.name).toBe("NEURA IPS");
    expect(conference.submissionDeadlineDate).toBeNull();
    expect(conference.conferenceStartDate).toBeNull();
    expect(conference.topics).toEqual([]);
    expect(conference.modeKind).toBe("Unspecified");
  });

  it("rejects a link column holding a title rather than a URL", () => {
    const conference = mapConferenceRow(
      {
        "CONFERENCE NAME": "ICASSE 2026",
        "CONFERENCE LINK": "ICASSE 2026 - International Conference on Studies",
      },
      new Set(),
    )!;

    expect(conference.link).toBe("");
    expect(conference.links).toEqual([]);
  });

  it("gives duplicate names distinct ids", () => {
    const taken = new Set<string>();
    const first = mapConferenceRow({ "CONFERENCE NAME": "Same Name" }, taken)!;
    const second = mapConferenceRow({ "CONFERENCE NAME": "Same Name" }, taken)!;

    expect(first.id).not.toBe(second.id);
  });

  it("accepts tidier column names too", () => {
    const conference = mapConferenceRow(
      {
        name: "Renamed Columns Conference",
        website: "https://example.org/cfp",
        submission_deadline: "2026-08-31",
        verified: "TRUE",
      },
      new Set(),
    )!;

    expect(conference.name).toBe("Renamed Columns Conference");
    expect(conference.submissionDeadlineDate).toBe("2026-08-31");
    expect(conference.verified).toBe(true);
  });
});

describe("mapJournalRow", () => {
  it("maps a real journal row", () => {
    const row = sampleJournalRows.find((item) =>
      String(item["JOURNAL NAME"]).includes("Pattern Recognition"),
    )!;

    const journal = mapJournalRow(row, new Set())!;

    expect(journal.publisher).toBe("Elsevier");
    expect(journal.issn).toBe("0031-3203");
    expect(journal.eissn).toBe("1873-5142");
    expect(journal.impactFactor).toBe(7.6);
    expect(journal.accessKind).toBe("Hybrid");
    expect(journal.indexing).toContain("Scopus");
    expect(journal.subjects.length).toBeGreaterThan(0);
  });

  it("skips a row with no name", () => {
    expect(mapJournalRow({ "JOURNAL NAME": "" }, new Set())).toBeNull();
  });

  it("leaves unknown numeric fields null rather than guessing", () => {
    const journal = mapJournalRow({ "JOURNAL NAME": "Sparse" }, new Set())!;
    expect(journal.impactFactor).toBeNull();
    expect(journal.citeScore).toBeNull();
    expect(journal.quartile).toBe("");
  });
});

describe("mapRows", () => {
  it("maps every usable row in the real sheets", () => {
    expect(mapRows(sampleConferenceRows, mapConferenceRow)).toHaveLength(
      sampleConferenceRows.length,
    );
    expect(mapRows(sampleJournalRows, mapJournalRow)).toHaveLength(
      sampleJournalRows.length,
    );
  });

  it("keeps going when one row throws", () => {
    const thrower = (row: { name?: string }) => {
      if (row.name === "bad") throw new Error("boom");
      return row.name ? { id: row.name } : null;
    };

    const result = mapRows(
      [{ name: "good" }, { name: "bad" }, { name: "also good" }],
      thrower,
    );

    expect(result).toHaveLength(2);
  });
});
