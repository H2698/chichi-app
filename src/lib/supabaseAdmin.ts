import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseAdminConfigured = Boolean(url && serviceRoleKey);

/**
 * Service-role Supabase client: full read/write access, bypasses Row Level
 * Security entirely. Needed for anything only a shop owner should be able to
 * do server-side — right now, creating a real Supabase Auth login for a new
 * employee (`supabase.auth.admin.*` requires this role; the anon key used by
 * `@/lib/supabase` cannot do it).
 *
 * SERVER-ONLY. `SUPABASE_SERVICE_ROLE_KEY` must never carry the
 * `NEXT_PUBLIC_` prefix or it ships to the browser. Only import this file
 * from Route Handlers or other server-only code — never from a "use client"
 * component.
 */
export const supabaseAdmin = createClient(
  url || "https://placeholder.supabase.co",
  serviceRoleKey || "placeholder-key",
  { auth: { autoRefreshToken: false, persistSession: false } }
);
