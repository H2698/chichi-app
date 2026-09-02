import { epochDayParts } from "./dates";

export const WEEKDAYS_FR = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

const MONTHS_FR = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const WEEKDAYS_FR_FULL = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];

export function dayLabel(epoch: number): string {
  const { month1, day } = epochDayParts(epoch);
  return `${day} ${MONTHS_FR[month1 - 1]}`;
}

export function dayLabelFull(epoch: number): string {
  const { year, month1, day } = epochDayParts(epoch);
  return `${day} ${MONTHS_FR[month1 - 1]} ${year}`;
}

/** e.g. "Septembre 2026" — for a calendar header showing the month `epoch` falls in. */
export function monthLabel(epoch: number): string {
  const { year, month1 } = epochDayParts(epoch);
  const name = MONTHS_FR[month1 - 1];
  return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
}

/** e.g. "MERCREDI 2 SEPTEMBRE" — the home screen's "today" header. */
export function weekdayLabelFull(epoch: number): string {
  const { weekday0Sun, day, month1 } = epochDayParts(epoch);
  return `${WEEKDAYS_FR_FULL[weekday0Sun]} ${day} ${MONTHS_FR[month1 - 1]}`.toUpperCase();
}

export function money(amount: number): string {
  return `${amount} DT`;
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}
