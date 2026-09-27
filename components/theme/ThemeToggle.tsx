"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";

import { THEME_STORAGE_KEY, type Theme } from "./theme";

/**
 * Light/dark switch for the navbar.
 *
 * The boot script in app/layout.tsx has already applied a theme before first
 * paint, so this component only reads `html[data-theme]` and flips it. Until
 * the visitor picks one explicitly, the site keeps following the OS setting.
 * Both icons are rendered and CSS shows the right one, so server and client
 * markup always match.
 */

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme, persist: boolean): void {
  document.documentElement.dataset.theme = theme;
  if (!persist) return;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Private mode or blocked storage: the choice lasts for this page view.
  }
}

export default function ThemeToggle() {
  const theme = useSyncExternalStore<Theme | null>(subscribe, readTheme, () => null);

  // Follow OS changes live, but only while no explicit choice is stored.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (!storedTheme()) applyTheme(media.matches ? "dark" : "light", false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => applyTheme(next, true)}
      aria-label={theme ? `Switch to ${next} mode` : "Toggle colour theme"}
      title={theme ? `Switch to ${next} mode` : "Toggle colour theme"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--rule-strong)] text-[var(--ink-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--ink)]"
    >
      <Moon size={17} aria-hidden="true" className="dark:hidden" />
      <Sun size={17} aria-hidden="true" className="hidden dark:block" />
    </button>
  );
}
