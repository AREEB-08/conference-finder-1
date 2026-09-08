import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import DeadlineBadge from "@/components/DeadlineBadge";
import { ButtonLink } from "@/components/ui/Button";
import {
  ResearcherFigure,
  PresenterFigure,
} from "@/components/illustrations/Figures";
import {
  CurvedArrow,
  Squiggle,
  Star4,
  Star8,
} from "@/components/illustrations/Doodles";
import { formatIsoDate } from "@/lib/dates";
import { truncate } from "@/lib/utils";
import type { Conference } from "@/types/conference";

/**
 * Above the fold: a centered editorial serif headline flanked by hand-drawn
 * figures, in the style of a well-edited research journal. The staggered
 * entrance runs on load rather than on scroll.
 */
export default function LandingHero({ closing }: { closing: Conference[] }) {
  return (
    <section className="relative overflow-hidden">
      {/* Flanking illustrations, hidden on small screens. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[max(1rem,calc(50%-620px))] top-24 hidden lg:block cf-drift"
      >
        <ResearcherFigure width={250} />
      </div>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[max(1rem,calc(50%-620px))] top-32 hidden lg:block cf-drift-slow"
      >
        <PresenterFigure width={250} />
      </div>

      {/* Scattered doodles */}
      <Star4
        size={30}
        className="pointer-events-none absolute left-[18%] top-14 hidden lg:block"
      />
      <Star8
        size={20}
        className="pointer-events-none absolute right-[16%] top-16 hidden lg:block"
      />
      <CurvedArrow className="pointer-events-none absolute left-[26%] bottom-40 hidden -scale-x-100 lg:block" />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center px-4 pb-20 pt-16 text-center sm:px-6 lg:pt-24">
        {/* Announcement pill banner */}
        <p className="cf-rise inline-flex items-center gap-2 rounded-full border border-[var(--accent-line)] bg-[var(--surface-sunken)] px-4 py-1.5 text-[13px]">
          <Sparkles size={14} aria-hidden="true" className="text-[var(--accent)]" />
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.059em] text-[var(--pine)]">
            Curated, human-checked
          </span>
          <span className="hidden text-[var(--ink-muted)] sm:inline">
            deadlines you can trust
          </span>
        </p>

        <h1 className="cf-rise cf-delay-1 mt-8 max-w-3xl font-serif text-5xl font-normal leading-[1.16] sm:text-6xl lg:text-[64px] lg:leading-[1.2]">
          We connect researchers{" "}
          <span className="italic text-[var(--accent)]">and</span> the venues
          that fit their work
        </h1>

        <p className="cf-rise cf-delay-2 mt-6 max-w-xl text-lg leading-7 text-[var(--ink-muted)]">
          Search calls for papers and journal listings by topic, deadline,
          location, publisher and indexing — compiled by hand, published in one
          place.
        </p>

        <div className="cf-rise cf-delay-3 mt-9 flex flex-wrap items-center justify-center gap-3">
          <ButtonLink href="/search">
            Search listings
            <ArrowRight size={16} aria-hidden="true" />
          </ButtonLink>
          <ButtonLink href="/conferences" variant="navy">
            Browse conferences
          </ButtonLink>
          <ButtonLink href="/journals" variant="secondary">
            Browse journals
          </ButtonLink>
        </div>

        <Squiggle className="cf-rise cf-delay-3 mt-10" />

        {closing.length > 0 ? (
          <div className="cf-rise cf-delay-4 mt-10 w-full max-w-xl rounded-xl border border-[var(--rule)] bg-[var(--surface)] p-5 text-left">
            <h2 className="eyebrow font-mono text-xs">Closing next</h2>

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
                    <span className="tnum mt-1 block font-mono text-xs text-[var(--ink-subtle)]">
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
