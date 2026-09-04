import type { DeadlineInfo, DeadlineStatus } from "@/types/conference";

/**
 * Date handling for hand-maintained spreadsheet values.
 *
 * The sheet mixes at least four representations in the same column:
 *   - Excel serial numbers   -> 46265
 *   - ISO strings            -> 2026-08-31
 *   - Long-form prose        -> "December 10, 2026 (abstract continues...)"
 *   - Multi-part schedules   -> "Round 2: 30 April 2026  Camera-Ready: ..."
 *
 * Everything here is timezone-safe: dates are treated as calendar days in UTC
 * so a user in Delhi and a server in Virginia agree on "days left".
 */

/** Excel's day zero (it treats 1900 as a leap year, hence Dec 30 not Dec 31). */
const EXCEL_EPOCH_UTC = Date.UTC(1899, 11, 30);
const MS_PER_DAY = 86_400_000;

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

/**
 * Which component comes first in all-numeric dates such as "05/09/2026".
 * The sheet is maintained in India, so day-first is the documented default.
 * Override with SHEET_DATE_ORDER=MDY when the sheet is US-formatted.
 */
export type DateOrder = "DMY" | "MDY";

export function configuredDateOrder(): DateOrder {
  return process.env.SHEET_DATE_ORDER === "MDY" ? "MDY" : "DMY";
}

