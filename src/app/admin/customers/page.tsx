"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { ChevronRightIcon, PlusIcon, SearchIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { searchCustomers } from "@/lib/selectors";

export default function AdminCustomersPage() {
  const router = useRouter();
  const customers = useAppStore((s) => s.customers);
  const [query, setQuery] = useState("");

  const results = searchCustomers(query, customers).sort((a, b) =>
    `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
  );

  return (
    <div className="px-[22px] pb-10 pt-2.5 lg:px-0 lg:pt-0">
      <AdminPageHeader
        title="Clientes"
        subtitle={`${customers.length} clientes`}
        action={
          <Button
            variant="dark"
            fullWidth={false}
            className="!w-auto gap-2 !py-3 !text-[12.5px]"
            onClick={() => router.push("/admin/customers/new")}
          >
            <span className="inline-flex items-center gap-2">
              <PlusIcon size={15} /> Ajouter une cliente
            </span>
          </Button>
        }
      />

      <div className="flex items-center gap-[11px] rounded-2xl border border-border-input bg-card px-[15px] py-3.5">
        <SearchIcon size={16} strokeWidth={1.6} className="text-tertiary" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom ou numéro de téléphone"
          className="flex-1 border-none bg-transparent text-[14px] text-ink outline-none"
        />
      </div>

      {results.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-border bg-card px-4 py-8 text-center text-[13.5px] text-secondary-2">
          Aucune cliente ne correspond à votre recherche.
        </div>
      ) : (
        <div className="mt-5 grid gap-2.5 lg:grid-cols-2">
          {results.map((c) => (
            <div
              key={c.id}
              onClick={() => router.push(`/admin/customers/${c.id}`)}
              className="flex cursor-pointer items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-3.5"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-pill font-caps text-[13px] text-gold">
                {c.firstName[0]}
                {c.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-serif text-[19px] text-ink">
                  {c.firstName} {c.lastName}
                </div>
                <div className="text-[13px] text-secondary-2">{c.phone}</div>
                <div className="mt-0.5 text-[11.5px] text-tertiary">
                  {c.rentalsCount} location{c.rentalsCount !== 1 ? "s" : ""} · {c.lastRentalLabel}
                </div>
              </div>
              <ChevronRightIcon size={16} className="text-[#c9a869]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
