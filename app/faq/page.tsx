import type { Metadata } from "next";

import { REVALIDATE_SECONDS } from "@/lib/data";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "How records are collected, how often the listings update, what the checked badge means, and how to suggest a conference or journal.",
  alternates: { canonical: "/faq" },
};

export default function FaqPage() {
  const minutes = Math.round(REVALIDATE_SECONDS / 60);

  const questions = [
    {
      q: "Where does this data come from?",
      a: `Every record is typed by hand into a Google spreadsheet from the organiser's or publisher's own announcement. The site reads that spreadsheet; there is no automatic scraping.`,
    },
    {
      q: "How quickly do updates appear?",
      a: `The site caches the spreadsheet for about ${minutes} minutes. After that window the next visitor triggers a fresh read, so an edit shows up within roughly ${minutes} minutes rather than instantly.`,
    },
    {
      q: "What does the checked badge mean?",
      a: "It means one of the maintainers opened the official site and confirmed the record on the date shown. It is not an endorsement, a ranking, or any form of external accreditation.",
    },
    {
      q: "Why does a conference show no deadline?",
      a: "Some entries record a deadline as prose rather than a date, or have no date announced yet. Rather than guess at a countdown, the site says the deadline is not listed and shows the original text on the detail page.",
    },
    {
      q: "Is this every conference and journal?",
      a: "No. It is a curated list focused on the areas the maintainers work in. Treat it as a starting point and always confirm details at the source before submitting.",
    },
    {
      q: "Can I suggest something to add?",
      a: "Yes — contact any of the maintainers listed on the About page with a link to the official call for papers or journal homepage.",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="border-b border-[var(--rule)] pb-8">
        <h1 className="text-3xl">Questions</h1>
      </header>

      <dl className="mt-8 space-y-8">
        {questions.map((item) => (
          <div key={item.q}>
            <dt className="font-serif text-lg font-semibold">{item.q}</dt>
            <dd className="mt-2 max-w-2xl leading-7 text-[var(--ink-muted)]">
              {item.a}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
