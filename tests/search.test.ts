import { describe, expect, it } from "vitest";

import {
  buildConferenceFacets,
  buildJournalFacets,
  defaultConferenceFilters,
  defaultJournalFilters,
  filterConferences,
  filterJournals,
  paginate,
  parseConferenceParams,
  parseJournalParams,
  searchConferences,
  sortConferences,
  sortJournals,
  upcomingConferences,
} from "@/lib/search";
import type { Conference } from "@/types/conference";
import type { Journal } from "@/types/journal";

const NOW = new Date("2026-06-01T00:00:00Z");

function conference(overrides: Partial<Conference> = {}): Conference {
  return {
    id: "c1",
    name: "International Conference on Computer Vision",
    acronym: "ICCV 2026",
    organizer: "IEEE",
    description: "",
    link: "https://example.org",
    links: ["https://example.org"],
    submissionDeadline: "31 August 2026",
    submissionDeadlineDate: "2026-08-31",
    conferenceDate: "December 2026",
    conferenceStartDate: "2026-12-01",
    notificationDate: "",
    registrationDeadline: "",
    paperSize: "",
    paperFormat: "",
    topics: ["Computer Vision", "Machine Learning"],
    field: "Computer Vision",
    mode: "Hybrid",
    modeKind: "Hybrid",
    place: "Chennai, Tamil Nadu, India",
    city: "Chennai",
    country: "India",
    fees: "",
    indexing: "",
    ranking: "",
    status: "",
    year: 2026,
    featured: false,
    verified: false,
    lastUpdated: null,
    ...overrides,
  };
}

function journal(overrides: Partial<Journal> = {}): Journal {
  return {
    id: "j1",
    name: "Pattern Recognition",
    abbreviation: "",
    publisher: "Elsevier",
    description: "",
    link: "https://example.org",
    links: ["https://example.org"],
    issn: "0031-3203",
    eissn: "1873-5142",
    field: "Pattern Recognition",
    subjects: ["Pattern Recognition", "Computer Vision"],
    frequency: "Monthly",
    openAccess: "Hybrid",
    accessKind: "Hybrid",
    apc: "",
    fees: "",
    paperSize: "",
    volume: "",
    indexing: ["Scopus", "SCIE"],
    impactFactor: 7.6,
    impactFactorText: "7.6 — 2025",
    citeScore: null,
    quartile: "Q1",
    submissionType: "",
    featured: false,
    verified: false,
    lastUpdated: null,
    ...overrides,
  };
}

describe("conference keyword search", () => {
  // Every field that the keyword index reads is set explicitly here, so a
  // factory default cannot make an assertion pass or fail by accident.
  const items = [
    conference({
      id: "a",
      name: "Vision Conference",
      topics: ["Computer Vision"],
      field: "Computer Vision",
      place: "Chennai, Tamil Nadu, India",
      city: "Chennai",
      country: "India",
    }),
    conference({
      id: "b",
      name: "Robotics Summit",
      acronym: "ROBO",
      topics: ["Robotics"],
      field: "Robotics",
      place: "Berlin, Germany",
      city: "Berlin",
      country: "Germany",
    }),
  ];

  it("matches across name, topic and location", () => {
    const byName = filterConferences(items, { ...defaultConferenceFilters, q: "vision" }, NOW);
    expect(byName.map((item) => item.id)).toEqual(["a"]);

    const byPlace = filterConferences(items, { ...defaultConferenceFilters, q: "berlin" }, NOW);
    expect(byPlace.map((item) => item.id)).toEqual(["b"]);
  });

  it("requires every term to match", () => {
    const both = filterConferences(
      items,
      { ...defaultConferenceFilters, q: "robotics berlin" },
      NOW,
    );
    expect(both.map((item) => item.id)).toEqual(["b"]);

    const neither = filterConferences(
      items,
      { ...defaultConferenceFilters, q: "robotics chennai" },
      NOW,
    );
    expect(neither).toEqual([]);
  });

  it("is case and whitespace insensitive", () => {
    expect(
      filterConferences(items, { ...defaultConferenceFilters, q: "  VISION  " }, NOW),
    ).toHaveLength(1);
  });

  it("returns everything for an empty query", () => {
    expect(
      filterConferences(items, defaultConferenceFilters, NOW),
    ).toHaveLength(2);
  });
});

