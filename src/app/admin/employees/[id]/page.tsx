"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Dot } from "@/components/ui/Card";
import { useAppStore } from "@/lib/store";
import type { Employee } from "@/lib/types";

const inputClass =
  "w-full rounded-[13px] border border-border-input bg-card px-4 py-3 text-[15px] text-ink outline-none";
const labelClass = "mb-1.5 block text-[10.5px] uppercase tracking-[1.6px] text-tertiary";

const ROLES: Employee["role"][] = ["Employée", "Admin"];
const STATUSES: Employee["status"][] = ["Actif", "Inactif"];

export default function EmployeeProfilePage() {
  const params = useParams<{ id: string }>();
  const employees = useAppStore((s) => s.employees);
  const employee = employees.find((e) => e.id === params.id);

  if (!employee) {
    return (
      <div className="px-[22px] pb-10 pt-2.5 text-center text-secondary-2 lg:px-0 lg:pt-0">
        Employée introuvable.
      </div>
    );
  }

  // Keyed on the employee id so local form state resets cleanly when
  // navigating from one employee's profile straight to another's.
  return <EmployeeEditForm key={employee.id} employee={employee} />;
}

function EmployeeEditForm({ employee }: { employee: Employee }) {
  const updateEmployee = useAppStore((s) => s.updateEmployee);
  const showToast = useAppStore((s) => s.showToast);

  const [firstName, setFirstName] = useState(employee.firstName);
  const [lastName, setLastName] = useState(employee.lastName);
  const [role, setRole] = useState(employee.role);
  const [status, setStatus] = useState(employee.status);

  const handleSave = () => {
    updateEmployee(employee.id, {
      firstName: firstName.trim() || employee.firstName,
      lastName: lastName.trim() || employee.lastName,
      role,
      status,
    });
    showToast("Fiche employée mise à jour");
  };

  return (
    <div className="mx-auto max-w-[480px] px-[22px] pb-10 pt-2.5 lg:mx-0 lg:px-0 lg:pt-0">
      <AdminPageHeader
        title={`${employee.firstName} ${employee.lastName}`}
        back
        subtitle={employee.recentActivity}
      />

      <div className="mb-5 flex items-center gap-2">
        <Dot color={status === "Actif" ? "#7f9476" : "#a49c8e"} size={7} />
        <span className="text-[13px]" style={{ color: status === "Actif" ? "#5f7355" : "#a49c8e" }}>
          {status === "Actif" ? "Compte actif" : "Compte inactif"}
        </span>
      </div>

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
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Employee["role"])}
            className={inputClass}
          >
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

      <div className="mt-4 rounded-2xl border border-border-soft bg-[#fdfaf3] px-4 py-3 text-[12px] leading-relaxed text-secondary-2">
        Passer le statut sur <span className="text-ink">Inactif</span> retire cette personne de
        l&apos;équipe visible sans supprimer sa fiche. Aucun accès n&apos;est réellement bloqué tant
        que l&apos;authentification n&apos;est pas branchée.
      </div>

      <div className="mt-5">
        <Button variant="dark" onClick={handleSave}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
