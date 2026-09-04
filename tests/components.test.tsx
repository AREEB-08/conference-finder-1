import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import ConferenceCard from "@/components/ConferenceCard";
import JournalCard from "@/components/JournalCard";
import DeadlineBadge from "@/components/DeadlineBadge";
import ModeBadge from "@/components/ModeBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import EmptyState from "@/components/EmptyState";
import { pageWindow } from "@/components/Pagination";
import type { Conference } from "@/types/conference";
import type { Journal } from "@/types/journal";

function conference(overrides: Partial<Conference> = {}): Conference {
  return {
    id: "indicon-2026",
    name: "IEEE India Council International Conference",
    acronym: "INDICON 2026",
    organizer: "IEEE",
    description: "",
    link: "https://example.org",
    links: ["https://example.org"],
    submissionDeadline: "31 August 2026",
    submissionDeadlineDate: "2026-08-31",
    conferenceDate: "December 18–20, 2026",
    conferenceStartDate: "2026-12-18",
    notificationDate: "",
    registrationDeadline: "",
    paperSize: "",
    paperFormat: "",
    topics: ["Artificial Intelligence", "6G", "IoT", "Robotics"],
    field: "Artificial Intelligence",
    mode: "In-person + Online/Virtual",
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
    id: "tpami",
    name: "IEEE Transactions on Pattern Analysis and Machine Intelligence",
    abbreviation: "TPAMI",
    publisher: "IEEE Computer Society",
    description: "",
    link: "https://example.org",
    links: ["https://example.org"],
    issn: "0162-8828",
    eissn: "",
    field: "Computer Vision",
    subjects: ["Computer Vision"],
    frequency: "Monthly",
    openAccess: "Hybrid Open Access",
    accessKind: "Hybrid",
    apc: "US$2,800",
    fees: "",
    paperSize: "",
    volume: "Volume 48 (2026)",
    indexing: ["SCIE", "Scopus", "IEEE Xplore", "DBLP"],
    impactFactor: 20.4,
    impactFactorText: "20.4 — 2025 Journal Impact Factor",
    citeScore: null,
    quartile: "Q1",
    submissionType: "",
    featured: false,
    verified: false,
    lastUpdated: null,
    ...overrides,
  };
}

describe("DeadlineBadge", () => {
  it("shows a countdown for a future deadline", () => {
    const future = new Date();
    future.setUTCDate(future.getUTCDate() + 12);
    render(<DeadlineBadge isoDate={future.toISOString().slice(0, 10)} />);
    expect(screen.getByText("12 days left")).toBeInTheDocument();
  });

  it("shows no countdown once the deadline has passed", () => {
    render(<DeadlineBadge isoDate="2020-01-01" />);
    expect(screen.getByText("Deadline passed")).toBeInTheDocument();
  });

  it("says the deadline is missing rather than inventing one", () => {
    render(<DeadlineBadge isoDate={null} />);
    expect(screen.getByText("Deadline not listed")).toBeInTheDocument();
  });
});

describe("ModeBadge", () => {
  it("renders a known mode", () => {
    render(<ModeBadge mode="Hybrid" />);
    expect(screen.getByText("Hybrid")).toBeInTheDocument();
  });

  it("renders nothing when the mode was not stated", () => {
    const { container } = render(<ModeBadge mode="Unspecified" />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("VerifiedBadge", () => {
  it("appears only for checked records", () => {
    const { container: absent } = render(<VerifiedBadge verified={false} />);
    expect(absent).toBeEmptyDOMElement();

    render(<VerifiedBadge verified />);
    expect(screen.getByText("Checked")).toBeInTheDocument();
  });
});

describe("ConferenceCard", () => {
  it("shows the name as a link to the detail page", () => {
    render(<ConferenceCard conference={conference()} />);

    const link = screen.getByRole("link", {
      name: /IEEE India Council International Conference/i,
    });
    expect(link).toHaveAttribute("href", "/conference/indicon-2026");
  });

  it("shows organiser, place and a formatted deadline", () => {
    render(<ConferenceCard conference={conference()} />);

    expect(screen.getByText("IEEE")).toBeInTheDocument();
    expect(screen.getByText(/Chennai/)).toBeInTheDocument();
    expect(screen.getByText("31 Aug 2026")).toBeInTheDocument();
  });

  it("caps the topic list and shows an overflow count", () => {
    render(<ConferenceCard conference={conference()} />);
    // Four topics, three shown, so "+1" stands in for the rest.
    expect(screen.getByText("+1")).toBeInTheDocument();
  });

  it("falls back to raw text when the deadline could not be parsed", () => {
    render(
      <ConferenceCard
        conference={conference({
          submissionDeadlineDate: null,
          submissionDeadline: "Round 2 TBA",
        })}
      />,
    );

    expect(screen.getByText("Deadline not listed")).toBeInTheDocument();
    expect(screen.getByText("Round 2 TBA")).toBeInTheDocument();
  });

  it("renders a sparse record without crashing", () => {
    render(
      <ConferenceCard
        conference={conference({
          organizer: "",
          place: "",
          topics: [],
          submissionDeadlineDate: null,
          submissionDeadline: "",
          acronym: "",
        })}
      />,
    );

    expect(screen.getByText("Not listed")).toBeInTheDocument();
  });
});

describe("JournalCard", () => {
  it("links to the detail page and shows key metadata", () => {
    render(<JournalCard journal={journal()} />);

    expect(
      screen.getByRole("link", { name: /IEEE Transactions on Pattern/i }),
    ).toHaveAttribute("href", "/journal/tpami");

    expect(screen.getByText("0162-8828")).toBeInTheDocument();
    expect(screen.getByText("Q1")).toBeInTheDocument();
    expect(screen.getByText("20.4")).toBeInTheDocument();
  });

  it("omits the impact factor row when none is recorded", () => {
    render(<JournalCard journal={journal({ impactFactor: null })} />);
    expect(screen.queryByText("Impact factor")).not.toBeInTheDocument();
  });
});

describe("EmptyState", () => {
  it("explains what happened and offers an action", () => {
    render(
      <EmptyState
        title="No conferences match these filters"
        description="Try removing a filter."
        action={<a href="/conferences">Clear filters</a>}
      />,
    );

    expect(
      screen.getByText("No conferences match these filters"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Clear filters" })).toBeInTheDocument();
  });
});

describe("pageWindow", () => {
  it("lists every page when there are few", () => {
    expect(pageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("collapses the middle for long ranges", () => {
    expect(pageWindow(10, 20)).toEqual([1, "gap", 9, 10, 11, "gap", 20]);
    expect(pageWindow(1, 20)).toEqual([1, 2, "gap", 20]);
  });
});
