"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { dayLabelFull, money } from "@/lib/format";
import type { Customer, DressModel, DressUnit, Reservation } from "@/lib/types";

/**
 * Printable reservation receipt, portaled directly onto `document.body`.
 *
 * The global print stylesheet (`@media print` in globals.css) hides
 * everything except `.chi-printable` — that's how `QrLabelCard` prints a
 * clean label instead of the whole app shell. Any screen that wants
 * `window.print()` to produce something other than a blank page needs one
 * of these targets; the reservation confirmation screen was calling
 * `window.print()` without one, hence the blank page.
 *
 * Portaled (rather than rendered inline) for the same reason as
 * `QrLabelCard`: `.chi-printable` relies on `position: fixed` to fill the
 * page, and a transformed ancestor (an open sheet, an animated wrapper)
 * would otherwise hijack that positioning.
 */
export function ReservationPrintable({
  reservation,
  customer,
  model,
  unit,
}: {
  reservation: Reservation;
  customer?: Customer;
  model?: DressModel;
  unit?: DressUnit;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Portals need a real `document`, so this only flips true after the
    // client has hydrated — same one-time mount flag as QrLabelCard.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const rows: Array<[string, string]> = [
    ["Cliente", customer ? `${customer.firstName} ${customer.lastName}` : "—"],
    ["Téléphone", customer?.phone ?? "—"],
    ["Robe", model ? `${model.name}${unit ? ` · ${unit.size}` : ""}` : "—"],
    ["Retrait", `${dayLabelFull(reservation.pickupDay)} · ${reservation.pickupTime}`],
    ["Retour", `${dayLabelFull(reservation.returnDay)} · ${reservation.returnTime}`],
    ["Montant", money(reservation.price)],
    ["Payé", money(reservation.paid)],
    ["Reste", money(reservation.price - reservation.paid)],
  ];

  return createPortal(
    <div className="chi-printable hidden print:flex">
      <div className="w-full max-w-[420px] text-black">
        <div className="text-center">
          <div className="text-[15px] font-semibold tracking-[2px]">CHICHI — ESPACE BOUTIQUE</div>
          <div className="mt-1.5 text-[12px] tracking-[2px] text-[#555]">{reservation.id}</div>
        </div>
        <div className="my-5 h-px bg-[#ccc]" />
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 py-2 text-[13.5px]">
            <div className="uppercase tracking-[1.2px] text-[#666]">{k}</div>
            <div className="text-right">{v}</div>
          </div>
        ))}
      </div>
    </div>,
    document.body
  );
}
