import { createClient } from "@supabase/supabase-js";

// Allow either server-only or NEXT_PUBLIC_* names (in case they were set that way on Vercel)
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE =
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE;

if (!SUPABASE_URL) {
  throw new Error("SUPABASE_URL is not set");
}
if (!SUPABASE_SERVICE_ROLE) {
  throw new Error("SUPABASE_SERVICE_ROLE is not set");
}

// Safe debug: confirm envs are present (no values printed)
try {
  const len = SUPABASE_SERVICE_ROLE?.length || 0;
  console.log(`Supabase env OK (url set, service role key length: ${len})`);
} catch {}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
  auth: { persistSession: false },
});
