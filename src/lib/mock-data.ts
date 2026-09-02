import { epochDay, todayEpochDay } from "./dates";
import { monthLabel, weekdayLabelFull } from "./format";
import type { Customer, DressModel, DressUnit, Employee, Reservation } from "./types";

/**
 * The real "today" — the calendar, agenda and stats all read from this, so
 * the app always reflects the actual current date instead of a fixed demo
 * day. (This used to be hardcoded to "22" / "Août 2026", matching a design
 * handoff mockup — that stopped being true the moment real time moved past
 * that date.)
 */
export const TODAY_DAY = todayEpochDay();
export const TODAY_MONTH_LABEL = monthLabel(TODAY_DAY);
export const TODAY_WEEKDAY_LABEL = weekdayLabelFull(TODAY_DAY);

/** No auth yet — the app always runs as this seeded employee. */
export const CURRENT_EMPLOYEE_ID = "emp-chichi";

export const DRESS_MODELS: DressModel[] = [
  {
    id: "CHI-0048",
    name: "Robe Satin Noir",
    ref: "CHI-0048",
    category: "Robe de soirée",
    price: 180,
    deposit: 100,
    color: "Noir",
    sizes: ["S", "M", "L"],
    photoSlot: "chi-g-1",
  },
  {
    id: "CHI-0027",
    name: "Robe Élégance Bordeaux",
    ref: "CHI-0027",
    category: "Robe de soirée",
    price: 220,
    deposit: 120,
    color: "Bordeaux",
    sizes: ["S", "M"],
    photoSlot: "chi-g-2",
  },
  {
    id: "CHI-0063",
    name: "Robe Perle Champagne",
    ref: "CHI-0063",
    category: "Robe de cocktail",
    price: 260,
    deposit: 120,
    color: "Champagne",
    sizes: ["M", "L", "XL"],
    photoSlot: "chi-g-3",
  },
  {
    id: "CHI-0071",
    name: "Robe Velours Émeraude",
    ref: "CHI-0071",
    category: "Robe de soirée",
    price: 200,
    deposit: 100,
    color: "Émeraude",
    sizes: ["S", "M"],
    photoSlot: "chi-g-4",
  },
  {
    id: "CHI-0055",
    name: "Robe Soirée Bleu Nuit",
    ref: "CHI-0055",
    category: "Robe de soirée",
    price: 240,
    deposit: 120,
    color: "Bleu Nuit",
    sizes: ["M", "L"],
    photoSlot: "chi-g-5",
  },
  {
    id: "CHI-0082",
    name: "Robe Tulle Ivoire",
    ref: "CHI-0082",
    category: "Robe de mariée",
    price: 190,
    deposit: 100,
    color: "Ivoire",
    sizes: ["XS", "S", "M"],
    photoSlot: "chi-g-6",
  },
];

export const DRESS_CATEGORIES = [
  "Robe de soirée",
  "Robe de cocktail",
  "Robe de mariée",
  "Robe demoiselle d'honneur",
];

export const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL"];

export const DRESS_UNITS: DressUnit[] = [
  { ref: "CHI-0048-S-01", modelId: "CHI-0048", size: "S", baseStatus: "disponible" },
  { ref: "CHI-0048-M-01", modelId: "CHI-0048", size: "M", baseStatus: "disponible" },
  { ref: "CHI-0048-M-02", modelId: "CHI-0048", size: "M", baseStatus: "disponible" },
  { ref: "CHI-0048-L-01", modelId: "CHI-0048", size: "L", baseStatus: "disponible" },

  { ref: "CHI-0027-S-01", modelId: "CHI-0027", size: "S", baseStatus: "louee" },
  { ref: "CHI-0027-M-01", modelId: "CHI-0027", size: "M", baseStatus: "disponible" },

  { ref: "CHI-0063-M-01", modelId: "CHI-0063", size: "M", baseStatus: "disponible" },
  { ref: "CHI-0063-L-01", modelId: "CHI-0063", size: "L", baseStatus: "louee" },
  { ref: "CHI-0063-XL-01", modelId: "CHI-0063", size: "XL", baseStatus: "disponible" },

  { ref: "CHI-0071-S-01", modelId: "CHI-0071", size: "S", baseStatus: "disponible" },
  { ref: "CHI-0071-M-01", modelId: "CHI-0071", size: "M", baseStatus: "disponible" },

  { ref: "CHI-0055-M-01", modelId: "CHI-0055", size: "M", baseStatus: "nettoyage" },
  { ref: "CHI-0055-L-01", modelId: "CHI-0055", size: "L", baseStatus: "indispo" },

  { ref: "CHI-0082-XS-01", modelId: "CHI-0082", size: "XS", baseStatus: "disponible" },
  { ref: "CHI-0082-S-01", modelId: "CHI-0082", size: "S", baseStatus: "disponible" },
  { ref: "CHI-0082-M-01", modelId: "CHI-0082", size: "M", baseStatus: "disponible" },
];

