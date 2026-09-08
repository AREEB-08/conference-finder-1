"use server";

import { revalidatePath } from "next/cache";

import { isValidUsername } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export interface SaveProfileState {
  ok: boolean;
  message: string;
}

const TEXT_LIMIT = 2000;
const SHORT_LIMIT = 200;

function clean(value: FormDataEntryValue | null, limit: number): string {
  return String(value ?? "").trim().slice(0, limit);
}

/** Allow only http(s) links; anything else is stored as empty. */
function cleanUrl(value: FormDataEntryValue | null): string {
  const raw = clean(value, SHORT_LIMIT);
  if (!raw) return "";
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    return url.toString();
  } catch {
    return "";
  }
}

export async function saveProfile(
  _prev: SaveProfileState,
  formData: FormData,
): Promise<SaveProfileState> {
  const supabase = await createClient();
  if (!supabase) {
    return { ok: false, message: "Supabase is not configured on this deployment." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "You need to sign in first." };
  }

  const username = clean(formData.get("username"), 20).toLowerCase();
  if (username && !isValidUsername(username)) {
    return {
      ok: false,
      message:
        "Usernames are 3-20 characters: lowercase letters, numbers and underscore only.",
    };
  }

  const values = {
    id: user.id,
    username: username || null,
    full_name: clean(formData.get("full_name"), SHORT_LIMIT) || null,
    bio: clean(formData.get("bio"), TEXT_LIMIT) || null,
    linkedin: cleanUrl(formData.get("linkedin")) || null,
    github: cleanUrl(formData.get("github")) || null,
    website: cleanUrl(formData.get("website")) || null,
    education: clean(formData.get("education"), TEXT_LIMIT) || null,
    experience: clean(formData.get("experience"), TEXT_LIMIT) || null,
    publications: clean(formData.get("publications"), TEXT_LIMIT) || null,
    // Keep the Google avatar in sync on every save.
    avatar_url: (user.user_metadata?.avatar_url as string | undefined) ?? null,
  };

  const { error } = await supabase.from("profiles").upsert(values);

  if (error) {
    // 23505 = unique_violation (someone else holds the username).
    if (error.code === "23505") {
      return { ok: false, message: `The username "${username}" is already taken.` };
    }
    return { ok: false, message: "Could not save the profile. Please try again." };
  }

  revalidatePath("/profile");
  if (username) revalidatePath(`/u/${username}`);

  return { ok: true, message: "Profile saved." };
}
