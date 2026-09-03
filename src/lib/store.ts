import { create } from "zustand";
import { CUSTOMERS, DRESS_MODELS, DRESS_UNITS, EMPLOYEES, SEED_RESERVATIONS, TODAY_DAY } from "./mock-data";
import { activeReservationForUnit, findModel, getUnitDayStatus, nextModelId, nextUnitRefs } from "./selectors";
import { supabase, supabaseConfigured } from "./supabase";
import type {
  Customer,
  DressCondition,
  DressModel,
  DressUnit,
  Employee,
  PaymentMethod,
  Reservation,
  ReservationDraft,
  SheetType,
  UnitStatus,
} from "./types";

let toastTimer: ReturnType<typeof setTimeout> | undefined;
// Seed value only — matches the bundled mock data's reservation count for
// the no-Supabase demo mode. Once real data exists, hydrate() below moves
// this past the highest id actually in the database; never rely on this
// literal once Supabase is configured.
let reservationSeq = 286;

/** Advances reservationSeq past the highest "CHI-R-NNNNN" id currently in
 * `reservations`, so a freshly loaded app (reservationSeq always restarts
 * at the literal above) can't hand out an id that already exists remotely.
 * Without this, confirmReservation() would silently reuse an old id once
 * more than 286 reservations existed — the insert fails quietly (fire-
 * and-forget sync), and the new booking then shares its id with the old
 * one, so whichever comes first in the array is what prints/displays. */
function bumpReservationSeq(reservations: { id: string }[]) {
  for (const r of reservations) {
    const match = /^CHI-R-(\d+)$/.exec(r.id);
    if (!match) continue;
    const n = parseInt(match[1], 10);
    if (n >= reservationSeq) reservationSeq = n + 1;
  }
}

const emptyDraft: ReservationDraft = {
  unitRef: null,
  pickupDay: null,
  returnDay: null,
  pickupTime: "10:30",
  returnTime: "18:00",
  customerId: null,
  method: "Espèces",
  paid: 0,
  deposit: 100,
};

export interface NewDressFields {
  name: string;
  category: string;
  color: string;
  price: number;
  deposit: number;
  photoUrl?: string;
  sizeQuantities: Record<string, number>; // e.g. { M: 2, L: 1 }
}

export interface NewEmployeeFields {
  firstName: string;
  lastName: string;
  role: Employee["role"];
  status: Employee["status"];
}

// ---- Supabase row <-> app-model mapping -----------------------------------
// The database uses snake_case columns; the app's types use camelCase. These
// helpers keep that translation in one place instead of scattering it across
// every store action.

type ModelRow = {
  id: string;
  name: string;
  category: string;
  price: number;
  deposit: number;
  color: string;
  sizes: string[];
  photo_slot: string | null;
  photo_url: string | null;
  disabled: boolean;
};
type UnitRow = { ref: string; model_id: string; size: string; base_status: UnitStatus };
type CustomerRow = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string | null;
  rentals_count: number;
  last_rental_label: string;
};
type ReservationRow = {
  id: string;
  unit_ref: string;
  customer_id: string;
  pickup_day: number;
  pickup_time: string;
  return_day: number;
  return_time: string;
  price: number;
  paid: number;
  deposit: number;
  method: PaymentMethod;
  completed: boolean;
  cancelled: boolean;
};
type EmployeeRow = {
  id: string;
  first_name: string;
  last_name: string;
  role: Employee["role"];
  status: Employee["status"];
  recent_activity: string;
  phone: string | null;
  email: string | null;
  photo_url: string | null;
};

