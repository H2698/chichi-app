"use client";

import { useEffect } from "react";
import { useAppStore } from "@/lib/store";

/**
 * Loads the real, persisted app state from Supabase once on mount, replacing
 * the local seed data the store starts with. Rendered once from the root
 * layout so every route benefits without each page having to remember to
 * call it.
 */
export function AppHydrator() {
  const hydrate = useAppStore((s) => s.hydrate);
  useEffect(() => {
    hydrate();
  }, [hydrate]);
  return null;
}
