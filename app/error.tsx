"use client";

import { useEffect } from "react";

import { Button, ButtonLink } from "@/components/ui/Button";

/**
 * Route error boundary. Shows what the user can do, never the stack trace —
 * the underlying error can contain spreadsheet or configuration detail.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // The digest is a server-side lookup key, safe to surface in the console.
    console.error("Page failed to render", error.digest);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl">Something went wrong</h1>
      <p className="mt-3 leading-7 text-[var(--ink-muted)]">
        This page could not load. The listings are read from a spreadsheet, so
        this is usually a temporary connection problem.
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <ButtonLink href="/" variant="secondary">
          Go home
        </ButtonLink>
      </div>
    </div>
  );
}
