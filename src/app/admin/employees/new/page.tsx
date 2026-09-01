"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import type { Employee } from "@/lib/types";

const inputClass =
  "w-full rounded-[13px] border border-border-input bg-card px-4 py-3 text-[15px] text-ink outline-none";
const labelClass = "mb-1.5 block text-[10.5px] uppercase tracking-[1.6px] text-tertiary";

const ROLES: Employee["role"][] = ["Employée", "Admin"];
const STATUSES: Employee["status"][] = ["Actif", "Inactif"];

export default function NewEmployeePage() {
  const router = useRouter();
  const addEmployee = useAppStore((s) => s.addEmployee);
  const showToast = useAppStore((s) => s.showToast);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<Employee["role"]>("Employée");
  const [status, setStatus] = useState<Employee["status"]>("Actif");

  const canSubmit = firstName.trim().length > 0 && lastName.trim().length > 0;

  const handleSubmit = () => {
    if (!canSubmit) {
      showToast("Renseignez au moins le prénom et le nom");
      return;
    }
    const id = addEmployee({ firstName: firstName.trim(), lastName: lastName.trim(), role, status });
    showToast(`${firstName} ajoutée à l'équipe`);
    router.push(`/admin/employees/${id}`);
  };

  return (
    <div className="mx-auto max-w-[480px] px-[22px] pb-10 pt-2.5 lg:mx-0 lg:px-0 lg:pt-0">
      <AdminPageHeader title="Ajouter une employée" back />

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
          <div className={labelClass}>Rôle</div>
          <select value={role} onChange={(e) => setRole(e.target.value as Employee["role"])} className={inputClass}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <div className={labelClass}>Statut</div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Employee["status"])}
            className={inputClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-2 rounded-2xl border border-border-soft bg-[#fdfaf3] px-4 py-3 text-[12px] leading-relaxed text-secondary-2">
        Le rôle détermine ce que ce compte pourra faire une fois l&apos;authentification branchée. Pour
        l&apos;instant, cette page n&apos;enregistre qu&apos;une fiche — elle ne crée pas encore de
        compte de connexion réel.
      </div>

      <div className="mt-5">
        <Button variant="dark" disabled={!canSubmit} onClick={handleSubmit}>
          Ajouter l&apos;employée
        </Button>
      </div>
    </div>
  );
}
