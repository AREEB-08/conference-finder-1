"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  /** What the user chose. */
  mode: ThemeMode;
  /** What is actually on screen once "system" is resolved. */
  resolved: "light" | "dark";
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";
/** Fired on the window so every subscriber updates when one of them writes. */
const CHANGE_EVENT = "themechange";

function isMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

/*
 * Both the stored preference and the OS preference are external stores that
 * React does not own, so they are read through useSyncExternalStore rather than
 * copied into state inside an effect. That keeps the values consistent during
 * concurrent rendering and avoids the cascading render that a setState-in-effect
 * would cause.
 */

function subscribeToStored(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getStoredMode(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isMode(stored)) return stored;
  } catch {
    // Storage can be blocked in private mode; fall through to the default.
  }
  return "system";
}

/** The server cannot know the preference, so it always assumes "system". */
function getServerMode(): ThemeMode {
  return "system";
}

function subscribeToSystem(onChange: () => void): () => void {
  const query = window.matchMedia("(prefers-color-scheme: dark)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function getSystemDark(): boolean {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getServerSystemDark(): boolean {
  return false;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useSyncExternalStore(
    subscribeToStored,
    getStoredMode,
    getServerMode,
  );

  const systemDark = useSyncExternalStore(
    subscribeToSystem,
    getSystemDark,
    getServerSystemDark,
  );

  const resolved: "light" | "dark" =
    mode === "dark" || (mode === "system" && systemDark) ? "dark" : "light";

  // Writing to the DOM is a genuine external-system sync, which is what
  // effects are for. ThemeScript already applied the same class before paint,
  // so this is a no-op on first render.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.style.colorScheme = resolved;
  }, [resolved]);

  const setMode = useCallback((next: ThemeMode) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The preference will not persist, but the session still works.
    }
    // Notify this tab; the storage event only fires in other tabs.
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const value = useMemo(
    () => ({ mode, resolved, setMode }),
    [mode, resolved, setMode],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return context;
}
