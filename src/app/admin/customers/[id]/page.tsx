"use client";

import { useParams, useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Dot } from "@/components/ui/Card";
import { ChevronRightIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { reservationStatus, reservationsForCustomer, unitLabel } from "@/lib/selectors";
import { dayLabel } from "@/lib/format";
import type { ReservationStatus } from "@/lib/types";

const STATUS_STYLE: Record<ReservationStatus, { label: string; dot: string; fg: string }> = {
  CONFIRMEE: { label: "CONFIRMÉE", dot: "#b3873d", fg: "#8a6a2c" },
  RETOUR_PREVU: { label: "RETOUR PRÉVU", dot: "#7c5a6b", fg: "#7c5a6b" },
  EN_RETARD: { label: "EN RETARD", dot: "#b1553f", fg: "#8f4331" },
  TERMINEE: { label: "TERMINÉE", dot: "#7f9476", fg: "#5f7355" },
  ANNULEE: { label: "ANNULÉE", dot: "#a49c8e", fg: "#a49c8e" },
};

export default function AdminCustomerProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const customers = useAppStore((s) => s.customers);
  const reservations = useAppStore((s) => s.reservations);
  const units = useAppStore((s) => s.units);
  const models = useAppStore((s) => s.models);

  const customer = customers.find((c) => c.id === params.id);

  if (!customer) {
    return (
      <div className="px-[22px] pb-10 pt-2.5 text-center text-secondary-2 lg:px-0 lg:pt-0">
        Cliente introuvable.
      </div>
    );
  }

  const history = reservationsForCustomer(customer.id, reservations);
  const current = history.filter((r) => {
    const st = reservationStatus(r, units);
    return st === "RETOUR_PREVU" || st === "EN_RETARD";
  });
  const upcoming = history.filter((r) => reservationStatus(r, units) === "CONFIRMEE");
  const past = history.filter((r) => {
    const st = reservationStatus(r, units);
    return st === "TERMINEE" || st === "ANNULEE";
  });

  const Row = ({ r }: { r: (typeof history)[number] }) => {
    const unit = units.find((u) => u.ref === r.unitRef);
    const status = STATUS_STYLE[reservationStatus(r, units)];
    return (
      <div
        onClick={() => router.push(`/admin/reservations/${r.id}`)}
        className="flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-card px-4 py-3"
      >
        <div>
          <div className="text-[14.5px] text-ink">{unit ? unitLabel(unit, models) : r.unitRef}</div>
          <div className="mt-0.5 text-[12px] text-secondary-2">
            {dayLabel(r.pickupDay)} → {dayLabel(r.returnDay)} · {r.id}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Dot color={status.dot} size={5} />
          <span className="font-caps text-[9px] tracking-[1.4px]" style={{ color: status.fg }}>
            {status.label}
          </span>
          <ChevronRightIcon size={14} className="text-[#c9a869]" />
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[640px] px-[22px] pb-10 pt-2.5 lg:mx-0 lg:px-0 lg:pt-0">
      <AdminPageHeader title={`${customer.firstName} ${customer.lastName}`} back subtitle={customer.phone} />

      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-border bg-card px-3 py-3.5 text-center">
          <div className="font-serif text-[24px] text-ink">{customer.rentalsCount}</div>
          <div className="mt-1 text-[10.5px] font-light text-secondary-2">Locations au total</div>
        </div>
        <div className="rounded-2xl border border-border bg-card px-3 py-3.5 text-center">
          <div className="font-serif text-[24px] text-ink">{current.length}</div>
          <div className="mt-1 text-[10.5px] font-light text-secondary-2">En cours</div>
        </div>
        <div className="rounded-2xl border border-border bg-card px-3 py-3.5 text-center">
          <div className="font-serif text-[24px] text-ink">{upcoming.length}</div>
          <div className="mt-1 text-[10.5px] font-light text-secondary-2">À venir</div>
        </div>
      </div>

      {current.length > 0 ? (
        <div className="mt-6">
          <div className="font-serif text-[20px] text-ink">Réservation en cours</div>
          <div className="mt-3 flex flex-col gap-2">
            {current.map((r) => (
              <Row key={r.id} r={r} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-6">
        <div className="font-serif text-[20px] text-ink">Réservations à venir</div>
        <div className="mt-3 flex flex-col gap-2">
          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-4 py-4 text-center text-[13px] text-secondary-2">
              Aucune réservation à venir.
            </div>
          ) : (
            upcoming.map((r) => <Row key={r.id} r={r} />)
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="font-serif text-[20px] text-ink">Historique</div>
        <div className="mt-3 flex flex-col gap-2">
          {past.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-4 py-4 text-center text-[13px] text-secondary-2">
              Aucune location passée enregistrée dans cette démo.
            </div>
          ) : (
            past.map((r) => <Row key={r.id} r={r} />)
          )}
        </div>
      </div>
    </div>
  );
}
