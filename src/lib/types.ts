export type UnitStatus =
  | "disponible"
  | "reservee"
  | "louee"
  | "nettoyage"
  | "indispo";

export type ReservationStatus =
  | "CONFIRMEE"
  | "RETOUR_PREVU"
  | "EN_RETARD"
  | "TERMINEE"
  | "ANNULEE";

export type PaymentMethod = "Espèces" | "Carte" | "Virement" | "Autre";

export interface DressModel {
  id: string; // e.g. 'CHI-0048'
  name: string;
  ref: string; // display ref, same as id
  category: string;
  price: number; // DT — rental price
  deposit: number; // DT — caution
  color: string;
  sizes: string[];
  photoSlot: string; // image-slot id, kept for parity with the design handoff
  photoUrl?: string; // admin-uploaded photo (object URL, session-only — no storage backend yet)
  disabled?: boolean;
}

export interface DressUnit {
  ref: string; // e.g. 'CHI-0048-M-01'
  modelId: string;
  size: string;
  baseStatus: UnitStatus;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  rentalsCount: number;
  lastRentalLabel: string;
}

export interface Reservation {
  id: string; // 'CHI-R-00284'
  unitRef: string;
  customerId: string;
  pickupDay: number; // epoch day (days since 1970-01-01 UTC) — an absolute real date, see src/lib/dates.ts
  pickupTime: string;
  returnDay: number;
  returnTime: string;
  price: number;
  paid: number;
  deposit: number;
  method: PaymentMethod;
  completed?: boolean;
  cancelled?: boolean;
}

export interface ReservationDraft {
  unitRef: string | null;
  pickupDay: number | null;
  returnDay: number | null;
  pickupTime: string;
  returnTime: string;
  customerId: string | null;
  method: PaymentMethod;
  paid: number;
  deposit: number;
}

export type SheetType = "reserved" | "newCustomer" | "return" | null;

export type DressCondition = "Bon état" | "À nettoyer" | "Tachée" | "Endommagée";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: "Admin" | "Employée";
  status: "Actif" | "Inactif";
  recentActivity: string;
  phone?: string;
  email?: string;
  photoUrl?: string; // session-only object URL — no storage backend yet
}

export type NotificationKind = "retard" | "nettoyage" | "reservation" | "retrait";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  detail: string;
  when: string;
  unitRef?: string;
}
