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
  const units = useAppStore((s) => s.units);
  const models = useAppStore((s) => s.models);

  useEffect(() => {
    if (!draft.unitRef) router.replace("/dresses");
  }, [draft.unitRef, router]);

  if (!draft.unitRef || draft.pickupDay === null || draft.returnDay === null) return null;

  const unit = units.find((u) => u.ref === draft.unitRef);
  const model = unit ? findModel(unit.modelId, models) : undefined;
  if (!unit || !model) return null;

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
            <div className="mt-2.5 flex items-end justify-between">
              <div className="font-serif text-[26px] text-ink">{dayLabelFull(draft.pickupDay)}</div>
              <div className="font-serif text-[26px] text-gold">{draft.pickupTime}</div>
            </div>
          </div>
          <div className="rounded-[20px] border border-border bg-card px-5 py-[18px]">
            <div className="font-caps text-[9.5px] tracking-[2.2px] text-gold">RETOUR</div>
            <div className="mt-2.5 flex items-end justify-between">
              <div className="font-serif text-[26px] text-ink">{dayLabelFull(draft.returnDay)}</div>
              <div className="font-serif text-[26px] text-gold">{draft.returnTime}</div>
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
          <Button variant="dark" onClick={() => router.push("/reservation/customer")}>
            Continuer
          </Button>
        </div>
      </div>
    </div>
  );
}
