"use client";

import { useParams, useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Dot } from "@/components/ui/Card";
import { useAppStore } from "@/lib/store";
import { findModel, reservationStatus, unitLabel } from "@/lib/selectors";
import { dayLabelFull, money } from "@/lib/format";
import type { ReservationStatus } from "@/lib/types";

const STATUS_STYLE: Record<ReservationStatus, { label: string; dot: string; fg: string; bg: string }> = {
  CONFIRMEE: { label: "CONFIRMÉE", dot: "#b3873d", fg: "#8a6a2c", bg: "#f7edd9" },
  RETOUR_PREVU: { label: "RETOUR PRÉVU", dot: "#7c5a6b", fg: "#7c5a6b", bg: "#f6ebee" },
  EN_RETARD: { label: "EN RETARD", dot: "#b1553f", fg: "#8f4331", bg: "#f6e3dd" },
  TERMINEE: { label: "TERMINÉE", dot: "#7f9476", fg: "#5f7355", bg: "#f1f4ee" },
  ANNULEE: { label: "ANNULÉE", dot: "#a49c8e", fg: "#a49c8e", bg: "#f1eee8" },
};

export default function AdminReservationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const reservations = useAppStore((s) => s.reservations);
  const units = useAppStore((s) => s.units);
  const models = useAppStore((s) => s.models);
  const customers = useAppStore((s) => s.customers);
  const cancelReservation = useAppStore((s) => s.cancelReservation);
  const showToast = useAppStore((s) => s.showToast);

  const reservation = reservations.find((r) => r.id === params.id);

  if (!reservation) {
    return (
      <div className="px-[22px] pb-10 pt-2.5 text-center text-secondary-2 lg:px-0 lg:pt-0">
        Réservation introuvable.
      </div>
    );
  }

  const unit = units.find((u) => u.ref === reservation.unitRef);
  const model = unit ? findModel(unit.modelId, models) : undefined;
  const customer = customers.find((c) => c.id === reservation.customerId);
  const status = STATUS_STYLE[reservationStatus(reservation, units)];
  const canCancel = !reservation.completed && !reservation.cancelled;

  return (
    <div className="mx-auto max-w-[560px] px-[22px] pb-10 pt-2.5 lg:mx-0 lg:px-0 lg:pt-0">
      <AdminPageHeader title={reservation.id} back subtitle="Détail de la réservation" />

      <div className="flex items-center gap-2 rounded-2xl px-4 py-2.5" style={{ background: status.bg }}>
        <Dot color={status.dot} size={6} />
        <div className="font-caps text-[10px] tracking-[1.8px]" style={{ color: status.fg }}>
          {status.label}
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex gap-3.5 p-4">
          <div className="h-[84px] w-[66px] flex-shrink-0 overflow-hidden rounded-xl bg-[#efe6d5]">
            <ImageSlot src={model?.photoUrl} placeholder="Robe" shape="rounded" radius={12} />
          </div>
          <div>
            <div className="font-serif text-[21px] text-ink">{model?.name ?? "Robe"}</div>
            <div className="mt-1 text-[13px] text-secondary-2">{unit ? unitLabel(unit, models) : ""}</div>
            <div className="mt-1.5 font-caps text-[9.5px] tracking-[1.6px] text-gold">{unit?.ref}</div>
          </div>
        </div>
        {[
          {
            k: "Cliente",
            v: customer ? `${customer.firstName} ${customer.lastName}` : "—",
            sub: customer?.phone,
          },
          { k: "Retrait", v: dayLabelFull(reservation.pickupDay), sub: reservation.pickupTime },
          { k: "Retour", v: dayLabelFull(reservation.returnDay), sub: reservation.returnTime },
          {
            k: "Paiement",
            v: `${money(reservation.price)} · payé ${money(reservation.paid)}`,
            sub: `Reste ${money(reservation.price - reservation.paid)} · caution ${money(reservation.deposit)}`,
          },
          { k: "Méthode", v: reservation.method },
        ].map((row) => (
          <div key={row.k} className="flex items-center justify-between border-t border-border-soft px-4 py-3.5">
            <div className="text-[11px] uppercase tracking-[1.4px] text-tertiary">{row.k}</div>
            <div className="text-right">
              <div className="text-[15px] text-ink">{row.v}</div>
              {row.sub ? <div className="mt-0.5 text-[12px] text-secondary-2">{row.sub}</div> : null}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2.5">
        {unit ? (
          <Button variant="outline" onClick={() => router.push(`/dress/${unit.ref}`)}>
            Voir la fiche robe
          </Button>
        ) : null}
        {customer ? (
          <Button variant="outline" onClick={() => router.push(`/admin/customers/${customer.id}`)}>
            Voir la cliente
          </Button>
        ) : null}
        {canCancel ? (
          <Button
            variant="ghost"
            className="!text-[#b1553f]"
            onClick={() => {
              cancelReservation(reservation.id);
              showToast("Réservation annulée");
            }}
          >
            Annuler la réservation
          </Button>
        ) : null}
      </div>
    </div>
  );
}
