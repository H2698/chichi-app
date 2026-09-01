"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Chip } from "@/components/ui/Chip";
import { Dot } from "@/components/ui/Card";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ChevronRightIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import {
  AVAILABLE_SIZES,
  TODAY_DAY,
  TODAY_MONTH_LABEL,
} from "@/lib/mock-data";
import {
  AUGUST_2026_DAYS,
  AUGUST_2026_LEADING_BLANKS,
  WEEKDAYS_FR,
  dayLabel,
} from "@/lib/format";
import { getEventsForDay, getUnitDayStatus, unitLabel } from "@/lib/selectors";
import { CAL, type CalStatusKey } from "@/lib/status";

const VIEWS = ["Mois", "Semaine", "Jour"] as const;
type View = (typeof VIEWS)[number];

const STATUS_FILTERS: { key: CalStatusKey | "all"; label: string }[] = [
  { key: "all", label: "Tous les statuts" },
  { key: "disponible", label: "Disponible" },
  { key: "reservee", label: "Réservée" },
  { key: "louee", label: "Louée" },
  { key: "retour", label: "Retour prévu" },
  { key: "nettoyage", label: "Nettoyage" },
  { key: "indispo", label: "Indisponible" },
];

function weekdayColumnOf(day: number): number {
  // August 2026: day 1 is a Monday-column-index 5 (Saturday); see AUGUST_2026_LEADING_BLANKS.
  return (AUGUST_2026_LEADING_BLANKS + day - 1) % 7;
}

