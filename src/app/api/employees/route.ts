import { NextResponse } from "next/server";
import { supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { Employee } from "@/lib/types";

// Characters chosen to avoid transcription mistakes when this is read off a
// screen and typed on a phone: no 0/O, 1/l/I, or other easily-confused pairs.
const PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generateTemporaryPassword(length = 10) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length]).join("");
}

/**
 * Creates a real Supabase Auth login for a new employee, alongside their
 * `employees` directory row. Requires the service-role key, so this has to
 * run server-side — the admin UI's "Ajouter une employée" form used to only
 * write the directory row (see git history), which is why new employees had
 * a profile but no way to actually sign in at /login.
 */
export async function POST(request: Request) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY n'est pas configurée côté serveur." },
      { status: 500 }
    );
  }

  // Require *some* signed-in caller — this endpoint has service-role power,
  // so it must not be reachable by a signed-out visitor. This intentionally
  // doesn't check for an Admin role: the rest of the app (AuthGate) doesn't
  // distinguish Admin from Employée for route access either, so adding that
  // restriction only here would be a false sense of security, not a real one.
  const authHeader = request.headers.get("authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }
  const { data: callerData, error: callerError } = await supabaseAdmin.auth.getUser(token);
  if (callerError || !callerData.user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const role: Employee["role"] = body?.role === "Admin" ? "Admin" : "Employée";
  const status: Employee["status"] = body?.status === "Inactif" ? "Inactif" : "Actif";

  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: "Prénom, nom et email sont requis." }, { status: 400 });
  }

  const password = generateTemporaryPassword();

  const { data: createdUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createUserError || !createdUser.user) {
    const message = createUserError?.message.toLowerCase().includes("already been registered")
      ? "Un compte existe déjà avec cet email."
      : createUserError?.message || "Impossible de créer le compte.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const id = createdUser.user.id;
  const recentActivity = "Compte créé — aucune activité pour le moment";

  const { error: insertError } = await supabaseAdmin.from("employees").insert({
    id,
    first_name: firstName,
    last_name: lastName,
    role,
    status,
    recent_activity: recentActivity,
    email,
  });

  if (insertError) {
    // The Auth account exists but the directory row failed — clean up so a
    // retry with the same email doesn't just hit "already registered".
    await supabaseAdmin.auth.admin.deleteUser(id).catch(() => {});
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const employee: Employee = {
    id,
    firstName,
    lastName,
    role,
    status,
    recentActivity,
    email,
  };

  return NextResponse.json({ employee, temporaryPassword: password });
}