function modelFromRow(r: ModelRow): DressModel {
  return {
    id: r.id,
    name: r.name,
    ref: r.id,
    category: r.category,
    price: r.price,
    deposit: r.deposit,
    color: r.color,
    sizes: r.sizes ?? [],
    photoSlot: r.photo_slot ?? `chi-admin-${r.id}`,
    photoUrl: r.photo_url ?? undefined,
    disabled: r.disabled ?? undefined,
  };
}
function unitFromRow(r: UnitRow): DressUnit {
  return { ref: r.ref, modelId: r.model_id, size: r.size, baseStatus: r.base_status };
}
function customerFromRow(r: CustomerRow): Customer {
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    phone: r.phone,
    email: r.email ?? undefined,
    rentalsCount: r.rentals_count,
    lastRentalLabel: r.last_rental_label,
  };
}
function reservationFromRow(r: ReservationRow): Reservation {
  return {
    id: r.id,
    unitRef: r.unit_ref,
    customerId: r.customer_id,
    pickupDay: r.pickup_day,
    pickupTime: r.pickup_time,
    returnDay: r.return_day,
    returnTime: r.return_time,
    price: r.price,
    paid: r.paid,
    deposit: r.deposit,
    method: r.method,
    completed: r.completed || undefined,
    cancelled: r.cancelled || undefined,
  };
}
function employeeFromRow(r: EmployeeRow): Employee {
  return {
    id: r.id,
    firstName: r.first_name,
    lastName: r.last_name,
    role: r.role,
    status: r.status,
    recentActivity: r.recent_activity,
    phone: r.phone ?? undefined,
    email: r.email ?? undefined,
    photoUrl: r.photo_url ?? undefined,
  };
}

/** Fire-and-forget Supabase write: logs to console instead of throwing, so a
 * flaky connection never breaks the local (optimistic) UI update it follows. */
function syncRemote(label: string, thenable: PromiseLike<{ error: { message: string } | null }>) {
  if (!supabaseConfigured) return;
  thenable.then(({ error }) => {
    if (error) console.error(`[supabase] ${label} failed:`, error.message);
  });
}

interface AppState {
  models: DressModel[];
  units: DressUnit[];
  reservations: Reservation[];
  customers: Customer[];
  employees: Employee[];

  hydrated: boolean;
  hydrate: () => Promise<void>;

  toast: string | null;
  showToast: (message: string) => void;

  sheet: SheetType;
  sheetDay: number | null;
  openSheet: (type: NonNullable<SheetType>, day?: number) => void;
  closeSheet: () => void;

  calendarUnitRef: string | null;
  selStart: number | null;
  selEnd: number | null;
  openCalendarFor: (unitRef: string) => void;
  tapDay: (unitRef: string, day: number) => void;

  draft: ReservationDraft;
  startReservationDraft: (unitRef: string) => void;
  pickCustomer: (customerId: string) => void;
  addCustomer: (fields: { firstName: string; lastName: string; phone: string; email?: string }) => string;
  setMethod: (method: PaymentMethod) => void;

  lastReservationId: string | null;
  confirmReservation: () => string | null;
  cancelReservation: (id: string) => void;

  setUnitStatus: (unitRef: string, status: UnitStatus) => void;

  condition: DressCondition;
  setCondition: (c: DressCondition) => void;
  lastReturn: { unitRef: string; condition: DressCondition } | null;
  confirmReturn: (unitRef: string) => void;
  markUnitReady: (unitRef: string) => void;

  // Admin — dress catalog management
  addDressModel: (fields: NewDressFields) => string;
  updateDressModel: (
    modelId: string,
    patch: Partial<Pick<DressModel, "name" | "category" | "color" | "price" | "deposit" | "photoUrl">>
  ) => void;
  setModelDisabled: (modelId: string, disabled: boolean) => void;
  addUnitsForSize: (modelId: string, size: string, count: number) => void;
  removeUnit: (unitRef: string) => { ok: boolean; reason?: string };

  // Admin — employee management (also used by the "Mes informations" self-edit screen)
  addEmployee: (fields: NewEmployeeFields) => string;
  updateEmployee: (id: string, patch: Partial<Omit<Employee, "id">>) => void;

