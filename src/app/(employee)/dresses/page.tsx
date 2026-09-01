"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Chip } from "@/components/ui/Chip";
import { Dot } from "@/components/ui/Card";
import { SearchIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { getCatalogCounts, getModelStatusSummary } from "@/lib/selectors";
import { CAL } from "@/lib/status";

const FILTERS = ["Toutes", "Disponibles", "Louées", "Réservées", "Nettoyage"] as const;

export default function DressesGalleryPage() {
  const router = useRouter();
  const allModels = useAppStore((s) => s.models);
  const units = useAppStore((s) => s.units);
  const reservations = useAppStore((s) => s.reservations);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Toutes");

  const counts = getCatalogCounts(allModels, units);
  const q = query.trim().toLowerCase();

  const models = allModels.filter((m) => {
    if (m.disabled) return false;
    if (q && !`${m.name} ${m.ref}`.toLowerCase().includes(q)) return false;
    const modelUnits = units.filter((u) => u.modelId === m.id);
    if (filter === "Disponibles") return modelUnits.some((u) => u.baseStatus === "disponible");
    if (filter === "Louées") return modelUnits.some((u) => u.baseStatus === "louee");
    if (filter === "Nettoyage")
      return modelUnits.some((u) => u.baseStatus === "nettoyage" || u.baseStatus === "indispo");
    if (filter === "Réservées")
      return reservations.some((r) => !r.completed && modelUnits.some((u) => u.ref === r.unitRef));
    return true;
  });

  return (
    <div className="chi-rise px-[22px] pb-[26px] pt-2.5">
      <div className="flex items-end justify-between">
        <div className="font-serif text-[33px] text-ink">Robes</div>
        <div className="text-[12px] tracking-[0.4px] text-tertiary">
          {counts.models} modèles · {counts.units} unités
        </div>
      </div>

      <div className="mt-4 flex items-center gap-[11px] rounded-2xl border border-border-input bg-card px-[15px] py-3.5">
        <SearchIcon size={16} strokeWidth={1.6} className="text-tertiary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une robe ou une référence"
          className="flex-1 border-none bg-transparent text-[14px] text-ink outline-none"
        />
      </div>

      <div className="mt-3.5 flex gap-2 overflow-x-auto pb-0.5">
        {FILTERS.map((f) => (
          <Chip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} scrollable />
        ))}
      </div>

      {models.length === 0 ? (
        <div className="mt-8 text-center text-[13.5px] text-secondary-2">
          Aucune robe ne correspond à votre recherche.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3.5">
          {models.map((m) => {
            const summary = getModelStatusSummary(m.id, units);
            const { dot: dotColor, fg: fgColor } = CAL[summary.status];
            const primaryUnit = units.find((u) => u.modelId === m.id);
            return (
              <div
                key={m.id}
                onClick={() => primaryUnit && router.push(`/dress/${primaryUnit.ref}`)}
                className="cursor-pointer"
              >
                <div className="h-[196px] w-full overflow-hidden rounded-2xl bg-[#efe6d5]">
                  <ImageSlot src={m.photoUrl} placeholder="Photo robe" shape="rounded" radius={16} />
                </div>
                <div className="mt-2.5 font-serif text-[18.5px] leading-[1.15] text-ink">
                  {m.name}
                </div>
                <div className="mt-1 font-caps text-[8.5px] tracking-[1.6px] text-tertiary">
                  REF {m.ref}
                </div>
                <div className="mt-[5px] text-[11.5px] text-secondary-2">
                  {m.sizes.join(" · ")}
                </div>
                <div className="mt-[5px] flex items-center gap-1.5">
                  <Dot color={dotColor} size={4} />
                  <div className="text-[11.5px]" style={{ color: fgColor }}>
                    {summary.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
