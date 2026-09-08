import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

/**
 * Empty results are a moment for direction, not an apology: say what happened
 * and offer the next action.
 */
export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--rule-strong)] bg-[var(--surface)] px-6 py-14 text-center">
      <SearchX
        size={22}
        className="mx-auto text-[var(--ink-subtle)]"
        aria-hidden="true"
      />
      <h3 className="mt-3 text-base">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--ink-muted)]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
