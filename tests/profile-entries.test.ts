import { describe, expect, it } from "vitest";

import {
  formatDateRange,
  parseEntries,
  serializeEntries,
  sortEntries,
  summarizeEntry,
} from "@/lib/profile-entries";

const today = new Date(2026, 8, 15); // Sep 2026

describe("parseEntries", () => {
  it("reads legacy newline text as title-only entries", () => {
    const entries = parseEntries("education", "B.Tech — Jamia Hamdard\n\n  M.Tech, IIT  ");
    expect(entries.map((e) => e.school)).toEqual(["B.Tech — Jamia Hamdard", "M.Tech, IIT"]);
  });

  it("reads the JSON this module writes", () => {
    const stored = serializeEntries("experience", [
      { title: "Research Assistant", organization: "Lab", start: "2024-01", current: true },
    ]);
    const [entry] = parseEntries("experience", stored);
    expect(entry).toMatchObject({ title: "Research Assistant", start: "2024-01", current: true, end: "" });
  });

  it("drops entries without a headline and invalid values", () => {
    const entries = parseEntries(
      "publications",
      JSON.stringify([
        { title: "" },
        { title: "Paper", date: "2024-13", url: "javascript:alert(1)" },
        "not an object",
      ]),
    );
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({ title: "Paper", date: "", url: "" });
  });

  it("adds https to bare publication links", () => {
    const [entry] = parseEntries("publications", JSON.stringify([{ title: "P", url: "doi.org/10.1/x" }]));
    expect(entry.url).toBe("https://doi.org/10.1/x");
  });

  it("returns null when serialising an empty list", () => {
    expect(serializeEntries("education", [])).toBeNull();
    expect(serializeEntries("education", "garbage")).toBeNull();
  });
});

describe("sortEntries", () => {
  it("puts current roles first, then most recent", () => {
    const entries = parseEntries(
      "experience",
      JSON.stringify([
        { title: "Old", start: "2018-01", end: "2019-06" },
        { title: "Now", start: "2023-01", current: true },
        { title: "Recent", start: "2020-01", end: "2022-12" },
      ]),
    );
    expect(sortEntries(entries).map((e) => e.title)).toEqual(["Now", "Recent", "Old"]);
  });
});

describe("formatDateRange", () => {
  it("formats month ranges with a duration", () => {
    expect(formatDateRange("2022-01", "2024-03", false, today)).toBe("Jan 2022 – Mar 2024 · 2 yrs 3 mos");
  });

  it("uses Present for current roles", () => {
    expect(formatDateRange("2026-01", "", true, today)).toBe("Jan 2026 – Present · 9 mos");
  });

  it("omits the duration for year-only dates", () => {
    expect(formatDateRange("2018", "2022", false, today)).toBe("2018 – 2022");
  });

  it("handles a single known date", () => {
    expect(formatDateRange("", "2024-09", false, today)).toBe("Sep 2024");
  });
});

describe("summarizeEntry", () => {
  it("joins degree and field for education", () => {
    const [entry] = parseEntries(
      "education",
      JSON.stringify([{ school: "Jamia Hamdard", degree: "B.Tech", field: "CSE", start: "2022", end: "2026" }]),
    );
    expect(summarizeEntry("education", entry, today)).toMatchObject({
      primary: "Jamia Hamdard",
      secondary: "B.Tech, CSE",
      dates: "2022 – 2026",
    });
  });
});
