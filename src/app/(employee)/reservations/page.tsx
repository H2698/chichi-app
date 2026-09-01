"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BackHeader } from "@/components/shell/BackHeader";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Dot } from "@/components/ui/Card";
import { useAppStore } from "@/lib/store";
import { TODAY_DAY } from "@/lib/mock-data";
import { AUGUST_2026_DAYS, WEEKDAYS_FR, AUGUST_2026_LEADING_BLANKS, dayLabel } from "@/lib/format";
import { reservationStatus, unitLabel } from "@/lib/selectors";
import type { ReservationStatus } from "@/lib/types";

const STATUS_STYLE: Record<ReservationStatus, { label: string; dot: string; fg: string }> = {
  CONFIRMEE: { label: "CONFIRMÉE", dot: "#b3873d", fg: "#8a6a2c" },
  RETOUR_PREVU: { label: "RETOUR PRÉVU", dot: "#7c5a6b", fg: "#7c5a6b" },
  EN_RETARD: { label: "EN RETARD", dot: "#b1553f", fg: "#8f4331" },
  TERMINEE: { label: "TERMINÉE", dot: "#7f9476", fg: "#5f7355" },
  ANNULEE: { label: "ANNULÉE", dot: "#a49c8e", fg: "#a49c8e" },
};

export default function ReservationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const dayParam = searchParams.get("day");

  const reservations = useAppStore((s) => s.reservations);
  const units = useAppStore((s) => s.units);
  const models = useAppStore((s) => s.models);
  const customers = useAppStore((s) => s.customers);

  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    const parsed = dayParam ? Number(dayParam) : NaN;
    return Number.isFinite(parsed) ? parsed : TODAY_DAY;
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (highlightId) {
      highlightRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    // Only on mount: scroll to the reservation we were sent here to see.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const daysWithActivity = useMemo(() => {
    const set = new Set<number>();
    reservations.forEach((r) => {
      set.add(r.pickupDay);
      set.add(r.returnDay);
    });
    return set;
  }, [reservations]);

  const list = reservations
    .filter((r) => selectedDay === null || r.pickupDay === selectedDay || r.returnDay === selectedDay)
    .sort((a, b) => a.pickupDay - b.pickupDay);

  const strip = Array.from({ length: AUGUST_2026_DAYS }, (_, i) => i + 1);

  return (
    <div className="chi-rise px-[22px] pb-[26px] pt-2.5">
      <BackHeader title="Réservations" />

      <div
        onClick={() => setShowCalendar((v) => !v)}
        className="mt-[18px] flex cursor-pointer items-center justify-between rounded-[18px] border border-border-input bg-card px-5 py-4"
      >
        <div>
          <div className="font-caps text-[9.5px] tracking-[1.6px] text-tertiary">DATE</div>
          <div className="mt-1 font-serif text-[22px] text-ink">
            {selectedDay === null ? "Toutes les dates" : dayLabel(selectedDay)}
          </div>
        </div>
        <div className="rounded-full border border-border-input bg-pill px-4 py-2 text-[13px] text-gold">
          {showCalendar ? "Fermer" : "Choisir une date"}
        </div>
      </div>

      {showCalendar ? (
        <div className="mt-3 rounded-[18px] border border-border bg-card p-3.5">
          <div className="grid grid-cols-7">
            {WEEKDAYS_FR.map((w) => (
              <div
                key={w}
                className="pb-2 text-center font-caps text-[9px] tracking-[1.2px] text-tertiary"
              >
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-[5px]">
            {Array.from({ length: AUGUST_2026_LEADING_BLANKS }).map((_, i) => (
              <div key={`blank-${i}`} className="h-[42px]" />
            ))}
            {strip.map((day) => {
              const isSelected = selectedDay === day;
              const isToday = day === TODAY_DAY;
              const hasActivity = daysWithActivity.has(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day);
                    setShowCalendar(false);
                  }}
                  className="box-border flex h-[42px] cursor-pointer flex-col items-center justify-center gap-[3px] rounded-xl"
                  style={{
                    background: isSelected ? "#33291f" : "transparent",
                    border: `1px solid ${isSelected ? "#33291f" : "transparent"}`,
                  }}
                >
                  <div
                    className="leading-none"
                    style={{
                      fontSize: 13,
                      color: isSelected ? "#f6ecd9" : "#33291f",
                      fontWeight: isToday ? 600 : 400,
                    }}
                  >
                    {day}
                  </div>
                  <div className="h-1 w-1 rounded-full" style={{
                    background: hasActivity ? (isSelected ? "#c9a869" : "#b3873d") : "transparent",
                  }} />
                </button>
              );
            })}
          </div>
          <div
            onClick={() => {
              setSelectedDay(null);
              setShowCalendar(false);
            }}
            className="mt-3 cursor-pointer rounded-xl border border-border-input py-2 text-center text-[12.5px] text-secondary-2"
          >
            Voir toutes les dates
          </div>
        </div>
      ) : null}

      <div className="mt-[18px] flex flex-col gap-3">
        {list.length === 0 ? (
          <div className="rounded-[18px] border border-border bg-card px-4 py-6 text-center text-[13.5px] text-secondary-2">
            Aucune réservation à cette date.
          </div>
        ) : (
          list.map((r) => {
            const unit = units.find((u) => u.ref === r.unitRef);
            const customer = customers.find((c) => c.id === r.customerId);
            const status = STATUS_STYLE[reservationStatus(r, units)];
            const isHighlighted = highlightId === r.id;
            return (
              <div
                key={r.id}
                ref={isHighlighted ? highlightRef : undefined}
                onClick={() => unit && router.push(`/dress/${unit.ref}`)}
                className="flex cursor-pointer items-center gap-[13px] rounded-[18px] border p-[13px]"
                style={{
                  borderColor: isHighlighted ? "#a5813f" : "var(--color-border)",
                  background: isHighlighted ? "#fdf7ea" : "var(--color-card)",
                  boxShadow: isHighlighted ? "0 0 0 1px #a5813f" : "none",
                }}
              >
                <div className="h-[78px] w-[60px] flex-shrink-0 overflow-hidden rounded-xl bg-[#efe6d5]">
                  <ImageSlot placeholder="Robe" shape="rounded" radius={12} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-[21px] text-ink">
                    {customer ? `${customer.firstName} ${customer.lastName}` : "Cliente"}
                  </div>
                  <div className="mt-[3px] text-[13px] text-secondary-2">
                    {unit ? unitLabel(unit, models) : ""}
                  </div>
                  <div className="mt-1 text-[12.5px] text-secondary">
                    {dayLabel(r.pickupDay)} → {dayLabel(r.returnDay)}
                  </div>
                  <div className="mt-[7px] flex items-center gap-1.5">
                    <Dot color={status.dot} size={5} />
                    <div
                      className="font-caps text-[9px] tracking-[1.6px]"
                      style={{ color: status.fg }}
                    >
                      {status.label}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