export default function AdminCalendarPage() {
  const router = useRouter();
  const models = useAppStore((s) => s.models);
  const units = useAppStore((s) => s.units);
  const reservations = useAppStore((s) => s.reservations);
  const customers = useAppStore((s) => s.customers);

  const [view, setView] = useState<View>("Mois");
  const [selectedDay, setSelectedDay] = useState(TODAY_DAY);
  const [filterModelId, setFilterModelId] = useState("all");
  const [filterSize, setFilterSize] = useState("all");
  const [filterStatus, setFilterStatus] = useState<CalStatusKey | "all">("all");
  const [dayPanelOpen, setDayPanelOpen] = useState(false);

  const filteredUnits = useMemo(
    () =>
      units.filter(
        (u) =>
          (filterModelId === "all" || u.modelId === filterModelId) &&
          (filterSize === "all" || u.size === filterSize)
      ),
    [units, filterModelId, filterSize]
  );
  const filteredRefs = useMemo(() => new Set(filteredUnits.map((u) => u.ref)), [filteredUnits]);

  const dayInfo = (day: number) => {
    const statuses = filteredUnits.map((u) => getUnitDayStatus(u, day, reservations));
    const matching = filterStatus === "all" ? statuses : statuses.filter((s) => s === filterStatus);
    const events = getEventsForDay(day, reservations, units, models, customers).filter(
      (e) => e.unit && filteredRefs.has(e.unit.ref)
    );
    const unavailable = statuses.filter((s) => s !== "disponible").length;
    const hasLate = events.some((e) => {
      if (!e.unit) return false;
      return e.unit.baseStatus === "louee" && e.reservation.returnDay < TODAY_DAY;
    });
    return { statuses, matching, events, unavailable, hasLate };
  };

  const openDay = (day: number) => {
    setSelectedDay(day);
    setDayPanelOpen(true);
  };

  const selected = dayInfo(selectedDay);

  const weekDays = useMemo(() => {
    const col = weekdayColumnOf(selectedDay);
    const monday = selectedDay - col;
    return Array.from({ length: 7 }, (_, i) => monday + i).filter((d) => d >= 1 && d <= AUGUST_2026_DAYS);
  }, [selectedDay]);

  return (
    <div className="px-[22px] pb-10 pt-2.5 lg:px-0 lg:pt-0">
      <AdminPageHeader title="Calendrier global" subtitle={TODAY_MONTH_LABEL} />

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          {VIEWS.map((v) => (
            <Chip key={v} label={v} active={view === v} onClick={() => setView(v)} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <select
            value={filterModelId}
            onChange={(e) => setFilterModelId(e.target.value)}
            className="rounded-2xl border border-border-input bg-card px-4 py-2.5 text-[13.5px] text-ink outline-none"
          >
            <option value="all">Toutes les robes</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          <select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
            className="rounded-2xl border border-border-input bg-card px-4 py-2.5 text-[13.5px] text-ink outline-none"
          >
            <option value="all">Toutes les tailles</option>
            {AVAILABLE_SIZES.map((s) => (
              <option key={s} value={s}>
                Taille {s}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as CalStatusKey | "all")}
            className="rounded-2xl border border-border-input bg-card px-4 py-2.5 text-[13.5px] text-ink outline-none"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.key} value={f.key}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {view === "Mois" && (
            <div>
              <div className="grid grid-cols-7">
                {WEEKDAYS_FR.map((w) => (
                  <div key={w} className="pb-2 text-center font-caps text-[9px] tracking-[1.2px] text-tertiary">
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-[5px]">
                {Array.from({ length: AUGUST_2026_LEADING_BLANKS }).map((_, i) => (
                  <div key={`b-${i}`} className="h-[54px]" />
                ))}
                {Array.from({ length: AUGUST_2026_DAYS }, (_, i) => i + 1).map((day) => {
                  const info = dayInfo(day);
                  const past = day < TODAY_DAY;
                  const isSelected = day === selectedDay;
                  const count = filterStatus === "all" ? info.events.length : info.matching.length;
                  const dotColor = info.hasLate
                    ? "#b1553f"
                    : filterStatus !== "all"
                      ? CAL[filterStatus].dot
                      : count > 0
                        ? "#b3873d"
                        : "#c9bda6";
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => openDay(day)}
                      className="box-border flex h-[54px] flex-col items-center justify-center gap-1 rounded-xl border"
                      style={{
                        background: isSelected ? "#33291f" : "#fdfaf3",
                        borderColor: isSelected ? "#33291f" : "#f0e7d6",
                        opacity: past ? 0.55 : 1,
                      }}
                    >
                      <div
                        className="text-[14px] leading-none"
                        style={{
                          color: isSelected ? "#f6ecd9" : "#33291f",
                          fontWeight: day === TODAY_DAY ? 600 : 400,
                        }}
                      >
                        {day}
                      </div>
                      {count > 0 ? (
                        <div className="flex items-center gap-1">
                          <Dot color={isSelected ? "#c9a869" : dotColor} size={5} />
                          <span
                            className="text-[9.5px]"
                            style={{ color: isSelected ? "#f6ecd9" : "#8a7a63" }}
                          >
                            {count}
                          </span>
                        </div>
                      ) : (
                        <div className="h-[5px]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {view === "Semaine" && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
              {weekDays.map((day) => {
                const info = dayInfo(day);
                return (
                  <div
                    key={day}
                    onClick={() => openDay(day)}
                    className="cursor-pointer rounded-2xl border border-border bg-card p-3"
                    style={{ borderColor: day === selectedDay ? "#a5813f" : "#eee3d0" }}
                  >
                    <div className="font-caps text-[9px] tracking-[1.2px] text-tertiary">
                      {WEEKDAYS_FR[weekdayColumnOf(day)]}
                    </div>
                    <div className="mt-1 font-serif text-[20px] text-ink">{day}</div>
                    <div className="mt-2 flex flex-col gap-1.5">
                      {info.events.length === 0 ? (
                        <div className="text-[11px] text-secondary-2">—</div>
                      ) : (
                        info.events.slice(0, 3).map((e, i) => (
                          <div
                            key={i}
                            className="truncate rounded-md px-1.5 py-1 text-[10.5px]"
                            style={{
                              background: e.kind === "RETRAIT" ? "#f1f4ee" : "#f6ebee",
                              color: e.kind === "RETRAIT" ? "#5f7355" : "#7c5a6b",
                            }}
                          >
                            {e.time} · {e.customer?.firstName}
                          </div>
                        ))
                      )}
                      {info.events.length > 3 ? (
                        <div className="text-[10.5px] text-tertiary">+{info.events.length - 3}</div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {view === "Jour" && (
            <div>
              <div className="flex items-center justify-between">
                <div className="font-serif text-[24px] text-ink">{dayLabel(selectedDay)}</div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDay((d) => Math.max(1, d - 1))}
                    className="rounded-full border border-border-input px-3 py-1.5 text-[12.5px] text-secondary"
                  >
                    ‹ Préc.
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDay((d) => Math.min(AUGUST_2026_DAYS, d + 1))}
                    className="rounded-full border border-border-input px-3 py-1.5 text-[12.5px] text-secondary"
                  >
                    Suiv. ›
                  </button>
                </div>
              </div>
              <DayEventList
                events={selected.events}
                unavailable={selected.unavailable}
                models={models}
                onOpenReservation={(id) => router.push(`/admin/reservations/${id}`)}
              />
            </div>
          )}
        </div>

        {/* Desktop: persistent side panel for the selected day */}
        <div className="hidden lg:block">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="font-serif text-[20px] text-ink">{dayLabel(selectedDay)}</div>
            <DayEventList
              events={selected.events}
              unavailable={selected.unavailable}
              models={models}
              onOpenReservation={(id) => router.push(`/admin/reservations/${id}`)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
        {(Object.keys(CAL) as CalStatusKey[]).map((k) => (
          <div key={k} className="flex items-center gap-2">
            <Dot color={CAL[k].dot} size={6} />
            <div className="text-[11.5px] text-secondary">{CAL[k].label}</div>
          </div>
        ))}
      </div>

      {/* Mobile: bottom sheet for the selected day (month/week views) */}
      <BottomSheet open={dayPanelOpen && view !== "Jour"} onClose={() => setDayPanelOpen(false)}>
        <div className="font-serif text-[24px] text-ink">{dayLabel(selectedDay)}</div>
        <DayEventList
          events={selected.events}
          unavailable={selected.unavailable}
          models={models}
          onOpenReservation={(id) => router.push(`/admin/reservations/${id}`)}
        />
      </BottomSheet>
    </div>
  );
}

function DayEventList({
  events,
  unavailable,
  models,
  onOpenReservation,
}: {
  events: ReturnType<typeof getEventsForDay>;
  unavailable: number;
  models: ReturnType<typeof useAppStore.getState>["models"];
  onOpenReservation: (id: string) => void;
}) {
  return (
    <div className="mt-4">
      <div className="rounded-xl bg-[#fdfaf3] px-3.5 py-2.5 text-[12.5px] text-secondary-2">
        {unavailable} unité{unavailable !== 1 ? "s" : ""} indisponible{unavailable !== 1 ? "s" : ""} ce jour
        (toutes robes confondues)
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {events.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border-input px-4 py-5 text-center text-[12.5px] text-secondary-2">
            Aucun retrait ni retour ce jour.
          </div>
        ) : (
          events.map((e, i) => (
            <div
              key={i}
              onClick={() => onOpenReservation(e.reservation.id)}
              className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-app px-3.5 py-2.5"
            >
              <div
                className="rounded-md px-2 py-1 font-caps text-[9px] tracking-[1.4px]"
                style={{
                  background: e.kind === "RETRAIT" ? "#f1f4ee" : "#f6ebee",
                  color: e.kind === "RETRAIT" ? "#5f7355" : "#7c5a6b",
                }}
              >
                {e.time}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13.5px] text-ink">
                  {e.customer ? `${e.customer.firstName} ${e.customer.lastName}` : "Cliente"}
                </div>
                <div className="truncate text-[11.5px] text-secondary-2">
                  {e.unit ? unitLabel(e.unit, models) : ""}
                </div>
              </div>
              <ChevronRightIcon size={14} className="flex-shrink-0 text-[#c9a869]" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
