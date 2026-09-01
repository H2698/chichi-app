"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ADMIN_NAV } from "./AdminNavItems";
import { ChevronLeftIcon } from "@/components/icons";

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[248px] flex-shrink-0 flex-col bg-ink text-gold-ink lg:flex">
      <div className="flex items-center gap-2.5 px-6 pb-5 pt-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/bychichi-logo.png" alt="Chichii" className="h-8 w-8 rounded-full" />
        <div>
          <div className="font-serif text-[19px] leading-none">Chichii</div>
          <div className="mt-1 font-caps text-[8.5px] tracking-[2.4px] text-[#c9a869]">ADMIN</div>
        </div>
      </div>

      <nav className="mt-4 flex flex-1 flex-col gap-1 px-3">
        {ADMIN_NAV.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[14px] transition-colors"
              style={{
                background: active ? "rgba(201,168,105,.14)" : "transparent",
                color: active ? "#f6ecd9" : "rgba(246,236,217,.62)",
              }}
            >
              <Icon size={17} strokeWidth={1.4} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[rgba(246,236,217,.12)] px-3 py-4">
        <Link
          href="/home"
          className="flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-[13px] text-[rgba(246,236,217,.55)] hover:text-gold-ink"
        >
          <ChevronLeftIcon size={14} strokeWidth={1.6} />
          <span>Retour à l&apos;app employée</span>
        </Link>
      </div>
    </aside>
  );
}
