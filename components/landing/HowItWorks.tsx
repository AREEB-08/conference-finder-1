import { Check } from "lucide-react";

import Reveal from "./Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { REVALIDATE_SECONDS } from "@/lib/data";

/**
 * Two-column feature cards on mint surfaces (DESIGN.md "Feature Card").
 * Explains the actual mechanism rather than making marketing claims.
 */
export default function HowItWorks() {
  const minutes = Math.round(REVALIDATE_SECONDS / 60);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-22">
      <Reveal className="text-center">
        <p className="eyebrow justify-center">How it works</p>
        <h2 className="mx-auto mt-3 max-w-2xl font-serif text-4xl font-normal leading-[1.2] sm:text-[44px]">
          A research index that stays honest
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-[var(--ink-muted)]">
          A small, checked list beats a large, stale one. Here is exactly what
          you are looking at.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <Reveal className="rounded-xl bg-[var(--surface-sunken)] p-8">
          <p className="eyebrow">Conferences</p>
          <h3 className="mt-3 font-serif text-2xl font-normal leading-snug sm:text-3xl">
            Find the right call for papers, fast
          </h3>
          <ul className="mt-5 space-y-2.5">
            {[
              "Deadline-first sorting with honest countdown badges",
              "Filter by country, city, mode, topic, organiser and year",
              `Entered by hand from the organiser's own call — no scraping`,
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-base leading-6">
                <Check
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[var(--pine)]"
                  strokeWidth={3}
                />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <ButtonLink href="/conferences">Explore conferences</ButtonLink>
          </div>
        </Reveal>

        <Reveal delay={90} className="rounded-xl bg-[var(--blush)] p-8">
          <p className="eyebrow">Journals</p>
          <h3 className="mt-3 font-serif text-2xl font-normal leading-snug sm:text-3xl">
            Match your paper to the right journal
          </h3>
          <ul className="mt-5 space-y-2.5">
            {[
              "Filter by publisher, subject, indexing, quartile and access model",
              "Impact factors parsed from the sheet, shown with their full text",
              `Edits to the spreadsheet appear here within about ${minutes} minutes`,
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-base leading-6">
                <Check
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-[var(--pine)]"
                  strokeWidth={3}
                />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-7">
            <ButtonLink href="/journals" variant="navy">
              Explore journals
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
