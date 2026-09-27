"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut, Pencil, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

export interface ProfileMenuProps {
  name: string;
  email: string | null;
  avatarUrl: string | null;
  username: string | null;
}

export function Avatar({
  name,
  avatarUrl,
  size,
}: {
  name: string;
  avatarUrl: string | null;
  size: number;
}) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (avatarUrl) {
    return (
      /* Remote Google avatar with unknown host; a plain img avoids
         remote-image config for a small icon. */
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatarUrl}
        alt=""
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <span
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-[var(--accent-ink)]"
    >
      {initial}
    </span>
  );
}

const itemClass =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-[var(--ink)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:bg-[var(--surface-hover)]";

/**
 * Avatar button in the navbar that opens a small account menu: view the
 * public profile, edit it, or sign out. Closes on Escape, outside click and
 * navigation; arrow keys move between items.
 */
export default function ProfileMenu({ name, email, avatarUrl, username }: ProfileMenuProps) {
  const pathname = usePathname();
  const menuId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Stored with the route it was opened on, so navigating closes it.
  const [menu, setMenu] = useState({ open: false, path: pathname });
  const open = menu.open && menu.path === pathname;
  const setOpen = useCallback(
    (next: boolean) => setMenu({ open: next, path: pathname }),
    [pathname],
  );

  const items = () =>
    Array.from(menuRef.current?.querySelectorAll<HTMLElement>("[role=menuitem]") ?? []);

  useEffect(() => {
    if (!open) return;

    items()[0]?.focus();

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

      event.preventDefault();
      const list = items();
      const index = list.indexOf(document.activeElement as HTMLElement);
      const step = event.key === "ArrowDown" ? 1 : -1;
      list[(index + step + list.length) % list.length]?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  const firstName = name.split(/\s+/)[0] || "Account";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={cn(
          "flex items-center gap-2 rounded-full border border-[var(--rule-strong)] py-1 pl-1 pr-2.5 text-sm transition-colors hover:bg-[var(--surface-hover)]",
          open && "bg-[var(--surface-hover)]",
        )}
      >
        <Avatar name={name} avatarUrl={avatarUrl} size={28} />
        <span className="max-w-28 truncate">{firstName}</span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={cn("text-[var(--ink-subtle)] transition-transform", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          aria-label="Account"
          className="cf-panel-enter absolute right-0 z-50 mt-2 w-64 rounded-xl border border-[var(--rule-strong)] bg-[var(--surface)] p-1.5 shadow-lg shadow-black/10"
        >
          <div className="flex items-center gap-3 border-b border-[var(--rule)] px-3 pb-3 pt-2">
            <Avatar name={name} avatarUrl={avatarUrl} size={36} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-[var(--ink-subtle)]">
                {username ? `@${username}` : email}
              </p>
            </div>
          </div>

          <div className="py-1.5">
            {username ? (
              <Link href={`/u/${username}`} role="menuitem" className={itemClass}>
                <UserRound size={16} aria-hidden="true" className="text-[var(--ink-muted)]" />
                View profile
              </Link>
            ) : (
              <Link href="/profile#username" role="menuitem" className={itemClass}>
                <UserRound size={16} aria-hidden="true" className="text-[var(--ink-muted)]" />
                <span>
                  View profile
                  <span className="block text-xs text-[var(--ink-subtle)]">
                    Claim a username to get a public page
                  </span>
                </span>
              </Link>
            )}
            <Link href="/profile" role="menuitem" className={itemClass}>
              <Pencil size={16} aria-hidden="true" className="text-[var(--ink-muted)]" />
              Edit profile
            </Link>
          </div>

          <form action="/auth/signout" method="post" className="border-t border-[var(--rule)] pt-1.5">
            <button type="submit" role="menuitem" className={itemClass}>
              <LogOut size={16} aria-hidden="true" className="text-[var(--ink-muted)]" />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
