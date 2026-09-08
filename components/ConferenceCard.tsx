import Link from "next/link";
import { Building2, MapPin } from "lucide-react";

import DeadlineBadge from "@/components/DeadlineBadge";
import ModeBadge from "@/components/ModeBadge";
import VerifiedBadge from "@/components/VerifiedBadge";
import Badge from "@/components/ui/Badge";
import { formatIsoDate } from "@/lib/dates";
import { truncate } from "@/lib/utils";
import type { Conference } from "@/types/conference";

/**
 * The scanning unit of the whole site. Information order matches how someone
 * triages a call for papers: what it is, who runs it, where, and by when.
 */
export default function ConferenceCard({
  conference,
}: {
  conference: Conference;
}) {
  const deadlineDate = formatIsoDate(conference.submissionDeadlineDate);
  const visibleTopics = conference.topics.slice(0, 3);
  const remainingTopics = conference.topics.length - visibleTopics.length;

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-[var(--rule)] bg-[var(--surface)] p-6 transition-colors hover:border-[var(--rule-strong)]">
      <div className="flex flex-wrap items-center gap-2">
        <DeadlineBadge isoDate={conference.submissionDeadlineDate} />
        <ModeBadge mode={conference.modeKind} title={conference.mode} />
        <VerifiedBadge verified={conference.verified} />
      </div>

      <h3 className="mt-3 text-base leading-6">
        <Link
          href={`/conference/${conference.id}`}
          // The stretched link makes the whole card clickable while keeping a
          // single, correctly-labelled tab stop for keyboard users.
          className="after:absolute after:inset-0 after:content-[''] hover:text-[var(--accent)]"
        >
          {truncate(conference.name, 110)}
        </Link>
      </h3>

      {conference.acronym && conference.acronym !== conference.name ? (
        <p className="mt-1 text-sm text-[var(--ink-subtle)]">
          {conference.acronym}
        </p>
      ) : null}

      <dl className="mt-4 space-y-2 text-sm text-[var(--ink-muted)]">
        {conference.organizer ? (
          <div className="flex items-start gap-2">
            <dt className="sr-only">Organiser</dt>
            <Building2
              size={14}
              className="mt-0.5 shrink-0 text-[var(--ink-subtle)]"
              aria-hidden="true"
            />
            <dd>{truncate(conference.organizer, 60)}</dd>
          </div>
        ) : null}

        {conference.place ? (
          <div className="flex items-start gap-2">
            <dt className="sr-only">Location</dt>
            <MapPin
              size={14}
              className="mt-0.5 shrink-0 text-[var(--ink-subtle)]"
              aria-hidden="true"
            />
            <dd>{truncate(conference.place, 70)}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-auto pt-4">
        {visibleTopics.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5">
            {visibleTopics.map((topic) => (
              <li key={topic}>
                <Badge tone="neutral">{truncate(topic, 28)}</Badge>
              </li>
            ))}
            {remainingTopics > 0 ? (
              <li>
                <Badge tone="neutral">+{remainingTopics}</Badge>
              </li>
            ) : null}
          </ul>
        ) : null}

        <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-[var(--rule)] pt-3 text-sm">
          <span className="text-[var(--ink-subtle)]">Submission</span>
          <span className="tnum text-right text-[var(--ink)]">
            {deadlineDate || truncate(conference.submissionDeadline, 28) || "Not listed"}
          </span>
        </div>
      </div>
    </article>
  );
}
