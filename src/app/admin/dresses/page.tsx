"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Chip } from "@/components/ui/Chip";
import { Dot } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { getCatalogCounts, getModelStatusSummary } from "@/lib/selectors";
import { CAL } from "@/lib/status";

const FILTERS = ["Toutes", "Actives", "Désactivées"] as const;

export default function AdminDressesPage() {
  const router = useRouter();
  const models = useAppStore((s) => s.models);
  const units = useAppStore((s) => s.units);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Toutes");

  const counts = getCatalogCounts(models, units);
  const q = query.trim().toLowerCase();

  const filtered = models.filter((m) => {
    if (q && !`${m.name} ${m.ref} ${m.category}`.toLowerCase().includes(q)) return false;
    if (filter === "Actives") return !m.disabled;
    if (filter === "Désactivées") return !!m.disabled;
    return true;
  });

  return (
    <div className="px-[22px] pb-10 pt-2.5 lg:px-0 lg:pt-0">
      <AdminPageHeader
        title="Gestion des robes"
        subtitle={`${counts.models} modèles · ${counts.units} unités`}
        action={
          <Button
            variant="dark"
            fullWidth={false}
            className="!w-auto gap-2 !py-3 !text-[12.5px]"
            onClick={() => router.push("/admin/dresses/new")}
          >
            <span className="inline-flex items-center gap-2">
              <PlusIcon size={15} /> Ajouter une robe
            </span>
          </Button>
        }
      />

      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-[11px] rounded-2xl border border-border-input bg-card px-[15px] py-3.5">
          <SearchIcon size={16} strokeWidth={1.6} className="text-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une robe, une référence, une catégorie"
            className="flex-1 border-none bg-transparent text-[14px] text-ink outline-none"
          />
        </div>
        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <Chip key={f} label={f} active={filter === f} onClick={() => setFilter(f)} />
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 text-center text-[13.5px] text-secondary-2">
          Aucune robe ne correspond à votre recherche.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((m) => {
            const modelUnits = units.filter((u) => u.modelId === m.id);
            const summary = getModelStatusSummary(m.id, units);
            const { dot, fg } = CAL[summary.status];
            return (
              <div
                key={m.id}
                onClick={() => router.push(`/admin/dresses/${m.id}`)}
                className="cursor-pointer"
              >
                <div className="relative h-[180px] w-full overflow-hidden rounded-2xl bg-[#efe6d5]">
                  <ImageSlot src={m.photoUrl} placeholder="Photo robe" shape="rounded" radius={16} />
                  {m.disabled ? (
                    <div className="absolute inset-x-2 top-2 rounded-lg bg-[rgba(35,27,20,.72)] px-2.5 py-1 text-center font-caps text-[8.5px] tracking-[1.6px] text-gold-ink">
                      DÉSACTIVÉE
                    </div>
                  ) : null}
                </div>
                <div className="mt-2.5 font-serif text-[17px] leading-[1.15] text-ink">{m.name}</div>
                <div className="mt-1 font-caps text-[8.5px] tracking-[1.6px] text-tertiary">
                  REF {m.ref} · {m.category}
                </div>
                <div className="mt-[5px] text-[11.5px] text-secondary-2">
                  {modelUnits.length} unité{modelUnits.length !== 1 ? "s" : ""} · {m.price} DT
                </div>
                <div className="mt-[5px] flex items-center gap-1.5">
                  <Dot color={dot} size={4} />
                  <div className="text-[11.5px]" style={{ color: fg }}>
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