export const CUSTOMERS: Customer[] = [
  {
    id: "cust-sarra",
    firstName: "Sarra",
    lastName: "Ben Ali",
    phone: "+216 24 118 902",
    rentalsCount: 5,
    lastRentalLabel: "dernière le 12 juillet",
  },
  {
    id: "cust-mariem",
    firstName: "Mariem",
    lastName: "Trabelsi",
    phone: "+216 22 304 771",
    rentalsCount: 3,
    lastRentalLabel: "dernière le 30 juin",
  },
  {
    id: "cust-yasmine",
    firstName: "Yasmine",
    lastName: "Gharbi",
    phone: "+216 20 556 843",
    rentalsCount: 7,
    lastRentalLabel: "dernière le 2 août",
  },
  {
    id: "cust-nour",
    firstName: "Nour",
    lastName: "Ayari",
    phone: "+216 25 741 690",
    rentalsCount: 2,
    lastRentalLabel: "dernière le 5 août",
  },
  {
    id: "cust-lea",
    firstName: "Léa",
    lastName: "Chedly",
    phone: "+216 23 998 214",
    rentalsCount: 1,
    lastRentalLabel: "dernière le 14 juin",
  },
];

// These used to be plain "day-of-month in August 2026" (20, 22, 19...) back
// when the whole app ran on that single fixed demo month. Converted 1:1 to
// real epoch days for the same August 2026 dates — the meaning is
// unchanged, only now they're absolute dates instead of an implicit month.
export const SEED_RESERVATIONS: Reservation[] = [
  {
    id: "CHI-R-00281",
    unitRef: "CHI-0027-S-01",
    customerId: "cust-mariem",
    pickupDay: epochDay(2026, 8, 20),
    pickupTime: "09:00",
    returnDay: epochDay(2026, 8, 22),
    returnTime: "12:00",
    price: 220,
    paid: 100,
    deposit: 100,
    method: "Espèces",
  },
  {
    id: "CHI-R-00279",
    unitRef: "CHI-0063-L-01",
    customerId: "cust-yasmine",
    pickupDay: epochDay(2026, 8, 19),
    pickupTime: "10:00",
    returnDay: epochDay(2026, 8, 20),
    returnTime: "18:00",
    price: 260,
    paid: 150,
    deposit: 120,
    method: "Carte",
  },
  {
    id: "CHI-R-00283",
    unitRef: "CHI-0071-S-01",
    customerId: "cust-nour",
    pickupDay: epochDay(2026, 8, 22),
    pickupTime: "09:30",
    returnDay: epochDay(2026, 8, 24),
    returnTime: "19:00",
    price: 200,
    paid: 90,
    deposit: 100,
    method: "Espèces",
  },
  {
    id: "CHI-R-00285",
    unitRef: "CHI-0082-M-01",
    customerId: "cust-lea",
    pickupDay: epochDay(2026, 8, 25),
    pickupTime: "11:00",
    returnDay: epochDay(2026, 8, 27),
    returnTime: "18:00",
    price: 190,
    paid: 0,
    deposit: 0,
    method: "Espèces",
  },
];

export function getModel(modelId: string): DressModel | undefined {
  return DRESS_MODELS.find((m) => m.id === modelId);
}

export function getUnit(ref: string): DressUnit | undefined {
  return DRESS_UNITS.find((u) => u.ref === ref);
}

export function getUnitsForModel(modelId: string): DressUnit[] {
  return DRESS_UNITS.filter((u) => u.modelId === modelId);
}

export function getCustomer(id: string): Customer | undefined {
  return CUSTOMERS.find((c) => c.id === id);
}

export const EMPLOYEES: Employee[] = [
  {
    id: "emp-chichi",
    firstName: "Chichi",
    lastName: "Founder",
    role: "Admin",
    status: "Actif",
    recentActivity: "Connectée aujourd'hui · 09:12",
    phone: "+216 20 445 118",
    email: "chichi@bychichi.tn",
  },
  {
    id: "emp-amira",
    firstName: "Amira",
    lastName: "Sassi",
    role: "Employée",
    status: "Actif",
    recentActivity: "Retrait enregistré · aujourd'hui 09:30",
  },
  {
    id: "emp-nesrine",
    firstName: "Nesrine",
    lastName: "Khemiri",
    role: "Employée",
    status: "Actif",
    recentActivity: "Réservation créée · hier 16:40",
  },
  {
    id: "emp-hela",
    firstName: "Hela",
    lastName: "Bouazizi",
    role: "Employée",
    status: "Inactif",
    recentActivity: "Dernière connexion · 3 août",
  },
];