function isoFromUtc(year: number, month: number, day: number): string | null {
  const time = Date.UTC(year, month, day);
  const date = new Date(time);

  // Rejects impossible dates like 31 February, which Date.UTC would roll over.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

/** Convert an Excel serial day number to an ISO date. */
export function excelSerialToIso(serial: number): string | null {
  if (!Number.isFinite(serial)) return null;
  // Below 1000 is almost certainly a stray number, above 60000 is year 2064+.
  if (serial < 1000 || serial > 60000) return null;

  const date = new Date(EXCEL_EPOCH_UTC + Math.round(serial) * MS_PER_DAY);
  return date.toISOString().slice(0, 10);
}

/**
 * Best-effort parse of one spreadsheet date cell into an ISO `YYYY-MM-DD`.
 * Returns null rather than guessing when nothing recognisable is present, so
 * callers can fall back to showing the raw text.
 */
export function parseSheetDate(
  input: unknown,
  order: DateOrder = configuredDateOrder(),
): string | null {
  if (input === null || input === undefined) return null;

  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return input.toISOString().slice(0, 10);
  }

  if (typeof input === "number") return excelSerialToIso(input);

  const text = String(input).trim();
  if (!text) return null;

  // A cell holding only a number is an Excel serial.
  if (/^\d{4,5}(\.\d+)?$/.test(text)) {
    return excelSerialToIso(Number(text));
  }

  // ISO first: unambiguous, so it wins over the locale-dependent branches.
  const iso = text.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (iso) {
    return isoFromUtc(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
  }

  // Ranges are matched BEFORE single dates. A single-date pattern would
  // otherwise latch onto the second half of "10-11 December 2026" and report
  // the 11th as the start.

  // "October 30 - November 1, 2026": two months sharing one year.
  const crossMonthRange = text.match(
    /\b([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?\s*[-\u2013\u2014]\s*[A-Za-z]{3,9}\.?\s+\d{1,2}(?:st|nd|rd|th)?,?\s*(\d{4})\b/,
  );
  if (crossMonthRange) {
    const month = MONTHS[crossMonthRange[1].toLowerCase()];
    if (month !== undefined) {
      return isoFromUtc(
        Number(crossMonthRange[3]),
        month,
        Number(crossMonthRange[2]),
      );
    }
  }

  // "December 18-20, 2026" - a range with the month named once.
  const rangeMonthFirst = text.match(
    /\b([A-Za-z]{3,9})\.?\s+(\d{1,2})\s*[-\u2013\u2014]\s*\d{1,2},?\s*(\d{4})\b/,
  );
  if (rangeMonthFirst) {
    const month = MONTHS[rangeMonthFirst[1].toLowerCase()];
    if (month !== undefined) {
      return isoFromUtc(
        Number(rangeMonthFirst[3]),
        month,
        Number(rangeMonthFirst[2]),
      );
    }
  }

  // "10-11 December 2026" - a day range before the month.
  const rangeDayFirst = text.match(
    /\b(\d{1,2})\s*[-\u2013\u2014]\s*\d{1,2}\s+([A-Za-z]{3,9})\.?\s+(\d{4})\b/,
  );
  if (rangeDayFirst) {
    const month = MONTHS[rangeDayFirst[2].toLowerCase()];
    if (month !== undefined) {
      return isoFromUtc(
        Number(rangeDayFirst[3]),
        month,
        Number(rangeDayFirst[1]),
      );
    }
  }

  // "30 April 2026" / "30th April, 2026" / "17 Aug 2026"
  const dayFirst = text.match(
    /\b(\d{1,2})(?:st|nd|rd|th)?[\s.\-]+([A-Za-z]{3,9})\.?[\s,.\-]+(\d{4})\b/,
  );
  if (dayFirst) {
    const month = MONTHS[dayFirst[2].toLowerCase()];
    if (month !== undefined) {
      return isoFromUtc(Number(dayFirst[3]), month, Number(dayFirst[1]));
    }
  }

  // "December 10, 2026"
  const monthFirst = text.match(
    /\b([A-Za-z]{3,9})\.?[\s.\-]+(\d{1,2})(?:st|nd|rd|th)?[\s,.\-]+(\d{4})\b/,
  );
  if (monthFirst) {
    const month = MONTHS[monthFirst[1].toLowerCase()];
    if (month !== undefined) {
      return isoFromUtc(Number(monthFirst[3]), month, Number(monthFirst[2]));
    }
  }

  // Numeric: 05/09/2026 or 5-9-26. Order is configuration-driven.
  const numeric = text.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{2,4})\b/);
  if (numeric) {
    const first = Number(numeric[1]);
    const second = Number(numeric[2]);
    let year = Number(numeric[3]);
    if (year < 100) year += year < 70 ? 2000 : 1900;

    let day = order === "DMY" ? first : second;
    let month = order === "DMY" ? second : first;

    // A value above 12 can only be a day, whatever the configured order says.
    if (month > 12 && day <= 12) [day, month] = [month, day];

    return isoFromUtc(year, month - 1, day);
  }

  return null;
}

/** Today as an ISO calendar date in UTC. */
export function todayIso(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Whole days from `fromIso` to `toIso`. Negative when `toIso` is in the past. */
export function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00Z`);
  const to = Date.parse(`${toIso}T00:00:00Z`);
  if (Number.isNaN(from) || Number.isNaN(to)) return 0;
  return Math.round((to - from) / MS_PER_DAY);
}

function describeDays(days: number): string {
  if (days === 1) return "1 day left";
  if (days < 30) return `${days} days left`;

  const months = Math.round(days / 30);
  if (months <= 1) return "About 1 month left";
  if (months < 12) return `About ${months} months left`;

  const years = Math.floor(days / 365);
  return years === 1 ? "Over a year left" : `Over ${years} years left`;
}

/**
 * Turn a parsed deadline into a badge-ready status.
 * Thresholds: today, <=7 days urgent, <=30 days soon, otherwise open.
 */
export function getDeadlineInfo(
  isoDate: string | null,
  now: Date = new Date(),
): DeadlineInfo {
  if (!isoDate) {
    return {
      status: "unknown",
      daysLeft: null,
      label: "Deadline not listed",
      isoDate: null,
    };
  }

  const daysLeft = daysBetween(todayIso(now), isoDate);

  let status: DeadlineStatus;
  let label: string;

  if (daysLeft < 0) {
    status = "passed";
    label = "Deadline passed";
  } else if (daysLeft === 0) {
    status = "today";
    label = "Closes today";
  } else if (daysLeft <= 7) {
    status = "urgent";
    label = describeDays(daysLeft);
  } else if (daysLeft <= 30) {
    status = "soon";
    label = describeDays(daysLeft);
  } else {
    status = "open";
    label = describeDays(daysLeft);
  }

  return { status, daysLeft, label, isoDate };
}

/** Format an ISO date for display, e.g. "31 Aug 2026". */
export function formatIsoDate(isoDate: string | null): string {
  if (!isoDate) return "";
  const time = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(time)) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(time));
}

/** Pull a plausible 4-digit year out of free text. */
export function extractYear(...values: string[]): number | null {
  for (const value of values) {
    const match = String(value ?? "").match(/\b(20\d{2})\b/);
    if (match) {
      const year = Number(match[1]);
      if (year >= 2000 && year <= 2099) return year;
    }
  }
  return null;
}
