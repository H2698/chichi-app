import { DRESS_UNITS, TODAY_DAY } from "./mock-data";
import { dayLabel } from "./format";
import type { CalStatusKey } from "./status";
import type {
  AppNotification,
  Customer,
  DressModel,
  DressUnit,
  Employee,
  Reservation,
  ReservationStatus,
  UnitStatus,
} from "./types";

/** Looks a model up in the live (store) models array — includes admin-added dresses. */
export function findModel(modelId: string, models: DressModel[]): DressModel | undefined {
  return models.find((m) => m.id === modelId);
}

/**
 * Resolves the signed-in Supabase Auth user to their `employees` directory
 * row — id first (how every employee created through /api/employees is
 * linked), email as a fallback for the handful of legacy rows whose id
 * predates that. Mirrors AuthGate's currentUserIsAdmin lookup, but returns
 * the row itself so screens can show the person's actual name, not just a
 * yes/no on their role.
 *
 * Returns undefined when signed out, when Supabase isn't configured (local
 * demo mode), or when the account has no matching directory row at all —
 * callers should fall back to something sensible (e.g. CURRENT_EMPLOYEE_ID)
 * rather than crash or show a blank name.
 */
export function getCurrentEmployee(
  employees: Employee[],
  authUserId: string | null,
  authUserEmail: string | null
): Employee | undefined {
  if (authUserId) {
    const byId = employees.find((e) => e.id === authUserId);
    if (byId) return byId;
  }
  if (authUserEmail) {
    const byEmail = employees.find((e) => e.email === authUserEmail);
    if (byEmail) return byEmail;
  }
  return undefined;
}

export function unitLabel(unit: DressUnit, models: DressModel[]): string {
  const model = findModel(unit.modelId, models);
  return `${model?.name ?? unit.modelId} · ${unit.size}`;
}

function isActive(r: Reservation): boolean {
  return !r.completed && !r.cancelled;
}

export function activeReservationForUnit(
  unitRef: string,
  reservations: Reservation[]
): Reservation | undefined {
  return reservations.find((r) => r.unitRef === unitRef && isActive(r) && r.pickupDay <= TODAY_DAY);
}

export function nextUpcomingReservationForUnit(
  unitRef: string,
  reservations: Reservation[]
): Reservation | undefined {
  return reservations
    .filter((r) => r.unitRef === unitRef && isActive(r) && r.pickupDay > TODAY_DAY)
    .sort((a, b) => a.pickupDay - b.pickupDay)[0];
}

/**
 * A reservation only reads as "RETOUR PRÉVU" once the unit has actually been
 * checked out (baseStatus 'louee'); a same-day pickup that hasn't happened
 * yet is still "CONFIRMÉE", regardless of how close the pickup date is.
 */
export function reservationStatus(r: Reservation, units: DressUnit[]): ReservationStatus {
  if (r.cancelled) return "ANNULEE";
  if (r.completed) return "TERMINEE";
  if (r.returnDay < TODAY_DAY) return "EN_RETARD";
  const unit = units.find((u) => u.ref === r.unitRef);
  if (unit?.baseStatus === "louee") return "RETOUR_PREVU";
  return "CONFIRMEE";
}

/**
 * A reservation only reads as genuinely late once its dress hasn't come
 * back — i.e. the unit is still actually "louee" — not just because its
 * `returnDay` is in the past and it hasn't been marked completed. Those two
 * can drift apart: a return normally sets both together (confirmReturn),
 * but a handful of old reservations were confirmed some other way (a
 * pre-existing data issue, and the "hors service" toggle changes a unit's
 * status without touching any reservation) and were left permanently
 * "late" even though their unit had already been returned to stock.
 */
export function isLate(r: Reservation, units: DressUnit[]): boolean {
  if (!isActive(r) || r.returnDay >= TODAY_DAY) return false;
  const unit = units.find((u) => u.ref === r.unitRef);
  return unit?.baseStatus === "louee";
}

/** Per-day calendar status for a unit, combining its live base status with its reservations. */
export function getUnitDayStatus(
  unit: DressUnit,
  day: number,
  reservations: Reservation[]
): CalStatusKey {
  if (unit.baseStatus === "indispo") return "indispo";
  if (unit.baseStatus === "nettoyage" && day === TODAY_DAY) return "nettoyage";

  const res = reservations.find(
    (r) => r.unitRef === unit.ref && isActive(r) && day >= r.pickupDay && day <= r.returnDay
  );
  if (!res) return "disponible";
  if (day === res.returnDay) return "retour";
  if (unit.baseStatus === "louee" && res.pickupDay <= TODAY_DAY) return "louee";
  return "reservee";
}

export interface AgendaEntry {
  time: string;
  kind: "RETRAIT" | "RETOUR";
  customerId: string;
  unitRef: string;
}

