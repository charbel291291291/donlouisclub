import { createClient } from "@supabase/supabase-js";

// Read values from Vite env (VITE_ prefix). Make env variables required and fail fast if missing.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
