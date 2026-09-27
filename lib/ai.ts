import "server-only";

import type { AiChatMessage } from "@/types/api";

/**
 * Groq chat proxy.
 *
 * The API key is read here, server-side, and is never returned to the client
 * or included in an error message. If the key is absent the whole feature
 * reports itself as disabled and the UI omits the assistant entirely.
 */

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
// Groq retires models regularly (llama-3.3-70b-versatile is gone, which broke
// the assistant); GROQ_MODEL overrides this without a code change.
const DEFAULT_MODEL = "openai/gpt-oss-120b";
const REQUEST_TIMEOUT_MS = 20_000;

export const MAX_MESSAGE_LENGTH = 1_000;
export const MAX_MESSAGES = 12;

export function isAiEnabled(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

const SYSTEM_PROMPT = [
  "You are the research assistant built into Conference Finder, a site for",
  "discovering academic conferences and journals.",
  "",
  "Help with: explaining academic publishing terms (impact factor, quartile,",
  "CiteScore, SCIE, Scopus, APC, camera-ready, open access), interpreting",
  "conference and journal metadata, and suggesting how to search or filter on",
  "this site.",
  "",
  "Rules:",
  "- Never invent conferences, journals, deadlines, impact factors, rankings or",
  "  indexing status. You do not have access to the site's dataset. If asked",
  "  for specific records, tell the user to use the search page and filters.",
  "- Keep answers short: two or three sentences unless asked for more.",
  "- Reply in plain text. Do not use Markdown, tables or headings.",
  "- Say plainly when you do not know something.",
  "- Stay on academic publishing topics.",
].join("\n");

export interface AiResult {
  ok: boolean;
  reply?: string;
  /** Safe, user-facing message. Never contains provider details or keys. */
  error?: string;
  status?: number;
}

/**
 * Validate an incoming message list. Returns a safe error string on rejection
 * so route handlers do not have to duplicate the rules.
 */
export function validateMessages(input: unknown): {
  ok: boolean;
  messages?: AiChatMessage[];
  error?: string;
} {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Request body must be a JSON object." };
  }

  const { messages } = input as { messages?: unknown };

  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "Provide at least one message." };
  }

  if (messages.length > MAX_MESSAGES) {
    return { ok: false, error: "This conversation is too long. Start a new one." };
  }

  const cleaned: AiChatMessage[] = [];

  for (const message of messages) {
    if (!message || typeof message !== "object") {
      return { ok: false, error: "Each message must be an object." };
    }

    const { role, content } = message as { role?: unknown; content?: unknown };

    if (role !== "user" && role !== "assistant") {
      return { ok: false, error: "Message role must be 'user' or 'assistant'." };
    }

    if (typeof content !== "string" || !content.trim()) {
      return { ok: false, error: "Message content must be a non-empty string." };
    }

    if (content.length > MAX_MESSAGE_LENGTH) {
      return {
        ok: false,
        error: `Messages are limited to ${MAX_MESSAGE_LENGTH} characters.`,
      };
    }

    cleaned.push({ role, content: content.trim() });
  }

  if (cleaned[cleaned.length - 1].role !== "user") {
    return { ok: false, error: "The last message must come from the user." };
  }

  return { ok: true, messages: cleaned };
}

export async function askGroq(messages: AiChatMessage[]): Promise<AiResult> {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    return { ok: false, error: "The assistant is not available.", status: 503 };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL?.trim() || DEFAULT_MODEL,
        temperature: 0.3,
        max_tokens: 500,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (!response.ok) {
      // Log only the status for operators; the body can echo request details,
      // so it is never logged or returned. A 404 usually means GROQ_MODEL was
      // retired; a 401 means the key is invalid.
      console.error(`[conference-finder] Groq responded with ${response.status}`);

      // Deliberately generic for users.
      return {
        ok: false,
        error:
          response.status === 429
            ? "The assistant is busy right now. Try again shortly."
            : "The assistant could not answer. Try again shortly.",
        status: 502,
      };
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    // Strip stray Markdown emphasis; the panel renders plain text.
    const reply = payload.choices?.[0]?.message?.content
      ?.replace(/\*\*(.+?)\*\*/g, "$1")
      .trim();

    if (!reply) {
      return { ok: false, error: "The assistant returned no answer.", status: 502 };
    }

    return { ok: true, reply };
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      error: timedOut
        ? "The assistant took too long to respond."
        : "The assistant is unavailable right now.",
      status: timedOut ? 504 : 502,
    };
  } finally {
    clearTimeout(timeout);
  }
}
