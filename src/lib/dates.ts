/**
 * Real calendar-date arithmetic.
 *
 * The app used to run on a single fixed demo month ("August 2026" — see the
 * old AUGUST_2026_DAYS/AUGUST_2026_LEADING_BLANKS constants this replaces).
 * Every date in the app — a reservation's pickupDay/returnDay, "today", the
 * calendar grids — is represented as an epoch day number: an integer count
 * of days since 1970-01-01 UTC. That keeps every existing comparison
 * (`a.pickupDay <= b.pickupDay`, sorting, `day === TODAY_DAY`, etc.) working
 * exactly as it did before; only what the integer *means* changed, from
 * "day-of-month in a fixed demo month" to "an absolute, real date".
 */

const MS_PER_DAY = 86_400_000;

export function epochDay(year: number, month1to12: number, day: number): number {
  return Math.round(Date.UTC(year, month1to12 - 1, day) / MS_PER_DAY);
}

export function todayEpochDay(): number {
  const now = new Date();
  return epochDay(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export interface EpochDayParts {
  year: number;
  month1: number; // 1-12
  day: number; // day of month
  weekday0Sun: number; // 0 = Sunday .. 6 = Saturday
}

export function epochDayParts(epoch: number): EpochDayParts {
  const d = new Date(epoch * MS_PER_DAY);
  return {
    year: d.getUTCFullYear(),
    month1: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    weekday0Sun: d.getUTCDay(),
  };
}

export function dayOfMonth(epoch: number): number {
  return epochDayParts(epoch).day;
}

/** All epoch days in the month containing `epoch`, in order. */
export function daysInMonthGrid(epoch: number): number[] {
  const { year, month1 } = epochDayParts(epoch);
  const count = new Date(Date.UTC(year, month1, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => epochDay(year, month1, i + 1));
}

/** Leading blank cells before day 1, for a Monday-first (LUN..DIM) week grid. */
export function leadingBlanksForMonth(epoch: number): number {
  const { year, month1 } = epochDayParts(epoch);
  const firstWeekday = new Date(Date.UTC(year, month1 - 1, 1)).getUTCDay(); // 0=Sun..6=Sat
  return (firstWeekday + 6) % 7;
}

/** The 1st of the month `delta` months away from the month containing `epoch`. */
export function addMonthsClampToFirst(epoch: number, delta: number): number {
  const { year, month1 } = epochDayParts(epoch);
  return epochDay(year, month1 + delta, 1);
}

/** Column index (0=Mon..6=Sun) of `epoch` within its Monday-first week. */
export function weekdayColumn(epoch: number): number {
  const { weekday0Sun } = epochDayParts(epoch);
  return (weekday0Sun + 6) % 7;
}
