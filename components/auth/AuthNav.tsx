import Link from "next/link";
import { LogOut } from "lucide-react";

import { buttonClass } from "@/components/ui/Button";
import { getUser } from "@/lib/supabase/server";

/**
 * Auth area in the navbar. Server component: reads the Supabase session on
 * every request. Signed out (or unconfigured) it shows the CTA pair; signed
 * in it shows the avatar linking to the profile page plus a sign-out button.
 */
export default async function AuthNav() {
  const user = await getUser();

  if (!user) {
    return (
      <>
        <Link href="/login" className={buttonClass("ghost", "sm")}>
          Sign in
        </Link>
        <Link href="/login" className={buttonClass("primary", "sm")}>
          Sign up
        </Link>
      </>
    );
  }

  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "Profile";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      <Link
        href="/profile"
        title={name}
        className="flex items-center gap-2 rounded-full border border-[var(--rule-strong)] py-1 pl-1 pr-3 text-sm transition-colors hover:bg-[var(--surface-hover)]"
      >
        {avatarUrl ? (
          /* Remote Google avatar with unknown host; a plain img avoids
             remote-image config for one 26px icon. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            width={26}
            height={26}
            className="h-[26px] w-[26px] rounded-full"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[var(--accent)] text-xs font-semibold text-white">
            {initial}
          </span>
        )}
        Profile
      </Link>

      <form action="/auth/signout" method="post">
        <button
          type="submit"
          className={buttonClass("ghost", "sm")}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={15} aria-hidden="true" />
        </button>
      </form>
    </>
  );
}
