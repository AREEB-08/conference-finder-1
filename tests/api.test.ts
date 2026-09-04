import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { rateLimit, resetRateLimits, clientKey } from "@/lib/rate-limit";
import { safeExternalUrl, extractUrls, slugify, uniqueSlug } from "@/lib/utils";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("allows requests up to the limit then blocks", () => {
    for (let index = 0; index < 3; index += 1) {
      expect(rateLimit("key", 3, 1000).allowed).toBe(true);
    }
    const blocked = rateLimit("key", 3, 1000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfter).toBeGreaterThan(0);
  });

  it("tracks callers independently", () => {
    rateLimit("a", 1, 1000);
    expect(rateLimit("a", 1, 1000).allowed).toBe(false);
    expect(rateLimit("b", 1, 1000).allowed).toBe(true);
  });

  it("resets after the window closes", () => {
    const start = 1_000_000;
    rateLimit("w", 1, 1000, start);
    expect(rateLimit("w", 1, 1000, start + 500).allowed).toBe(false);
    expect(rateLimit("w", 1, 1000, start + 1500).allowed).toBe(true);
  });
});

describe("clientKey", () => {
  it("uses the first forwarded address", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" });
    expect(clientKey(headers, "ai")).toBe("ai:203.0.113.5");
  });

  it("falls back when no address header is present", () => {
    expect(clientKey(new Headers(), "ai")).toBe("ai:unknown");
  });
});

describe("safeExternalUrl", () => {
  it("accepts real http(s) URLs", () => {
    expect(safeExternalUrl("https://neurips.cc/")).toBe("https://neurips.cc/");
    expect(safeExternalUrl("example.org/cfp")).toBe("https://example.org/cfp");
  });

  it("rejects dangerous and placeholder values", () => {
    // A spreadsheet is untrusted input; these must never become an href.
    expect(safeExternalUrl("javascript:alert(1)")).toBe("");
    expect(safeExternalUrl("data:text/html,<script>alert(1)</script>")).toBe("");
    expect(safeExternalUrl("#")).toBe("");
    expect(safeExternalUrl("")).toBe("");
    expect(safeExternalUrl("Conference title, not a link")).toBe("");
  });
});

describe("extractUrls", () => {
  it("pulls several URLs out of one cell", () => {
    const urls = extractUrls(
      "https://events.ieee.org/indicon-2026/   https://www.indicon2026.com/",
    );
    expect(urls).toHaveLength(2);
  });

  it("returns nothing for prose", () => {
    expect(extractUrls("ICASSE 2026 - International Conference")).toEqual([]);
  });
});

describe("slug helpers", () => {
  it("builds URL-safe slugs", () => {
    expect(slugify("CVMI-2026 – 5th IEEE Conference!")).toBe(
      "cvmi-2026-5th-ieee-conference",
    );
  });

  it("disambiguates repeats", () => {
    const taken = new Set<string>();
    expect(uniqueSlug("same", taken)).toBe("same");
    expect(uniqueSlug("same", taken)).toBe("same-2");
    expect(uniqueSlug("same", taken)).toBe("same-3");
  });
});

describe("AI request validation", () => {
  it("rejects malformed payloads", async () => {
    const { validateMessages } = await import("@/lib/ai");

    expect(validateMessages(null).ok).toBe(false);
    expect(validateMessages({}).ok).toBe(false);
    expect(validateMessages({ messages: [] }).ok).toBe(false);
    expect(validateMessages({ messages: "hello" }).ok).toBe(false);
    expect(
      validateMessages({ messages: [{ role: "system", content: "hi" }] }).ok,
    ).toBe(false);
    expect(
      validateMessages({ messages: [{ role: "user", content: "" }] }).ok,
    ).toBe(false);
  });

  it("rejects oversized messages and conversations", async () => {
    const { validateMessages, MAX_MESSAGE_LENGTH, MAX_MESSAGES } = await import(
      "@/lib/ai"
    );

    expect(
      validateMessages({
        messages: [{ role: "user", content: "a".repeat(MAX_MESSAGE_LENGTH + 1) }],
      }).ok,
    ).toBe(false);

    expect(
      validateMessages({
        messages: Array.from({ length: MAX_MESSAGES + 1 }, () => ({
          role: "user",
          content: "hi",
        })),
      }).ok,
    ).toBe(false);
  });

  it("requires the last message to be from the user", async () => {
    const { validateMessages } = await import("@/lib/ai");

    expect(
      validateMessages({
        messages: [{ role: "assistant", content: "hello" }],
      }).ok,
    ).toBe(false);
  });

  it("accepts and trims a valid conversation", async () => {
    const { validateMessages } = await import("@/lib/ai");

    const result = validateMessages({
      messages: [
        { role: "user", content: "  what is a quartile?  " },
        { role: "assistant", content: "A ranking band." },
        { role: "user", content: "and an APC?" },
      ],
    });

    expect(result.ok).toBe(true);
    expect(result.messages?.[0].content).toBe("what is a quartile?");
  });
});

describe("AI feature flag", () => {
  const original = process.env.GROQ_API_KEY;

  afterEach(() => {
    process.env.GROQ_API_KEY = original;
    vi.resetModules();
  });

  it("is disabled when no key is configured", async () => {
    vi.resetModules();
    delete process.env.GROQ_API_KEY;
    const { isAiEnabled } = await import("@/lib/ai");
    expect(isAiEnabled()).toBe(false);
  });

  it("is disabled when the key is only whitespace", async () => {
    vi.resetModules();
    process.env.GROQ_API_KEY = "   ";
    const { isAiEnabled } = await import("@/lib/ai");
    expect(isAiEnabled()).toBe(false);
  });

  it("is enabled when a key is present", async () => {
    vi.resetModules();
    process.env.GROQ_API_KEY = "test-key";
    const { isAiEnabled } = await import("@/lib/ai");
    expect(isAiEnabled()).toBe(true);
  });

  it("refuses to call Groq without a key and leaks nothing", async () => {
    vi.resetModules();
    delete process.env.GROQ_API_KEY;
    const { askGroq } = await import("@/lib/ai");

    const result = await askGroq([{ role: "user", content: "hi" }]);
    expect(result.ok).toBe(false);
    expect(result.error).not.toContain("GROQ");
  });

  it("returns a safe message when Groq fails, without the upstream body", async () => {
    vi.resetModules();
    process.env.GROQ_API_KEY = "test-key";

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "invalid api key sk-secret-123" }), {
        status: 401,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { askGroq } = await import("@/lib/ai");
    const result = await askGroq([{ role: "user", content: "hi" }]);

    expect(result.ok).toBe(false);
    expect(result.error).not.toContain("sk-secret-123");
    expect(result.error).not.toContain("invalid api key");

    // The key must travel in the header, never in the body or the URL.
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).not.toContain("test-key");
    expect(String(init.body)).not.toContain("test-key");
    expect(init.headers.authorization).toBe("Bearer test-key");

    vi.unstubAllGlobals();
  });

  it("returns the reply on success", async () => {
    vi.resetModules();
    process.env.GROQ_API_KEY = "test-key";

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ choices: [{ message: { content: "A quartile is..." } }] }),
          { status: 200 },
        ),
      ),
    );

    const { askGroq } = await import("@/lib/ai");
    const result = await askGroq([{ role: "user", content: "quartile?" }]);

    expect(result.ok).toBe(true);
    expect(result.reply).toBe("A quartile is...");

    vi.unstubAllGlobals();
  });
});
