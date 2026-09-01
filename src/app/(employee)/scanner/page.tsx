"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import jsQR from "jsqr";
import { IconCircle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { CloseIcon, FlashIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { findUnitByCode } from "@/lib/selectors";

const DEMO_UNIT_REF = "CHI-0048-M-01";

type CameraState = "idle" | "starting" | "active" | "denied" | "unsupported";

export default function ScannerPage() {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const units = useAppStore((s) => s.units);

  const [scanning, setScanning] = useState(false);
  const [scannedRef, setScannedRef] = useState(DEMO_UNIT_REF);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualValue, setManualValue] = useState("");
  const [cameraState, setCameraState] = useState<CameraState>("idle");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const scanningRef = useRef(false);

  const goToDress = useCallback(
    (ref: string) => {
      setScannedRef(ref);
      setScanning(true);
      scanningRef.current = true;
      window.setTimeout(() => {
        router.push(`/dress/${ref}`);
      }, 1100);
    },
    [router]
  );

  // Held in a ref (rather than a self-referencing useCallback) so the RAF
  // loop can always call the latest closure without re-triggering effects.
  const tickRef = useRef<() => void>(() => {});
  useEffect(() => {
    tickRef.current = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(() => tickRef.current());
        return;
      }
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(() => tickRef.current());
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      if (code && !scanningRef.current) {
        const unit = findUnitByCode(code.data, units);
        if (unit) {
          goToDress(unit.ref);
          return;
        }
      }
      rafRef.current = requestAnimationFrame(() => tickRef.current());
    };
  }, [goToDress, units]);

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraState("unsupported");
        return;
      }
      setCameraState("starting");
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraState("active");
      } catch {
        if (!cancelled) setCameraState("denied");
      }
    };

    // Deferred a tick so the camera permission flow runs as a reaction
    // rather than synchronously inside the effect body.
    const timer = window.setTimeout(start, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // The <video> element only mounts once cameraState becomes "active", so
  // videoRef.current is still null at the moment getUserMedia resolves —
  // attaching the stream there was a no-op. Re-attach here, once the
  // element actually exists in the DOM, and kick off the scan loop.
  useEffect(() => {
    if (cameraState !== "active") return;
    const video = videoRef.current;
    const stream = streamRef.current;
    if (video && stream) {
      video.srcObject = stream;
      video.play().catch(() => {});
    }
    rafRef.current = requestAnimationFrame(() => tickRef.current());
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [cameraState]);

  const handleManualSubmit = () => {
    const unit = findUnitByCode(manualValue, units);
    if (!unit) {
      showToast("Référence introuvable");
      return;
    }
    setManualOpen(false);
    goToDress(unit.ref);
  };

  return (
    <div className="chi-fade absolute inset-0 flex flex-col bg-scanner">
      <div className="flex items-center justify-between px-6 pb-2 pt-[18px]">
        <IconCircle
          size={34}
          border={false}
          onClick={() => router.push("/home")}
          className="border border-[rgba(246,236,217,.22)] text-gold-ink"
        >
          <CloseIcon size={15} />
        </IconCircle>
        <div className="font-serif text-[21px] text-gold-ink">Scanner une robe</div>
        <IconCircle
          size={34}
          border={false}
          onClick={() => showToast("Flash indisponible sur cet appareil")}
          className="border border-[rgba(246,236,217,.22)] text-[#c9a869]"
        >
          <FlashIcon size={15} />
        </IconCircle>
      </div>

      <div
        onClick={() => !scanning && goToDress(DEMO_UNIT_REF)}
        className="relative mx-[22px] my-[14px] flex-1 cursor-pointer overflow-hidden rounded-[26px] bg-scanner-frame"
      >
        <div className="absolute inset-0">
          {cameraState === "active" ? (
            <video ref={videoRef} muted playsInline className="h-full w-full object-cover opacity-90" />
          ) : (
            <div className="h-full w-full opacity-50">
              <ImageSlot placeholder="Vue caméra" shape="rect" />
            </div>
          )}
          <canvas ref={canvasRef} className="hidden" />
        </div>
        <div className="absolute inset-0 bg-[rgba(23,19,16,.55)]" />

        <div className="absolute left-1/2 top-[46%] h-[206px] w-[206px] -translate-x-1/2 -translate-y-1/2">
          <div className="absolute left-0 top-0 h-[34px] w-[34px] rounded-tl-xl border-l-2 border-t-2 border-[#c9a869]" />
          <div className="absolute right-0 top-0 h-[34px] w-[34px] rounded-tr-xl border-r-2 border-t-2 border-[#c9a869]" />
          <div className="absolute bottom-0 left-0 h-[34px] w-[34px] rounded-bl-xl border-b-2 border-l-2 border-[#c9a869]" />
          <div className="absolute bottom-0 right-0 h-[34px] w-[34px] rounded-br-xl border-b-2 border-r-2 border-[#c9a869]" />
          {!scanning && (
            <div
              className="chi-scan absolute left-3.5 right-3.5 h-px"
              style={{
                background:
                  "linear-gradient(90deg, rgba(201,168,105,0), #e6cf9a, rgba(201,168,105,0))",
              }}
            />
          )}
        </div>

        {scanning && (
          <div className="chi-fade-fast absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[rgba(23,19,16,.72)]">
            <div className="chi-ring h-[52px] w-[52px] rounded-full border border-[rgba(201,168,105,.25)] border-t-[#c9a869]" />
            <div className="font-caps text-[10px] tracking-[2.6px] text-[#c9a869]">{scannedRef}</div>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-[26px] px-10 text-center text-[13px] font-light text-[rgba(246,236,217,.75)]">
          {cameraState === "active"
            ? "Placez le QR code de la robe dans le cadre"
            : "Aperçu caméra indisponible — utilisez la simulation ou la saisie manuelle"}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 px-[22px] pb-[26px] pt-1">
        {manualOpen ? (
          <div className="flex flex-col gap-2.5">
            <input
              autoFocus
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
              placeholder="Ex. CHI-0048-M-01"
              className="w-full rounded-[15px] border border-[rgba(246,236,217,.24)] bg-transparent px-4 py-3.5 text-[14px] text-gold-ink outline-none placeholder:text-[rgba(246,236,217,.4)]"
            />
            <div className="flex gap-2.5">
              <Button variant="ghost" fullWidth={false} className="flex-1 !bg-transparent !text-[rgba(246,236,217,.6)]" onClick={() => setManualOpen(false)}>
                Annuler
              </Button>
              <Button variant="gold" fullWidth={false} className="flex-1" onClick={handleManualSubmit}>
                Valider
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Button variant="gold" onClick={() => goToDress(DEMO_UNIT_REF)}>
              Simuler un scan
            </Button>
            <Button
              variant="outline"
              className="!border-[rgba(246,236,217,.24)] !bg-transparent !text-gold-ink"
              onClick={() => setManualOpen(true)}
            >
              Saisir le code manuellement
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
