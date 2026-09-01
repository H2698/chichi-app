"use client";

import { useAppStore } from "@/lib/store";

export function Toast() {
  const toast = useAppStore((s) => s.toast);
  if (!toast) return null;

  return (
    <div className="chi-rise absolute inset-x-6 bottom-24 z-30 rounded-2xl bg-ink px-[18px] py-3.5 text-[13.5px] text-gold-ink shadow-[0_18px_30px_-18px_rgba(35,27,20,.8)]">
      {toast}
    </div>
  );
}
