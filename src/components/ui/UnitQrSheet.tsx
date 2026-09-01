"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { QrLabelCard } from "@/components/ui/QrLabelCard";

export function UnitQrSheet({
  unitRef,
  open,
  onClose,
  fromAdmin = false,
  autoPrint = false,
}: {
  unitRef: string | null;
  open: boolean;
  onClose: () => void;
  fromAdmin?: boolean;
  /** Opens straight into the print dialog once the QR has rendered — the label is still shown first. */
  autoPrint?: boolean;
}) {
  const router = useRouter();
  const printedRef = useRef<string | null>(null);

  const handleReady = () => {
    if (!autoPrint || !unitRef || printedRef.current === unitRef) return;
    printedRef.current = unitRef;
    window.print();
  };

  return (
    <BottomSheet open={open && !!unitRef} onClose={onClose}>
      {unitRef ? (
        <div>
          <div className="mb-5 text-center font-serif text-[22px] text-ink">Étiquette QR</div>
          <QrLabelCard unitRef={unitRef} printable onReady={handleReady} />
          <div className="mt-6 flex flex-col gap-2.5">
            <Button variant="dark" onClick={() => window.print()}>
              Imprimer l&apos;étiquette
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                router.push(`/dress/${unitRef}/qr-label${fromAdmin ? "?from=admin" : ""}`);
              }}
            >
              Agrandir le QR
            </Button>
          </div>
        </div>
      ) : null}
    </BottomSheet>
  );
}
