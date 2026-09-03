"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured } from "@/lib/supabase";
import { useAppStore } from "@/lib/store";

/**
 * Looks up the signed-in user's role in the `employees` directory. Checked
 * by id first — that's how every employee created through /api/employees
 * is linked (employees.id is their real Auth user id) — falling back to
 * email for the handful of employees that predate that (their employees.id
 * is a hand-picked slug like "emp-chichi", unrelated to any Auth id, but
 * chichi@bychichi.tn's row does carry a matching email).
 *
 * No match at all (a real account with no directory row) is treated as not
 * Admin — the safe default, not an error.
 */
async function currentUserIsAdmin(session: Session): Promise<boolean> {
  const byId = await supabase.from("employees").select("role").eq("id", session.user.id).maybeSingle();
  if (byId.data) return byId.data.role === "Admin";

  if (session.user.email) {
    const byEmail = await supabase
      .from("employees")
      .select("role")
      .eq("email", session.user.email)
      .maybeSingle();
    if (byEmail.data) return byEmail.data.role === "Admin";
  }

  return false;
}

/**
 * Blocks rendering of protected screens until a real Supabase Auth session
 * is confirmed, redirecting to /login otherwise. Wraps the (employee) and
 * admin layouts so both areas of the app require sign-in.
 *
 * `requireAdmin` additionally checks the signed-in user's role and sends
 * anyone who isn't an Admin to /home — before this, any signed-in employee
 * (any role) could reach every /admin screen, including creating other
 * employee accounts and changing their passwords.
 *
 * If Supabase isn't configured (no env vars), it behaves like before —
 * everything is open — so local/offline demo mode keeps working.
 */
export function AuthGate({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const isLoginPage = pathname === "/login";
  const [ready, setReady] = useState(!supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let active = true;

    const handleSession = async (session: Session | null) => {
      if (!session) {
        if (!isLoginPage) router.replace("/login");
        return;
      }
      if (requireAdmin) {
        const isAdmin = await currentUserIsAdmin(session);
        if (!active) return;
        if (!isAdmin) {
          showToast("Accès réservé aux administratrices");
          router.replace("/home");
          return;
        }
      }
      if (active) setReady(true);
    };

    supabase.auth.getSession().then(({ data }) => handleSession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [isLoginPage, requireAdmin, router, showToast]);

  // Avoid flashing protected content before the session (and, for admin
  // routes, the role) check resolves.
  if (!ready && !isLoginPage) return null;
  return <>{children}</>;
}
