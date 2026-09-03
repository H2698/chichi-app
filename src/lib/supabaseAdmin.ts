import { createClient, type User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const supabaseAdminConfigured = Boolean(url && serviceRoleKey);

// Re-exported for convenience so server-side code only needs one import —
// but see @/lib/authConstants for why this value itself lives elsewhere.
export { MIN_PASSWORD_LENGTH } from "@/lib/authConstants";

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

/**
 * Shared guard for the employee-account routes below: requires *some*
 * signed-in caller, since these endpoints carry service-role power and must
 * not be reachable by a signed-out visitor. This intentionally doesn't check
 * for an Admin role — the rest of the app (AuthGate) doesn't distinguish
 * Admin from Employée for route access either, so adding that restriction
 * only here would be a false sense of security, not a real one.
 */
export async function requireCaller(
  request: Request
): Promise<{ user: User; error?: undefined } | { user?: undefined; error: NextResponse }> {
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return { error: NextResponse.json({ error: "Non authentifié." }, { status: 401 }) };
  }
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    return { error: NextResponse.json({ error: "Non authentifié." }, { status: 401 }) };
  }
  return { user: data.user };
}
