"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReservationHeader } from "@/components/shell/ReservationHeader";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { useAppStore } from "@/lib/store";
import { findModel } from "@/lib/selectors";
import type { PaymentMethod } from "@/lib/types";

const METHODS: PaymentMethod[] = ["Espèces", "Carte", "Virement", "Autre"];

export default function ReservationPaymentPage() {
  const router = useRouter();
  const draft = useAppStore((s) => s.draft);
  const setMethod = useAppStore((s) => s.setMethod);
  const units = useAppStore((s) => s.units);
  const models = useAppStore((s) => s.models);

  useEffect(() => {
    if (!draft.unitRef) router.replace("/dresses");
  }, [draft.unitRef, router]);

  if (!draft.unitRef) return null;
  const unit = units.find((u) => u.ref === draft.unitRef);
  const model = unit ? findModel(unit.modelId, models) : undefined;
  if (!model) return null;

  const reste = model.price - draft.paid;

  return (
    <div className="chi-rise pb-[30px]">
      <ReservationHeader step="payment" />

      <div className="px-[22px] pt-[26px]">
        <div className="font-serif text-[29px] text-ink">Paiement</div>

        <div className="mt-5 rounded-[20px] border border-border bg-card p-5">
          <div className="flex items-baseline justify-between">
            <div className="text-[13.5px] text-secondary-2">Prix location</div>
            <div className="font-serif text-[30px] text-ink">
              {model.price} <span className="text-[16px] text-gold">DT</span>
            </div>
          </div>
          <div className="my-4 h-px bg-border-soft" />
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="text-[13.5px] text-secondary-2">Montant payé</div>
              <div className="font-serif text-[22px] text-ink">{draft.paid} DT</div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[13.5px] text-secondary-2">Caution</div>
              <div className="font-serif text-[22px] text-ink">{draft.deposit} DT</div>
            </div>
          </div>
          <div className="my-4 h-px bg-border-soft" />
          <div className="flex items-center justify-between">
            <div className="font-caps text-[10px] tracking-[2px] text-gold">RESTE À PAYER</div>
            <div className="font-serif text-[28px] text-[#8f6a2c]">{reste} DT</div>
          </div>
        </div>

        <div className="mb-[11px] mt-[22px] font-caps text-[9px] tracking-[2px] text-tertiary">
          MOYEN DE PAIEMENT
        </div>
        <div className="flex flex-wrap gap-2.5">
          {METHODS.map((m) => (
            <Chip key={m} label={m} active={draft.method === m} onClick={() => setMethod(m)} />
          ))}
        </div>

        <div className="mt-[26px]">
          <Button variant="dark" onClick={() => router.push("/reservation/summary")}>
            Continuer
          </Button>
        </div>
      </div>
    </div>
  );
}
