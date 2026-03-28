import { createClient } from "@supabase/supabase-js";

export function hasServerSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createServerSupabaseClient() {
  if (!hasServerSupabaseEnv()) {
    throw new Error("Missing Supabase server environment variables.");
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
