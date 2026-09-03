"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/lib/store";
import { supabase, supabaseConfigured } from "@/lib/supabase";
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
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Employee["role"]>("Employée");
  const [status, setStatus] = useState<Employee["status"]>("Actif");
  const [submitting, setSubmitting] = useState(false);

  // Set once account creation succeeds. Supabase only ever returns this
  // password this one time — it can't be retrieved again afterwards — so
  // submitting the form again switches to this confirmation screen instead
  // of the form, until the shop owner has copied it and moved on.
  const [created, setCreated] = useState<{ id: string; email: string; password: string } | null>(
    null
  );

  // Without a real backend, there's no Auth to create an account against —
  // keep the old offline/demo behaviour (a directory-only record) rather
  // than block the whole screen on a feature that can't work here.
  const requiresRealAccount = supabaseConfigured;

  const canSubmit =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    (!requiresRealAccount || email.trim().length > 0);

  const handleSubmit = async () => {
    if (!canSubmit) {
      showToast(
        requiresRealAccount
          ? "Renseignez le prénom, le nom et l'email"
          : "Renseignez au moins le prénom et le nom"
      );
      return;
    }

    if (!requiresRealAccount) {
      const id = addEmployee({ firstName: firstName.trim(), lastName: lastName.trim(), role, status });
      showToast(`${firstName} ajoutée à l'équipe`);
      router.push(`/admin/employees/${id}`);
      return;
    }

    setSubmitting(true);
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    const res = await fetch("/api/employees", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role,
        status,
      }),
    });
    const json = await res.json().catch(() => ({}));
    setSubmitting(false);

    if (!res.ok) {
      showToast(json.error || "Impossible de créer le compte");
      return;
    }

    useAppStore.setState((st) => ({ employees: [...st.employees, json.employee as Employee] }));
    setCreated({ id: json.employee.id, email: json.employee.email, password: json.temporaryPassword });
  };

  if (created) {
    return (
      <div className="mx-auto max-w-[480px] px-[22px] pb-10 pt-2.5 lg:mx-0 lg:px-0 lg:pt-0">
        <AdminPageHeader title="Compte créé" />

        <div className="rounded-2xl border border-border-soft bg-[#fdfaf3] px-4 py-3.5 text-[12.5px] leading-relaxed text-secondary-2">
          Communiquez ces identifiants à l&apos;employée. Le mot de passe ne sera plus jamais
          affiché après avoir quitté cette page — notez-le maintenant.
        </div>

        <div className="mt-4 flex flex-col gap-3.5 rounded-[18px] border border-border bg-card p-4">
          <div>
            <div className={labelClass}>Identifiant</div>
            <div className="text-[15px] text-ink">{created.email}</div>
          </div>
          <div>
            <div className={labelClass}>Mot de passe temporaire</div>
            <div className="font-mono text-[17px] tracking-wide text-ink">{created.password}</div>
          </div>
          <div
            className="cursor-pointer text-[12.5px] text-gold"
            onClick={async () => {
              await navigator.clipboard.writeText(created.password);
              showToast("Mot de passe copié");
            }}
          >
            Copier le mot de passe
          </div>
        </div>

        <div className="mt-5">
          <Button variant="dark" onClick={() => router.push(`/admin/employees/${created.id}`)}>
            Continuer
          </Button>
        </div>
      </div>
    );
  }

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
          <div className={labelClass}>Email</div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom@bychichi.tn"
            className={inputClass}
          />
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
        {requiresRealAccount
          ? "Un compte de connexion réel est créé avec cet email et un mot de passe temporaire généré automatiquement, affiché une seule fois."
          : "Aucun backend n'est connecté ici — cette page n'enregistre qu'une fiche de démonstration, sans compte de connexion réel."}
      </div>

      <div className="mt-5">
        <Button variant="dark" disabled={!canSubmit || submitting} onClick={handleSubmit}>
          {submitting ? "Création..." : "Ajouter l'employée"}
        </Button>
      </div>
    </div>
  );
}
