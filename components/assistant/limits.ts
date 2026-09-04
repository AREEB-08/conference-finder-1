/**
 * Shared client/server limits.
 *
 * Kept in its own module so the client component can import the number without
 * pulling in `lib/ai.ts`, which is server-only and holds the API key logic.
 * The server re-validates every value; this is only for the input's maxLength.
 */
export const MAX_MESSAGE_LENGTH = 1_000;
