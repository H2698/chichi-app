"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/shell/BackHeader";
import { Toggle } from "@/components/ui/Toggle";
import { ChevronRightIcon } from "@/components/icons";
import { supabase, supabaseConfigured } from "@/lib/supabase";

export default function ParametresPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState(true);
  const [scannerSound, setScannerSound] = useState(true);
  const [confirmBeforeReturn, setConfirmBeforeReturn] = useState(true);

  const toggles = [
    {
      label: "Notifications",
      hint: "Retours en retard, robes à nettoyer, réservations",
      value: notifications,
      set: setNotifications,
    },
    {
      label: "Sons / vibration du scanner",
      hint: "Retour sonore lors d'un scan réussi",
      value: scannerSound,
      set: setScannerSound,
    },
    {
      label: "Confirmation avant retour",
      hint: "Demander une confirmation avant d'enregistrer un retour",
      value: confirmBeforeReturn,
      set: setConfirmBeforeReturn,
    },
  ];

  return (
    <div className="chi-rise px-[22px] pb-[26px] pt-2.5">
      <BackHeader title="Paramètres" size="md" />

      <div className="mt-6 flex flex-col gap-2.5">
        {toggles.map((t) => (
          <div
            key={t.label}
            className="flex items-center gap-3.5 rounded-[18px] border border-border bg-card px-4 py-3.5"
          >
            <div className="flex-1">
              <div className="text-[14.5px] text-ink">{t.label}</div>
              <div className="mt-0.5 text-[11.5px] font-light text-secondary-2">{t.hint}</div>
            </div>
            <Toggle checked={t.value} onChange={t.set} />
          </div>
        ))}

        <div className="flex items-center gap-3.5 rounded-[18px] border border-border bg-card px-4 py-3.5">
          <div className="flex-1">
            <div className="text-[14.5px] text-ink">Langue</div>
            <div className="mt-0.5 text-[11.5px] font-light text-secondary-2">
              Seul le français est disponible pour l&apos;instant
            </div>
          </div>
          <div className="rounded-full border border-border-input bg-pill px-3 py-1 font-caps text-[10px] tracking-[1.2px] text-secondary">
            FR
          </div>
        </div>
      </div>

      <div
        onClick={async () => {
          if (supabaseConfigured) await supabase.auth.signOut();
          router.push("/login");
        }}
        className="mt-6 flex cursor-pointer items-center gap-[14px] rounded-[32px] bg-pill px-5 py-[13px] hover:bg-pill-hover"
      >
        <div className="flex-1 text-[14.5px] text-[#b1553f]">Se déconnecter</div>
        <div className="text-[#c9a869]">
          <ChevronRightIcon size={16} />
        </div>
      </div>

      <div className="mt-4 text-center text-[11.5px] text-tertiary">
        Ces réglages sont visuels pour l&apos;instant — ils ne sont pas encore sauvegardés côté serveur.
      </div>
    </div>
  );
}
