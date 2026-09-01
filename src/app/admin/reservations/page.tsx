"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Dot } from "@/components/ui/Card";
import { SearchIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import {
  adminReservationBucket,
  reservationStatus,
  searchReservations,
  unitLabel,
  type AdminReservationTab,
} from "@/lib/selectors";
import { dayLabel } from "@/lib/format";
import type { ReservationStatus } from "@/lib/types";

const TABS: AdminReservationTab[] = ["Aujourd'hui", "À venir", "Passées", "Annulées"];

const STATUS_STYLE: Record<ReservationStatus, { label: string; dot: string; fg: string }> = {
  CONFIRMEE: { label: "CONFIRMÉE", dot: "#b3873d", fg: "#8a6a2c" },
  RETOUR_PREVU: { label: "RETOUR PRÉVU", dot: "#7c5a6b", fg: "#7c5a6b" },
  EN_RETARD: { label: "EN RETARD", dot: "#b1553f", fg: "#8f4331" },
  TERMINEE: { label: "TERMINÉE", dot: "#7f9476", fg: "#5f7355" },
  ANNULEE: { label: "ANNULÉE", dot: "#a49c8e", fg: "#a49c8e" },
};

export default function AdminReservationsPage() {
  const router = useRouter();
  const reservations = useAppStore((s) => s.reservations);
  const customers = useAppStore((s) => s.customers);
  const units = useAppStore((s) => s.units);
  const models = useAppStore((s) => s.models);
  const [tab, setTab] = useState<AdminReservationTab>("Aujourd'hui");
  const [query, setQuery] = useState("");

  const rows = searchReservations(query, reservations, customers, units, models)
    .filter((row) => adminReservationBucket(row.reservation) === tab)
    .sort((a, b) => a.reservation.pickupDay - b.reservation.pickupDay);

  return (
    <div className="px-[22px] pb-10 pt-2.5 lg:px-0 lg:pt-0">
      <AdminPageHeader title="Réservations" subtitle={`${reservations.length} au total`} />

      <div className="flex items-center gap-[11px] rounded-2xl border border-border-input bg-card px-[15px] py-3.5">
        <SearchIcon size={16} strokeWidth={1.6} className="text-tertiary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cliente, téléphone, robe ou référence"
          className="flex-1 border-none bg-transparent text-[14px] text-ink outline-none"
        />
      </div>

      <div className="mt-4 flex gap-6 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <div
            key={t}
            onClick={() => setTab(t)}
            className="-mb-px flex-shrink-0 cursor-pointer whitespace-nowrap pb-[11px] text-[14px]"
            style={{
              borderBottom: `2px solid ${tab === t ? "#a5813f" : "transparent"}`,
              color: tab === t ? "#33291f" : "#a3937c",
            }}
          >
            {t}
          </div>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card px-4 py-8 text-center text-[13.5px] text-secondary-2">
          Aucune réservation dans cette catégorie.
        </div>
      ) : (
        <>
          {/* Mobile / tablet: card list, matching the employee app's pattern */}
          <div className="mt-4 flex flex-col gap-3 lg:hidden">
            {rows.map(({ reservation: r, customer, unit }) => {
              const status = STATUS_STYLE[reservationStatus(r, units)];
              return (
                <div
                  key={r.id}
                  onClick={() => router.push(`/admin/reservations/${r.id}`)}
                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  <div className="h-[70px] w-[54px] flex-shrink-0 overflow-hidden rounded-xl bg-[#efe6d5]">
                    <ImageSlot placeholder="Robe" shape="rounded" radius={10} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-serif text-[19px] text-ink">
                      {customer ? `${customer.firstName} ${customer.lastName}` : "Cliente"}
                    </div>
                    <div className="text-[12.5px] text-secondary-2">{unit ? unitLabel(unit, models) : ""}</div>
                    <div className="mt-0.5 text-[12px] text-secondary">
                      {dayLabel(r.pickupDay)} → {dayLabel(r.returnDay)} · {r.id}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <Dot color={status.dot} size={5} />
                      <div className="font-caps text-[9px] tracking-[1.6px]" style={{ color: status.fg }}>
                        {status.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: dense table */}
          <div className="mt-4 hidden overflow-hidden rounded-2xl border border-border lg:block">
            <table className="w-full border-collapse text-[13.5px]">
              <thead>
                <tr className="border-b border-border bg-card text-left text-[11px] uppercase tracking-[1px] text-tertiary">
                  <th className="px-4 py-3 font-normal">Référence</th>
                  <th className="px-4 py-3 font-normal">Cliente</th>
                  <th className="px-4 py-3 font-normal">Robe</th>
                  <th className="px-4 py-3 font-normal">Dates</th>
                  <th className="px-4 py-3 font-normal">Statut</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ reservation: r, customer, unit }) => {
                  const status = STATUS_STYLE[reservationStatus(r, units)];
                  return (
                    <tr
                      key={r.id}
                      onClick={() => router.push(`/admin/reservations/${r.id}`)}
                      className="cursor-pointer border-b border-border-soft bg-app last:border-0 hover:bg-card"
                    >
                      <td className="px-4 py-3 font-caps text-[11px] tracking-[1px] text-gold">{r.id}</td>
                      <td className="px-4 py-3 text-ink">
                        {customer ? `${customer.firstName} ${customer.lastName}` : "Cliente"}
                      </td>
                      <td className="px-4 py-3 text-secondary">{unit ? unitLabel(unit, models) : ""}</td>
                      <td className="px-4 py-3 text-secondary">
                        {dayLabel(r.pickupDay)} → {dayLabel(r.returnDay)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <Dot color={status.dot} size={5} />
                          <span className="font-caps text-[9.5px] tracking-[1.4px]" style={{ color: status.fg }}>
                            {status.label}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
