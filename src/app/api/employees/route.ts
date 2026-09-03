import { NextResponse } from "next/server";
import { MIN_PASSWORD_LENGTH, requireCaller, supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabaseAdmin";
import type { Employee } from "@/lib/types";

/**
 * Creates a real Supabase Auth login for a new employee, alongside their
 * `employees` directory row. Requires the service-role key, so this has to
 * run server-side — the admin UI's "Ajouter une employée" form used to only
 * write the directory row (see git history), which is why new employees had
 * a profile but no way to actually sign in at /login.
 *
 * The password is chosen by the caller (the shop owner), not generated here
 * — they'd rather set something they can tell the employee directly than
 * relay a random string shown once.
 */
export async function POST(request: Request) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY n'est pas configurée côté serveur." },
      { status: 500 }
    );
  }

  const auth = await requireCaller(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
  const lastName = typeof body?.lastName === "string" ? body.lastName.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const role: Employee["role"] = body?.role === "Admin" ? "Admin" : "Employée";
  const status: Employee["status"] = body?.status === "Inactif" ? "Inactif" : "Actif";

  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: "Prénom, nom et email sont requis." }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.` },
      { status: 400 }
    );
  }

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

  return NextResponse.json({ employee });
}
