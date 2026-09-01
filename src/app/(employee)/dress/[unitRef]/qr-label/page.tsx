"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CloseIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { IconCircle } from "@/components/ui/Card";
import { QrLabelCard } from "@/components/ui/QrLabelCard";
import { useAppStore } from "@/lib/store";
import { findModel } from "@/lib/selectors";

export default function QrLabelPage() {
  const params = useParams<{ unitRef: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromAdmin = searchParams.get("from") === "admin";
  const models = useAppStore((s) => s.models);
  const units = useAppStore((s) => s.units);

  const unit = units.find((u) => u.ref === params.unitRef);
  const model = unit ? findModel(unit.modelId, models) : undefined;

  if (!unit || !model) {
    return (
      <div className="chi-rise px-6 pb-8 pt-6 text-center text-secondary-2">
        Unité introuvable.
      </div>
    );
  }

  const backHref = fromAdmin ? `/admin/dresses/${unit.modelId}` : `/dress/${unit.ref}`;
  const close = () => router.push(backHref);

  return (
    <div className="chi-rise flex min-h-full flex-col px-6 pb-8 pt-6">
      <div className="flex items-center justify-between print:hidden">
        {/* Context only — the model name and size are app UI, not part of the printed label. */}
        <div>
          <div className="font-serif text-[20px] text-ink">{model.name}</div>
          <div className="mt-0.5 text-[12.5px] text-secondary-2">Taille {unit.size}</div>
        </div>
        <IconCircle size={34} onClick={close}>
          <CloseIcon size={14} strokeWidth={1.7} />
        </IconCircle>
      </div>

      <div className="mt-8 flex flex-1 flex-col items-center justify-center print:mt-0">
        <QrLabelCard unitRef={unit.ref} size="lg" printable />

        <div className="mt-8 flex w-full max-w-[280px] flex-col gap-2.5 print:hidden">
          <Button variant="dark" onClick={() => window.print()}>
            Imprimer l&apos;étiquette
          </Button>
          <Button variant="outline" onClick={close}>
            Fermer
          </Button>
        </div>
      </div>
    </div>
  );
}
