"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { useQueryState } from "./useQueryState";

const DEBOUNCE_MS = 300;
const MAX_LENGTH = 120;

/**
 * Keyword input. Typing is debounced into the URL so results update as you go
 * without pushing a history entry per keystroke; submitting applies at once.
 */
export default function SearchBar({
  placeholder = "Search by name, topic, organiser or location",
  label = "Search",
}: {
  placeholder?: string;
  label?: string;
}) {
  const { get, setParams } = useQueryState();
  const urlQuery = get("q");

  const [value, setValue] = useState(urlQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const isTyping = useRef(false);

  // Adopt external URL changes (back button, cleared filters) unless the user
  // is mid-keystroke, which would otherwise fight their typing.
  useEffect(() => {
    if (!isTyping.current) setValue(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (value === urlQuery) return;

    const timer = setTimeout(() => {
      isTyping.current = false;
      setParams({ q: value });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value, urlQuery, setParams]);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        isTyping.current = false;
        setParams({ q: value });
      }}
      className="relative"
    >
      <label htmlFor="search-input" className="sr-only">
        {label}
      </label>

      <Search
        size={17}
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-subtle)]"
      />

      <input
        id="search-input"
        ref={inputRef}
        type="search"
        value={value}
        maxLength={MAX_LENGTH}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => {
          isTyping.current = true;
          setValue(event.target.value);
        }}
        className="h-12 w-full rounded border border-[var(--rule-strong)] bg-[var(--surface)] pl-11 pr-11 text-[15px] text-[var(--ink)] placeholder:text-[var(--ink-subtle)] focus:border-[var(--accent)]"
      />

      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            isTyping.current = false;
            setValue("");
            setParams({ q: "" });
            inputRef.current?.focus();
          }}
          className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-[var(--ink-subtle)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
        >
          <X size={15} />
        </button>
      ) : null}
    </form>
  );
}
