import { createClient } from "@supabase/supabase-js";

// Allow either server-only or NEXT_PUBLIC_* names (in case they were set that way on Vercel)
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE =
  process.env.SUPABASE_SERVICE_ROLE ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE;
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL) {
  throw new Error("SUPABASE_URL is not set");
}

// Prefer service role if present; otherwise fall back to anon for read-only endpoints
const SUPABASE_KEY = SUPABASE_SERVICE_ROLE || SUPABASE_ANON_KEY;
if (!SUPABASE_KEY) {
  throw new Error("Neither SUPABASE_SERVICE_ROLE nor SUPABASE_ANON_KEY is set");
}

// Provide a fetch with timeout to avoid hanging
function withTimeout(ms: number) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(new Error("fetch-timeout")), ms);
    try {
      const res = await fetch(input as any, { ...(init as any), signal: controller.signal } as any);
      return res as any;
    } finally {
      clearTimeout(id);
    }
  };
}

// Safe debug: confirm envs are present (no values printed)
try {
  const srLen = SUPABASE_SERVICE_ROLE?.length || 0;
  const anLen = SUPABASE_ANON_KEY?.length || 0;
  console.log(
    `Supabase env OK (url set, using ${SUPABASE_SERVICE_ROLE ? "service_role" : "anon"}; service len: ${srLen}, anon len: ${anLen})`,
  );
} catch {}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false },
  global: { fetch: withTimeout(10000) as any },
});
