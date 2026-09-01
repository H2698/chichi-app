"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GalleryIcon,
  HomeIcon,
  ProfileIcon,
  QrIcon,
  ReservationsIcon,
} from "@/components/icons";

const items = [
  { key: "home", href: "/home", label: "Accueil", Icon: HomeIcon },
  { key: "reservations", href: "/reservations", label: "Réservations", Icon: ReservationsIcon },
  { key: "scanner", href: "/scanner", label: "Scanner", Icon: QrIcon },
  { key: "dresses", href: "/dresses", label: "Robes", Icon: GalleryIcon },
  { key: "profile", href: "/profile", label: "Profil", Icon: ProfileIcon },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div
      className="flex flex-shrink-0 items-end justify-between border-t border-border bg-[rgba(250,244,234,.94)] px-3.5 pb-4 pt-2.5 backdrop-blur-[8px]"
      style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
    >
      {items.map(({ key, href, label, Icon }) => {
        const active = pathname?.startsWith(href);
        const isScan = key === "scanner";
        return (
          <Link
            key={key}
            href={href}
            className="flex flex-1 flex-col items-center gap-1.5"
            style={{ color: isScan ? undefined : active ? "#33291f" : "#b3a68f" }}
          >
            <div
              className="flex items-center justify-center rounded-[8px]"
              style={
                isScan
                  ? {
                      width: 52,
                      height: 52,
                      borderRadius: 17,
                      background: "#33291f",
                      marginTop: -20,
                      boxShadow: "0 12px 22px -12px rgba(35,27,20,.9)",
                      color: "#c9a869",
                    }
                  : { width: 26, height: 26 }
              }
            >
              <Icon size={isScan ? 23 : 19} strokeWidth={isScan ? 1.3 : 1.4} />
            </div>
            {label ? <div className="text-[9.5px] tracking-[0.7px]">{label}</div> : null}
          </Link>
        );
      })}
    </div>
  );
}
