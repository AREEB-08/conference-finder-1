import CountUp from "./CountUp";
import Reveal from "./Reveal";

/**
 * Stat banner strip per DESIGN.md: a full-width bordered strip of uppercase
 * mono stats separated by pipes. Every figure is computed from the live
 * dataset — nothing is a rounded-up marketing number.
 */
export default function LandingStats({
  stats,
}: {
  stats: { label: string; value: number; hint?: string }[];
}) {
  return (
    <section className="border-y border-[var(--rule)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <dl className="flex flex-wrap items-center justify-center gap-y-3 font-mono text-sm uppercase tracking-[0.038em] text-[var(--ink)]">
          {stats.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={index * 70}
              className="flex items-center"
            >
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="mx-4 text-[var(--rule-strong)] sm:mx-6"
                >
                  |
                </span>
              ) : null}
              <div className="whitespace-nowrap">
                <dd className="inline font-semibold text-[var(--accent)]">
                  <CountUp value={stat.value} />
                </dd>{" "}
                <dt className="inline text-[var(--ink-muted)]">{stat.label}</dt>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
