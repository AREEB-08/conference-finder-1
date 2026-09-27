"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Mark } from "@/components/landing/Wordmark";
import { mainNav, siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export default function Navbar({
  authSlot,
  themeSlot,
}: {
  authSlot?: React.ReactNode;
  themeSlot?: React.ReactNode;
}) {
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // The menu is stored with the route it was opened on, so navigating closes it
  // as a derived value rather than through a setState-in-effect.
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const open = menu.open && menu.path === pathname;

  const setOpen = useCallback(
    (next: boolean) => setMenu({ open: next, path: pathname }),
    [pathname],
  );

  // Escape closes the menu and returns focus to the button that opened it.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[var(--paper)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--paper)]/85">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:text-[var(--accent-ink)]"
      >
        Skip to content
      </a>

      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 rounded-full">
          <Mark />
          <span className="font-serif text-lg font-semibold tracking-tight">
            {siteConfig.name}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm transition-colors",
                    isActive(item.href)
                      ? "bg-[var(--surface-sunken)] font-medium text-[var(--pine)]"
                      : "text-[var(--ink-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {themeSlot}
          <div className="hidden items-center gap-2 sm:flex">{authSlot}</div>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--rule-strong)] text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--ink)] md:hidden"
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          ref={panelRef}
          className="cf-panel-enter border-t border-[var(--rule)] bg-[var(--surface)] md:hidden"
        >
          <nav aria-label="Main" className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            <ul className="flex flex-col">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "block rounded-full px-4 py-2.5 text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-[var(--surface-sunken)] font-medium text-[var(--pine)]"
                        : "text-[var(--ink-muted)] hover:bg-[var(--surface-hover)]",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex items-center gap-2 border-t border-[var(--rule)] pt-3 sm:hidden">
              {authSlot}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
