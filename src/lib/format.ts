export const WEEKDAYS_FR = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

/** Days in August 2026, indexed from Monday = 1. Aug 1 2026 is a Saturday. */
export const AUGUST_2026_LEADING_BLANKS = 5; // Sat is the 6th column (Mon..Sun)
export const AUGUST_2026_DAYS = 31;

export function dayLabel(day: number): string {
  return `${day} août`;
}

export function dayLabelFull(day: number): string {
  return `${day} août 2026`;
}

export function money(amount: number): string {
  return `${amount} DT`;
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}
