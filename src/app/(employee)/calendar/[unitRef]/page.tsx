"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { BackHeader } from "@/components/shell/BackHeader";
import { CalendarGrid } from "@/components/ui/CalendarGrid";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Dot } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, PhoneIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { TODAY_DAY } from "@/lib/mock-data";
import { addMonthsClampToFirst } from "@/lib/dates";
import { CAL, type CalStatusKey } from "@/lib/status";
import { findModel, reservationCoveringDay } from "@/lib/selectors";
import { dayLabel, dayLabelFull, money, monthLabel } from "@/lib/format";

export default function CalendarPage() {
  const params = useParams<{ unitRef: string }>();
  const router = useRouter();
  const unitRef = params.unitRef;

  const openCalendarFor = useAppStore((s) => s.openCalendarFor);
  const selStart = useAppStore((s) => s.selStart);
  const selEnd = useAppStore((s) => s.selEnd);
  const startReservationDraft = useAppStore((s) => s.startReservationDraft);
  const showToast = useAppStore((s) => s.showToast);
  const models = useAppStore((s) => s.models);
  const units = useAppStore((s) => s.units);
  const reservations = useAppStore((s) => s.reservations);
  const customers = useAppStore((s) => s.customers);
  const sheet = useAppStore((s) => s.sheet);
  const sheetDay = useAppStore((s) => s.sheetDay);
  const closeSheet = useAppStore((s) => s.closeSheet);

  const [monthEpoch, setMonthEpoch] = useState(TODAY_DAY);

  const sheetReservation =
    sheetDay !== null ? reservationCoveringDay(unitRef, sheetDay, reservations) : undefined;
  const sheetCustomer = sheetReservation
    ? customers.find((c) => c.id === sheetReservation.customerId)
    : undefined;

  useEffect(() => {
    openCalendarFor(unitRef);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitRef]);

  const unit = units.find((u) => u.ref === unitRef);
  const model = unit ? findModel(unit.modelId, models) : undefined;
  const rangeReady = selStart !== null && selEnd !== null;

  if (!unit || !model) {
    return (
      <div className="chi-rise px-6 pb-8 pt-6 text-center text-secondary-2">
        Unité introuvable.
      </div>
    );
  }

  const legendKeys: CalStatusKey[] = [
    "disponible",
    "reservee",
    "louee",
    "retour",
    "nettoyage",
    "indispo",
  ];

  return (
    <div className="chi-rise px-[22px] pb-[30px] pt-1.5">
      <BackHeader title="Disponibilités" />

      <div className="mt-[18px] flex items-center gap-[13px] rounded-2xl border border-border bg-card p-2.5">
        <div className="h-[60px] w-12 flex-shrink-0 overflow-hidden rounded-[10px] bg-[#efe6d5]">
          <ImageSlot src={model.photoUrl} placeholder="Photo robe" shape="rounded" radius={10} />
        </div>
        <div>
          <div className="font-serif text-[19px] text-ink">{model.name}</div>
          <div className="mt-1 font-caps text-[9.5px] tracking-[1.8px] text-gold">
            {unit.size} · {unit.ref}
          </div>
        </div>
      </div>

      <div className="mt-[26px] flex items-center justify-between">
        <div
          onClick={() => setMonthEpoch((m) => addMonthsClampToFirst(m, -1))}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gold"
        >
          <ChevronLeftIcon size={14} strokeWidth={1.6} />
        </div>
        <div className="font-serif text-[24px] tracking-[0.5px] text-ink">
          {monthLabel(monthEpoch)}
        </div>
        <div
          onClick={() => setMonthEpoch((m) => addMonthsClampToFirst(m, 1))}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gold"
        >
          <ChevronRightIcon size={14} strokeWidth={1.6} />
        </div>
      </div>

      <div className="mt-4">
        <CalendarGrid unitRef={unitRef} monthEpoch={monthEpoch} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-2.5">
        {legendKeys.map((k) => {
          const c = CAL[k];
          return (
            <div key={k} className="flex items-center gap-2">
              <div
                className="flex h-4 w-4 items-center justify-center rounded-[5px] font-caps text-[7px]"
                style={{ background: c.bg, border: `1px solid ${c.bd}`, color: c.fg }}
              >
                {c.mark ?? ""}
              </div>
              <div className="text-[11.5px] font-light text-secondary">{c.label}</div>
            </div>
          );
        })}
      </div>

      {rangeReady ? (
        <div className="chi-rise-fast mt-[22px] rounded-[18px] border border-[#dfe6da] bg-[#f1f4ee] p-4">
          <div className="flex items-center gap-[9px]">
            <CheckIcon size={16} strokeWidth={1.7} className="text-[#5f7355]" />
            <div className="text-[14.5px] text-[#4d6043]">Disponible pendant cette période</div>
          </div>
          <div className="mt-[9px] font-serif text-[22px] text-ink">
            {dayLabel(selStart!)} → {dayLabelFull(selEnd!)}
          </div>
          <div className="mt-3.5">
            <Button
              variant="dark"
              onClick={() => {
                startReservationDraft(unitRef);
                router.push("/reservation/dates");
              }}
            >
              Créer une réservation
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-5 text-center text-[12.5px] font-light text-[#a3937c]">
          {selStart === null ? "Touchez une date pour commencer" : "Touchez la date de retour"}
        </div>
      )}

      <BottomSheet open={sheet === "reserved"} onClose={closeSheet}>
        {sheetReservation && sheetDay !== null ? (
          <div>
            <div className="flex items-baseline justify-between">
              <div className="font-serif text-[27px] text-ink">{dayLabel(sheetDay)}</div>
              <div className="flex items-center gap-[7px] rounded-[18px] bg-gold-ink px-3 py-1.5">
                <Dot color="#b3873d" size={5} />
                <div className="font-caps text-[9px] tracking-[1.6px] text-[#8a6a2c]">
                  RÉSERVÉE
                </div>
              </div>
            </div>
            <div className="my-[18px] h-px bg-border" />
            {[
              {
                k: "Cliente",
                v: sheetCustomer ? `${sheetCustomer.firstName} ${sheetCustomer.lastName}` : "—",
              },
              { k: "Téléphone", v: sheetCustomer?.phone ?? "—" },
              { k: "Retrait", v: `${dayLabel(sheetReservation.pickupDay)} · ${sheetReservation.pickupTime}` },
              { k: "Retour", v: `${dayLabel(sheetReservation.returnDay)} · ${sheetReservation.returnTime}` },
              { k: "Montant", v: money(sheetReservation.price) },
              { k: "Payé", v: money(sheetReservation.paid) },
              { k: "Reste", v: money(sheetReservation.price - sheetReservation.paid) },
            ].map((r) => (
              <div key={r.k} className="flex items-center justify-between py-2.5">
                <div className="text-[11px] uppercase tracking-[1.4px] text-tertiary">{r.k}</div>
                <div className="text-[15px] text-ink">{r.v}</div>
              </div>
            ))}
            <div className="my-3 mt-[12px] h-px bg-border" />
            <div className="mt-[6px] flex gap-[11px]">
              <Button
                variant="dark"
                className="!py-[15px] !text-[12.5px] !tracking-[1.8px]"
                onClick={() => router.push("/reservations")}
              >
                Voir la réservation
              </Button>
              <button
                type="button"
                onClick={() => showToast(`Appel · ${sheetCustomer?.phone ?? ""}`)}
                className="flex w-14 flex-shrink-0 cursor-pointer items-center justify-center rounded-[15px] border border-border-input text-gold"
              >
                <PhoneIcon size={17} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        ) : null}
      </BottomSheet>
    </div>
  );
}
