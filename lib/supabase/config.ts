/**
 * Supabase configuration flags, safe to import anywhere (no server-only APIs).
 *
 * The whole auth feature degrades gracefully: with no Supabase env vars the
 * site builds and runs, the login page explains what is missing, and the
 * navbar simply shows the sign-in buttons.
 */

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ??
    ""
  );
}

export function isSupabaseConfigured(): boolean {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}

/** Username rules: 3-20 chars, lowercase letters, digits and underscore. */
export const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export function isValidUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}
