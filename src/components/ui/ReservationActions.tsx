"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "./Button";
import { useAppStore } from "@/lib/store";
import { getReservationActions } from "@/lib/selectors";

export function ReservationActions({ reservationId }: { reservationId: string }) {
  const router = useRouter();
  const reservations = useAppStore((s) => s.reservations);
  const units = useAppStore((s) => s.units);
  const customers = useAppStore((s) => s.customers);
  const confirmPickup = useAppStore((s) => s.confirmPickup);
  const cancelReservation = useAppStore((s) => s.cancelReservation);
  const pending = useAppStore((s) => s.pendingReservationAction);
  const [action, setAction] = useState<"pickup" | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reservation = reservations.find((r) => r.id === reservationId);
  if (!reservation) return null;
  const { canPickup, canCancel, checkedOut } = getReservationActions(reservation, units, reservations);
  if (!canPickup && !canCancel && !checkedOut) return null;
  const customer = customers.find((c) => c.id === reservation.customerId);
  const customerName = customer ? `${customer.firstName} ${customer.lastName}` : "la cliente";
  const confirming = (action === "pickup" && canPickup) || (action === "cancel" && canCancel);

  const submit = async () => {
    if (pending || !action) return;
    setError(null);
    const success = await (action === "pickup" ? confirmPickup(reservationId) : cancelReservation(reservationId));
    if (success) setAction(null);
    else setError("Enregistrement impossible. Vérifiez la connexion et l’état de la réservation, puis réessayez.");
  };

  return (
    <div className="flex flex-col gap-2.5">
      {confirming ? (
        <div className="rounded-2xl border border-border-input bg-pill p-4">
          <p className="text-[14px] text-ink">
            {action === "pickup"
              ? `Confirmer la remise de la robe ${reservation.unitRef} à ${customerName} ?`
              : `Annuler la réservation de ${customerName} pour la robe ${reservation.unitRef} ?`}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            <Button variant="dark" disabled={Boolean(pending)} onClick={submit}>
              {pending === reservationId ? "Enregistrement…" : action === "pickup" ? "Oui, confirmer le retrait" : "Oui, annuler la réservation"}
            </Button>
            <Button variant="outline" disabled={Boolean(pending)} onClick={() => { setAction(null); setError(null); }}>
              Revenir
            </Button>
          </div>
        </div>
      ) : (
        <>
          {canPickup && (
            <Button variant="dark" disabled={Boolean(pending)} onClick={() => { setAction("pickup"); setError(null); }}>
              Confirmer le retrait
            </Button>
          )}
          {checkedOut && (
            <Button variant="dark" onClick={() => router.push(`/dress/${reservation.unitRef}`)}>
              Enregistrer le retour
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" className="!text-[#b1553f]" disabled={Boolean(pending)} onClick={() => { setAction("cancel"); setError(null); }}>
              Annuler la réservation
            </Button>
          )}
        </>
      )}
      {error && <p role="alert" className="text-[13px] text-[#b1553f]">{error}</p>}
    </div>
  );
}
