# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

Next.js 16 (App Router, React 19, Turbopack), TypeScript strict, Tailwind v4. Consult `node_modules/next/dist/docs/` before using Next APIs — e.g. `middleware.ts` is now `proxy.ts` (exported `proxy` function), `params`/`searchParams` are Promises, and `revalidateTag(tag, "max")` takes a second argument.

## Commands

```bash
npm run dev          # dev server on :3000 — works with zero env config (sample data)
npm run build
npm run lint         # eslint
npm run typecheck    # tsc --noEmit
npm test             # vitest run (all suites in tests/)
npx vitest run tests/dates.test.ts          # single file
npx vitest run -t "parses Excel serial"     # single test by name
```

CI (`.github/workflows/ci.yml`) runs lint → typecheck → test → build on Node 22 with no secrets; the build must succeed against the bundled sample data.

## Architecture

A Google Sheet is the source of truth (tab `Sheet1` = conferences, `Sheet2` = journals). There is no database for listings.

**Data pipeline** — `lib/sheets/client.ts` → `lib/sheets/rows.ts` → `lib/sheets/mappers.ts` → `lib/data.ts`:
- `client.ts` picks an adapter: service account (`GOOGLE_SHEETS_ID` + email + key, wins if set) or Apps Script URL (`GOOGLE_SHEETS_API_URL`, `?sheet=conferences|journals`; `docs/apps-script.gs` is the script). `rowsFromApiPayload` tolerates several JSON payload shapes.
- `mappers.ts` turns raw rows into `Conference`/`Journal` (`types/`). Headers are matched via alias lists (live sheet uses `CONFERENCE NAME` etc.; lowercase names like `name` also work) — never assume a column exists. Malformed rows are skipped, not fatal. IDs are slugs derived from names (`slugify`/`uniqueSlug`).
- Parsing helpers: `lib/dates.ts` (ISO, Excel serials, ranges, prose, numeric with `SHEET_DATE_ORDER` DMY/MDY; unparseable → null → "Deadline not listed", never guessed) and `lib/parse.ts` (lists, ISSN pairs, indexing, impact factor, quartile, place).
- `lib/data.ts` wraps loaders in `unstable_cache` with tag `sheets-data` and `SHEETS_REVALIDATE_SECONDS` (default 600). With no Sheets config it serves `data/sample-*.ts` and returns `status.isFallback` so `DataSourceNotice` shows a "Sample data" banner. On fetch failure it falls back in dev but **throws in production** (deliberate: broken connection must be visible). `POST /api/revalidate` (Bearer `REVALIDATE_SECRET`) busts the tag.

**Search** — `lib/search.ts` holds pure filter/sort/facet/paginate functions plus `parseConferenceParams`/`parseJournalParams` that clamp and allow-list URL params. Server pages (`app/search`, `app/conferences`, `app/journals`) and the JSON APIs (`app/api/conferences`, `app/api/journals`) share them. All filter state lives in the URL; client components write it via `components/search/useQueryState.ts` (any change resets `page`).

**Server-only boundaries** — `lib/data.ts`, `lib/sheets/client.ts`, `lib/ai.ts` import `server-only`. In tests, `vitest.config.ts` aliases `server-only` and `next/cache` to no-op stubs in `tests/stubs/` so the real data functions run; add new stubs there rather than mocking per test.

**Auth & profiles (optional)** — Supabase via `@supabase/ssr`. `lib/supabase/{client,server,config}.ts`; `proxy.ts` refreshes the session cookie on every request. Google OAuth callback at `app/auth/callback`. Profiles (`profiles` table, RLS, signup trigger) are defined in `supabase/schema.sql`; editing is a server action in `app/profile/actions.ts`, public pages at `app/u/[username]`, username rule `^[a-z0-9_]{3,20}$` (`USERNAME_PATTERN`, also enforced in SQL). Every Supabase path must degrade gracefully when `isSupabaseConfigured()` is false (`createClient()` returns null). Full setup in `SETUP.md`.

**AI assistant (optional)** — `lib/ai.ts` proxies to Groq; `/api/ai` (POST) and `/api/ai/status` (GET). Without `GROQ_API_KEY` the UI doesn't render and the route returns 503. The key must never appear in URLs, bodies, or error messages — `tests/api.test.ts` asserts this.

**Rate limiting** — `lib/rate-limit.ts` is in-memory, per instance (AI 12/min, listing APIs 60/min, revalidate 10/min).

## Constraints to preserve

- Env vars are server-only except `NEXT_PUBLIC_SITE_URL` and the Supabase URL/anon key. Never add a secret with `NEXT_PUBLIC_`.
- `next.config.ts` sets a strict CSP. Adding an external origin (images, fetches, fonts) requires updating it. `script-src 'unsafe-inline'` is intentional — nonces would force dynamic rendering and break caching.
- Fonts are self-hosted from npm (`@fontsource*`), not `next/font/google`.
- Spreadsheet URLs are untrusted: route them through `safeExternalUrl` (http/https only).
- API errors stay generic; never forward upstream error bodies or stack traces.
- Visual design follows `DESIGN.md` (warm paper canvas, deep-teal/navy pill buttons, serif headlines, mono uppercase eyebrows, hand-drawn illustrations in `components/illustrations/`). Tokens live at the top of `app/globals.css`.
- `scripts/strip-coauthor.ps1` rewrites local commits to remove `Co-authored-by: Cursor` trailers before pushing.
