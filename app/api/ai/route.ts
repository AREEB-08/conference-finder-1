import { NextResponse } from "next/server";

import { askGroq, isAiEnabled, validateMessages } from "@/lib/ai";
import { clientKey, rateLimit } from "@/lib/rate-limit";

// Always runs per-request: there is nothing cacheable about a chat turn.
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16_000;

/**
 * Groq proxy.
 *
 * The API key lives only in this process. The browser never receives it, and
 * no error path echoes it or the upstream response body back to the client.
 */
export async function POST(request: Request) {
  if (!isAiEnabled()) {
    return NextResponse.json(
      { success: false, error: "The assistant is not available." },
      { status: 503 },
    );
  }

  const limit = rateLimit(clientKey(request.headers, "ai"), 12, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "You have sent too many messages. Wait a moment and try again.",
      },
      { status: 429, headers: { "retry-after": String(limit.retryAfter) } },
    );
  }

  // Reject oversized bodies before parsing them.
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { success: false, error: "That message is too long." },
      { status: 413 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const validation = validateMessages(body);
  if (!validation.ok || !validation.messages) {
    return NextResponse.json(
      { success: false, error: validation.error },
      { status: 400 },
    );
  }

  const result = await askGroq(validation.messages);

  if (!result.ok) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: result.status ?? 502 },
    );
  }

  // Nothing is persisted: no conversation logging, no analytics on content.
  return NextResponse.json(
    { success: true, reply: result.reply },
    { headers: { "cache-control": "no-store" } },
  );
}
