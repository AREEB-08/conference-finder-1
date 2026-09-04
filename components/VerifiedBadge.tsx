import { BadgeCheck } from "lucide-react";
import Badge from "@/components/ui/Badge";

/**
 * Shown only when the spreadsheet's `verified` column is true. The tooltip is
 * explicit that this means the maintainers checked the record, not that any
 * external body certified it.
 */
export default function VerifiedBadge({ verified }: { verified: boolean }) {
  if (!verified) return null;

  return (
    <Badge
      tone="accent"
      title="Marked as checked by the people who maintain this list"
    >
      <BadgeCheck size={12} aria-hidden="true" />
      Checked
    </Badge>
  );
}
