import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone =
  | "neutral"
  | "accent"
  | "open"
  | "soon"
  | "urgent"
  | "closed";

const toneStyles: Record<BadgeTone, string> = {
  neutral:
    "border-[var(--rule)] bg-[var(--surface-sunken)] text-[var(--ink-muted)]",
  accent:
    "border-[var(--accent-line)] bg-[var(--accent-wash)] text-[var(--accent)]",
  open: "border-[var(--state-open-line)] bg-[var(--state-open-wash)] text-[var(--state-open)]",
  soon: "border-[var(--state-soon-line)] bg-[var(--state-soon-wash)] text-[var(--state-soon)]",
  urgent:
    "border-[var(--state-urgent-line)] bg-[var(--state-urgent-wash)] text-[var(--state-urgent)]",
  closed:
    "border-[var(--state-closed-line)] bg-[var(--state-closed-wash)] text-[var(--state-closed)]",
};

export default function Badge({
  children,
  tone = "neutral",
  className,
  title,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
