"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ReservationHeader } from "@/components/shell/ReservationHeader";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { findModel } from "@/lib/selectors";
import { dayLabelFull } from "@/lib/format";

export default function ReservationDatesPage() {
  const router = useRouter();
  const draft = useAppStore((s) => s.draft);
  const setPickupTime = useAppStore((s) => s.setPickupTime);
  const setReturnTime = useAppStore((s) => s.setReturnTime);
  const units = useAppStore((s) => s.units);
  const models = useAppStore((s) => s.models);

  useEffect(() => {
    if (!draft.unitRef) router.replace("/dresses");
  }, [draft.unitRef, router]);

  if (!draft.unitRef || draft.pickupDay === null || draft.returnDay === null) return null;

  const unit = units.find((u) => u.ref === draft.unitRef);
  const model = unit ? findModel(unit.modelId, models) : undefined;
  if (!unit || !model) return null;

  const timeError =
    !draft.pickupTime || !draft.returnTime
      ? "Renseignez les heures de retrait et de retour."
      : draft.pickupDay === draft.returnDay && draft.returnTime <= draft.pickupTime
        ? "L’heure de retour doit être après l’heure de retrait."
        : null;

  return (
    <div className="chi-rise pb-[30px]">
      <ReservationHeader step="dates" />

      <div className="px-[22px] pt-[26px]">
        <div className="font-serif text-[29px] leading-[1.15] text-ink">
          Quand sera-t-elle louée ?
        </div>

        <div className="mt-[22px] flex flex-col gap-3">
          <div className="rounded-[20px] border border-border bg-card px-5 py-[18px]">
            <div className="font-caps text-[9.5px] tracking-[2.2px] text-gold">RETRAIT</div>
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="font-serif text-[26px] text-ink">{dayLabelFull(draft.pickupDay)}</div>
              <input
                type="time"
                aria-label="Heure de retrait"
                aria-describedby={timeError ? "reservation-time-error" : undefined}
                required
                value={draft.pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="ml-auto min-h-11 w-[132px] rounded-lg border border-border-input bg-transparent px-2 text-[20px] text-gold outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>
          <div className="rounded-[20px] border border-border bg-card px-5 py-[18px]">
            <div className="font-caps text-[9.5px] tracking-[2.2px] text-gold">RETOUR</div>
            <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="font-serif text-[26px] text-ink">{dayLabelFull(draft.returnDay)}</div>
              <input
                type="time"
                aria-label="Heure de retour"
                aria-describedby={timeError ? "reservation-time-error" : undefined}
                required
                value={draft.returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                className="ml-auto min-h-11 w-[132px] rounded-lg border border-border-input bg-transparent px-2 text-[20px] text-gold outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-[9px] rounded-[14px] border border-[#dfe6da] bg-[#f1f4ee] px-4 py-3.5">
          <CheckIcon size={15} strokeWidth={1.7} className="text-[#5f7355]" />
          <div className="text-[14px] text-[#4d6043]">Cette robe est disponible</div>
        </div>

        <div className="mt-3.5 flex items-center gap-[13px] rounded-2xl border border-border bg-card p-2.5">
          <div className="h-14 w-11 flex-shrink-0 overflow-hidden rounded-[10px] bg-[#efe6d5]">
            <ImageSlot src={model.photoUrl} placeholder="Robe" shape="rounded" radius={10} />
          </div>
          <div className="flex-1">
            <div className="font-serif text-[18px] text-ink">{model.name}</div>
            <div className="mt-[3px] font-caps text-[9px] tracking-[1.6px] text-gold">
              {unit.size} · {unit.ref}
            </div>
          </div>
        </div>

        <div className="mt-[22px]">
          {timeError && (
            <p id="reservation-time-error" role="alert" className="mb-3 text-[13px] text-red-700">
              {timeError}
            </p>
          )}
          <Button variant="dark" disabled={Boolean(timeError)} onClick={() => router.push("/reservation/customer")}>
            Continuer
          </Button>
        </div>
      </div>
    </div>
  );
}
