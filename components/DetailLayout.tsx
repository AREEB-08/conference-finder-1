import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";

import { ButtonLink } from "@/components/ui/Button";
import { hostOf } from "@/lib/utils";

/** Definition row used on both detail pages. Renders nothing when empty. */
export function DetailRow({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  if (!children && !value?.trim()) return null;

  return (
    <div className="grid gap-1 border-b border-[var(--rule)] py-3 last:border-0 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-sm text-[var(--ink-subtle)]">{label}</dt>
      <dd className="text-sm leading-6 text-[var(--ink)]">
        {children ?? value}
      </dd>
    </div>
  );
}

export function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xl">{title}</h2>
      <dl className="mt-3">{children}</dl>
    </section>
  );
}

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
    >
      <ArrowLeft size={15} aria-hidden="true" />
      {label}
    </Link>
  );
}

/**
 * The official-website button. Rendered only when the sheet contained a real
 * http(s) URL, so a title pasted into the link column never becomes a dead
 * button.
 */
export function OfficialSiteButton({
  url,
  label = "Visit official website",
}: {
  url: string;
  label?: string;
}) {
  if (!url) return null;

  const host = hostOf(url);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonLink href={url} external>
        {label}
        <ExternalLink size={15} aria-hidden="true" />
      </ButtonLink>
      {host ? (
        <span className="text-sm text-[var(--ink-subtle)]">{host}</span>
      ) : null}
    </div>
  );
}
