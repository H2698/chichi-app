"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { UploadIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { AVAILABLE_SIZES, DRESS_CATEGORIES } from "@/lib/mock-data";
import { nextModelId, nextUnitRefs } from "@/lib/selectors";
import { uploadPhoto } from "@/lib/supabase";

const inputClass =
  "w-full rounded-[14px] border border-border-input bg-card px-4 py-3 text-[15px] text-ink outline-none";
const labelClass = "mb-1.5 block font-caps text-[9.5px] tracking-[1.8px] text-gold";

export default function NewDressPage() {
  const router = useRouter();
  const models = useAppStore((s) => s.models);
  const units = useAppStore((s) => s.units);
  const addDressModel = useAppStore((s) => s.addDressModel);
  const showToast = useAppStore((s) => s.showToast);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState(DRESS_CATEGORIES[0]);
  const [color, setColor] = useState("");
  const [price, setPrice] = useState(180);
  const [deposit, setDeposit] = useState(100);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const nextId = useMemo(() => nextModelId(models), [models]);
  const previewRefs = useMemo(() => {
    const refs: string[] = [];
    for (const size of AVAILABLE_SIZES) {
      const count = quantities[size] ?? 0;
      if (count > 0) refs.push(...nextUnitRefs(nextId, size, count, units));
    }
    return refs;
  }, [quantities, nextId, units]);

  const toggleSize = (size: string) => {
    setQuantities((q) => {
      const next = { ...q };
      if (next[size]) delete next[size];
      else next[size] = 1;
      return next;
    });
  };

  const setQty = (size: string, qty: number) => {
    setQuantities((q) => ({ ...q, [size]: Math.max(1, qty) }));
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadingPhoto(true);
    try {
      setPhotoUrl(await uploadPhoto(file, "models"));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const canSubmit = name.trim().length > 0 && color.trim().length > 0 && previewRefs.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      showToast("Renseignez le nom, la couleur et au moins une taille");
      return;
    }
    const id = addDressModel({
      name: name.trim(),
      category,
      color: color.trim(),
      price,
      deposit,
      photoUrl,
      sizeQuantities: quantities,
    });
    router.push(`/admin/dresses/${id}/labels`);
  };

  return (
    <div className="px-[22px] pb-10 pt-2.5 lg:px-0 lg:pt-0">
      <AdminPageHeader title="Ajouter une robe" back subtitle={`Référence auto : ${nextId}`} />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div>
          <div className={labelClass}>PHOTO</div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative h-[280px] w-full cursor-pointer overflow-hidden rounded-2xl bg-[#efe6d5]"
          >
            <ImageSlot
              src={photoUrl}
              placeholder={uploadingPhoto ? "Envoi en cours…" : "Ajouter une photo"}
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

        <div className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <div className={labelClass}>NOM DE LA ROBE</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Robe Satin Rubis"
                className={inputClass}
              />
            </label>
            <label className="block">
              <div className={labelClass}>CATÉGORIE</div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {DRESS_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <div className={labelClass}>COULEUR</div>
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ex. Rubis"
                className={inputClass}
              />
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
            <div className={labelClass}>TAILLES ET QUANTITÉS</div>
            <div className="flex flex-col gap-2">
              {AVAILABLE_SIZES.map((size) => {
                const active = size in quantities;
                return (
                  <div
                    key={size}
                    className="flex items-center gap-3.5 rounded-2xl border px-4 py-3"
                    style={{ borderColor: active ? "#a5813f" : "#eee3d0", background: active ? "#fdf7ea" : "#fdfaf3" }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleSize(size)}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-caps text-[12px]"
                      style={{
                        border: `1px solid ${active ? "#a5813f" : "#e6dbc6"}`,
                        background: active ? "#33291f" : "transparent",
                        color: active ? "#f6ecd9" : "#7c6a58",
                      }}
                    >
                      {size}
                    </button>
                    <div className="flex-1 text-[13.5px] text-secondary-2">
                      {active ? "Sélectionnée" : "Non incluse"}
                    </div>
                    {active ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setQty(size, (quantities[size] ?? 1) - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-border-input text-ink"
                        >
                          −
                        </button>
                        <div className="w-6 text-center text-[14px] text-ink">{quantities[size]}</div>
                        <button
                          type="button"
                          onClick={() => setQty(size, (quantities[size] ?? 1) + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full border border-border-input text-ink"
                        >
                          +
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {previewRefs.length > 0 ? (
            <div className="rounded-2xl border border-border-soft bg-[#fdfaf3] px-4 py-3.5">
              <div className={labelClass}>UNITÉS GÉNÉRÉES AUTOMATIQUEMENT</div>
              <div className="flex flex-wrap gap-2">
                {previewRefs.map((ref) => (
                  <div
                    key={ref}
                    className="rounded-lg border border-border-soft bg-card px-2.5 py-1 font-caps text-[10px] tracking-[1px] text-ink"
                  >
                    {ref}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-2">
            <Button variant="dark" disabled={!canSubmit} onClick={handleSubmit}>
              Ajouter la robe
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
