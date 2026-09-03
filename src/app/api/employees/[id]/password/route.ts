import { NextResponse } from "next/server";
import { MIN_PASSWORD_LENGTH, requireAdminCaller, supabaseAdmin, supabaseAdminConfigured } from "@/lib/supabaseAdmin";

/**
 * Lets the shop owner set a new password for an existing employee's login,
 * directly — e.g. after they forgot it, or to hand out a fresh one. Only
 * works for employees created through /api/employees (their `employees.id`
 * is the matching Supabase Auth user's id); employees added before that
 * feature existed, or through the old offline/demo form, have no real
 * account behind their id and this will 404 for them.
 */
export async function PATCH(request: Request, ctx: RouteContext<"/api/employees/[id]/password">) {
  if (!supabaseAdminConfigured) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY n'est pas configurée côté serveur." },
      { status: 500 }
    );
  }

  const auth = await requireAdminCaller(request);
  if (auth.error) return auth.error;

  const { id } = await ctx.params;
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (password.length < MIN_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.` },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(id, { password });

  if (error) {
    const message = error.message.toLowerCase().includes("not found")
      ? "Cette employée n'a pas de compte de connexion réel (créée avant cette fonctionnalité) — impossible de lui définir un mot de passe ici."
      : error.message;
    return NextResponse.json({ error: message }, { status: error.status === 404 ? 404 : 400 });
  }

  return NextResponse.json({ ok: true });
}
