"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ReservationPrintable } from "@/components/ui/ReservationPrintable";
import { CheckIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { findModel } from "@/lib/selectors";
import { dayLabel } from "@/lib/format";

export default function ReservationSuccessPage() {
  const router = useRouter();
  const lastReservationId = useAppStore((s) => s.lastReservationId);
  const reservations = useAppStore((s) => s.reservations);
  const units = useAppStore((s) => s.units);
  const models = useAppStore((s) => s.models);
  const customers = useAppStore((s) => s.customers);
  const showToast = useAppStore((s) => s.showToast);

  const reservation = reservations.find((r) => r.id === lastReservationId);

  useEffect(() => {
    if (!reservation) router.replace("/home");
  }, [reservation, router]);

  if (!reservation) return null;

  const unit = units.find((u) => u.ref === reservation.unitRef);
  const model = unit ? findModel(unit.modelId, models) : undefined;
  const customer = customers.find((c) => c.id === reservation.customerId);

  return (
    <div className="chi-fade flex min-h-full flex-col items-center px-[30px] pb-[34px] pt-[60px] text-center">
      <div className="relative flex h-[84px] w-[84px] items-center justify-center">
        <div className="absolute inset-0 rounded-full border border-[#e0cba0]" />
        <div className="absolute inset-[10px] rounded-full border border-[#efe0c2]" />
        <CheckIcon size={26} strokeWidth={1.3} className="text-gold" />
      </div>
      <div className="mt-6 font-serif text-[31px] text-ink">Réservation confirmée</div>
      <div className="mt-2.5 font-caps text-[11px] tracking-[3px] text-gold">
        {reservation.id}
      </div>
      <div className="my-6 h-px w-11 bg-[#e0cba0]" />
      <div className="font-serif text-[24px] text-ink">
        {customer ? `${customer.firstName} ${customer.lastName}` : "Cliente"}
      </div>
      <div className="mt-1.5 text-[14.5px] text-secondary">
        {dayLabel(reservation.pickupDay)} → {dayLabel(reservation.returnDay)}
      </div>
      <div className="mt-0.5 text-[14.5px] text-secondary">
        {model?.name} · {unit?.size}
      </div>

      <div className="mt-[34px] flex w-full flex-col gap-[11px]">
        <Button variant="dark" onClick={() => router.push("/reservations")}>
          Voir la réservation
        </Button>
        <Button variant="outline" onClick={() => router.push(`/calendar/${reservation.unitRef}`)}>
          Voir le calendrier
        </Button>
        <Button variant="ghost" onClick={() => router.push("/home")}>
          Retour à l&apos;accueil
        </Button>
      </div>

      <div className="mt-5 flex gap-[26px]">
        <div
          className="cursor-pointer text-[12.5px] text-gold"
          onClick={() => showToast("Réservation envoyée par SMS à la cliente")}
        >
          Envoyer à la cliente
        </div>
        <div className="cursor-pointer text-[12.5px] text-gold" onClick={() => window.print()}>
          Imprimer
        </div>
      </div>

      <ReservationPrintable
        reservation={reservation}
        customer={customer}
        model={model}
        unit={unit}
      />
    </div>
  );
}
