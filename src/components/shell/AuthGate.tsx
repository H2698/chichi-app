"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase, supabaseConfigured } from "@/lib/supabase";

/**
 * Blocks rendering of protected screens until a real Supabase Auth session
 * is confirmed, redirecting to /login otherwise. Wraps the (employee) and
 * admin layouts so both areas of the app require sign-in.
 *
 * If Supabase isn't configured (no env vars), it behaves like before —
 * everything is open — so local/offline demo mode keeps working.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === "/login";
  const [ready, setReady] = useState(!supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session && !isLoginPage) {
        router.replace("/login");
        return;
      }
      setReady(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isLoginPage) {
        router.replace("/login");
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [isLoginPage, router]);

  // Avoid flashing protected content before the session check resolves.
  if (!ready && !isLoginPage) return null;
  return <>{children}</>;
}