describe("conference filters", () => {
  const items = [
    conference({ id: "open", submissionDeadlineDate: "2026-08-31" }),
    conference({ id: "passed", submissionDeadlineDate: "2026-01-01" }),
    conference({ id: "unknown", submissionDeadlineDate: null }),
    conference({ id: "online", modeKind: "Online", country: "Japan" }),
  ];

  it("filters by open and passed deadlines", () => {
    const open = filterConferences(
      items,
      { ...defaultConferenceFilters, deadline: "open" },
      NOW,
    );
    expect(open.map((item) => item.id).sort()).toEqual(["online", "open"]);

    const passed = filterConferences(
      items,
      { ...defaultConferenceFilters, deadline: "passed" },
      NOW,
    );
    expect(passed.map((item) => item.id)).toEqual(["passed"]);
  });

  it("excludes records with no deadline from both sides", () => {
    const ids = [
      ...filterConferences(items, { ...defaultConferenceFilters, deadline: "open" }, NOW),
      ...filterConferences(items, { ...defaultConferenceFilters, deadline: "passed" }, NOW),
    ].map((item) => item.id);

    expect(ids).not.toContain("unknown");
  });

  it("combines filters", () => {
    const result = filterConferences(
      items,
      { ...defaultConferenceFilters, mode: "Online", country: "Japan" },
      NOW,
    );
    expect(result.map((item) => item.id)).toEqual(["online"]);
  });

  it("returns nothing when filters conflict", () => {
    expect(
      filterConferences(
        items,
        { ...defaultConferenceFilters, mode: "Online", country: "India" },
        NOW,
      ),
    ).toEqual([]);
  });

  it("filters by topic and verified flag", () => {
    const verified = [conference({ id: "v", verified: true }), conference({ id: "n" })];
    expect(
      filterConferences(
        verified,
        { ...defaultConferenceFilters, verifiedOnly: true },
        NOW,
      ).map((item) => item.id),
    ).toEqual(["v"]);

    expect(
      filterConferences(
        verified,
        { ...defaultConferenceFilters, topic: "computer vision" },
        NOW,
      ),
    ).toHaveLength(2);
  });
});

describe("conference sorting", () => {
  it("puts soonest open deadlines first, then passed, then unknown", () => {
    const items = [
      conference({ id: "unknown", submissionDeadlineDate: null }),
      conference({ id: "passed", submissionDeadlineDate: "2026-01-01" }),
      conference({ id: "later", submissionDeadlineDate: "2026-09-01" }),
      conference({ id: "sooner", submissionDeadlineDate: "2026-07-01" }),
    ];

    expect(sortConferences(items, "deadline", NOW).map((item) => item.id)).toEqual([
      "sooner",
      "later",
      "passed",
      "unknown",
    ]);
  });

  it("sorts by name", () => {
    const items = [conference({ name: "Zeta" }), conference({ name: "Alpha" })];
    expect(sortConferences(items, "name", NOW)[0].name).toBe("Alpha");
  });

  it("does not mutate the input array", () => {
    const items = [conference({ name: "Zeta" }), conference({ name: "Alpha" })];
    sortConferences(items, "name", NOW);
    expect(items[0].name).toBe("Zeta");
  });
});

describe("journal filters and sorting", () => {
  const items = [
    journal({ id: "high", impactFactor: 20.4, publisher: "IEEE", quartile: "Q1" }),
    journal({ id: "mid", impactFactor: 7.6, publisher: "Elsevier", quartile: "Q2" }),
    journal({ id: "none", impactFactor: null, publisher: "Springer", quartile: "" }),
  ];

  it("applies a minimum impact factor and excludes unknowns", () => {
    const result = filterJournals(items, {
      ...defaultJournalFilters,
      minImpact: "10",
    });
    expect(result.map((item) => item.id)).toEqual(["high"]);
  });

  it("filters by publisher, quartile and indexing", () => {
    expect(
      filterJournals(items, { ...defaultJournalFilters, publisher: "IEEE" }).map(
        (item) => item.id,
      ),
    ).toEqual(["high"]);

    expect(
      filterJournals(items, { ...defaultJournalFilters, quartile: "Q1" }).map(
        (item) => item.id,
      ),
    ).toEqual(["high"]);

    expect(
      filterJournals(items, { ...defaultJournalFilters, indexing: "Scopus" }),
    ).toHaveLength(3);
  });

  it("searches ISSN", () => {
    expect(
      filterJournals(items, { ...defaultJournalFilters, q: "0031-3203" }),
    ).toHaveLength(3);
  });

  it("sorts by impact with unknowns last", () => {
    expect(sortJournals(items, "impact").map((item) => item.id)).toEqual([
      "high",
      "mid",
      "none",
    ]);
  });
});

