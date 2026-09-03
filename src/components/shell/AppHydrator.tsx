"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { supabase, supabaseConfigured } from "@/lib/supabase";

/**
 * Loads the real, persisted app state from Supabase once on mount, replacing
 * the local seed data the store starts with. Rendered once from the root
 * layout so every route benefits without each page having to remember to
 * call it.
 *
 * Also keeps the store's authUserId/authUserEmail in sync with the signed-in
 * Supabase Auth session, so any screen can resolve "who am I" against the
 * employees directory (see lib/selectors' getCurrentEmployee) instead of
 * assuming the original shared "Chichi" account, which is all screens did
 * before real per-employee logins existed.
 */
export function AppHydrator() {
  const hydrate = useAppStore((s) => s.hydrate);
  const setAuthUser = useAppStore((s) => s.setAuthUser);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (!supabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setAuthUser(data.session?.user.id ?? null, data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user.id ?? null, session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, [setAuthUser]);

  return null;
}
