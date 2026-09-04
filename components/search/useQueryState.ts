"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * Reads and writes filter state through the URL.
 *
 * Keeping filters in the query string is what makes a search shareable, gives
 * the back button sensible behaviour, and lets the server do the filtering.
 * Any change resets to page 1, because staying on page 4 of a different result
 * set is never what someone means.
 */
export function useQueryState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const get = useCallback(
    (key: string, fallback = "") => searchParams.get(key) ?? fallback,
    [searchParams],
  );

  const buildQuery = useCallback(
    (updates: Record<string, string | number | boolean | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        const next =
          value === null || value === false || value === "" ? "" : String(value);

        if (!next) {
          params.delete(key);
        } else {
          params.set(key, next);
        }
      }

      if (!("page" in updates)) params.delete("page");

      const query = params.toString();
      return query ? `${pathname}?${query}` : pathname;
    },
    [pathname, searchParams],
  );

  const setParams = useCallback(
    (updates: Record<string, string | number | boolean | null>) => {
      // `scroll: false` keeps the user's place in a long result list.
      router.replace(buildQuery(updates), { scroll: false });
    },
    [buildQuery, router],
  );

  return { get, setParams, buildQuery, searchParams };
}
