/** Card-shaped skeletons so the layout does not jump when results arrive. */
export function CardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading results"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="h-56 rounded border border-[var(--rule)] bg-[var(--surface)] p-5"
        >
          <div className="cf-skeleton h-5 w-24 rounded" />
          <div className="cf-skeleton mt-4 h-4 w-full rounded" />
          <div className="cf-skeleton mt-2 h-4 w-3/4 rounded" />
          <div className="cf-skeleton mt-6 h-4 w-1/2 rounded" />
          <div className="cf-skeleton mt-2 h-4 w-2/3 rounded" />
        </div>
      ))}
      <span className="sr-only">Loading</span>
    </div>
  );
}

export function LineSkeleton({ className = "h-4 w-40" }: { className?: string }) {
  return <div className={`cf-skeleton rounded ${className}`} />;
}
