"use client";

import { useRef, useState } from "react";
import { BackHeader } from "@/components/shell/BackHeader";
import { Button } from "@/components/ui/Button";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { UploadIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { CURRENT_EMPLOYEE_ID } from "@/lib/mock-data";
import { getCurrentEmployee } from "@/lib/selectors";
import { uploadPhoto } from "@/lib/supabase";
import type { Employee } from "@/lib/types";

const inputClass =
  "w-full rounded-[14px] border border-border-input bg-card px-4 py-3.5 text-[15px] text-ink outline-none";
const labelClass = "mb-1.5 block font-caps text-[9.5px] tracking-[2.2px] text-gold";

export default function MesInformationsPage() {
  const employees = useAppStore((s) => s.employees);
  const authUserId = useAppStore((s) => s.authUserId);
  const authUserEmail = useAppStore((s) => s.authUserEmail);

  // This used to always look up the hardcoded CURRENT_EMPLOYEE_ID
  // ("emp-chichi") — so any employee opening "Mes informations" was
  // actually viewing and, on save, overwriting Chichi's own directory row,
  // not their own. Resolve the real signed-in person instead, same as the
  // home and profile screens; keep the old constant only as the local-demo
  // fallback (no real Supabase session to resolve against).
  const me =
    getCurrentEmployee(employees, authUserId, authUserEmail) ??
    employees.find((e) => e.id === CURRENT_EMPLOYEE_ID);

  if (!me) return null;

  // Keyed on the employee id so the form's local state resets if the
  // resolved "me" changes (e.g. the auth session resolves after the seed
  // fallback already rendered once) — otherwise the input fields would
  // stay stuck on whichever employee's data they first initialized from.
  return <MesInformationsForm key={me.id} me={me} />;
}

function MesInformationsForm({ me }: { me: Employee }) {
  const updateEmployee = useAppStore((s) => s.updateEmployee);
  const showToast = useAppStore((s) => s.showToast);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [firstName, setFirstName] = useState(me.firstName);
  const [lastName, setLastName] = useState(me.lastName);
  const [phone, setPhone] = useState(me.phone ?? "");
  const [email, setEmail] = useState(me.email ?? "");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const url = await uploadPhoto(file, "employees");
    updateEmployee(me.id, { photoUrl: url });
  };

  const handleSave = () => {
    updateEmployee(me.id, {
      firstName: firstName.trim() || me.firstName,
      lastName: lastName.trim() || me.lastName,
      phone: phone.trim(),
      email: email.trim(),
    });
    showToast("Informations mises à jour");
  };

  return (
    <div className="chi-rise px-[22px] pb-[26px] pt-2.5">
      <BackHeader title="Mes informations" size="md" />

      <div className="mt-6 flex flex-col items-center">
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative h-[88px] w-[88px] cursor-pointer overflow-hidden rounded-full border border-border-input"
        >
          <ImageSlot src={me.photoUrl} placeholder={`${me.firstName} ${me.lastName}`} shape="circle" />
          <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-gold-ink">
            <UploadIcon size={13} strokeWidth={1.6} />
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <div className="mt-3 font-caps text-[9.5px] tracking-[1.6px] text-gold">
          {me.role === "Admin" ? "ADMINISTRATRICE" : "ÉQUIPE BOUTIQUE"}
        </div>
      </div>

      <div className="mt-7 flex flex-col gap-3.5">
        <label className="block">
          <div className={labelClass}>PRÉNOM</div>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <div className={labelClass}>NOM</div>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <div className={labelClass}>TÉLÉPHONE</div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <div className={labelClass}>EMAIL</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </label>
      </div>

      <div className="mt-6">
        <Button variant="dark" onClick={handleSave}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
