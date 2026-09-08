import Link from "next/link";

import { buttonClass } from "@/components/ui/Button";

/**
 * Auth area in the navbar. Server component: reads the Supabase session when
 * configured (wired in the auth phase), otherwise shows the sign-in CTA pair.
 */
export default function AuthNav() {
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
