import CountUp from "./CountUp";
import Reveal from "./Reveal";

/**
 * Headline figures, every one computed from the live dataset. Nothing here is
 * a rounded-up marketing number, so the strip stays honest even when the list
 * is small.
 */
export default function LandingStats({
  stats,
}: {
  stats: { label: string; value: number; hint?: string }[];
}) {
  return (
    <section className="border-y border-[var(--rule)] bg-[var(--surface)]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <dl className="grid grid-cols-2 gap-px bg-[var(--rule)] sm:grid-cols-4">
          {stats.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={index * 70}
              className="bg-[var(--surface)] px-4 py-7"
            >
              <dd className="font-serif text-3xl leading-none text-[var(--accent)] sm:text-4xl">
                <CountUp value={stat.value} />
              </dd>
              <dt className="mt-2 text-sm text-[var(--ink)]">{stat.label}</dt>
              {stat.hint ? (
                <p className="mt-1 text-xs text-[var(--ink-subtle)]">
                  {stat.hint}
                </p>
              ) : null}
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
