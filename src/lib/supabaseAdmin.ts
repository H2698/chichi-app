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
 * not be reachable by a signed-out visitor.
 *
 * This alone does NOT check for an Admin role — use `requireAdminCaller`
 * below for routes that create accounts or change credentials. (Until this
 * fix, nothing checked the role anywhere — including the admin UI itself —
 * so any signed-in employee could create other accounts or change
 * passwords. AuthGate now blocks the UI; this blocks the API underneath it,
 * since leaving the API open would make the UI block a false sense of
 * security rather than a real one.)
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

/**
 * Same as `requireCaller`, but additionally requires the caller's
 * `employees.role` to be "Admin" — checked id-first, email-fallback, same
 * lookup AuthGate uses client-side (kept in sync deliberately: id is how
 * every employee created through /api/employees is linked, email is the
 * fallback for the handful of employees that predate that feature). No
 * matching directory row at all is treated as not Admin, the safe default.
 *
 * Use this for every route that can create an account or change login
 * credentials — POST /api/employees and the password/email PATCH routes.
 */
export async function requireAdminCaller(
  request: Request
): Promise<{ user: User; error?: undefined } | { user?: undefined; error: NextResponse }> {
  const auth = await requireCaller(request);
  if (auth.error) return auth;

  const byId = await supabaseAdmin.from("employees").select("role").eq("id", auth.user.id).maybeSingle();
  let role = byId.data?.role;

  if (!role && auth.user.email) {
    const byEmail = await supabaseAdmin
      .from("employees")
      .select("role")
      .eq("email", auth.user.email)
      .maybeSingle();
    role = byEmail.data?.role;
  }

  if (role !== "Admin") {
    return {
      error: NextResponse.json({ error: "Réservé aux administratrices." }, { status: 403 }),
    };
  }
  return auth;
}
