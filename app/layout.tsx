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
import ThemeToggle from "@/components/theme/ThemeToggle";
import { THEME_STORAGE_KEY } from "@/components/theme/theme";
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f2f8f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1719" },
  ],
};

// Runs before first paint: flags that JS is running (unlocks the reveal
// animations) and applies the stored theme, falling back to the OS setting,
// so there is no flash of the wrong theme. Static, developer-authored string;
// no user input reaches it.
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t}catch(e){d.dataset.theme='light'}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // The boot script sets data-theme before hydration, which React would
    // otherwise report as a mismatch on this one element.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <Navbar authSlot={<AuthNav />} themeSlot={<ThemeToggle />} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
        <AssistantMount />
      </body>
    </html>
  );
}