export function getTodayAgenda(reservations: Reservation[]): AgendaEntry[] {
  const entries: AgendaEntry[] = [];
  for (const r of reservations) {
    if (!isActive(r)) continue;
    if (r.pickupDay === TODAY_DAY) {
      entries.push({ time: r.pickupTime, kind: "RETRAIT", customerId: r.customerId, unitRef: r.unitRef });
    }
    if (r.returnDay === TODAY_DAY) {
      entries.push({ time: r.returnTime, kind: "RETOUR", customerId: r.customerId, unitRef: r.unitRef });
    }
  }
  return entries.sort((a, b) => a.time.localeCompare(b.time));
}

export interface HomeStats {
  pickupsToday: number;
  returnsToday: number;
  availableUnits: number;
  lateCount: number;
}

export function getHomeStats(units: DressUnit[], reservations: Reservation[]): HomeStats {
  const pickupsToday = reservations.filter((r) => isActive(r) && r.pickupDay === TODAY_DAY).length;
  const returnsToday = reservations.filter((r) => isActive(r) && r.returnDay === TODAY_DAY).length;
  const availableUnits = units.filter((u) => u.baseStatus === "disponible").length;
  const lateCount = reservations.filter((r) => isLate(r, units)).length;
  return { pickupsToday, returnsToday, availableUnits, lateCount };
}

export interface AdminStats extends HomeStats {
  rentedUnits: number;
  cleaningUnits: number;
  upcomingCount: number;
}

export function getAdminStats(units: DressUnit[], reservations: Reservation[]): AdminStats {
  const base = getHomeStats(units, reservations);
  const rentedUnits = units.filter((u) => u.baseStatus === "louee").length;
  const cleaningUnits = units.filter((u) => u.baseStatus === "nettoyage").length;
  const upcomingCount = reservations.filter((r) => isActive(r) && r.pickupDay > TODAY_DAY).length;
  return { ...base, rentedUnits, cleaningUnits, upcomingCount };
}

export function getModelStatusSummary(
  modelId: string,
  units: DressUnit[]
): { label: string; status: UnitStatus } {
  const modelUnits = units.filter((u) => u.modelId === modelId);
  const available = modelUnits.filter((u) => u.baseStatus === "disponible").length;
  if (available === modelUnits.length) return { label: `${available} disponibles`, status: "disponible" };
  if (available > 0) return { label: `${available} disponible${available > 1 ? "s" : ""}`, status: "disponible" };
  if (modelUnits.every((u) => u.baseStatus === "nettoyage" || u.baseStatus === "indispo")) {
    return { label: "En nettoyage", status: "nettoyage" };
  }
  return { label: "Toutes réservées", status: "reservee" };
}

export function getCatalogCounts(models: DressModel[], units: DressUnit[]) {
  return { models: models.length, units: units.length };
}

export function reservationCoveringDay(
  unitRef: string,
  day: number,
  reservations: Reservation[]
): Reservation | undefined {
  return reservations.find(
    (r) => r.unitRef === unitRef && isActive(r) && day >= r.pickupDay && day <= r.returnDay
  );
}

export function findUnitByCode(code: string, units: DressUnit[] = DRESS_UNITS): DressUnit | undefined {
  const normalized = code.trim().toUpperCase();
  return units.find((u) => u.ref === normalized);
}

/* ----------------------------- Admin selectors ---------------------------- */

export type AdminReservationTab = "Aujourd'hui" | "À venir" | "Passées" | "Annulées";

export function adminReservationBucket(r: Reservation): AdminReservationTab {
  if (r.cancelled) return "Annulées";
  if (r.completed) return "Passées";
  if (r.pickupDay === TODAY_DAY || r.returnDay === TODAY_DAY || r.returnDay < TODAY_DAY) {
    return "Aujourd'hui";
  }
  if (r.pickupDay > TODAY_DAY) return "À venir";
  return "Passées";
}

export interface ReservationSearchRow {
  reservation: Reservation;
  customer?: Customer;
  unit?: DressUnit;
  model?: DressModel;
}

