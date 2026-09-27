"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  Briefcase,
  ExternalLink,
  GraduationCap,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  MONTHS,
  newEntryId,
  sortEntries,
  summarizeEntry,
  type EntryKind,
  type EntryMap,
  type YearMonth,
} from "@/lib/profile-entries";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------------ */
/* Per-kind configuration                                                    */
/* ------------------------------------------------------------------------ */

type Draft = Record<string, string | boolean>;

interface FieldDef {
  key: string;
  label: string;
  type: "text" | "textarea" | "month" | "checkbox" | "url";
  required?: boolean;
  placeholder?: string;
  /** Sits in a two-column row on wider screens. */
  half?: boolean;
  /** Hidden (and ignored) while this returns true, e.g. end date if current. */
  hiddenWhen?: (draft: Draft) => boolean;
}

interface KindConfig {
  title: string;
  noun: string;
  icon: typeof Briefcase;
  empty: string;
  fields: FieldDef[];
  blank: () => Draft;
}

const CONFIG: Record<EntryKind, KindConfig> = {
  experience: {
    title: "Experience",
    noun: "experience",
    icon: Briefcase,
    empty: "Add research positions, internships, teaching or industry roles.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true, placeholder: "Research Assistant" },
      { key: "organization", label: "Organisation", type: "text", required: true, placeholder: "Jamia Hamdard", half: true },
      { key: "location", label: "Location", type: "text", placeholder: "New Delhi, India", half: true },
      { key: "current", label: "I currently work in this role", type: "checkbox" },
      { key: "start", label: "Start date", type: "month", required: true, half: true },
      { key: "end", label: "End date", type: "month", half: true, hiddenWhen: (d) => d.current === true },
      { key: "description", label: "Description", type: "textarea", placeholder: "What you worked on, key results…" },
    ],
    blank: () => ({ title: "", organization: "", location: "", start: "", end: "", current: false, description: "" }),
  },
  education: {
    title: "Education",
    noun: "education",
    icon: GraduationCap,
    empty: "Add your degrees, from the most recent.",
    fields: [
      { key: "school", label: "School", type: "text", required: true, placeholder: "Jamia Hamdard" },
      { key: "degree", label: "Degree", type: "text", placeholder: "Bachelor of Technology", half: true },
      { key: "field", label: "Field of study", type: "text", placeholder: "Computer Science", half: true },
      { key: "start", label: "Start date", type: "month", half: true },
      { key: "end", label: "End date (or expected)", type: "month", half: true },
      { key: "description", label: "Description", type: "textarea", placeholder: "Thesis, grade, activities…" },
    ],
    blank: () => ({ school: "", degree: "", field: "", start: "", end: "", description: "" }),
  },
  publications: {
    title: "Publications",
    noun: "publication",
    icon: BookOpen,
    empty: "List papers, preprints and book chapters.",
    fields: [
      { key: "title", label: "Title", type: "text", required: true, placeholder: "Title of the paper" },
      { key: "venue", label: "Journal or conference", type: "text", placeholder: "IEEE INDICON 2025", half: true },
      { key: "date", label: "Publication date", type: "month", half: true },
      { key: "authors", label: "Authors", type: "text", placeholder: "J. Doe, A. Smith" },
      { key: "url", label: "Link", type: "url", placeholder: "https://doi.org/…" },
      { key: "description", label: "Description", type: "textarea", placeholder: "Abstract or a one-line summary" },
    ],
    blank: () => ({ title: "", venue: "", date: "", authors: "", url: "", description: "" }),
  },
};

/* ------------------------------------------------------------------------ */
/* Inputs                                                                    */
/* ------------------------------------------------------------------------ */

const inputClass =
  "h-11 w-full rounded-xl border border-[var(--rule-strong)] bg-[var(--surface)] px-3.5 text-base text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:border-[var(--accent)]";

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: THIS_YEAR + 8 - 1950 }, (_, i) => THIS_YEAR + 7 - i);

