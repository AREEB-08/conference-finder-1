import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content Security Policy.
 *
 * Tuned to what this app actually loads, and tested against a production build:
 *  - 'unsafe-inline' on script-src covers the theme script and Next's inline
 *    bootstrap. Removing it needs a nonce, which forces every page dynamic and
 *    would defeat the caching this site relies on.
 *  - 'unsafe-eval' is dev-only; the Turbopack dev runtime needs it.
 *  - style-src needs 'unsafe-inline' for Next's injected critical CSS.
 *  - connect-src stays 'self': the browser talks to /api/ai, never to Groq
 *    directly, which is what keeps the key server-side.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // Google avatars come from *.googleusercontent.com after OAuth sign-in.
  "img-src 'self' data: blob: https://*.googleusercontent.com",
  "font-src 'self' data:",
  // The browser talks to Supabase directly for auth and profile data.
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  // Only meaningful over HTTPS, so it is left off in development.
  ...(isDev
    ? []
    : [
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
      ]),
];

const nextConfig: NextConfig = {
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
