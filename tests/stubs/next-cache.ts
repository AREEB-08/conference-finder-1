/**
 * Test stub for `next/cache`.
 *
 * `unstable_cache` needs Next's incremental cache context, which only exists
 * inside a running Next server. Making it a pass-through lets the tests
 * exercise the real exported data functions rather than a parallel code path.
 * Caching behaviour itself is Next's responsibility, not this app's.
 */
export function unstable_cache<Args extends unknown[], Result>(
  fn: (...args: Args) => Promise<Result>,
): (...args: Args) => Promise<Result> {
  return fn;
}

export function revalidateTag(): void {}
export function revalidatePath(): void {}
