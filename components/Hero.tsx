import Link from "next/link";

import DeadlineBadge from "@/components/DeadlineBadge";
import { ButtonLink } from "@/components/ui/Button";
import { formatIsoDate } from "@/lib/dates";
import { truncate } from "@/lib/utils";
import type { Conference } from "@/types/conference";

/**
 * The hero leads with the thing this audience actually acts on: the deadlines
 * closing next, pulled from live data. No decorative gradient, no invented
 * statistics — the most useful content in the dataset is the opening image.
 */
export default function Hero({ closing }: { closing: Conference[] }) {
  return (
    <section className="border-b border-[var(--rule)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-20">
        <div>
          <h1 className="max-w-xl text-4xl leading-[1.15] sm:text-5xl">
            Find the right conference or journal for your research.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-7 text-[var(--ink-muted)]">
            Search calls for papers and journal listings by topic, deadline,
            location, publisher and indexing. Records are compiled and kept
            current in a spreadsheet, then published here.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href="/search">Search listings</ButtonLink>
            <ButtonLink href="/conferences" variant="secondary">
              Browse conferences
            </ButtonLink>
          </div>
        </div>

        {closing.length > 0 ? (
          <div className="rounded-xl border border-[var(--rule)] bg-[var(--paper)] p-5">
            <h2 className="font-sans text-sm font-medium">Closing next</h2>

            <ul className="mt-4 divide-y divide-[var(--rule)]">
              {closing.map((conference) => (
                <li key={conference.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/conference/${conference.id}`}
                    className="group block rounded"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm leading-6 group-hover:text-[var(--accent)]">
                        {truncate(conference.acronym || conference.name, 42)}
                      </span>
                      <DeadlineBadge
                        isoDate={conference.submissionDeadlineDate}
                        showIcon={false}
                      />
                    </div>

                    <span className="tnum mt-1 block text-xs text-[var(--ink-subtle)]">
                      {formatIsoDate(conference.submissionDeadlineDate) ||
                        "Date not listed"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
