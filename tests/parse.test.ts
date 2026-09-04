import { describe, expect, it } from "vitest";

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

describe("cleanString", () => {
  it("normalises whitespace and nullish values", () => {
    expect(cleanString("  IEEE   Xplore \n")).toBe("IEEE Xplore");
    expect(cleanString("non\u00a0breaking")).toBe("non breaking");
    expect(cleanString(null)).toBe("");
    expect(cleanString(undefined)).toBe("");
    expect(cleanString(42)).toBe("42");
    expect(cleanString(Number.NaN)).toBe("");
  });
});

describe("cleanMultiline", () => {
  it("keeps paragraph breaks but collapses runs", () => {
    expect(cleanMultiline("one\n\n\n\ntwo")).toBe("one\n\ntwo");
    expect(cleanMultiline("  spaced   out  ")).toBe("spaced out");
  });
});

describe("parseList", () => {
  it("splits on the semicolons the sheet actually uses", () => {
    expect(parseList("Computer Vision; Machine Learning; Deep Learning")).toEqual(
      ["Computer Vision", "Machine Learning", "Deep Learning"],
    );
  });

  it("falls back to commas when there are no semicolons", () => {
    expect(parseList("AI, Robotics, IoT")).toEqual(["AI", "Robotics", "IoT"]);
  });

  it("drops empties, placeholders and duplicates", () => {
    expect(parseList("AI;; -; N/A; AI")).toEqual(["AI"]);
    expect(parseList("")).toEqual([]);
    expect(parseList(null)).toEqual([]);
  });
});

describe("parseBoolean", () => {
  it("accepts the spellings that appear in spreadsheets", () => {
    for (const value of ["TRUE", "yes", "Y", "1", "x", "✓"]) {
      expect(parseBoolean(value)).toBe(true);
    }
    for (const value of ["FALSE", "no", "0", "", "-"]) {
      expect(parseBoolean(value)).toBe(false);
    }
  });

  it("uses the fallback for text it does not recognise", () => {
    expect(parseBoolean("maybe", true)).toBe(true);
    expect(parseBoolean("maybe", false)).toBe(false);
  });
});

describe("parseNumber", () => {
  it("extracts the leading number from prose", () => {
    expect(
      parseNumber("20.4 — 2025 Journal Impact Factor, from the 2025 reports."),
    ).toBe(20.4);
    expect(parseNumber("7.6 — 2025 Journal Impact Factor")).toBe(7.6);
  });

  it("returns null when there is no number", () => {
    expect(parseNumber("Not reported")).toBeNull();
    expect(parseNumber("")).toBeNull();
  });
});

describe("parseIssnPair", () => {
  it("splits the combined form used in the sheet", () => {
    expect(parseIssnPair("0031-3203 (E-ISSN: 1873-5142)")).toEqual({
      issn: "0031-3203",
      eissn: "1873-5142",
    });
  });

  it("handles a single ISSN", () => {
    expect(parseIssnPair("0162-8828")).toEqual({
      issn: "0162-8828",
      eissn: "",
    });
  });

  it("preserves a trailing X check digit", () => {
    expect(parseIssnPair("1077-314X").issn).toBe("1077-314X");
  });

  it("returns empties for missing or malformed values", () => {
    expect(parseIssnPair("")).toEqual({ issn: "", eissn: "" });
    expect(parseIssnPair("not an issn")).toEqual({ issn: "", eissn: "" });
  });
});

describe("parseIndexing", () => {
  it("recognises database names inside prose", () => {
    const result = parseIndexing(
      "Web of Science – SCIE; Scopus; IEEE Xplore. Also widely indexed.",
    );
    expect(result).toContain("SCIE");
    expect(result).toContain("Scopus");
    expect(result).toContain("IEEE Xplore");
    // The trailing prose must not become a filter option.
    expect(result.some((item) => item.includes("widely"))).toBe(false);
  });

  it("returns an empty list for an empty cell", () => {
    expect(parseIndexing("")).toEqual([]);
  });
});

describe("parseQuartile", () => {
  it("finds a quartile and ignores other text", () => {
    expect(parseQuartile("Scopus Q1 journal")).toBe("Q1");
    expect(parseQuartile("q3")).toBe("Q3");
    expect(parseQuartile("Q9")).toBe("");
    expect(parseQuartile("no quartile listed")).toBe("");
  });
});

describe("parsePlace", () => {
  it("finds the city when a venue and state are present", () => {
    expect(
      parsePlace("Sri Sai Ram Engineering College, Chennai, Tamil Nadu, India"),
    ).toMatchObject({ city: "Chennai", country: "India" });

    expect(
      parsePlace(
        "COEP Technological University, Shivajinagar, Pune, Maharashtra, India",
      ),
    ).toMatchObject({ city: "Pune", country: "India" });
  });

  it("handles a venue, city and country", () => {
    expect(parsePlace("Nippon Hotel, Istanbul, Türkiye")).toMatchObject({
      city: "Istanbul",
      country: "Türkiye",
    });
  });

  it("handles degenerate values without throwing", () => {
    expect(parsePlace("")).toEqual({ place: "", city: "", country: "" });
    expect(parsePlace("Online")).toMatchObject({ city: "Online", country: "" });
  });
});
