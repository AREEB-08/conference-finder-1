"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { AtSign, Check, Loader2, X } from "lucide-react";

import { saveProfile, type SaveProfileState } from "@/app/profile/actions";
import EntrySection from "@/components/profile/EntrySection";
import { parseEntries, sortEntries, type EntryKind, type EntryMap } from "@/lib/profile-entries";
import { USERNAME_PATTERN } from "@/lib/supabase/config";
import type { Profile } from "@/types/profile";
import { cn } from "@/lib/utils";

type Availability = "idle" | "checking" | "available" | "taken" | "invalid";

const inputClass =
  "h-11 w-full rounded-full border border-[var(--rule-strong)] bg-[var(--surface)] px-4 text-base text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:border-[var(--accent)]";

const textareaClass =
  "w-full rounded-xl border border-[var(--rule-strong)] bg-[var(--surface)] px-4 py-3 text-base leading-6 text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:border-[var(--accent)]";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-[var(--ink)]">
        {label}
      </span>
      {children}
      {hint ? (
        <span className="mt-1.5 block text-xs leading-5 text-[var(--ink-subtle)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const initialState: SaveProfileState = { ok: false, message: "" };
  const [state, formAction, pending] = useActionState(saveProfile, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  const [entries, setEntries] = useState<{ [K in EntryKind]: EntryMap[K][] }>(() => ({
    experience: sortEntries(parseEntries("experience", profile.experience)),
    education: sortEntries(parseEntries("education", profile.education)),
    publications: sortEntries(parseEntries("publications", profile.publications)),
  }));

  // Entry edits save immediately, like LinkedIn: commit the new list to the
  // hidden inputs synchronously, then submit the form through the action.
  function updateEntries<K extends EntryKind>(kind: K, next: EntryMap[K][]) {
    flushSync(() => setEntries((current) => ({ ...current, [kind]: next })));
    formRef.current?.requestSubmit();
  }

  const [username, setUsername] = useState(profile.username ?? "");
  // Latest async check result; everything else is derived during render.
  const [checked, setChecked] = useState<{ name: string; available: boolean } | null>(
    null,
  );
  const requestSeq = useRef(0);

  const value = username.trim().toLowerCase();
  let availability: Availability;
  if (!value || value === profile.username) availability = "idle";
  else if (!USERNAME_PATTERN.test(value)) availability = "invalid";
  else if (checked?.name === value)
    availability = checked.available ? "available" : "taken";
  else availability = "checking";

  // Debounced live availability check while the user types a handle.
  useEffect(() => {
    const name = username.trim().toLowerCase();
    if (!name || name === profile.username || !USERNAME_PATTERN.test(name)) return;

    const seq = ++requestSeq.current;
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/username?u=${encodeURIComponent(name)}`);
        const data = (await response.json()) as {
          valid?: boolean;
          available?: boolean;
        };
        if (seq !== requestSeq.current) return;
        setChecked({ name, available: Boolean(data.valid && data.available) });
      } catch {
        // Network hiccup: leave the state as "checking"; the next keystroke
        // or the server-side validation on submit will catch it.
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, profile.username]);

  const availabilityHint: Record<Availability, React.ReactNode> = {
    idle: null,
    checking: (
      <span className="inline-flex items-center gap-1.5 text-[var(--ink-subtle)]">
        <Loader2 size={13} className="animate-spin" aria-hidden="true" />
        Checking…
      </span>
    ),
    available: (
      <span className="inline-flex items-center gap-1.5 text-[var(--state-open)]">
        <Check size={13} aria-hidden="true" />
        Available
      </span>
    ),
    taken: (
      <span className="inline-flex items-center gap-1.5 text-[var(--state-urgent)]">
        <X size={13} aria-hidden="true" />
        Already taken
      </span>
    ),
    invalid: (
      <span className="text-[var(--state-urgent)]">
        3–20 characters: lowercase letters, numbers and _ only
      </span>
    ),
  };

  return (
    <form ref={formRef} action={formAction} className="space-y-6">
      <input type="hidden" name="experience" value={JSON.stringify(entries.experience)} />
      <input type="hidden" name="education" value={JSON.stringify(entries.education)} />
      <input type="hidden" name="publications" value={JSON.stringify(entries.publications)} />

      <section
        id="username"
        className="scroll-mt-24 rounded-2xl border border-[var(--accent-line)] bg-[var(--surface-sunken)] p-5 sm:p-6"
      >
        <p className="eyebrow">Claim your username</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            <div className="relative">
              <AtSign
                size={16}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--ink-subtle)]"
              />
              <input
                name="username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value.toLowerCase())
                }
                placeholder="john_doe"
                maxLength={20}
                autoComplete="off"
                spellCheck={false}
                aria-label="Username"
                className={cn(inputClass, "pl-10 font-mono")}
                aria-describedby="username-status"
              />
            </div>
            <p id="username-status" className="mt-1.5 min-h-5 text-xs" aria-live="polite">
              {availabilityHint[availability]}
            </p>
          </div>
          <p className="text-sm leading-6 text-[var(--ink-subtle)] sm:max-w-56 sm:pt-2">
            Your public page will live at{" "}
            <span className="font-mono text-[var(--ink)]">/u/{username || "john_doe"}</span>
          </p>
        </div>
      </section>

      <section className="space-y-5 rounded-2xl border border-[var(--rule)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="font-serif text-2xl">About you</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name">
            <input
              name="full_name"
              defaultValue={profile.full_name ?? ""}
              placeholder="John Doe"
              maxLength={200}
              className={inputClass}
            />
          </Field>
          <Field label="Website" hint="Personal site, Google Scholar, ORCID…">
            <input
              name="website"
              defaultValue={profile.website ?? ""}
              placeholder="https://example.com"
              maxLength={200}
              className={inputClass}
            />
          </Field>
          <Field label="LinkedIn">
            <input
              name="linkedin"
              defaultValue={profile.linkedin ?? ""}
              placeholder="https://linkedin.com/in/john-doe"
              maxLength={200}
              className={inputClass}
            />
          </Field>
          <Field label="GitHub">
            <input
              name="github"
              defaultValue={profile.github ?? ""}
              placeholder="https://github.com/johndoe"
              maxLength={200}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Bio" hint="A sentence or two about your research interests.">
          <textarea
            name="bio"
            defaultValue={profile.bio ?? ""}
            rows={3}
            maxLength={2000}
            placeholder="PhD student working on…"
            className={textareaClass}
          />
        </Field>
      </section>

      <EntrySection
        kind="experience"
        entries={entries.experience}
        onChange={(next) => updateEntries("experience", next)}
      />
      <EntrySection
        kind="education"
        entries={entries.education}
        onChange={(next) => updateEntries("education", next)}
      />
      <EntrySection
        kind="publications"
        entries={entries.publications}
        onChange={(next) => updateEntries("publications", next)}
      />

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-4 rounded-full border border-[var(--rule-strong)] bg-[var(--surface)]/95 py-2 pl-2 pr-5 shadow-lg shadow-black/5 backdrop-blur">
        <button
          type="submit"
          disabled={pending || availability === "taken" || availability === "invalid"}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 text-sm font-medium text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-55"
        >
          {pending ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              Saving…
            </>
          ) : (
            "Save profile"
          )}
        </button>

        {state.message ? (
          <p
            aria-live="polite"
            className={cn(
              "text-sm",
              state.ok ? "text-[var(--state-open)]" : "text-[var(--state-urgent)]",
            )}
          >
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