  // Notifications — derived feed, only read/unread state is actually stored
  readNotificationIds: string[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (ids: string[]) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  models: DRESS_MODELS.map((m) => ({ ...m })),
  units: DRESS_UNITS.map((u) => ({ ...u })),
  reservations: SEED_RESERVATIONS.map((r) => ({ ...r })),
  customers: CUSTOMERS.map((c) => ({ ...c })),
  employees: EMPLOYEES.map((e) => ({ ...e })),

  // Loads the real, persisted state from Supabase over the local seed data.
  // Called once on app mount (see AppHydrator). If Supabase isn't reachable
  // or isn't configured, the seed data above stays in place so the app still
  // works as an offline demo.
  hydrated: false,
  hydrate: async () => {
    if (!supabaseConfigured || get().hydrated) return;
    try {
      const [modelsRes, unitsRes, customersRes, reservationsRes, employeesRes] = await Promise.all([
        supabase.from("models").select("*"),
        supabase.from("units").select("*"),
        supabase.from("customers").select("*"),
        supabase.from("reservations").select("*"),
        supabase.from("employees").select("*"),
      ]);
      if (modelsRes.error || unitsRes.error || customersRes.error || reservationsRes.error || employeesRes.error) {
        console.error(
          "[supabase] hydrate failed:",
          modelsRes.error?.message ??
            unitsRes.error?.message ??
            customersRes.error?.message ??
            reservationsRes.error?.message ??
            employeesRes.error?.message
        );
        return;
      }
      const reservations = (reservationsRes.data as ReservationRow[]).map(reservationFromRow);
      bumpReservationSeq(reservations);
      set({
        models: (modelsRes.data as ModelRow[]).map(modelFromRow),
        units: (unitsRes.data as UnitRow[]).map(unitFromRow),
        customers: (customersRes.data as CustomerRow[]).map(customerFromRow),
        reservations,
        employees: (employeesRes.data as EmployeeRow[]).map(employeeFromRow),
        hydrated: true,
      });
    } catch (err) {
      console.error("[supabase] hydrate threw:", err);
    }
  },

  toast: null,
  showToast: (message) => {
    set({ toast: message });
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => set({ toast: null }), 2200);
  },

  sheet: null,
  sheetDay: null,
  openSheet: (type, day) => set({ sheet: type, sheetDay: day ?? null }),
  closeSheet: () => set({ sheet: null }),

  calendarUnitRef: null,
  selStart: null,
  selEnd: null,
  openCalendarFor: (unitRef) => set({ calendarUnitRef: unitRef, selStart: null, selEnd: null }),
  tapDay: (unitRef, day) => {
    const state = get();
    const unit = state.units.find((u) => u.ref === unitRef);
    if (!unit) return;
    const status = getUnitDayStatus(unit, day, state.reservations);
    if (status !== "disponible") {
      set({ sheet: "reserved", sheetDay: day });
      return;
    }
    set((st) => {
      if (st.selStart === null || st.selEnd !== null || day <= st.selStart) {
        return { selStart: day, selEnd: null };
      }
      return { selEnd: day };
    });
  },

  draft: emptyDraft,
  startReservationDraft: (unitRef) => {
    const { selStart, selEnd, units, models } = get();
    if (selStart === null || selEnd === null) return;
    const unit = units.find((u) => u.ref === unitRef);
    const model = unit ? findModel(unit.modelId, models) : undefined;
    set({
      draft: {
        ...emptyDraft,
        unitRef,
        pickupDay: selStart,
        returnDay: selEnd,
        deposit: model?.deposit ?? emptyDraft.deposit,
      },
    });
  },
  pickCustomer: (customerId) => set((st) => ({ draft: { ...st.draft, customerId } })),
  addCustomer: (fields) => {
    const id = `cust-${Date.now()}`;
    const customer: Customer = {
      id,
      firstName: fields.firstName || "Cliente",
      lastName: fields.lastName || "",
      phone: fields.phone || "",
      email: fields.email || undefined,
      rentalsCount: 0,
      lastRentalLabel: "Nouvelle cliente",
    };
    set((st) => ({
      customers: [...st.customers, customer],
      draft: { ...st.draft, customerId: id },
      sheet: null,
    }));
    syncRemote(
      "addCustomer",
      supabase.from("customers").insert({
        id: customer.id,
        first_name: customer.firstName,
        last_name: customer.lastName,
        phone: customer.phone,
        email: customer.email ?? null,
        rentals_count: customer.rentalsCount,
        last_rental_label: customer.lastRentalLabel,
      })
    );
    return id;
  },
  setMethod: (method) => set((st) => ({ draft: { ...st.draft, method } })),

