"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.93-2.92l-3.87-3c-1.07.72-2.44 1.15-4.06 1.15-3.12 0-5.77-2.11-6.71-4.95H1.29v3.1A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.29 14.28A7.2 7.2 0 0 1 4.91 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l4-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44A11.97 11.97 0 0 0 12 0 12 12 0 0 0 1.29 6.62l4 3.1C6.23 6.88 8.88 4.77 12 4.77z"
      />
    </svg>
  );
}

export default function GoogleSignInButton({ next = "/profile" }: { next?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const signIn = async () => {
    const supabase = createClient();
    if (!supabase) {
      setError("Sign-in is not configured yet. Add the Supabase environment variables.");
      return;
    }

    setPending(true);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });

    if (authError) {
      setError("Could not start Google sign-in. Please try again.");
      setPending(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[var(--rule-strong)] bg-[var(--surface)] px-6 text-base font-medium text-[var(--ink)] transition-colors hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-55"
      >
        <GoogleIcon />
        {pending ? "Redirecting to Google…" : "Continue with Google"}
      </button>

      {error ? (
        <p className="mt-3 rounded-lg border border-[var(--state-urgent-line)] bg-[var(--state-urgent-wash)] px-3 py-2 text-sm text-[var(--state-urgent)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
