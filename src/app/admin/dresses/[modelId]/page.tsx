"use client";

import { useRef, useState } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Dot } from "@/components/ui/Card";
import { UnitQrSheet } from "@/components/ui/UnitQrSheet";
import { EyeOffIcon, PlusIcon, PrinterIcon, QrIcon, TrashIcon, UploadIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { AVAILABLE_SIZES, DRESS_CATEGORIES } from "@/lib/mock-data";
import { findModel } from "@/lib/selectors";
import { uploadPhoto } from "@/lib/supabase";
import { badgeForUnitStatus } from "@/lib/status";
import type { DressModel } from "@/lib/types";

const inputClass =
  "w-full rounded-[14px] border border-border-input bg-card px-4 py-3 text-[15px] text-ink outline-none";
const labelClass = "mb-1.5 block font-caps text-[9.5px] tracking-[1.8px] text-gold";

export default function EditDressPage() {
  const params = useParams<{ modelId: string }>();
  const models = useAppStore((s) => s.models);
  const model = findModel(params.modelId, models);

  if (!model) {
    return (
      <div className="px-[22px] pb-10 pt-2.5 text-center text-secondary-2 lg:px-0 lg:pt-0">
        Robe introuvable.
      </div>
    );
  }

  // Keyed on the model id so the form's local state resets cleanly when
  // navigating from one dress's edit page straight to another's.
  return <DressEditForm key={model.id} model={model} />;
}

function DressEditForm({ model }: { model: DressModel }) {
  const units = useAppStore((s) => s.units);
  const updateDressModel = useAppStore((s) => s.updateDressModel);
  const setModelDisabled = useAppStore((s) => s.setModelDisabled);
  const addUnitsForSize = useAppStore((s) => s.addUnitsForSize);
  const removeUnit = useAppStore((s) => s.removeUnit);
  const showToast = useAppStore((s) => s.showToast);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [qrSheet, setQrSheet] = useState<{ ref: string; autoPrint: boolean } | null>(null);

  const modelUnits = units.filter((u) => u.modelId === model.id);

  const [name, setName] = useState(model.name);
  const [category, setCategory] = useState(model.category);
  const [color, setColor] = useState(model.color);
  const [price, setPrice] = useState(model.price);
  const [deposit, setDeposit] = useState(model.deposit);

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const url = await uploadPhoto(file, "models");
      updateDressModel(model.id, { photoUrl: url });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSave = () => {
    updateDressModel(model.id, {
      name: name.trim() || model.name,
      category,
      color: color.trim() || model.color,
      price,
      deposit,
    });
    showToast("Robe mise à jour");
  };

  const sizesInUse = Array.from(new Set([...model.sizes, ...modelUnits.map((u) => u.size)]));

  const handleRemoveUnit = (ref: string) => {
    const result = removeUnit(ref);
    if (!result.ok) showToast(result.reason ?? "Impossible de retirer cette unité");
  };

  return (
    <div className="px-[22px] pb-10 pt-2.5 lg:px-0 lg:pt-0">
      <AdminPageHeader
        title={model.name}
        back
        subtitle={`REF ${model.ref} · ${modelUnits.length} unité${modelUnits.length !== 1 ? "s" : ""}`}
        action={
          <Button
            variant={model.disabled ? "dark" : "outline"}
            fullWidth={false}
            className="!w-auto gap-2 !py-3 !text-[12.5px]"
            onClick={() => {
              setModelDisabled(model.id, !model.disabled);
              showToast(model.disabled ? "Robe réactivée" : "Robe désactivée");
            }}
          >
            <span className="inline-flex items-center gap-2">
              <EyeOffIcon size={15} /> {model.disabled ? "Réactiver" : "Désactiver"}
            </span>
          </Button>
        }
      />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div>
          <div className={labelClass}>PHOTO</div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative h-[280px] w-full cursor-pointer overflow-hidden rounded-2xl bg-[#efe6d5]"
          >
            <ImageSlot
              src={model.photoUrl}
              placeholder={uploadingPhoto ? "Envoi en cours…" : `Photo ${model.name}`}
              shape="rounded"
              radius={16}
            />
            <div className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-gold-ink shadow-[0_10px_20px_-10px_rgba(35,27,20,.7)]">
              <UploadIcon size={16} strokeWidth={1.5} />
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <div className={labelClass}>NOM DE LA ROBE</div>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <div className={labelClass}>CATÉGORIE</div>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                {DRESS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className={labelClass}>COULEUR</div>
              <input value={color} onChange={(e) => setColor(e.target.value)} className={inputClass} />
            </label>
            <div />
            <label className="block">
              <div className={labelClass}>PRIX DE LOCATION (DT)</div>
              <input
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                className={inputClass}
              />
            </label>
            <label className="block">
              <div className={labelClass}>CAUTION (DT)</div>
              <input
                type="number"
                min={0}
                value={deposit}
                onChange={(e) => setDeposit(Number(e.target.value) || 0)}
                className={inputClass}
              />
            </label>
          </div>
          <div>
            <Button variant="dark" fullWidth={false} className="!w-auto px-8" onClick={handleSave}>
              Enregistrer
            </Button>
          </div>

          <div>
            <div className="font-serif text-[20px] text-ink">Unités physiques</div>
            <div className="mt-3 flex flex-col gap-4">
              {sizesInUse.map((size) => {
                const sizeUnits = modelUnits.filter((u) => u.size === size);
                return (
                  <div key={size}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="font-caps text-[10px] tracking-[1.8px] text-tertiary">
                        TAILLE {size} · {sizeUnits.length}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          addUnitsForSize(model.id, size, 1);
                          showToast(`Unité ajoutée · taille ${size}`);
                        }}
                        className="flex items-center gap-1.5 text-[12px] text-gold"
                      >
                        <PlusIcon size={13} /> Ajouter une unité
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {sizeUnits.map((u) => {
                        const badge = badgeForUnitStatus(u.baseStatus);
                        return (
                          <div
                            key={u.ref}
                            className="flex items-center justify-between rounded-[14px] border border-border bg-card px-4 py-3"
                          >
                            <div className="font-caps text-[11px] tracking-[1.6px] text-ink">{u.ref}</div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-[7px]">
                                <Dot color={badge.dot} size={5} />
                                <div className="text-[12.5px]" style={{ color: badge.fg }}>
                                  {badge.labelSoft}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => setQrSheet({ ref: u.ref, autoPrint: false })}
                                className="text-gold"
                                title="Voir QR"
                              >
                                <QrIcon size={15} strokeWidth={1.3} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setQrSheet({ ref: u.ref, autoPrint: true })}
                                className="text-gold"
                                title="Imprimer l'étiquette"
                              >
                                <PrinterIcon size={15} strokeWidth={1.3} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveUnit(u.ref)}
                                className="text-[#b1553f]"
                                title="Retirer l'unité"
                              >
                                <TrashIcon size={15} strokeWidth={1.4} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                      {sizeUnits.length === 0 ? (
                        <div className="rounded-[14px] border border-dashed border-border-input px-4 py-3 text-center text-[12.5px] text-secondary-2">
                          Aucune unité pour cette taille
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
              <div>
                <div className="mb-2 font-caps text-[10px] tracking-[1.8px] text-tertiary">
                  AJOUTER UNE NOUVELLE TAILLE
                </div>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_SIZES.filter((s) => !sizesInUse.includes(s)).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        addUnitsForSize(model.id, size, 1);
                        showToast(`Taille ${size} ajoutée`);
                      }}
                      className="rounded-full border border-border-input px-3.5 py-1.5 text-[12.5px] text-secondary"
                    >
                      + {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UnitQrSheet
        unitRef={qrSheet?.ref ?? null}
        open={!!qrSheet}
        autoPrint={qrSheet?.autoPrint ?? false}
        fromAdmin
        onClose={() => setQrSheet(null)}
      />
    </div>
  );
}
