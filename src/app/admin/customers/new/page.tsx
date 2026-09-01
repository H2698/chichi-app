"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";

const inputClass =
  "w-full rounded-[13px] border border-border-input bg-card px-4 py-3 text-[15px] text-ink outline-none";
const labelClass = "mb-1.5 block text-[10.5px] uppercase tracking-[1.6px] text-tertiary";

export default function NewCustomerPage() {
  const router = useRouter();
  const addCustomer = useAppStore((s) => s.addCustomer);
  const showToast = useAppStore((s) => s.showToast);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const canSubmit = firstName.trim().length > 0 && phone.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      showToast("Renseignez au moins le prénom et le téléphone");
      return;
    }
    const id = addCustomer({ firstName, lastName, phone, email });
    showToast(`${firstName} ajoutée`);
    router.push(`/admin/customers/${id}`);
  };

  return (
    <div className="mx-auto max-w-[480px] px-[22px] pb-10 pt-2.5 lg:mx-0 lg:px-0 lg:pt-0">
      <AdminPageHeader title="Ajouter une cliente" back />

      <div className="flex flex-col gap-3.5">
        <label className="block">
          <div className={labelClass}>Prénom</div>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <div className={labelClass}>Nom</div>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <div className={labelClass}>Téléphone</div>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </label>
        <label className="block">
          <div className={labelClass}>Email — facultatif</div>
          <input value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
        </label>
      </div>

      <div className="mt-5">
        <Button variant="dark" disabled={!canSubmit} onClick={handleSubmit}>
          Ajouter la cliente
        </Button>
      </div>
    </div>
  );
}