/** Month + year selects, like LinkedIn. Month is optional. */
function MonthYearInput({
  id,
  value,
  onChange,
}: {
  id: string;
  value: YearMonth;
  onChange: (value: YearMonth) => void;
}) {
  const [year = "", month = ""] = value.split("-");

  const update = (nextYear: string, nextMonth: string) =>
    onChange(nextYear ? (nextMonth ? `${nextYear}-${nextMonth}` : nextYear) : "");

  return (
    <div className="grid grid-cols-2 gap-2">
      <select
        id={id}
        aria-label="Month"
        value={month}
        onChange={(event) => update(year || String(THIS_YEAR), event.target.value)}
        className={inputClass}
      >
        <option value="">Month</option>
        {MONTHS.map((name, index) => (
          <option key={name} value={String(index + 1).padStart(2, "0")}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label="Year"
        value={year}
        onChange={(event) => update(event.target.value, event.target.value ? month : "")}
        className={inputClass}
      >
        <option value="">Year</option>
        {YEARS.map((y) => (
          <option key={y} value={String(y)}>
            {y}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ------------------------------------------------------------------------ */
/* Dialog                                                                    */
/* ------------------------------------------------------------------------ */

function EntryDialog({
  config,
  initial,
  isNew,
  onSave,
  onClose,
}: {
  config: KindConfig;
  initial: Draft;
  isNew: boolean;
  onSave: (draft: Draft) => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const baseId = useId();
  const [draft, setDraft] = useState<Draft>(initial);
  const [error, setError] = useState("");

  // showModal gives focus trapping, Escape and the backdrop for free. No
  // close() on cleanup: its async "close" event would fire onClose after a
  // Strict Mode re-run and dismiss the dialog; unmounting removes it anyway.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const set = (key: string, value: string | boolean) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const visible = config.fields.filter((field) => !field.hiddenWhen?.(draft));

  function submit(event: React.FormEvent) {
    event.preventDefault();

    const missing = visible.find(
      (field) => field.required && !String(draft[field.key] ?? "").trim(),
    );
    if (missing) {
      setError(`${missing.label} is required.`);
      return;
    }

    const start = String(draft.start ?? "");
    const end = String(draft.end ?? "");
    if (start && end && !draft.current && end < start) {
      setError("The end date can't be before the start date.");
      return;
    }

    onSave(draft);
  }

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      aria-labelledby={`${baseId}-title`}
      className="m-auto w-[calc(100vw-2rem)] max-w-xl rounded-2xl border border-[var(--rule-strong)] bg-[var(--surface)] p-0 text-[var(--ink)] shadow-2xl shadow-black/20"
    >
      <form onSubmit={submit} noValidate className="flex max-h-[85dvh] flex-col">
        <div className="flex items-center justify-between border-b border-[var(--rule)] px-6 py-4">
          <h2 id={`${baseId}-title`} className="font-serif text-2xl">
            {isNew ? `Add ${config.noun}` : `Edit ${config.noun}`}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-muted)] hover:bg-[var(--surface-hover)]"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="grid flex-1 gap-4 overflow-y-auto px-6 py-5 sm:grid-cols-2">
          {visible.map((field) => {
            const id = `${baseId}-${field.key}`;
            const value = draft[field.key];

            if (field.type === "checkbox") {
              return (
                <label key={field.key} className="flex items-center gap-2.5 text-sm sm:col-span-2">
                  <input
                    type="checkbox"
                    checked={value === true}
                    onChange={(event) => set(field.key, event.target.checked)}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  {field.label}
                </label>
              );
            }

            return (
              <div key={field.key} className={field.half ? "" : "sm:col-span-2"}>
                <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
                  {field.label}
                  {field.required ? <span className="text-[var(--state-urgent)]"> *</span> : null}
                </label>
                {field.type === "month" ? (
                  <MonthYearInput
                    id={id}
                    value={String(value ?? "")}
                    onChange={(next) => set(field.key, next)}
                  />
                ) : field.type === "textarea" ? (
                  <textarea
                    id={id}
                    value={String(value ?? "")}
                    onChange={(event) => set(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    rows={4}
                    maxLength={1500}
                    className={cn(inputClass, "h-auto py-2.5 leading-6")}
                  />
                ) : (
                  <input
                    id={id}
                    type={field.type === "url" ? "url" : "text"}
                    inputMode={field.type === "url" ? "url" : undefined}
                    value={String(value ?? "")}
                    onChange={(event) => set(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    maxLength={400}
                    className={inputClass}
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--rule)] px-6 py-4">
          <p role="alert" className="text-sm text-[var(--state-urgent)]">
            {error}
          </p>
          <button
            type="submit"
            className="inline-flex h-10 shrink-0 items-center rounded-full bg-[var(--accent)] px-6 text-sm font-medium text-[var(--accent-ink)] transition-colors hover:bg-[var(--accent-hover)]"
          >
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}

/* ------------------------------------------------------------------------ */
/* Section                                                                   */
/* ------------------------------------------------------------------------ */

/**
 * One profile section (experience, education or publications): a list of
 * entry cards with edit/delete, and an "Add" button that opens a dialog.
 * `onChange` receives the full new list; the parent persists it.
 */
export default function EntrySection<K extends EntryKind>({
  kind,
  entries,
  onChange,
}: {
  kind: K;
  entries: EntryMap[K][];
  onChange: (entries: EntryMap[K][]) => void;
}) {
  const config = CONFIG[kind];
  const Icon = config.icon;
  const [editing, setEditing] = useState<{ id: string | null; draft: Draft } | null>(null);

  function save(draft: Draft) {
    if (!editing) return;
    const id = editing.id ?? newEntryId();
    const entry = { ...draft, id } as unknown as EntryMap[K];
    const next = editing.id
      ? entries.map((item) => (item.id === editing.id ? entry : item))
      : [...entries, entry];
    setEditing(null);
    onChange(sortEntries(next));
  }

  function remove(id: string, label: string) {
    if (!window.confirm(`Delete “${label}”?`)) return;
    onChange(entries.filter((item) => item.id !== id));
  }

  return (
    <section className="rounded-2xl border border-[var(--rule)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 font-serif text-2xl">
          <Icon size={20} aria-hidden="true" className="text-[var(--accent)]" />
          {config.title}
        </h2>
        <button
          type="button"
          onClick={() => setEditing({ id: null, draft: config.blank() })}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--rule-strong)] px-3.5 text-sm font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent-wash)]"
        >
          <Plus size={16} aria-hidden="true" />
          Add
        </button>
      </div>

      {entries.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--ink-subtle)]">{config.empty}</p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--rule)]">
          {entries.map((entry) => {
            const s = summarizeEntry(kind, entry);
            return (
              <li key={entry.id} className="flex gap-4 py-4 first:pt-1 last:pb-0">
                <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--surface-sunken)] text-[var(--accent)]">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">{s.primary}</p>
                  {s.secondary ? <p className="text-sm">{s.secondary}</p> : null}
                  {s.dates ? <p className="text-sm text-[var(--ink-subtle)]">{s.dates}</p> : null}
                  {s.detail ? <p className="text-sm text-[var(--ink-subtle)]">{s.detail}</p> : null}
                  {s.url ? (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-sm text-[var(--accent)] hover:underline"
                    >
                      View publication
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                  ) : null}
                  {s.description ? (
                    <p className="mt-1.5 line-clamp-3 whitespace-pre-line text-sm text-[var(--ink-muted)]">
                      {s.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-start gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setEditing({ id: entry.id, draft: { ...(entry as unknown as Draft) } })
                    }
                    aria-label={`Edit ${s.primary}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(entry.id, s.primary)}
                    aria-label={`Delete ${s.primary}`}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-muted)] hover:bg-[var(--state-urgent-wash)] hover:text-[var(--state-urgent)]"
                  >
                    <Trash2 size={16} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Portalled out of the profile <form>, so Enter inside the dialog
          saves the entry instead of submitting the whole profile. */}
      {editing
        ? createPortal(
            <EntryDialog
              config={config}
              initial={editing.draft}
              isNew={editing.id === null}
              onSave={save}
              onClose={() => setEditing(null)}
            />,
            document.body,
          )
        : null}
    </section>
  );
}
