/** Shape returned by every JSON route in this app. */
export type ApiResponse<T> =
  | ({ success: true } & T)
  | { success: false; error: string };

export interface DataSourceStatus {
  /** Which adapter served the current data. */
  source: "google-sheets-api" | "google-service-account" | "sample-data";
  /** True when the response came from local sample data rather than Sheets. */
  isFallback: boolean;
  /** ISO timestamp of the fetch that produced the cached payload. */
  fetchedAt: string;
  /** Populated when a fetch failed and the fallback was used instead. */
  warning?: string;
}

export interface AiChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiChatRequest {
  messages: AiChatMessage[];
}

export interface AiChatResponse {
  reply: string;
}

export interface AiStatusResponse {
  /** True only when the server has a Groq key configured. */
  enabled: boolean;
}
