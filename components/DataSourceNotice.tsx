import { Info } from "lucide-react";

import type { DataSourceStatus } from "@/types/api";

/**
 * Banner shown whenever the page is rendering bundled sample records instead of
 * live spreadsheet data.
 *
 * This renders in production too, on purpose. A misconfigured deployment that
 * quietly served placeholder data as if it were real listings would be worse
 * than one that says so plainly.
 */
export default function DataSourceNotice({
  status,
}: {
  status: DataSourceStatus;
}) {
  if (!status.isFallback) return null;

  return (
    <div
      role="status"
      className="mb-6 flex items-start gap-2.5 rounded border border-[var(--state-soon-line)] bg-[var(--state-soon-wash)] px-4 py-3 text-sm leading-6 text-[var(--state-soon)]"
    >
      <Info size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      <p>
        <span className="font-medium">Sample data.</span>{" "}
        {status.warning ?? "Google Sheets is not connected."} These are example
        records, not a maintained listing.
      </p>
    </div>
  );
}