export function searchReservations(
  query: string,
  reservations: Reservation[],
  customers: Customer[],
  units: DressUnit[],
  models: DressModel[]
): ReservationSearchRow[] {
  const q = query.trim().toLowerCase();
  const rows = reservations.map((reservation) => {
    const customer = customers.find((c) => c.id === reservation.customerId);
    const unit = units.find((u) => u.ref === reservation.unitRef);
    const model = unit ? findModel(unit.modelId, models) : undefined;
    return { reservation, customer, unit, model };
  });
  if (!q) return rows;
  return rows.filter(({ reservation, customer, unit, model }) => {
    const haystack = [
      customer ? `${customer.firstName} ${customer.lastName}` : "",
      customer?.phone ?? "",
      model?.name ?? "",
      unit?.ref ?? "",
      reservation.id,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function searchCustomers(query: string, customers: Customer[]): Customer[] {
  const q = query.trim().toLowerCase();
  if (!q) return customers;
  return customers.filter(
    (c) =>
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
  );
}

export function reservationsForCustomer(customerId: string, reservations: Reservation[]): Reservation[] {
  return reservations
    .filter((r) => r.customerId === customerId)
    .sort((a, b) => b.pickupDay - a.pickupDay);
}

/** All pickup/return events touching a given day, across every unit — for the admin global calendar. */
export interface CalendarEvent {
  reservation: Reservation;
  kind: "RETRAIT" | "RETOUR";
  time: string;
  unit?: DressUnit;
  model?: DressModel;
  customer?: Customer;
}

export function getEventsForDay(
  day: number,
  reservations: Reservation[],
  units: DressUnit[],
  models: DressModel[],
  customers: Customer[]
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  for (const r of reservations) {
    if (!isActive(r)) continue;
    const unit = units.find((u) => u.ref === r.unitRef);
    const model = unit ? findModel(unit.modelId, models) : undefined;
    const customer = customers.find((c) => c.id === r.customerId);
    if (r.pickupDay === day) {
      events.push({ reservation: r, kind: "RETRAIT", time: r.pickupTime, unit, model, customer });
    }
    if (r.returnDay === day) {
      events.push({ reservation: r, kind: "RETOUR", time: r.returnTime, unit, model, customer });
    }
  }
  return events.sort((a, b) => a.time.localeCompare(b.time));
}

/** Next unused model id in the CHI-00NN sequence. */
export function nextModelId(models: DressModel[]): string {
  const max = models.reduce((m, model) => {
    const n = parseInt(model.id.replace("CHI-", ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return `CHI-${String(max + 1).padStart(4, "0")}`;
}

/** Generates the next `count` unit refs for a given model+size, continuing from existing units. */
export function nextUnitRefs(
  modelRef: string,
  size: string,
  count: number,
  existingUnits: DressUnit[]
): string[] {
  const existingForSize = existingUnits.filter(
    (u) => u.modelId === modelRef && u.size === size
  );
  const maxIndex = existingForSize.reduce((m, u) => {
    const n = parseInt(u.ref.split("-").pop() ?? "0", 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 0);
  return Array.from({ length: count }, (_, i) => {
    const idx = maxIndex + i + 1;
    return `${modelRef}-${size}-${String(idx).padStart(2, "0")}`;
  });
}

/**
 * Derives a notification feed from live app data — there's no event log or
 * push backend, so each notification is recomputed from current state
 * rather than stored as a persisted event.
 */
export function getNotifications(
  reservations: Reservation[],
  units: DressUnit[],
  models: DressModel[],
  customers: Customer[]
): AppNotification[] {
  const items: AppNotification[] = [];

  const customerName = (id: string) => {
    const c = customers.find((cu) => cu.id === id);
    return c ? `${c.firstName} ${c.lastName}` : "Cliente";
  };
  const dressLabel = (unitRef: string) => {
    const unit = units.find((u) => u.ref === unitRef);
    const model = unit ? findModel(unit.modelId, models) : undefined;
    return model ? `${model.name} · ${unit?.size}` : unitRef;
  };

  for (const r of reservations) {
    if (isLate(r, units)) {
      items.push({
        id: `retard-${r.id}`,
        kind: "retard",
        title: "Retour en retard",
        detail: `${customerName(r.customerId)} — ${dressLabel(r.unitRef)}`,
        when: `${dayLabel(r.returnDay)} · ${r.returnTime}`,
        unitRef: r.unitRef,
      });
    }
  }

  for (const u of units) {
    if (u.baseStatus === "nettoyage") {
      items.push({
        id: `nettoyage-${u.ref}`,
        kind: "nettoyage",
        title: "Robe à nettoyer",
        detail: dressLabel(u.ref),
        when: "Aujourd'hui",
        unitRef: u.ref,
      });
    }
  }

  for (const r of reservations) {
    if (isActive(r) && r.pickupDay === TODAY_DAY) {
      items.push({
        id: `retrait-${r.id}`,
        kind: "retrait",
        title: "Retrait prévu aujourd'hui",
        detail: `${customerName(r.customerId)} — ${dressLabel(r.unitRef)}`,
        when: r.pickupTime,
        unitRef: r.unitRef,
      });
    }
  }

  for (const r of reservations) {
    if (isActive(r) && r.pickupDay > TODAY_DAY) {
      items.push({
        id: `reservation-${r.id}`,
        kind: "reservation",
        title: "Nouvelle réservation",
        detail: `${customerName(r.customerId)} — ${dressLabel(r.unitRef)}`,
        when: dayLabel(r.pickupDay),
        unitRef: r.unitRef,
      });
    }
  }

  return items;
}
