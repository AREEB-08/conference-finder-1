# Setup guide — Supabase, Google OAuth, Sheets, Groq, Vercel

Everything the site needs, in the order you should set it up. Local dev works
with **zero configuration** (sample data, no sign-in); each section below
unlocks one feature.

---

## 1. Supabase (accounts, profiles, Google sign-in)

### 1.1 Create the project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Pick any name (e.g. `conference-finder`), a strong database password
   (store it somewhere safe — you rarely need it again), and a region close
   to your users.
3. Wait ~2 minutes for provisioning.

### 1.2 Get the API keys

1. In the project dashboard: **Project Settings → API Keys**.
2. Copy two values into `.env.local` (and later into Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<the anon / publishable key>
```

> These two are safe to expose publicly. Security comes from Row Level
> Security in the database, not from hiding this key. Never copy the
> `service_role` key into this app — it is not needed anywhere.

### 1.3 Create the database schema

1. Dashboard → **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql)
   and click **Run**.

This creates the `profiles` table with:

- a **unique username** column enforcing `^[a-z0-9_]{3,20}$` at the database
  level (lowercase letters, numbers, underscore),
- Row Level Security: anyone can read profiles, only the owner can write,
- a **trigger that inserts a profile row automatically on signup**, seeded
  with the name and avatar Google provides.

---

## 2. Google OAuth (the "Continue with Google" button)

Supabase brokers the OAuth flow; you create the credentials in Google Cloud
and paste them into Supabase.

### 2.1 Create the Google credentials

1. Go to [console.cloud.google.com](https://console.cloud.google.com) →
   create (or select) a project.
2. **APIs & Services → OAuth consent screen**:
   - User type: **External**, click **Create**.
   - Fill in app name (`Conference Finder`), support email, developer email.
     Save through the remaining steps (scopes and test users can stay
     default; the basic `email`/`profile`/`openid` scopes are automatic).
   - When you are ready for anyone to sign in, click **Publish app**.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**:
   - Application type: **Web application**.
   - Name: `Conference Finder (Supabase)`.
   - **Authorized JavaScript origins**: add
     - `http://localhost:3000`
     - your production URL later, e.g. `https://your-app.vercel.app`
   - **Authorized redirect URIs**: add exactly one —
     - `https://<your-ref>.supabase.co/auth/v1/callback`
     (shown verbatim in the Supabase dashboard in the next step).
4. Click **Create** and keep the **Client ID** and **Client secret** visible.

### 2.2 Enable Google in Supabase

1. Supabase dashboard → **Authentication → Sign In / Providers → Google**.
2. Toggle **Enable**, paste the **Client ID** and **Client secret**, save.
   (This page also displays the exact callback URL used in step 2.1.)

### 2.3 Set the redirect URLs in Supabase

1. **Authentication → URL Configuration**:
   - **Site URL**: `http://localhost:3000` while developing; change to the
     production URL after deploying.
   - **Redirect URLs**: add both
     - `http://localhost:3000/auth/callback`
     - `https://your-app.vercel.app/auth/callback` (after deploy)

### 2.4 Test it

Restart `npm run dev`, open `http://localhost:3000/login`, click
**Continue with Google**. After consenting you should land on `/profile`,
and a row should appear in **Table Editor → profiles**.

---

## 3. How the app uses Supabase (for reference)

- `lib/supabase/client.ts` — browser client (login button, availability check)
- `lib/supabase/server.ts` — server client bound to request cookies
- `proxy.ts` — Next.js 16 proxy (middleware) that refreshes expired sessions
- `app/auth/callback/route.ts` — exchanges the OAuth code for a session
- `app/profile` — own profile editor with live username availability
- `app/u/[username]` — public researcher profile
- Usernames: **lowercase letters, numbers and `_`, 3–20 chars** — validated
  in the form, in the server action, and by a database CHECK constraint.

Without the two env vars the whole feature degrades gracefully: the site
builds, listings work, and `/login` explains what is missing.

---

## 4. Google Sheets (the conference/journal data)

Already configured in this repo via an Apps Script URL. Two options:

- **Option A — Apps Script (in use)**: a web app deployed on the spreadsheet
  returns JSON; its `/exec` URL goes in `GOOGLE_SHEETS_API_URL`. The script
  source is in `docs/apps-script.gs`.
- **Option B — Service account (for private sheets)**: enable the Google
  Sheets API in Google Cloud, create a service account, download the JSON
  key, share the sheet with the service account email as Viewer, and set
  `GOOGLE_SHEETS_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`.

Without either, the site serves the bundled sample rows and shows a
"Sample data" banner.

---

## 5. Groq (optional AI assistant)

1. Get a key at [console.groq.com/keys](https://console.groq.com/keys).
2. Set `GROQ_API_KEY` in `.env.local` / Vercel.
3. Without a key the assistant button simply does not render.

---

## 6. Vercel deployment

1. Push the repository to GitHub.
2. [vercel.com](https://vercel.com) → **Add New → Project** → import the
   repo. Next.js is detected automatically.
3. **Settings → Environment Variables** — add, for Production (and Preview
   if you like):

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | from Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase |
   | `GOOGLE_SHEETS_API_URL` | your Apps Script `/exec` URL |
   | `GROQ_API_KEY` | optional |

4. Deploy. Then finish the auth loop:
   - Supabase **Authentication → URL Configuration**: set Site URL to the
     production URL and add `https://<prod-url>/auth/callback` to Redirect
     URLs.
   - Google Cloud **Credentials**: add the production URL to Authorized
     JavaScript origins.

Or use the CLI: `npx vercel` (link the project), `npx vercel env add`,
`npx vercel --prod`.
