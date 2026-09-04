import Link from "next/link";
import Badge from "@/components/ui/Badge";

/**
 * A research topic. When `href` is given the badge becomes a link that runs the
 * corresponding search, which is how most topic browsing starts.
 */
export default function TopicBadge({
  topic,
  href,
}: {
  topic: string;
  href?: string;
}) {
  if (!topic.trim()) return null;

  if (!href) return <Badge tone="neutral">{topic}</Badge>;

  return (
    <Link href={href} className="rounded">
      <Badge
        tone="neutral"
        className="transition-colors hover:border-[var(--accent-line)] hover:bg-[var(--accent-wash)] hover:text-[var(--accent)]"
      >
        {topic}
      </Badge>
    </Link>
  );
}