describe("paginate", () => {
  const items = Array.from({ length: 25 }, (_, index) => index);

  it("slices pages and reports totals", () => {
    const page = paginate(items, 2, 10);
    expect(page.items).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    expect(page).toMatchObject({ total: 25, totalPages: 3, page: 2 });
  });

  it("clamps an out-of-range page instead of returning nothing", () => {
    expect(paginate(items, 99, 10).page).toBe(3);
    expect(paginate(items, 0, 10).page).toBe(1);
  });

  it("handles an empty set", () => {
    const page = paginate([], 1, 10);
    expect(page.items).toEqual([]);
    expect(page.totalPages).toBe(1);
  });
});

describe("parameter parsing", () => {
  it("reads filters from a URL", () => {
    const params = new URLSearchParams(
      "q=machine+learning&country=India&mode=Hybrid&sort=name&page=3&verified=1",
    );
    expect(parseConferenceParams(params)).toMatchObject({
      q: "machine learning",
      country: "India",
      mode: "Hybrid",
      sort: "name",
      page: 3,
      verifiedOnly: true,
    });
  });

  it("falls back to defaults for invalid values", () => {
    const params = new URLSearchParams(
      "sort=nonsense&page=-4&perPage=99999&deadline=maybe&year=abcd",
    );
    const filters = parseConferenceParams(params);

    expect(filters.sort).toBe("deadline");
    expect(filters.page).toBe(1);
    expect(filters.perPage).toBeLessThanOrEqual(60);
    expect(filters.deadline).toBe("");
    expect(filters.year).toBe("");
  });

  it("caps an overlong query", () => {
    const params = new URLSearchParams(`q=${"a".repeat(500)}`);
    expect(parseConferenceParams(params).q.length).toBeLessThanOrEqual(120);
  });

  it("reads plain search param objects as well as URLSearchParams", () => {
    expect(
      parseJournalParams({ publisher: "Elsevier", sort: "impact" }),
    ).toMatchObject({ publisher: "Elsevier", sort: "impact" });

    // Next can hand over repeated params as arrays.
    expect(parseJournalParams({ q: ["first", "second"] }).q).toBe("first");
  });
});

describe("facets", () => {
  it("counts only values present in the data", () => {
    const facets = buildConferenceFacets([
      conference({ country: "India" }),
      conference({ country: "India" }),
      conference({ country: "Japan" }),
    ]);

    expect(facets.countries[0]).toEqual({ value: "India", count: 2 });
    expect(facets.countries.map((item) => item.value)).not.toContain("");
  });

  it("builds journal facets", () => {
    const facets = buildJournalFacets([
      journal({ publisher: "Elsevier" }),
      journal({ publisher: "IEEE" }),
    ]);
    expect(facets.publishers.map((item) => item.value).sort()).toEqual([
      "Elsevier",
      "IEEE",
    ]);
  });
});

describe("upcomingConferences", () => {
  it("prefers featured records then soonest deadline", () => {
    const items = [
      conference({ id: "soon", submissionDeadlineDate: "2026-06-10" }),
      conference({ id: "featured", submissionDeadlineDate: "2026-11-01", featured: true }),
      conference({ id: "past", submissionDeadlineDate: "2026-01-01" }),
    ];

    expect(upcomingConferences(items, 2, NOW).map((item) => item.id)).toEqual([
      "featured",
      "soon",
    ]);
  });

  it("still returns something when every deadline has passed", () => {
    const items = [conference({ id: "past", submissionDeadlineDate: "2026-01-01" })];
    expect(upcomingConferences(items, 3, NOW)).toHaveLength(1);
  });
});

describe("searchConferences", () => {
  it("filters, sorts and paginates together", () => {
    const items = Array.from({ length: 15 }, (_, index) =>
      conference({
        id: `c${index}`,
        name: `Conference ${index}`,
        submissionDeadlineDate: `2026-07-${String((index % 28) + 1).padStart(2, "0")}`,
      }),
    );

    const result = searchConferences(
      items,
      { ...defaultConferenceFilters, perPage: 5, page: 2 },
      NOW,
    );

    expect(result.items).toHaveLength(5);
    expect(result.total).toBe(15);
    expect(result.totalPages).toBe(3);
  });
});
