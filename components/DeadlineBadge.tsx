import { CalendarClock } from "lucide-react";

import Badge, { type BadgeTone } from "@/components/ui/Badge";
import { formatIsoDate, getDeadlineInfo } from "@/lib/dates";
import type { DeadlineStatus } from "@/types/conference";

const toneFor: Record<DeadlineStatus, BadgeTone> = {
  open: "open",
  soon: "soon",
  urgent: "urgent",
  today: "urgent",
  passed: "closed",
  unknown: "neutral",
};

/**
 * Shows how long is left to submit. Renders "Deadline not listed" rather than a
 * countdown when the sheet's date could not be parsed, so no misleading number
 * is ever displayed.
 */
export default function DeadlineBadge({
  isoDate,
  showIcon = true,
  className,
}: {
  isoDate: string | null;
  showIcon?: boolean;
  className?: string;
}) {
  const info = getDeadlineInfo(isoDate);
  const formatted = formatIsoDate(info.isoDate);

  return (
    <Badge
      tone={toneFor[info.status]}
      className={className}
      title={formatted ? `Submission deadline: ${formatted}` : undefined}
    >
      {showIcon ? <CalendarClock size={12} aria-hidden="true" /> : null}
      <span className="tnum">{info.label}</span>
    </Badge>
  );
}
