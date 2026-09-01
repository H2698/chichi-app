"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeftIcon,
  DashboardIcon,
  GalleryIcon,
  MenuIcon,
  ReservationsIcon,
  UsersIcon,
} from "@/components/icons";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ADMIN_NAV } from "./AdminNavItems";

const PRIMARY = [
  { href: "/admin", label: "Dashboard", Icon: DashboardIcon, exact: true },
  { href: "/admin/dresses", label: "Robes", Icon: GalleryIcon, exact: false },
  { href: "/admin/reservations", label: "Réservations", Icon: ReservationsIcon, exact: false },
  { href: "/admin/customers", label: "Clientes", Icon: UsersIcon, exact: false },
] as const;

const OVERFLOW = ADMIN_NAV.filter((n) => !PRIMARY.some((p) => p.href === n.href));

export function AdminBottomNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const overflowActive = OVERFLOW.some((n) => pathname?.startsWith(n.href));

  return (
    <>
      <div
        className="flex flex-shrink-0 items-center justify-between border-t border-border bg-[rgba(250,244,234,.94)] px-3.5 pb-2.5 pt-2.5 backdrop-blur-[8px] lg:hidden"
        style={{ paddingBottom: "calc(10px + env(safe-area-inset-bottom))" }}
      >
        {PRIMARY.map(({ href, label, Icon, exact }) => {
          const active = exact ? pathname === href : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-1.5"
              style={{ color: active ? "#33291f" : "#b3a68f" }}
            >
              <Icon size={19} strokeWidth={1.4} />
              <div className="text-[9.5px] tracking-[0.7px]">{label}</div>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          className="flex flex-1 flex-col items-center gap-1.5"
          style={{ color: overflowActive ? "#33291f" : "#b3a68f" }}
        >
          <MenuIcon size={19} strokeWidth={1.4} />
          <div className="text-[9.5px] tracking-[0.7px]">Plus</div>
        </button>
      </div>

      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)}>
        <div className="font-serif text-[22px] text-ink">Plus</div>
        <div className="mt-4 flex flex-col gap-2">
          {OVERFLOW.map(({ href, label, Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3.5 rounded-2xl bg-pill px-5 py-3.5 text-[14.5px] text-[#3b3226]"
            >
              <Icon size={18} strokeWidth={1.4} className="text-gold" />
              {label}
            </Link>
          ))}
        </div>
        <div className="my-4 h-px bg-border" />
        <Link
          href="/home"
          onClick={() => setMoreOpen(false)}
          className="flex items-center gap-3.5 rounded-2xl px-5 py-3 text-[13.5px] text-secondary-2"
        >
          <ChevronLeftIcon size={15} strokeWidth={1.6} />
          Retour à l&apos;app employée
        </Link>
      </BottomSheet>
    </>
  );
}
