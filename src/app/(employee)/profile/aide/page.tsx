"use client";

import { useState } from "react";
import { BackHeader } from "@/components/shell/BackHeader";
import { ChevronDownIcon } from "@/components/icons";

const FAQ = [
  {
    q: "Comment scanner une robe ?",
    a: "Depuis l'accueil ou le bouton central de la barre de navigation, ouvrez le scanner et visez le QR code de l'étiquette. Si la caméra n'est pas disponible, utilisez « Saisir le code manuellement » et entrez la référence de l'unité (ex. CHI-0048-M-01).",
  },
  {
    q: "Comment créer une réservation ?",
    a: "Ouvrez la fiche d'une robe disponible, appuyez sur « Nouvelle réservation », choisissez les dates dans le calendrier, puis suivez les étapes Cliente → Paiement → Résumé jusqu'à la confirmation.",
  },
  {
    q: "Comment enregistrer un retour ?",
    a: "Sur la fiche d'une robe louée, appuyez sur « Enregistrer le retour », indiquez l'état de la robe (bon état, à nettoyer, tachée, endommagée) puis confirmez. La robe passe automatiquement au statut « À nettoyer ».",
  },
  {
    q: "Comment marquer une robe comme prête ?",
    a: "Une fois nettoyée, ouvrez la fiche de la robe (ou passez par « Robes à préparer » dans votre profil) et appuyez sur « Marquer comme prête ». Elle redevient disponible immédiatement.",
  },
  {
    q: "Que faire si le QR code ne fonctionne pas ?",
    a: "Utilisez la saisie manuelle sur l'écran du scanner : tapez la référence imprimée sous le QR code de l'étiquette. Si l'étiquette est illisible, retrouvez la robe depuis l'onglet Robes en recherchant son nom ou sa référence.",
  },
];

export default function AidePage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="chi-rise px-[22px] pb-[26px] pt-2.5">
      <BackHeader title="Aide" size="md" />

      <div className="mt-6 flex flex-col gap-2.5">
        {FAQ.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q} className="overflow-hidden rounded-[18px] border border-border bg-card">
              <div
                onClick={() => setOpenIndex(open ? null : i)}
                className="flex cursor-pointer items-center gap-3 px-4 py-3.5"
              >
                <div className="flex-1 text-[14.5px] text-ink">{item.q}</div>
                <div
                  className="flex-shrink-0 text-gold transition-transform"
                  style={{ transform: open ? "rotate(180deg)" : "none" }}
                >
                  <ChevronDownIcon size={16} />
                </div>
              </div>
              {open ? (
                <div className="border-t border-border-soft px-4 py-3.5 text-[13px] font-light leading-relaxed text-secondary-2">
                  {item.a}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-[18px] border border-border-soft bg-[#fdfaf3] px-4 py-3.5 text-center text-[12.5px] text-secondary-2">
        Besoin d&apos;aide supplémentaire ? Contactez votre responsable de boutique.
      </div>
    </div>
  );
}
