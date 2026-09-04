"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, SendHorizonal, X } from "lucide-react";

import { MAX_MESSAGE_LENGTH } from "./limits";
import type { AiChatMessage } from "@/types/api";

/**
 * A small research assistant in the corner. Deliberately compact: it answers
 * questions about publishing terminology and how to search this site, and it
 * is told not to invent records, because it has no access to the dataset.
 */
export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  // Escape closes and returns focus to the launcher.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        openerRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, pending]);

  async function send(event: React.FormEvent) {
    event.preventDefault();

    const content = draft.trim();
    if (!content || pending) return;

    const next: AiChatMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setDraft("");
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        // Only the last few turns are sent, which keeps requests small and
        // bounds what leaves the browser.
        body: JSON.stringify({ messages: next.slice(-8) }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        setError(payload.error ?? "The assistant is unavailable right now.");
        return;
      }

      setMessages([...next, { role: "assistant", content: payload.reply }]);
    } catch {
      setError("Could not reach the assistant. Check your connection.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        ref={openerRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls="assistant-panel"
        aria-label={open ? "Close research assistant" : "Open research assistant"}
        className="fixed bottom-5 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-[var(--rule-strong)] bg-[var(--surface)] text-[var(--ink-muted)] shadow-sm transition-colors hover:text-[var(--ink)]"
      >
        {open ? <X size={18} /> : <MessageSquare size={18} />}
      </button>

      {open ? (
        <div
          id="assistant-panel"
          ref={panelRef}
          role="dialog"
          aria-label="Research assistant"
          aria-modal="false"
          className="cf-panel-enter fixed bottom-20 right-4 z-40 flex max-h-[70dvh] w-[calc(100vw-2rem)] max-w-sm flex-col overflow-hidden rounded border border-[var(--rule-strong)] bg-[var(--surface)] shadow-lg"
        >
          <div className="border-b border-[var(--rule)] px-4 py-3">
            <h2 className="font-sans text-sm font-medium">Research assistant</h2>
            <p className="mt-0.5 text-xs text-[var(--ink-subtle)]">
              Publishing terms and search help. It cannot see the listings.
            </p>
          </div>

          <div
            ref={logRef}
            role="log"
            aria-live="polite"
            className="flex-1 space-y-3 overflow-y-auto px-4 py-3"
          >
            {messages.length === 0 ? (
              <p className="text-sm leading-6 text-[var(--ink-muted)]">
                Ask what a quartile means, how APCs work, or which filters to use
                to narrow a search.
              </p>
            ) : null}

            {messages.map((message, index) => (
              <div
                key={index}
                className={
                  message.role === "user"
                    ? "ml-6 rounded bg-[var(--accent-wash)] px-3 py-2 text-sm leading-6 text-[var(--ink)]"
                    : "mr-2 text-sm leading-6 text-[var(--ink-muted)]"
                }
              >
                {message.content}
              </div>
            ))}

            {pending ? (
              <p className="text-sm text-[var(--ink-subtle)]">Thinking…</p>
            ) : null}

            {error ? (
              <p
                role="alert"
                className="rounded border border-[var(--state-urgent-line)] bg-[var(--state-urgent-wash)] px-3 py-2 text-sm text-[var(--state-urgent)]"
              >
                {error}
              </p>
            ) : null}
          </div>

          <form
            onSubmit={send}
            className="flex items-center gap-2 border-t border-[var(--rule)] p-3"
          >
            <label htmlFor="assistant-input" className="sr-only">
              Message
            </label>
            <input
              id="assistant-input"
              ref={inputRef}
              value={draft}
              maxLength={MAX_MESSAGE_LENGTH}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask a question"
              disabled={pending}
              className="h-9 flex-1 rounded border border-[var(--rule)] bg-[var(--paper)] px-3 text-sm focus:border-[var(--accent)]"
            />
            <button
              type="submit"
              disabled={pending || !draft.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 items-center justify-center rounded bg-[var(--accent)] text-[var(--accent-ink)] disabled:opacity-45"
            >
              <SendHorizonal size={15} />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}
