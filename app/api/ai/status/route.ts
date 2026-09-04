import { NextResponse } from "next/server";

import { isAiEnabled } from "@/lib/ai";

export const dynamic = "force-dynamic";

/**
 * Feature flag endpoint. Reports only whether the assistant is available —
 * never the key, the model, or any other configuration detail.
 */
export async function GET() {
  return NextResponse.json(
    { success: true, enabled: isAiEnabled() },
    { headers: { "cache-control": "no-store" } },
  );
}
