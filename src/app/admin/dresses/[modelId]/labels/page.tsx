"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { QrLabelCard } from "@/components/ui/QrLabelCard";
import { CheckIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { findModel } from "@/lib/selectors";

export default function NewDressLabelsPage() {
  const params = useParams<{ modelId: string }>();
  const router = useRouter();
  const models = useAppStore((s) => s.models);
  const units = useAppStore((s) => s.units);

  const model = findModel(params.modelId, models);
  const modelUnits = units.filter((u) => u.modelId === params.modelId);

  const [printTarget, setPrintTarget] = useState<"all" | string | null>(null);

  useEffect(() => {
    const reset = () => setPrintTarget(null);
    window.addEventListener("afterprint", reset);
    return () => window.removeEventListener("afterprint", reset);
  }, []);

  const printOne = (ref: string) => {
    setPrintTarget(ref);
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  };
  const printAll = () => {
    setPrintTarget("all");
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()));
  };

  if (!model) {
    return (
      <div className="px-[22px] pb-10 pt-2.5 text-center text-secondary-2 lg:px-0 lg:pt-0">
        Robe introuvable.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[560px] px-[22px] pb-10 pt-2.5 lg:mx-0 lg:px-0 lg:pt-0">
      <div className="flex flex-col items-center text-center print:hidden">
        <div className="relative flex h-[64px] w-[64px] items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#e0cba0]" />
          <div className="absolute inset-[8px] rounded-full border border-[#efe0c2]" />
          <CheckIcon size={20} strokeWidth={1.4} className="text-gold" />
        </div>
        <div className="mt-4 font-serif text-[26px] text-ink">Robe ajoutée avec succès</div>
        <div className="mt-1.5 text-[13.5px] text-secondary-2">
          {model.name} · REF {model.ref}
        </div>
      </div>

      <div className="mt-8 print:hidden">
        <div className="font-serif text-[20px] text-ink">Étiquettes générées</div>
        <div className="mt-1 text-[12.5px] font-light text-secondary-2">
          {modelUnits.length} unité{modelUnits.length !== 1 ? "s" : ""} physique
          {modelUnits.length !== 1 ? "s" : ""} — une étiquette QR par unité
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-6">
        {modelUnits.map((u) => (
          <div key={u.ref} className="flex flex-col items-center">
            <QrLabelCard unitRef={u.ref} printable={printTarget === "all" || printTarget === u.ref} />
            <div className="mt-3 w-full max-w-[280px] print:hidden">
              <Button variant="outline" onClick={() => printOne(u.ref)}>
                Imprimer l&apos;étiquette
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-2.5 print:hidden">
        <Button variant="dark" onClick={printAll}>
          Imprimer toutes les étiquettes
        </Button>
        <Button variant="ghost" onClick={() => router.push(`/admin/dresses/${model.id}`)}>
          Continuer vers la fiche robe
        </Button>
      </div>
    </div>
  );
}
