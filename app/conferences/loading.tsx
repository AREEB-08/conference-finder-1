import { CardGridSkeleton } from "@/components/LoadingState";

/**
 * Skeleton for the listing routes only.
 *
 * This deliberately does not live at the app root: a root-level loading.js
 * wraps every route in a Suspense boundary, which makes all responses streamed.
 * Once a response streams, its HTTP status is already committed as 200 and
 * `notFound()` can no longer return a real 404.
 */
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="cf-skeleton h-9 w-56 rounded" />
      <div className="cf-skeleton mt-3 h-4 w-96 max-w-full rounded" />
      <div className="mt-8">
        <CardGridSkeleton />
      </div>
    </div>
  );
}
