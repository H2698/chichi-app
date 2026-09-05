"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Dot } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { UnitQrSheet } from "@/components/ui/UnitQrSheet";
import { ChevronLeftIcon, ClockIcon, PrinterIcon, QrIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { activeReservationForUnit, findModel, isLate } from "@/lib/selectors";
import { badgeForUnitStatus } from "@/lib/status";
import { dayLabel, money } from "@/lib/format";
import type { DressCondition } from "@/lib/types";

const CONDITIONS: { label: DressCondition; note?: string; dot: string }[] = [
  { label: "Bon état", dot: "#7f9476" },
  { label: "À nettoyer", note: "recommandé", dot: "#7b8ba3" },
  { label: "Tachée", dot: "#b3873d" },
  { label: "Endommagée", dot: "#b1553f" },
];

export default function DressDetailPage() {
  const params = useParams<{ unitRef: string }>();
  const unitRef = params.unitRef;
  const router = useRouter();

  const models = useAppStore((s) => s.models);
  const units = useAppStore((s) => s.units);
  const reservations = useAppStore((s) => s.reservations);
  const customers = useAppStore((s) => s.customers);
  const sheet = useAppStore((s) => s.sheet);
  const openSheet = useAppStore((s) => s.openSheet);
  const closeSheet = useAppStore((s) => s.closeSheet);
  const condition = useAppStore((s) => s.condition);
  const setCondition = useAppStore((s) => s.setCondition);
  const confirmReturn = useAppStore((s) => s.confirmReturn);
  const markUnitReady = useAppStore((s) => s.markUnitReady);
  const showToast = useAppStore((s) => s.showToast);
  const openCalendarFor = useAppStore((s) => s.openCalendarFor);

  const [qrSheet, setQrSheet] = useState<{ ref: string; autoPrint: boolean } | null>(null);

  const unit = units.find((u) => u.ref === unitRef);

  if (!unit) {
    return (
      <div className="chi-rise flex flex-col items-center gap-4 px-6 pb-8 pt-16 text-center">
        <div className="font-serif text-[24px] text-ink">Unité introuvable</div>
        <div className="text-[13.5px] text-secondary-2">
          Aucune robe ne correspond à la référence « {unitRef} ».
        </div>
        <Button variant="outline" fullWidth={false} className="px-6" onClick={() => router.push("/dresses")}>
          Retour aux robes
        </Button>
      </div>
    );
  }

  const model = findModel(unit.modelId, models)!;
  const badge = badgeForUnitStatus(unit.baseStatus);
  const active = activeReservationForUnit(unit.ref, reservations);
  const customer = active ? customers.find((c) => c.id === active.customerId) : undefined;
  const late = active ? isLate(active, units) : false;
  // All physical units for this model, grouped by size — not just units that
  // share the current unit's size — so the employee can see and switch into
  // any available size before starting a new reservation.
  const modelUnits = units.filter((u) => u.modelId === unit.modelId);
  const sizesInUse = Array.from(new Set(modelUnits.map((u) => u.size))).sort();

  const goToCalendar = () => {
    openCalendarFor(unit.ref);
    router.push(`/calendar/${unit.ref}`);
  };

  const actions =
    unit.baseStatus === "disponible"
      ? [
          { label: "Nouvelle réservation", dark: true, onClick: goToCalendar },
          { label: "Voir les disponibilités", outline: true, onClick: goToCalendar },
          { label: "Historique", ghost: true, onClick: () => showToast("Historique — 12 locations") },
        ]
      : unit.baseStatus === "louee"
        ? [
            { label: "Enregistrer le retour", dark: true, onClick: () => openSheet("return") },
            {
              label: "Voir la location",
              outline: true,
              onClick: () =>
                router.push(
                  active
                    ? `/reservations?highlight=${active.id}&day=${active.returnDay}`
                    : "/reservations"
                ),
            },
            {
              label: "Appeler la cliente",
              ghost: true,
              onClick: () => showToast(`Appel · ${customer?.phone ?? ""}`),
            },
          ]
        : unit.baseStatus === "nettoyage"
          ? [
              { label: "Marquer comme prête", dark: true, onClick: () => markUnitReady(unit.ref) },
              { label: "Voir les disponibilités", outline: true, onClick: goToCalendar },
            ]
          : [{ label: "Voir les disponibilités", outline: true, onClick: goToCalendar }];

  return (
    <div className="chi-rise pb-[26px]">
      <div className="relative h-[340px] bg-[#efe6d5]">
        <ImageSlot src={model.photoUrl} placeholder={`Photo ${model.name}`} shape="rect" />
        <div
          onClick={() => router.back()}
          className="absolute left-5 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-ink backdrop-blur-sm"
          style={{ background: "rgba(250,244,234,.9)" }}
        >
          <ChevronLeftIcon size={15} strokeWidth={1.7} />
        </div>
        <div
          className="absolute right-5 top-4 flex items-center gap-[7px] rounded-[20px] px-[13px] py-[7px]"
          style={{ background: badge.softBg }}
        >
          <Dot color={badge.dot} size={6} />
          <div className="font-caps text-[9.5px] tracking-[1.8px]" style={{ color: badge.fg }}>
            {badge.label}
          </div>
        </div>
      </div>

      <div className="px-6 pt-[22px]">
        <div className="flex items-start justify-between gap-3">
          <div className="font-serif text-[30px] leading-[1.1] text-ink">{model.name}</div>
          <div
            onClick={() => setQrSheet({ ref: unit.ref, autoPrint: false })}
            className="mt-1 flex h-9 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full border border-border-input text-gold"
            title="Voir QR"
          >
            <QrIcon size={16} strokeWidth={1.3} />
          </div>
        </div>
        <div className="mt-[7px] font-caps text-[10px] tracking-[2.4px] text-gold">
          REF {model.ref}
        </div>

        <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-[18px] border border-border bg-card">
          {[
            { k: "Unité", v: unit.ref },
            { k: "Taille", v: unit.size },
            { k: "Couleur", v: model.color },
            { k: "Location", v: money(model.price) },
          ].map((m) => (
            <div key={m.k} className="box-border border-b border-r border-border-soft px-4 py-3.5">
              <div className="text-[10.5px] uppercase tracking-[1.4px] text-tertiary">{m.k}</div>
              <div className="mt-[5px] text-[15px] text-ink">{m.v}</div>
            </div>
          ))}
        </div>

        {unit.baseStatus === "louee" && active && (
          <div className="mt-4 rounded-[18px] border border-[#e7d9dd] bg-[#faf1f2] p-[18px]">
            <div className="font-caps text-[9.5px] tracking-[2.2px] text-[#8a6274]">
              ACTUELLEMENT CHEZ
            </div>
            <div className="mt-1.5 font-serif text-[24px] text-ink">
              {customer ? `${customer.firstName} ${customer.lastName}` : "Cliente"}
            </div>
            <div className="mt-0.5 text-[13.5px] text-secondary">{customer?.phone}</div>
            <div className="my-[15px] h-px bg-[#eadfe1]" />
            <div className="flex gap-5">
              <div className="flex-1">
                <div className="text-[10.5px] uppercase tracking-[1.4px] text-[#a38c93]">Retrait</div>
                <div className="mt-1 text-[14.5px] text-ink">
                  {dayLabel(active.pickupDay)} · {active.pickupTime}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[10.5px] uppercase tracking-[1.4px] text-[#a38c93]">
                  Retour prévu
                </div>
                <div className="mt-1 text-[14.5px] text-ink">
                  {dayLabel(active.returnDay)} · {active.returnTime}
                </div>
              </div>
            </div>
            {late && (
              <div className="mt-[15px] flex items-center gap-[9px] rounded-xl bg-[#f6e3dd] px-3.5 py-2.5">
                <ClockIcon size={15} strokeWidth={1.6} className="text-[#b1553f]" />
                <div className="text-[13px] text-[#8f4331]">
                  Retour en retard — {dayLabel(active.returnDay)} · {active.returnTime}
                </div>
              </div>
            )}
          </div>
        )}

        {unit.baseStatus === "nettoyage" && (
          <div className="mt-4 rounded-[18px] border border-[#dde5ea] bg-[#f2f6f8] p-[18px]">
            <div className="font-caps text-[9.5px] tracking-[2.2px] text-[#5f7285]">
              EN NETTOYAGE
            </div>
            <div className="mt-2 text-[14px] font-light text-[#4f5f6d]">
              Cette unité est en cours de nettoyage. Elle sera disponible dès qu&apos;elle est
              prête.
            </div>
          </div>
        )}

        {unit.baseStatus === "indispo" && (
          <div className="mt-4 rounded-[18px] border border-border-soft bg-[#f1eee8] p-[18px]">
            <div className="font-caps text-[9.5px] tracking-[2.2px] text-[#8a8171]">
              HORS SERVICE
            </div>
            <div className="mt-2 text-[14px] font-light text-[#6d6455]">
              Cette unité est actuellement indisponible à la location.
            </div>
          </div>
        )}

        <div className="mt-[22px] flex flex-col gap-[11px]">
          {actions.map((a) => (
            <Button
              key={a.label}
              variant={a.dark ? "dark" : a.outline ? "outline" : "ghost"}
              onClick={a.onClick}
              className="!text-[13.5px] !uppercase !tracking-[1.6px]"
            >
              {a.label}
            </Button>
          ))}
        </div>

        <div className="mt-[26px]">
          <div className="font-serif text-[22px] text-ink">Unités physiques</div>
          <div className="mt-1 text-[12.5px] text-secondary-2">
            Touchez une autre taille pour l&apos;ouvrir et démarrer une réservation avec.
          </div>
          <div className="mt-3 flex flex-col gap-5">
            {sizesInUse.map((size) => {
              const sizeUnits = modelUnits.filter((u) => u.size === size);
              return (
                <div key={size}>
                  <div className="mb-2 font-caps text-[10px] tracking-[1.8px] text-tertiary">
                    TAILLE {size}
                  </div>
                  <div className="flex flex-col gap-[9px]">
                    {sizeUnits.map((s) => {
                      const b = badgeForUnitStatus(s.baseStatus);
                      const isCurrent = s.ref === unit.ref;
                      return (
                        <div
                          key={s.ref}
                          className="flex items-center justify-between rounded-[14px] border px-4 py-[13px]"
                          style={{
                            borderColor: isCurrent ? "#dcc9a4" : "var(--border)",
                            background: isCurrent ? "#fdf7ea" : "var(--card)",
                          }}
                        >
                          <div
                            onClick={() => !isCurrent && router.push(`/dress/${s.ref}`)}
                            className={`flex-1 font-caps text-[11px] tracking-[1.6px] text-ink ${
                              isCurrent ? "" : "cursor-pointer"
                            }`}
                          >
                            {s.ref}
                            {isCurrent ? (
                              <span className="ml-2 text-tertiary">(consultée)</span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-[7px]">
                              <Dot color={b.dot} size={5} />
                              <div className="text-[12.5px]" style={{ color: b.fg }}>
                                {b.labelSoft}
                              </div>
                            </div>
                            <div
                              onClick={() => setQrSheet({ ref: s.ref, autoPrint: false })}
                              className="cursor-pointer text-gold"
                              title="Voir QR"
                            >
                              <QrIcon size={15} strokeWidth={1.3} />
                            </div>
                            <div
                              onClick={() => setQrSheet({ ref: s.ref, autoPrint: true })}
                              className="cursor-pointer text-gold"
                              title="Imprimer l'étiquette"
                            >
                              <PrinterIcon size={15} strokeWidth={1.3} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <BottomSheet open={sheet === "return"} onClose={closeSheet}>
        <div>
          <div className="font-serif text-[27px] text-ink">État de la robe</div>
          <div className="mt-[5px] text-[13px] font-light text-secondary-2">
            {model.name} · {unit.size} · {unit.ref}
          </div>
          <div className="mt-5 flex flex-col gap-2.5">
            {CONDITIONS.map((c) => {
              const selected = condition === c.label;
              return (
                <div
                  key={c.label}
                  onClick={() => setCondition(c.label)}
                  className="flex cursor-pointer items-center gap-[13px] rounded-2xl px-[17px] py-[15px]"
                  style={{
                    border: `1px solid ${selected ? "#a5813f" : "#eee3d0"}`,
                    background: selected ? "#fdf7ea" : "#fdfaf3",
                  }}
                >
                  <div className="h-2 w-2 rounded-full" style={{ background: c.dot }} />
                  <div className="flex-1 text-[15px] text-ink">{c.label}</div>
                  {c.note ? <div className="text-[12px] text-gold">{c.note}</div> : null}
                </div>
              );
            })}
          </div>
          <div className="mt-[18px] flex items-center justify-between rounded-[14px] border border-border bg-card px-4 py-3.5">
            <div className="text-[11px] uppercase tracking-[1.4px] text-tertiary">
              Heure de retour
            </div>
            <div className="text-[15px] text-ink">Aujourd&apos;hui · 17:42</div>
          </div>
          <div className="mt-5">
            <Button
              variant="dark"
              onClick={() => {
                confirmReturn(unit.ref);
                router.push("/return-done");
              }}
            >
              Confirmer le retour
            </Button>
          </div>
        </div>
      </BottomSheet>

      <UnitQrSheet
        unitRef={qrSheet?.ref ?? null}
        open={!!qrSheet}
        autoPrint={qrSheet?.autoPrint ?? false}
        onClose={() => setQrSheet(null)}
      />
    </div>
  );
}
