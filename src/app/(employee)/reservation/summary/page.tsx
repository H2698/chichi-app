"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReservationHeader } from "@/components/shell/ReservationHeader";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { findModel } from "@/lib/selectors";
import { dayLabelFull, money } from "@/lib/format";

export default function ReservationSummaryPage() {
  const router = useRouter();
  const draft = useAppStore((s) => s.draft);
  const confirmReservation = useAppStore((s) => s.confirmReservation);
  const units = useAppStore((s) => s.units);
  const models = useAppStore((s) => s.models);
  const customers = useAppStore((s) => s.customers);

  useEffect(() => {
    if (!draft.unitRef || !draft.customerId) router.replace("/dresses");
  }, [draft.unitRef, draft.customerId, router]);

  if (!draft.unitRef || !draft.customerId || draft.pickupDay === null || draft.returnDay === null) {
    return null;
  }

  const unit = units.find((u) => u.ref === draft.unitRef);
  const model = unit ? findModel(unit.modelId, models) : undefined;
  // Look up in the live store — a customer added via "Nouvelle cliente" only
  // exists there, not in the static mock-data seed list. Reading from the
  // seed list here caused newly-added customers to silently blank this page.
  const customer = customers.find((c) => c.id === draft.customerId);
  if (!unit || !model || !customer) return null;

  const reste = model.price - draft.paid;

  const rows = [
    { k: "Cliente", v: `${customer.firstName} ${customer.lastName}`, sub: customer.phone },
    { k: "Retrait", v: dayLabelFull(draft.pickupDay), sub: draft.pickupTime },
    { k: "Retour", v: dayLabelFull(draft.returnDay), sub: draft.returnTime },
    {
      k: "Paiement",
      v: `${money(model.price)} · payé ${money(draft.paid)}`,
      sub: `Reste ${money(reste)} · caution ${money(draft.deposit)}`,
    },
  ];

  return (
    <div className="chi-rise pb-[30px]">
      <ReservationHeader step="summary" />

      <div className="px-[22px] pt-[26px]">
        <div className="font-serif text-[29px] text-ink">Vérifier la réservation</div>

        <div className="mt-5 overflow-hidden rounded-[20px] border border-border bg-card">
          <div className="flex gap-3.5 p-4">
            <div className="h-[84px] w-[66px] flex-shrink-0 overflow-hidden rounded-xl bg-[#efe6d5]">
              <ImageSlot placeholder="Robe" shape="rounded" radius={12} />
            </div>
            <div>
              <div className="font-serif text-[22px] text-ink">{model.name}</div>
              <div className="mt-1 text-[13px] text-secondary-2">Taille {unit.size}</div>
              <div className="mt-1.5 font-caps text-[9.5px] tracking-[1.6px] text-gold">
                {unit.ref}
              </div>
            </div>
          </div>
          {rows.map((r) => (
            <div
              key={r.k}
              className="flex items-center justify-between border-t border-border-soft px-4 py-3.5"
            >
              <div className="text-[11px] uppercase tracking-[1.4px] text-tertiary">{r.k}</div>
              <div className="text-right">
                <div className="text-[15px] text-ink">{r.v}</div>
                <div className="mt-0.5 text-[12px] text-secondary-2">{r.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-[22px]">
          <Button
            variant="dark"
            className="!py-[18px] !text-[13.5px] !tracking-[2.4px]"
            onClick={() => {
              confirmReservation();
              router.push("/reservation/success");
            }}
          >
            Confirmer la réservation
          </Button>
        </div>
        <div
          onClick={() => router.back()}
          className="mt-4 cursor-pointer text-center text-[13.5px] text-secondary-2"
        >
          Modifier
        </div>
      </div>
    </div>
  );
}
