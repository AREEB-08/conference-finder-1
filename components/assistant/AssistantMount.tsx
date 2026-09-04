import { isAiEnabled } from "@/lib/ai";
import Assistant from "./Assistant";

/**
 * Server component gate for the assistant.
 *
 * The key check happens here, on the server, and the client bundle for the
 * assistant is only rendered when it passes. Nothing is sent to the browser
 * that reveals whether a key exists beyond the presence of the button itself,
 * and no NEXT_PUBLIC_ variable is involved.
 */
export default function AssistantMount() {
  if (!isAiEnabled()) return null;
  return <Assistant />;
}
