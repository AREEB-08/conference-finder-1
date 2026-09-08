/** A row in the Supabase `profiles` table. */
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  education: string | null;
  experience: string | null;
  publications: string | null;
  created_at: string;
  updated_at: string;
}

/** The fields a user may edit on their own profile. */
export interface ProfileFormValues {
  username: string;
  full_name: string;
  bio: string;
  linkedin: string;
  github: string;
  website: string;
  education: string;
  experience: string;
  publications: string;
}