  lastReservationId: null,
  confirmReservation: () => {
    const { draft, units, models } = get();
    if (!draft.unitRef || draft.pickupDay === null || draft.returnDay === null || !draft.customerId) {
      return null;
    }
    const unit = units.find((u) => u.ref === draft.unitRef);
    const model = unit ? findModel(unit.modelId, models) : undefined;
    const id = `CHI-R-${String(reservationSeq++).padStart(5, "0")}`;
    const reservation: Reservation = {
      id,
      unitRef: draft.unitRef,
      customerId: draft.customerId,
      pickupDay: draft.pickupDay,
      pickupTime: draft.pickupTime,
      returnDay: draft.returnDay,
      returnTime: draft.returnTime,
      price: model?.price ?? 0,
      paid: draft.paid,
      deposit: draft.deposit,
      method: draft.method,
    };
    set((st) => ({
      reservations: [...st.reservations, reservation],
      lastReservationId: id,
      selStart: null,
      selEnd: null,
    }));
    // A booking is too important to fail silently the way syncRemote's other
    // fire-and-forget writes do (console.error only) — if the insert is
    // rejected (e.g. a duplicate id, which is exactly what an out-of-sync
    // reservationSeq used to cause), the employee needs to know this
    // reservation didn't actually reach the database.
    if (supabaseConfigured) {
      (async () => {
        const { error } = await supabase.from("reservations").insert({
          id: reservation.id,
          unit_ref: reservation.unitRef,
          customer_id: reservation.customerId,
          pickup_day: reservation.pickupDay,
          pickup_time: reservation.pickupTime,
          return_day: reservation.returnDay,
          return_time: reservation.returnTime,
          price: reservation.price,
          paid: reservation.paid,
          deposit: reservation.deposit,
          method: reservation.method,
        });
        if (error) {
          console.error("[supabase] confirmReservation failed:", error.message);
          get().showToast("Échec de l'enregistrement de la réservation — réessayez");
        }
      })();
    }
    // `draft` is deliberately left as-is (not reset to emptyDraft) here: the
    // summary/success screens still read draft.unitRef while navigating away,
    // and clearing it synchronously would trip their "no active draft, bounce
    // to /dresses" guard before the push to /reservation/success lands.
    // startReservationDraft() overwrites it wholesale for the next booking.
    return id;
  },
  cancelReservation: (id) => {
    set((st) => ({
      reservations: st.reservations.map((r) => (r.id === id ? { ...r, cancelled: true } : r)),
    }));
    syncRemote("cancelReservation", supabase.from("reservations").update({ cancelled: true }).eq("id", id));
  },

  setUnitStatus: (unitRef, status) => {
    set((st) => ({
      units: st.units.map((u) => (u.ref === unitRef ? { ...u, baseStatus: status } : u)),
    }));
    syncRemote("setUnitStatus", supabase.from("units").update({ base_status: status }).eq("ref", unitRef));
  },

