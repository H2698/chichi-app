"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ReturnIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { findModel } from "@/lib/selectors";

export default function ReturnDonePage() {
  const router = useRouter();
  const lastReturn = useAppStore((s) => s.lastReturn);
  const units = useAppStore((s) => s.units);
  const models = useAppStore((s) => s.models);

  useEffect(() => {
    if (!lastReturn) router.replace("/home");
  }, [lastReturn, router]);

  if (!lastReturn) return null;

  const unit = units.find((u) => u.ref === lastReturn.unitRef);
  const model = unit ? findModel(unit.modelId, models) : undefined;

  return (
    <div className="chi-fade flex min-h-full flex-col items-center px-[30px] pb-[34px] pt-[70px] text-center">
      <div className="flex h-[76px] w-[76px] items-center justify-center rounded-full border border-[#dde5ea]">
        <ReturnIcon size={24} strokeWidth={1.3} className="text-[#5f7285]" />
      </div>
      <div className="mt-[22px] font-serif text-[30px] text-ink">Retour enregistré</div>
      <div className="mt-2 text-[14.5px] text-secondary">{model?.name}</div>
      <div className="mt-1.5 font-caps text-[10px] tracking-[2.2px] text-gold">{unit?.ref}</div>
      <div className="mt-[22px] flex items-center gap-[9px] rounded-2xl border border-[#dde5ea] bg-[#f2f6f8] px-[18px] py-3">
        <div className="h-1.5 w-1.5 rounded-full bg-[#7b8ba3]" />
        <div className="text-[14px] text-[#4f5f6d]">Statut : À nettoyer</div>
      </div>
      <div className="mt-8 w-full">
        <Button variant="dark" onClick={() => router.push("/home")}>
          Terminer
        </Button>
      </div>
    </div>
  );
}
