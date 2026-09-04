import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "."),
      // lib/data.ts and lib/sheets/client.ts import "server-only", which throws
      // outside a React Server Component. Point it at a no-op for tests.
      "server-only": resolve(__dirname, "tests/stubs/server-only.ts"),
      // unstable_cache needs a running Next server; pass it through in tests.
      "next/cache": resolve(__dirname, "tests/stubs/next-cache.ts"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["lib/**", "components/**", "config/**"],
    },
  },
});