  condition: "À nettoyer",
  setCondition: (c) => set({ condition: c }),
  lastReturn: null,
  confirmReturn: (unitRef) => {
    const state = get();
    const active = activeReservationForUnit(unitRef, state.reservations);
    set((st) => ({
      reservations: active
        ? st.reservations.map((r) => (r.id === active.id ? { ...r, completed: true } : r))
        : st.reservations,
      units: st.units.map((u) => (u.ref === unitRef ? { ...u, baseStatus: "nettoyage" } : u)),
      lastReturn: { unitRef, condition: st.condition },
      sheet: null,
    }));
    if (active) {
      syncRemote("confirmReturn:reservation", supabase.from("reservations").update({ completed: true }).eq("id", active.id));
    }
    syncRemote("confirmReturn:unit", supabase.from("units").update({ base_status: "nettoyage" }).eq("ref", unitRef));
  },
  markUnitReady: (unitRef) => {
    const { units, models } = get();
    const unit = units.find((u) => u.ref === unitRef);
    const model = unit ? findModel(unit.modelId, models) : undefined;
    get().setUnitStatus(unitRef, "disponible");
    get().showToast(`${model?.name ?? unitRef} · Disponible`);
  },

  addDressModel: (fields) => {
    const { models, units } = get();
    const id = nextModelId(models);
    const model: DressModel = {
      id,
      name: fields.name || "Nouvelle robe",
      ref: id,
      category: fields.category,
      price: fields.price,
      deposit: fields.deposit,
      color: fields.color,
      sizes: Object.keys(fields.sizeQuantities).filter((s) => fields.sizeQuantities[s] > 0),
      photoSlot: `chi-admin-${id}`,
      photoUrl: fields.photoUrl,
    };
    const newUnits: DressUnit[] = [];
    for (const size of model.sizes) {
      const count = fields.sizeQuantities[size] ?? 0;
      for (const ref of nextUnitRefs(id, size, count, units)) {
        newUnits.push({ ref, modelId: id, size, baseStatus: "disponible" });
      }
    }
    set((st) => ({ models: [...st.models, model], units: [...st.units, ...newUnits] }));

    // The units insert carries a model_id foreign key, so it must not fire
    // until the model row has actually landed remotely — firing both writes
    // at once (as before) raced the two requests, and when the units insert
    // reached Supabase first it was rejected for referencing a model that
    // didn't exist yet, silently leaving a model with zero physical units
    // (shows in the catalog as "0 disponibles" and can't be opened, since
    // there's no unit to route to). Sequencing them here closes that gap.
    if (supabaseConfigured) {
      (async () => {
        const { error: modelError } = await supabase.from("models").insert({
          id: model.id,
          name: model.name,
          category: model.category,
          price: model.price,
          deposit: model.deposit,
          color: model.color,
          sizes: model.sizes,
          photo_slot: model.photoSlot,
          photo_url: model.photoUrl ?? null,
        });
        if (modelError) {
          console.error("[supabase] addDressModel:model failed:", modelError.message);
          return;
        }
        if (newUnits.length > 0) {
          syncRemote(
            "addDressModel:units",
            supabase.from("units").insert(
              newUnits.map((u) => ({ ref: u.ref, model_id: u.modelId, size: u.size, base_status: u.baseStatus }))
            )
          );
        }
      })();
    }
    return id;
  },

  updateDressModel: (modelId, patch) => {
    set((st) => ({
      models: st.models.map((m) => (m.id === modelId ? { ...m, ...patch } : m)),
    }));
    const row: Record<string, unknown> = {};
    if (patch.name !== undefined) row.name = patch.name;
    if (patch.category !== undefined) row.category = patch.category;
    if (patch.color !== undefined) row.color = patch.color;
    if (patch.price !== undefined) row.price = patch.price;
    if (patch.deposit !== undefined) row.deposit = patch.deposit;
    if (patch.photoUrl !== undefined) row.photo_url = patch.photoUrl;
    if (Object.keys(row).length > 0) {
      syncRemote("updateDressModel", supabase.from("models").update(row).eq("id", modelId));
    }
  },

  setModelDisabled: (modelId, disabled) => {
    set((st) => ({
      models: st.models.map((m) => (m.id === modelId ? { ...m, disabled } : m)),
    }));
    syncRemote("setModelDisabled", supabase.from("models").update({ disabled }).eq("id", modelId));
  },

