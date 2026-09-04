import Link from "next/link";
import { ArrowRight, CalendarClock } from "lucide-react";

import DeadlineBadge from "@/components/DeadlineBadge";
import ProgrammeMotif from "./ProgrammeMotif";
import { ButtonLink } from "@/components/ui/Button";
import { formatIsoDate } from "@/lib/dates";
import { siteConfig } from "@/config/site";
import { truncate } from "@/lib/utils";
import type { Conference } from "@/types/conference";

/**
 * Above the fold. The staggered entrance runs on load rather than on scroll,
 * because the hero is visible immediately and a scroll observer would never
 * fire for it.
 */
export default function LandingHero({ closing }: { closing: Conference[] }) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--rule)] bg-[var(--surface)]">
      {/* Decorative motif, offset behind the content on large screens. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 top-16 hidden opacity-70 lg:block cf-drift"
      >
        <ProgrammeMotif />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <p className="cf-rise inline-flex items-center gap-2 rounded-full border border-[var(--accent-line)] bg-[var(--accent-wash)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
          <CalendarClock size={13} aria-hidden="true" />
          {siteConfig.institution}
        </p>

        <h1 className="cf-rise cf-delay-1 mt-5 max-w-2xl text-4xl leading-[1.12] sm:text-5xl lg:text-6xl">
          Find the right conference or journal for your research.
        </h1>

        <p className="cf-rise cf-delay-2 mt-6 max-w-xl text-base leading-7 text-[var(--ink-muted)]">
          Search calls for papers and journal listings by topic, deadline,
          location, publisher and indexing. Records are compiled by hand in a
          spreadsheet and published here, so what you see is what we have
          checked.
        </p>

        <div className="cf-rise cf-delay-3 mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/search">
            Search listings
            <ArrowRight size={16} aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="/conferences" variant="secondary">
            Browse conferences
          </ButtonLink>
          <ButtonLink href="/journals" variant="secondary">
            Browse journals
          </ButtonLink>
        </div>

        {closing.length > 0 ? (
          <div className="cf-rise cf-delay-4 mt-14 max-w-xl rounded border border-[var(--rule)] bg-[var(--paper)] p-5">
            <h2 className="font-sans text-sm font-medium">Closing next</h2>

            <ul className="mt-3 divide-y divide-[var(--rule)]">
              {closing.map((conference) => (
                <li key={conference.id} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/conference/${conference.id}`}
                    className="group block rounded"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm leading-6 transition-colors group-hover:text-[var(--accent)]">
                        {truncate(conference.acronym || conference.name, 46)}
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
