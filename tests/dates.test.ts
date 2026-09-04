import { describe, expect, it } from "vitest";

import {
  daysBetween,
  excelSerialToIso,
  extractYear,
  formatIsoDate,
  getDeadlineInfo,
  parseSheetDate,
  todayIso,
} from "@/lib/dates";

describe("excelSerialToIso", () => {
  it("converts the serials that appear in the real sheet", () => {
    // These three are the actual values in the maintained spreadsheet.
    expect(excelSerialToIso(46265)).toBe("2026-08-31");
    expect(excelSerialToIso(46295)).toBe("2026-09-30");
    expect(excelSerialToIso(46254)).toBe("2026-08-20");
  });

  it("rejects values that cannot be dates", () => {
    expect(excelSerialToIso(6)).toBeNull();
    expect(excelSerialToIso(999)).toBeNull();
    expect(excelSerialToIso(70000)).toBeNull();
    expect(excelSerialToIso(Number.NaN)).toBeNull();
  });
});

describe("parseSheetDate", () => {
  it("handles Excel serials as numbers and as strings", () => {
    expect(parseSheetDate(46265)).toBe("2026-08-31");
    expect(parseSheetDate("46265")).toBe("2026-08-31");
  });

  it("handles ISO dates", () => {
    expect(parseSheetDate("2026-08-31")).toBe("2026-08-31");
    expect(parseSheetDate("2026-8-1")).toBe("2026-08-01");
  });

  it("handles the prose formats used in the sheet", () => {
    expect(
      parseSheetDate(
        "December 10, 2026 (abstract submission continues until this date)",
      ),
    ).toBe("2026-12-10");
    expect(parseSheetDate("17 August 2026 (2nd Round Full Paper)")).toBe(
      "2026-08-17",
    );
    expect(parseSheetDate("30 April 2026")).toBe("2026-04-30");
  });

  it("takes the first day of a date range", () => {
    expect(parseSheetDate("December 18–20, 2026")).toBe("2026-12-18");
    expect(parseSheetDate("10–11 December 2026")).toBe("2026-12-10");
    expect(parseSheetDate("October 30 – November 1, 2026")).toBe("2026-10-30");
  });

  it("respects the configured order for all-numeric dates", () => {
    expect(parseSheetDate("05/09/2026", "DMY")).toBe("2026-09-05");
    expect(parseSheetDate("05/09/2026", "MDY")).toBe("2026-05-09");
  });

  it("corrects an impossible month regardless of configured order", () => {
    // 25 cannot be a month, so this is 25 September however it was configured.
    expect(parseSheetDate("25/09/2026", "MDY")).toBe("2026-09-25");
  });

  it("returns null rather than guessing at unparseable text", () => {
    expect(parseSheetDate("date has been gone")).toBeNull();
    expect(parseSheetDate("")).toBeNull();
    expect(parseSheetDate(null)).toBeNull();
    expect(parseSheetDate(undefined)).toBeNull();
    expect(parseSheetDate("TBA")).toBeNull();
  });

  it("rejects calendar dates that do not exist", () => {
    expect(parseSheetDate("2026-02-31")).toBeNull();
  });

  it("accepts Date objects and rejects invalid ones", () => {
    expect(parseSheetDate(new Date("2026-08-31T00:00:00Z"))).toBe("2026-08-31");
    expect(parseSheetDate(new Date("nonsense"))).toBeNull();
  });
});

describe("getDeadlineInfo", () => {
  const now = new Date("2026-06-01T12:00:00Z");

  it("labels a passed deadline without a countdown", () => {
    const info = getDeadlineInfo("2026-05-01", now);
    expect(info.status).toBe("passed");
    expect(info.label).toBe("Deadline passed");
  });

  it("labels the deadline day itself", () => {
    expect(getDeadlineInfo("2026-06-01", now).status).toBe("today");
  });

  it("separates urgent, soon and open", () => {
    expect(getDeadlineInfo("2026-06-05", now).status).toBe("urgent");
    expect(getDeadlineInfo("2026-06-20", now).status).toBe("soon");
    expect(getDeadlineInfo("2026-12-01", now).status).toBe("open");
  });

  it("says so plainly when no date could be parsed", () => {
    const info = getDeadlineInfo(null, now);
    expect(info.status).toBe("unknown");
    expect(info.daysLeft).toBeNull();
    expect(info.label).toBe("Deadline not listed");
  });

  it("counts whole days regardless of the time of day", () => {
    const lateInDay = new Date("2026-06-01T23:59:00Z");
    expect(getDeadlineInfo("2026-06-08", lateInDay).daysLeft).toBe(7);
  });
});

describe("helpers", () => {
  it("computes signed day differences", () => {
    expect(daysBetween("2026-06-01", "2026-06-08")).toBe(7);
    expect(daysBetween("2026-06-08", "2026-06-01")).toBe(-7);
  });

  it("formats and degrades safely", () => {
    expect(formatIsoDate("2026-08-31")).toBe("31 Aug 2026");
    expect(formatIsoDate(null)).toBe("");
    expect(formatIsoDate("not-a-date")).toBe("");
  });

  it("pulls a year out of free text", () => {
    expect(extractYear("INDICON 2026")).toBe(2026);
    expect(extractYear("", "December 18–20, 2027")).toBe(2027);
    expect(extractYear("no year here")).toBeNull();
  });

  it("reports today as an ISO calendar date", () => {
    expect(todayIso(new Date("2026-06-01T23:30:00Z"))).toBe("2026-06-01");
  });
});
