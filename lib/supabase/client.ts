"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./config";

/**
 * Browser Supabase client. Call only after checking isSupabaseConfigured(),
 * or be prepared for null.
 */
export function createClient() {
  if (!isSupabaseConfigured()) return null;
  return createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
}
