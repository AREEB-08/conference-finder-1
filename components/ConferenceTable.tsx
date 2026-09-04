import Link from "next/link";

import DeadlineBadge from "@/components/DeadlineBadge";
import ModeBadge from "@/components/ModeBadge";
import { formatIsoDate } from "@/lib/dates";
import { truncate } from "@/lib/utils";
import type { Conference } from "@/types/conference";

/**
 * Dense table view, for comparing many deadlines at once. Kept from the
 * original project and re-pointed at the live data model. It scrolls
 * horizontally on small screens rather than forcing the page to.
 */
export default function ConferenceTable({
  conferences,
}: {
  conferences: Conference[];
}) {
  if (conferences.length === 0) return null;

  return (
    <div className="overflow-hidden rounded border border-[var(--rule)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <caption className="sr-only">
            Conferences with submission deadlines, locations and participation
            modes
          </caption>

          <thead>
            <tr className="border-b border-[var(--rule)] bg-[var(--surface-sunken)]">
              <th scope="col" className="px-4 py-3 font-medium">Conference</th>
              <th scope="col" className="px-4 py-3 font-medium">Deadline</th>
              <th scope="col" className="px-4 py-3 font-medium">Conference date</th>
              <th scope="col" className="px-4 py-3 font-medium">Location</th>
              <th scope="col" className="px-4 py-3 font-medium">Mode</th>
            </tr>
          </thead>

          <tbody>
            {conferences.map((conference) => (
              <tr
                key={conference.id}
                className="border-b border-[var(--rule)] last:border-0 hover:bg-[var(--surface-hover)]"
              >
                <th scope="row" className="px-4 py-3 font-normal">
                  <Link
                    href={`/conference/${conference.id}`}
                    className="rounded hover:text-[var(--accent)]"
                  >
                    {truncate(conference.name, 64)}
                  </Link>
                  {conference.acronym &&
                  conference.acronym !== conference.name ? (
                    <span className="mt-0.5 block text-xs text-[var(--ink-subtle)]">
                      {conference.acronym}
                    </span>
                  ) : null}
                </th>

                <td className="px-4 py-3">
                  <DeadlineBadge
                    isoDate={conference.submissionDeadlineDate}
                    showIcon={false}
                  />
                  <span className="tnum mt-1 block text-xs text-[var(--ink-subtle)]">
                    {formatIsoDate(conference.submissionDeadlineDate)}
                  </span>
                </td>

                <td className="tnum px-4 py-3 text-[var(--ink-muted)]">
                  {truncate(conference.conferenceDate, 28) || "—"}
                </td>

                <td className="px-4 py-3 text-[var(--ink-muted)]">
                  {truncate(conference.place, 34) || "—"}
                </td>

                <td className="px-4 py-3">
                  <ModeBadge mode={conference.modeKind} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
