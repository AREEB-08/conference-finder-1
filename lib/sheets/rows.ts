/**
 * A single spreadsheet row, keyed by its column header.
 * Values arrive as strings or numbers depending on the adapter.
 */
export type SheetRow = Record<string, string | number | boolean | null>;

/**
 * Look up a cell by header name, tolerating the differences that creep into
 * hand-edited sheets: trailing spaces, casing, punctuation and minor renames.
 * Aliases are tried in order, so the first match wins.
 */
export function cell(row: SheetRow, ...aliases: string[]): unknown {
  for (const alias of aliases) {
    if (alias in row && row[alias] !== null && row[alias] !== "") {
      return row[alias];
    }
  }

  const normalisedRow = new Map<string, unknown>();
  for (const [key, value] of Object.entries(row)) {
    normalisedRow.set(normaliseHeader(key), value);
  }

  for (const alias of aliases) {
    const value = normalisedRow.get(normaliseHeader(alias));
    if (value !== undefined && value !== null && value !== "") return value;
  }

  return "";
}

/** Reduce a header to a comparable key: lowercase, alphanumeric only. */
export function normaliseHeader(header: string): string {
  return String(header ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Convert a raw 2D range (first row = headers) into keyed rows.
 * Rows where every cell is blank are dropped.
 */
export function rowsFromValues(values: unknown[][]): SheetRow[] {
  if (!Array.isArray(values) || values.length < 2) return [];

  const headers = (values[0] ?? []).map((header) => String(header ?? "").trim());

  return values
    .slice(1)
    .map((row) => {
      const record: SheetRow = {};
      headers.forEach((header, index) => {
        if (!header) return;
        const value = row?.[index];
        record[header] =
          value === undefined || value === null
            ? ""
            : (value as string | number | boolean);
      });
      return record;
    })
    .filter((row) => Object.values(row).some((value) => cleanish(value)));
}

function cleanish(value: unknown): boolean {
  return String(value ?? "").trim().length > 0;
}
