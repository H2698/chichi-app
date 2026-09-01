"use client";

import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/shell/BackHeader";
import { ChevronRightIcon, ClockIcon, CheckIcon, QrIcon, ReturnIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { getNotifications } from "@/lib/selectors";
import type { NotificationKind } from "@/lib/types";

const KIND_STYLE: Record<NotificationKind, { Icon: typeof ClockIcon; fg: string; bg: string }> = {
  retard: { Icon: ClockIcon, fg: "#b1553f", bg: "#f6e3dd" },
  nettoyage: { Icon: ReturnIcon, fg: "#5f7285", bg: "#eef3f6" },
  retrait: { Icon: QrIcon, fg: "#5f7355", bg: "#f1f4ee" },
  reservation: { Icon: CheckIcon, fg: "#8a6a2c", bg: "#f7edd9" },
};

export default function NotificationsPage() {
  const router = useRouter();
  const reservations = useAppStore((s) => s.reservations);
  const units = useAppStore((s) => s.units);
  const models = useAppStore((s) => s.models);
  const customers = useAppStore((s) => s.customers);
  const readIds = useAppStore((s) => s.readNotificationIds);
  const markRead = useAppStore((s) => s.markNotificationRead);
  const markAllRead = useAppStore((s) => s.markAllNotificationsRead);

  const notifications = getNotifications(reservations, units, models, customers);
  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  return (
    <div className="chi-rise px-[22px] pb-[26px] pt-2.5">
      <div className="flex items-center justify-between">
        <BackHeader title="Notifications" size="md" />
        {unreadCount > 0 ? (
          <div
            onClick={() => markAllRead(notifications.map((n) => n.id))}
            className="cursor-pointer text-[12px] text-gold"
          >
            Tout marquer comme lu
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {notifications.length === 0 ? (
          <div className="rounded-[18px] border border-border bg-card px-4 py-8 text-center text-[13.5px] text-secondary-2">
            Aucune notification pour le moment.
          </div>
        ) : (
          notifications.map((n) => {
            const { Icon, fg, bg } = KIND_STYLE[n.kind];
            const unread = !readIds.includes(n.id);
            return (
              <div
                key={n.id}
                onClick={() => {
                  markRead(n.id);
                  if (n.unitRef) router.push(`/dress/${n.unitRef}`);
                }}
                className="flex cursor-pointer items-start gap-3 rounded-[18px] border border-border bg-card p-[13px]"
                style={{ borderColor: unread ? "#e3d4b3" : undefined }}
              >
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full"
                  style={{ background: bg, color: fg }}
                >
                  <Icon size={16} strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[14.5px] text-ink" style={{ fontWeight: unread ? 500 : 400 }}>
                      {n.title}
                    </div>
                    {unread ? <div className="h-[6px] w-[6px] flex-shrink-0 rounded-full bg-gold" /> : null}
                  </div>
                  <div className="mt-0.5 truncate text-[12.5px] font-light text-secondary-2">
                    {n.detail}
                  </div>
                  <div className="mt-1 text-[11px] text-tertiary">{n.when}</div>
                </div>
                {n.unitRef ? (
                  <ChevronRightIcon size={14} className="mt-1.5 flex-shrink-0 text-[#c9a869]" />
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
