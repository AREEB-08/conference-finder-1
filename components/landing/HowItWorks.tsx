import { FileSearch, ListFilter, Table2 } from "lucide-react";

import Reveal from "./Reveal";
import { REVALIDATE_SECONDS } from "@/lib/data";

/**
 * Explains the actual mechanism rather than making marketing claims. Anyone
 * deciding whether to trust these listings deserves to know a person typed
 * them in and how stale they might be.
 */
export default function HowItWorks() {
  const minutes = Math.round(REVALIDATE_SECONDS / 60);

  const steps = [
    {
      Icon: Table2,
      title: "Maintained in a spreadsheet",
      body: `Each conference and journal is entered by hand from the organiser's own call for papers. No scraping, no automated guesses.`,
    },
    {
      Icon: ListFilter,
      title: "Published automatically",
      body: `The site reads that spreadsheet directly. An edit appears here within about ${minutes} minutes, with nobody touching the code.`,
    },
    {
      Icon: FileSearch,
      title: "Searchable by what matters",
      body: "Filter by deadline, topic, location, indexing, quartile or impact factor. Every search lives in the URL, so you can share it.",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <Reveal>
        <h2 className="text-2xl">How this list works</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--ink-muted)]">
          A small, checked list beats a large, stale one. Here is exactly what
          you are looking at.
        </p>
      </Reveal>

      <ol className="mt-8 grid gap-4 sm:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal
            as="li"
            key={step.title}
            delay={index * 90}
            className="rounded border border-[var(--rule)] bg-[var(--surface)] p-5"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded border border-[var(--accent-line)] bg-[var(--accent-wash)] text-[var(--accent)]">
              <step.Icon size={17} aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">
              {step.body}
            </p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
