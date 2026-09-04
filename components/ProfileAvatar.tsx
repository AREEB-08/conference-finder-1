"use client";

import Image from "next/image";
import { useState } from "react";

import { cn, initials } from "@/lib/utils";

/**
 * Profile image with an initials fallback. The fallback covers both "no image
 * configured yet" and "the configured file is missing", so a placeholder path
 * in config never renders a broken image icon.
 */
export default function ProfileAvatar({
  src,
  name,
  size = 96,
  className,
}: {
  src: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  const shared = cn(
    "shrink-0 overflow-hidden rounded border border-[var(--rule)] bg-[var(--surface-sunken)]",
    className,
  );

  if (!src || failed) {
    return (
      <div
        className={cn(
          shared,
          "flex items-center justify-center font-serif text-[var(--ink-subtle)]",
        )}
        style={{ width: size, height: size, fontSize: size / 3 }}
        aria-hidden="true"
      >
        {initials(name)}
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={`Photograph of ${name}`}
      width={size}
      height={size}
      className={cn(shared, "object-cover")}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  );
}
