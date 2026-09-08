/**
 * A short strip of counts derived from the data on screen.
 *
 * Every figure is computed from the spreadsheet, never hardcoded. If a value
 * cannot be derived it is left out rather than shown as zero, so the strip
 * never implies a fact the data does not support.
 */
export default function ListingStats({
  stats,
}: {
  stats: { label: string; value: string | number; hint?: string }[];
}) {
  const shown = stats.filter((stat) => stat.value !== "" && stat.value !== null);
  if (shown.length === 0) return null;

  return (
    <dl className="mb-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[var(--rule)] bg-[var(--rule)] sm:grid-cols-4">
      {shown.map((stat) => (
        <div key={stat.label} className="bg-[var(--surface)] px-4 py-3.5">
          <dt className="text-xs text-[var(--ink-subtle)]">{stat.label}</dt>
          <dd className="tnum mt-1 font-serif text-2xl leading-none text-[var(--ink)]">
            {stat.value}
          </dd>
          {stat.hint ? (
            <p className="mt-1.5 text-xs text-[var(--ink-subtle)]">{stat.hint}</p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}
