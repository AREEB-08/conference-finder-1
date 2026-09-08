import type { Metadata, Viewport } from "next";

// Fonts are self-hosted via npm rather than next/font/google. That keeps the
// build reproducible offline and in restricted CI networks, and avoids a
// third-party request at runtime (the CSP has no google-fonts origin).
import "@fontsource-variable/source-serif-4";
import "@fontsource-variable/dm-sans";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import AssistantMount from "@/components/assistant/AssistantMount";
import AuthNav from "@/components/auth/AuthNav";
import { getSiteUrl, siteConfig } from "@/config/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f2f8f7",
};

// Signals that JS is running, which unlocks the reveal animations. Static,
// developer-authored string; no user input reaches it.
const jsFlagScript = `document.documentElement.classList.add('js');`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsFlagScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <Navbar authSlot={<AuthNav />} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <AssistantMount />
      </body>
    </html>
  );
}
