"use client";

import { useRouter } from "next/navigation";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { ChevronRightIcon, DashboardIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { getNotifications } from "@/lib/selectors";

const ROWS: { label: string; href: string }[] = [
  { label: "Mes informations", href: "/profile/mes-informations" },
  { label: "Notifications", href: "/profile/notifications" },
  { label: "Robes à préparer", href: "/profile/robes-a-preparer" },
  { label: "Aide", href: "/profile/aide" },
  { label: "Paramètres", href: "/profile/parametres" },
];

export default function ProfilePage() {
  const router = useRouter();
  const units = useAppStore((s) => s.units);
  const reservations = useAppStore((s) => s.reservations);
  const models = useAppStore((s) => s.models);
  const customers = useAppStore((s) => s.customers);
  const readNotificationIds = useAppStore((s) => s.readNotificationIds);

  const cleaningCount = units.filter((u) => u.baseStatus === "nettoyage").length;
  const unreadCount = getNotifications(reservations, units, models, customers).filter(
    (n) => !readNotificationIds.includes(n.id)
  ).length;

  const badgeFor = (label: string) => {
    if (label === "Robes à préparer" && cleaningCount > 0) return cleaningCount;
    if (label === "Notifications" && unreadCount > 0) return unreadCount;
    return null;
  };

  return (
    <div className="chi-rise px-[22px] pb-[26px] pt-[22px] text-center">
      <div className="mx-auto flex h-[96px] w-[96px] items-center justify-center rounded-full border border-border-input bg-card p-4">
        <ImageSlot src="/assets/bychichi-logo.png" alt="By Chichi" shape="circle" fit="contain" />
      </div>
      <div className="mt-4 font-serif text-[28px] text-ink">Chichi</div>
      <div className="mt-1.5 font-caps text-[9.5px] tracking-[2.2px] text-gold">
        ÉQUIPE BOUTIQUE
      </div>

      <div
        onClick={() => router.push("/admin")}
        className="mt-7 flex cursor-pointer items-center gap-[14px] rounded-[32px] border border-[#e3d4b3] bg-card px-5 py-[13px] text-left hover:border-[#c9a869]"
      >
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-pill text-gold">
          <DashboardIcon size={17} strokeWidth={1.4} />
        </div>
        <div className="flex-1">
          <div className="text-[14.5px] text-[#3b3226]">Espace Admin</div>
          <div className="font-caps text-[8.5px] tracking-[1.6px] text-gold">
            DASHBOARD · ROBES · RÉSERVATIONS · CLIENTES
          </div>
        </div>
        <div className="text-[#c9a869]">
          <ChevronRightIcon size={16} />
        </div>
      </div>

      <div className="mt-[11px] flex flex-col gap-[11px] text-left">
        {ROWS.map(({ label, href }) => {
          const badge = badgeFor(label);
          return (
            <div
              key={label}
              onClick={() => router.push(href)}
              className="flex cursor-pointer items-center gap-[14px] rounded-[32px] bg-pill px-5 py-[13px] hover:bg-pill-hover"
            >
              <div className="flex-1 text-[14.5px] text-[#3b3226]">{label}</div>
              {badge ? (
                <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1.5 font-caps text-[10px] text-gold-ink">
                  {badge}
                </div>
              ) : null}
              <div className="text-[#c9a869]">
                <ChevronRightIcon size={16} />
              </div>
            </div>
          );
        })}
      </div>

      <div
        onClick={() => router.push("/login")}
        className="mt-[26px] cursor-pointer text-[13.5px] text-[#b1553f]"
      >
        Se déconnecter
      </div>
    </div>
  );
}
