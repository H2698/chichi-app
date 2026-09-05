import type { UnitStatus } from "./types";

/** Badge shown on the Fiche robe screen — dot, label, soft translucent background. */
export const BADGE: Record<"disponible" | "louee" | "nettoyage" | "indispo", {
  key: string;
  label: string;
  labelSoft: string;
  fg: string;
  dot: string;
  softBg: string;
}> = {
  disponible: {
    key: "disponible",
    label: "DISPONIBLE",
    labelSoft: "Disponible",
    fg: "#5f7355",
    dot: "#7f9476",
    softBg: "rgba(241,244,238,.92)",
  },
  louee: {
    key: "louee",
    label: "LOUÉE",
    labelSoft: "Louée",
    fg: "#7c5a6b",
    dot: "#7c5a6b",
    softBg: "rgba(250,241,242,.94)",
  },
  nettoyage: {
    key: "nettoyage",
    label: "À NETTOYER",
    labelSoft: "À nettoyer",
    fg: "#5f7285",
    dot: "#7b8ba3",
    softBg: "rgba(242,246,248,.94)",
  },
  indispo: {
    key: "indispo",
    label: "HORS SERVICE",
    labelSoft: "Hors service",
    fg: "#8a8171",
    dot: "#a49c8e",
    softBg: "rgba(241,238,232,.94)",
  },
};

/** Calendar-day + gallery status palette — matches the README status table exactly. */
export type CalStatusKey =
  | "disponible"
  | "reservee"
  | "louee"
  | "retour"
  | "nettoyage"
  | "indispo";

export const CAL: Record<
  CalStatusKey,
  { bg: string; bd: string; fg: string; dot: string; mark: string | null; label: string }
> = {
  disponible: { bg: "#fdfaf3", bd: "#f0e7d6", fg: "#33291f", dot: "#7f9476", mark: null, label: "Disponible" },
  reservee: { bg: "#f7edd9", bd: "#ecdcba", fg: "#8a6a2c", dot: "#b3873d", mark: "R", label: "Réservée" },
  louee: { bg: "#f6ebee", bd: "#e9d9de", fg: "#7c5a6b", dot: "#7c5a6b", mark: "L", label: "Louée" },
  retour: { bg: "#f6ebee", bd: "#d9bfc7", fg: "#7c5a6b", dot: "#7c5a6b", mark: "↩", label: "Retour prévu" },
  nettoyage: { bg: "#eef3f6", bd: "#dde6ec", fg: "#5f7285", dot: "#7b8ba3", mark: "N", label: "Nettoyage" },
  indispo: { bg: "#f1eee8", bd: "#e6e0d5", fg: "#a49c8e", dot: "#a49c8e", mark: "—", label: "Indisponible" },
};

export const LATE = { fg: "#8f4331", dot: "#b1553f", bg: "#f6e3dd" };

export function badgeForUnitStatus(status: UnitStatus) {
  if (status === "louee") return BADGE.louee;
  if (status === "nettoyage") return BADGE.nettoyage;
  // 'indispo' (out of service — damaged, retired, etc.) genuinely isn't
  // available to rent, so it gets its own badge; it used to fall through to
  // "disponible" here, contradicting the "Hors service" panel shown just
  // below it on the same screen.
  if (status === "indispo") return BADGE.indispo;
  // 'reservee' units are still physically in the shop and available for
  // pickup today (they only carry a future booking), so the badge treats
  // them as available.
  return BADGE.disponible;
}