  addUnitsForSize: (modelId, size, count) => {
    const { units, models } = get();
    const model = findModel(modelId, models);
    if (!model) return;
    const refs = nextUnitRefs(modelId, size, count, units);
    const newUnits: DressUnit[] = refs.map((ref) => ({
      ref,
      modelId,
      size,
      baseStatus: "disponible",
    }));
    const sizesChanged = !model.sizes.includes(size);
    set((st) => ({
      units: [...st.units, ...newUnits],
      models: st.models.map((m) =>
        m.id === modelId && !m.sizes.includes(size) ? { ...m, sizes: [...m.sizes, size] } : m
      ),
    }));
    syncRemote(
      "addUnitsForSize:units",
      supabase.from("units").insert(newUnits.map((u) => ({ ref: u.ref, model_id: u.modelId, size: u.size, base_status: u.baseStatus })))
    );
    if (sizesChanged) {
      syncRemote("addUnitsForSize:model", supabase.from("models").update({ sizes: [...model.sizes, size] }).eq("id", modelId));
    }
  },

  removeUnit: (unitRef) => {
    const { units, reservations } = get();
    const unit = units.find((u) => u.ref === unitRef);
    if (!unit) return { ok: false, reason: "Unité introuvable" };
    if (unit.baseStatus === "louee") {
      return { ok: false, reason: "Impossible de retirer une unité actuellement louée" };
    }
    const hasUpcoming = reservations.some(
      (r) => r.unitRef === unitRef && !r.completed && !r.cancelled && r.returnDay >= TODAY_DAY
    );
    if (hasUpcoming) {
      return { ok: false, reason: "Cette unité a une réservation à venir" };
    }
    set((st) => ({ units: st.units.filter((u) => u.ref !== unitRef) }));
    syncRemote("removeUnit", supabase.from("units").delete().eq("ref", unitRef));
    return { ok: true };
  },

  addEmployee: (fields) => {
    const id = `emp-${Date.now()}`;
    const employee: Employee = {
      id,
      firstName: fields.firstName || "Employée",
      lastName: fields.lastName || "",
      role: fields.role,
      status: fields.status,
      recentActivity: "Compte créé — aucune activité pour le moment",
    };
    set((st) => ({ employees: [...st.employees, employee] }));
    syncRemote(
      "addEmployee",
      supabase.from("employees").insert({
        id: employee.id,
        first_name: employee.firstName,
        last_name: employee.lastName,
        role: employee.role,
        status: employee.status,
        recent_activity: employee.recentActivity,
      })
    );
    return id;
  },

  updateEmployee: (id, patch) => {
    set((st) => ({
      employees: st.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
    const row: Record<string, unknown> = {};
    if (patch.firstName !== undefined) row.first_name = patch.firstName;
    if (patch.lastName !== undefined) row.last_name = patch.lastName;
    if (patch.role !== undefined) row.role = patch.role;
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.recentActivity !== undefined) row.recent_activity = patch.recentActivity;
    if (patch.phone !== undefined) row.phone = patch.phone;
    if (patch.email !== undefined) row.email = patch.email;
    if (patch.photoUrl !== undefined) row.photo_url = patch.photoUrl;
    if (Object.keys(row).length > 0) {
      syncRemote("updateEmployee", supabase.from("employees").update(row).eq("id", id));
    }
  },

  readNotificationIds: [],
  markNotificationRead: (id) =>
    set((st) =>
      st.readNotificationIds.includes(id)
        ? st
        : { readNotificationIds: [...st.readNotificationIds, id] }
    ),
  markAllNotificationsRead: (ids) =>
    set((st) => ({ readNotificationIds: Array.from(new Set([...st.readNotificationIds, ...ids])) })),
}));

export function unitDayStatusFromStore(unitRef: string, day: number) {
  const state = useAppStore.getState();
  const unit = state.units.find((u) => u.ref === unitRef);
  if (!unit) return "indispo" as const;
  return getUnitDayStatus(unit, day, state.reservations);
}

export const DEMO_TODAY = TODAY_DAY;
