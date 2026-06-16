import { createClient } from "@supabase/supabase-js";

// Service-role client for server-side jobs (cron) that run with NO user session.
// It bypasses RLS, so only use it in trusted server contexts (API/cron routes),
// never in the browser. Returns null if the service key is not configured.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
