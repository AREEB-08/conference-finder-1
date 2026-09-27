import Link from "next/link";

import ProfileMenu from "@/components/auth/ProfileMenu";
import { buttonClass } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";

/**
 * Auth area in the navbar. Server component: reads the Supabase session on
 * every request. Signed out (or unconfigured) it shows the CTA pair; signed
 * in it shows the avatar button that opens the account menu.
 */
export default async function AuthNav() {
  const supabase = await createClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  if (!supabase || !user) {
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

  // The claimed handle decides where "View profile" goes.
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const name =
    profile?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email ??
    "Account";

  return (
    <ProfileMenu
      name={name}
      email={user.email ?? null}
      avatarUrl={
        profile?.avatar_url ??
        (user.user_metadata?.avatar_url as string | undefined) ??
        null
      }
      username={profile?.username ?? null}
    />
  );
}
