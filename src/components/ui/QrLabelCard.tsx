"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { generateUnitQrDataUrl } from "@/lib/qr";

interface LabelVisualProps {
  unitRef: string;
  qr: string | null;
  qrPx: number;
}

/** The actual logo + QR + reference markup, shared by the on-screen card and its print portal. */
function LabelVisual({ unitRef, qr, qrPx }: LabelVisualProps) {
  return (
    <div className="flex flex-col items-center print:gap-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/bychichi-logo.png"
        alt="By Chichi"
        className="h-9 w-9 object-contain print:h-12 print:w-12"
      />
      <div
        className="mt-4 flex items-center justify-center bg-white p-3 print:mt-0 print:p-4"
        style={{ width: qrPx + 24, height: qrPx + 24 }}
      >
        {qr ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qr}
            alt={`QR ${unitRef}`}
            style={{ width: qrPx, height: qrPx }}
            className="print:h-[260px] print:w-[260px]"
          />
        ) : (
          <div className="animate-pulse rounded-xl bg-border-soft" style={{ width: qrPx, height: qrPx }} />
        )}
      </div>
      <div className="mt-4 font-caps text-[12px] tracking-[3px] text-gold print:mt-0 print:text-[16px] print:text-black">
        {unitRef}
      </div>
    </div>
  );
}

/**
 * The physical printed label: logo, QR, unique reference — nothing else.
 * Deliberately excludes dress name/size/price/status; those stay in the app
 * UI around this card, never inside it, so they never end up on paper.
 *
 * When `printable`, a second copy is portaled directly onto `document.body`.
 * `.chi-printable` relies on `position: fixed` to fill the printed page, and
 * CSS gives any ancestor with a non-`none` transform (an open bottom sheet,
 * an animated page wrapper, anything) authority over that positioning — the
 * portal sidesteps the whole ancestor chain so printing can never again
 * silently break because of an unrelated component's animation.
 */
export function QrLabelCard({
  unitRef,
  size = "md",
  printable = false,
  className = "",
  onReady,
}: {
  unitRef: string;
  size?: "md" | "lg";
  printable?: boolean;
  className?: string;
  onReady?: () => void;
}) {
  const [qr, setQr] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Portals need a real `document`, so this only flips true after the
    // client has hydrated — deliberate one-time mount flag, not state meant
    // to synchronize with an external system.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    generateUnitQrDataUrl(unitRef).then((url) => {
      if (cancelled) return;
      setQr(url);
      onReady?.();
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitRef]);

  const qrPx = size === "lg" ? 224 : 168;

  return (
    <>
      <div
        className={`mx-auto w-full max-w-[280px] rounded-[24px] border border-border bg-card p-7 text-center shadow-[0_18px_30px_-24px_rgba(80,60,30,.5)] print:hidden ${className}`}
      >
        <LabelVisual unitRef={unitRef} qr={qr} qrPx={qrPx} />
      </div>
      {printable && mounted
        ? createPortal(
            <div className="chi-printable hidden print:flex">
              <LabelVisual unitRef={unitRef} qr={qr} qrPx={260} />
            </div>,
            document.body
          )
        : null}
    </>
  );
}
