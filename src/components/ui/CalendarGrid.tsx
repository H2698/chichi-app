"use client";

import { WEEKDAYS_FR } from "@/lib/format";
import { daysInMonthGrid, dayOfMonth, leadingBlanksForMonth } from "@/lib/dates";
import { TODAY_DAY } from "@/lib/mock-data";
import { CAL, type CalStatusKey } from "@/lib/status";
import { useAppStore } from "@/lib/store";
import { getUnitDayStatus } from "@/lib/selectors";

export function CalendarGrid({ unitRef, monthEpoch }: { unitRef: string; monthEpoch: number }) {
  const units = useAppStore((s) => s.units);
  const reservations = useAppStore((s) => s.reservations);
  const selStart = useAppStore((s) => s.selStart);
  const selEnd = useAppStore((s) => s.selEnd);
  const tapDay = useAppStore((s) => s.tapDay);

  const unit = units.find((u) => u.ref === unitRef);
  const days = daysInMonthGrid(monthEpoch);
  const leadingBlanks = leadingBlanksForMonth(monthEpoch);

  return (
    <div>
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
        {Array.from({ length: leadingBlanks }).map((_, i) => (
          <div key={`blank-${i}`} className="h-[46px]" />
        ))}
        {unit &&
          days.map((day) => {
            const key: CalStatusKey = getUnitDayStatus(unit, day, reservations);
            const c = CAL[key];
            const inRange =
              selStart !== null &&
              (selEnd !== null ? day >= selStart && day <= selEnd : day === selStart);
            const past = day < TODAY_DAY;

            const bg = inRange ? "#33291f" : c.bg;
            const bd = inRange ? "#33291f" : c.bd;
            const fg = inRange ? "#f6ecd9" : c.fg;
            const dot = inRange ? "#c9a869" : c.dot;
            const mark = inRange ? null : c.mark;

            return (
              <button
                key={day}
                type="button"
                onClick={() => tapDay(unitRef, day)}
                className="box-border flex h-[46px] cursor-pointer flex-col items-center justify-center gap-[3px] rounded-xl"
                style={{
                  background: bg,
                  border: `1px solid ${bd}`,
                  opacity: past ? 0.5 : 1,
                }}
              >
                <div
                  className="leading-none"
                  style={{ fontSize: 14, color: fg, fontWeight: day === TODAY_DAY ? 600 : 400 }}
                >
                  {dayOfMonth(day)}
                </div>
                <div className="flex h-[9px] items-center justify-center">
                  {mark ? (
                    <div className="font-caps text-[8px] tracking-[0.6px]" style={{ color: fg }}>
                      {mark}
                    </div>
                  ) : (
                    <div className="h-1 w-1 rounded-full" style={{ background: dot }} />
                  )}
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
