"use client";

import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageSlot } from "@/components/ui/ImageSlot";
import {
  ChevronRightIcon,
  PlusIcon,
  QrIcon,
  SearchIcon,
  UsersIcon,
} from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { getAdminStats, unitLabel } from "@/lib/selectors";
import { TODAY_DAY, TODAY_WEEKDAY_LABEL } from "@/lib/mock-data";

export default function AdminDashboardPage() {
  const router = useRouter();
  const models = useAppStore((s) => s.models);
  const units = useAppStore((s) => s.units);
  const reservations = useAppStore((s) => s.reservations);
  const customers = useAppStore((s) => s.customers);

  const stats = getAdminStats(units, reservations);

  const todayEntries = reservations
    .filter((r) => !r.completed && !r.cancelled && (r.pickupDay === TODAY_DAY || r.returnDay === TODAY_DAY))
    .flatMap((r) => {
      const rows: { time: string; kind: "RETRAIT" | "RETOUR"; reservation: typeof r }[] = [];
      if (r.pickupDay === TODAY_DAY) rows.push({ time: r.pickupTime, kind: "RETRAIT", reservation: r });
      if (r.returnDay === TODAY_DAY) rows.push({ time: r.returnTime, kind: "RETOUR", reservation: r });
      return rows;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const statCards = [
    { n: stats.pickupsToday, label: "Retraits aujourd'hui", color: "#33291f" },
    { n: stats.returnsToday, label: "Retours aujourd'hui", color: "#33291f" },
    { n: stats.upcomingCount, label: "Réservations à venir", color: "#8a6a2c" },
    { n: stats.availableUnits, label: "Robes disponibles", color: "#5f7355" },
    { n: stats.rentedUnits, label: "Robes louées", color: "#7c5a6b" },
    { n: stats.cleaningUnits, label: "Robes à nettoyer", color: "#5f7285" },
    { n: stats.lateCount, label: "Retours en retard", color: "#b1553f" },
  ];

  const quick = [
    { label: "Ajouter une robe", icon: <PlusIcon size={18} />, onClick: () => router.push("/admin/dresses/new") },
    { label: "Nouvelle réservation", icon: <QrIcon size={18} strokeWidth={1.3} />, onClick: () => router.push("/dresses") },
    { label: "Scanner une robe", icon: <SearchIcon size={18} />, onClick: () => router.push("/scanner") },
    { label: "Ajouter une cliente", icon: <UsersIcon size={18} />, onClick: () => router.push("/admin/customers/new") },
  ];

  return (
    <div className="px-[22px] pb-10 pt-2.5 lg:px-0 lg:pt-0">
      <AdminPageHeader title="Dashboard" subtitle={TODAY_WEEKDAY_LABEL} />

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
        {statCards.map((st) => (
          <div key={st.label} className="rounded-2xl border border-border bg-card px-4 py-4">
            <div className="font-serif text-[28px] leading-none" style={{ color: st.color }}>
              {st.n}
            </div>
            <div className="mt-2 text-[11.5px] font-light leading-tight text-secondary-2">
              {st.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <div className="font-serif text-[22px] text-ink">Aujourd&apos;hui</div>
          <div className="mt-3 flex flex-col gap-2.5">
            {todayEntries.length === 0 ? (
              <div className="rounded-2xl border border-border bg-card px-4 py-5 text-center text-[13px] text-secondary-2">
                Rien de prévu aujourd&apos;hui.
              </div>
            ) : (
              todayEntries.map((entry, i) => {
                const unit = units.find((u) => u.ref === entry.reservation.unitRef);
                const customer = customers.find((c) => c.id === entry.reservation.customerId);
                const isPickup = entry.kind === "RETRAIT";
                return (
                  <div
                    key={i}
                    onClick={() => router.push(`/admin/reservations/${entry.reservation.id}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:border-[#dcc9a4]"
                  >
                    <div className="h-[58px] w-[46px] flex-shrink-0 overflow-hidden rounded-xl bg-[#efe6d5]">
                      <ImageSlot placeholder="Robe" shape="rounded" radius={10} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-serif text-[17px] text-ink">{entry.time}</div>
                        <div
                          className="rounded-md px-1.5 py-[2px] font-caps text-[8.5px] tracking-[1.4px]"
                          style={{
                            background: isPickup ? "#f1f4ee" : "#f6ebee",
                            color: isPickup ? "#5f7355" : "#7c5a6b",
                          }}
                        >
                          {entry.kind}
                        </div>
                      </div>
                      <div className="truncate text-[13.5px] text-ink">
                        {customer ? `${customer.firstName} ${customer.lastName}` : "Cliente"}
                      </div>
                      <div className="truncate text-[11.5px] font-light text-secondary-2">
                        {unit ? unitLabel(unit, models) : ""}
                      </div>
                    </div>
                    <ChevronRightIcon size={15} className="text-[#c9a869]" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div>
          <div className="font-serif text-[22px] text-ink">Actions rapides</div>
          <div className="mt-3 flex flex-col gap-2.5">
            {quick.map((q) => (
              <div
                key={q.label}
                onClick={q.onClick}
                className="flex cursor-pointer items-center gap-3.5 rounded-2xl bg-pill px-4 py-3 hover:bg-pill-hover"
              >
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[#e3d4b3] bg-card text-gold">
                  {q.icon}
                </div>
                <div className="flex-1 text-[14px] text-[#3b3226]">{q.label}</div>
                <ChevronRightIcon size={16} className="text-[#c9a869]" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
