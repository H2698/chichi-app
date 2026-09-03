import { NextResponse } from "next/server";
import { requireCaller, supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabaseAdmin";

/**
 * Changes an employee's login email — both the Supabase Auth user (what
 * they actually sign in with at /login) and the `employees.email` directory
 * column, together. Deliberately separate from the plain profile save on
 * the employee page (which only ever touches the directory row via the
 * anon-key client): an email is also a login identifier here, so changing
 * it needs the same service-role path as the password does, or the two
 * would silently drift apart — the directory would show a new email while
 * the person still signs in with the old one.
 *
 * Same caveat as the password route: only works for an employee whose
 * `employees.id` is a real Supabase Auth user id (i.e. created through
 * /api/employees). A directory-only row from before that feature existed
 * has no Auth account behind it to update.
 */
export async function PATCH(request: Request, ctx: RouteContext<"/api/employees/[id]/email">) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY n'est pas configurée côté serveur." },
      { status: 500 }
    );
  }

  const auth = await requireCaller(request);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, { email });

  if (authError) {
    const message = authError.message.toLowerCase().includes("not found")
      ? "Cette employée n'a pas de compte de connexion réel (créée avant cette fonctionnalité) — impossible de lui changer l'email ici."
      : authError.message.toLowerCase().includes("already been registered")
        ? "Un autre compte utilise déjà cet email."
        : authError.message;
    return NextResponse.json({ error: message }, { status: authError.status === 404 ? 404 : 400 });
  }

  const { error: dbError } = await supabaseAdmin.from("employees").update({ email }).eq("id", id);

  if (dbError) {
    return NextResponse.json(
      {
        error:
          "L'email de connexion a été changé, mais la fiche employée n'a pas pu être mise à jour : " +
          dbError.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, email });
}
