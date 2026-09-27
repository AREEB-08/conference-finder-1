/**
 * Shared by the boot script in app/layout.tsx (server) and ThemeToggle
 * (client). Lives in a plain module because a "use client" file's exports
 * reach server components as references, not values.
 */
export const THEME_STORAGE_KEY = "cf-theme";

export type Theme = "light" | "dark";
