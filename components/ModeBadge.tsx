import { Globe, MapPin, MonitorSmartphone } from "lucide-react";

import Badge from "@/components/ui/Badge";
import type { ConferenceMode } from "@/types/conference";

const icons = {
  "In-person": MapPin,
  Online: Globe,
  Hybrid: MonitorSmartphone,
  Unspecified: MapPin,
} as const;

/** Participation mode. Renders nothing when the sheet did not state one. */
export default function ModeBadge({
  mode,
  title,
}: {
  mode: ConferenceMode;
  title?: string;
}) {
  if (mode === "Unspecified") return null;

  const Icon = icons[mode];

  return (
    <Badge tone="neutral" title={title}>
      <Icon size={12} aria-hidden="true" />
      {mode}
    </Badge>
  );
}
