"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ReservationHeader } from "@/components/shell/ReservationHeader";
import { Button } from "@/components/ui/Button";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { CheckIcon, SearchIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";

export default function ReservationCustomerPage() {
  const router = useRouter();
  const draft = useAppStore((s) => s.draft);
  const customers = useAppStore((s) => s.customers);
  const pickCustomer = useAppStore((s) => s.pickCustomer);
  const addCustomer = useAppStore((s) => s.addCustomer);
  const sheet = useAppStore((s) => s.sheet);
  const openSheet = useAppStore((s) => s.openSheet);
  const closeSheet = useAppStore((s) => s.closeSheet);

  const [query, setQuery] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!draft.unitRef) router.replace("/dresses");
  }, [draft.unitRef, router]);

  if (!draft.unitRef) return null;

  const q = query.trim().toLowerCase();
  const results = customers.filter(
    (c) =>
      !q ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.phone.replace(/\s/g, "").includes(q.replace(/\s/g, ""))
  );

  const picked = draft.customerId;

  return (
    <div className="chi-rise pb-[30px]">
      <ReservationHeader step="customer" />

      <div className="px-[22px] pt-[26px]">
        <div className="font-serif text-[29px] text-ink">Pour quelle cliente ?</div>

        <div className="mt-[18px] flex items-center gap-[11px] rounded-2xl border border-border-input bg-card px-4 py-3.5">
          <SearchIcon size={16} strokeWidth={1.6} className="text-tertiary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nom ou numéro de téléphone"
            className="flex-1 border-none bg-transparent text-[15px] text-ink outline-none"
          />
        </div>

        <div className="mb-3 mt-[22px] font-caps text-[9px] tracking-[2px] text-tertiary">
          {results.length} RÉSULTAT{results.length > 1 ? "S" : ""}
        </div>

        <div className="flex flex-col gap-2.5">
          {results.map((c) => {
            const selected = picked === c.id;
            return (
              <div
                key={c.id}
                onClick={() => pickCustomer(c.id)}
                className="cursor-pointer rounded-2xl bg-card px-[18px] py-[17px]"
                style={{ border: `1px solid ${selected ? "#a5813f" : "#eee3d0"}` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-serif text-[23px] text-ink">
                      {c.firstName} {c.lastName}
                    </div>
                    <div className="mt-[3px] text-[13.5px] text-secondary-2">{c.phone}</div>
                    <div className="mt-1.5 text-[12px] tracking-[0.4px] text-tertiary">
                      {c.rentalsCount} location{c.rentalsCount !== 1 ? "s" : ""} · {c.lastRentalLabel}
                    </div>
                  </div>
                  <div
                    className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-card"
                    style={{
                      border: `1px solid ${selected ? "#a5813f" : "#eee3d0"}`,
                      background: selected ? "#a5813f" : "transparent",
                    }}
                  >
                    {selected ? <CheckIcon size={12} strokeWidth={2.2} /> : null}
                  </div>
                </div>
              </div>
            );
          })}
          {results.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card px-[18px] py-6 text-center text-[13.5px] text-secondary-2">
              Aucune cliente ne correspond à « {query} ».
            </div>
          ) : null}
        </div>

        <div className="mt-3">
          <Button variant="outline" onClick={() => openSheet("newCustomer")}>
            Nouvelle cliente
          </Button>
        </div>

        <div className="mt-[22px]">
          <Button
            variant="dark"
            disabled={!picked}
            className={picked ? "" : "!bg-[#b6a68f]"}
            onClick={() => picked && router.push("/reservation/payment")}
          >
            Continuer
          </Button>
        </div>
      </div>

      <BottomSheet open={sheet === "newCustomer"} onClose={closeSheet}>
        <div>
          <div className="font-serif text-[27px] text-ink">Nouvelle cliente</div>
          <div className="mt-5 flex flex-col gap-3">
            {[
              { label: "Prénom", value: firstName, set: setFirstName },
              { label: "Nom", value: lastName, set: setLastName },
              { label: "Téléphone", value: phone, set: setPhone },
              { label: "Email — facultatif", value: email, set: setEmail },
            ].map((f) => (
              <label key={f.label} className="block">
                <div className="mb-1.5 text-[10.5px] uppercase tracking-[1.6px] text-tertiary">
                  {f.label}
                </div>
                <input
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="w-full rounded-[13px] border border-border-input bg-card px-[15px] py-[13px] text-[15px] text-ink outline-none"
                />
              </label>
            ))}
          </div>
          <div className="mt-5">
            <Button
              variant="dark"
              onClick={() => {
                addCustomer({ firstName, lastName, phone, email });
                setFirstName("");
                setLastName("");
                setPhone("");
                setEmail("");
              }}
            >
              Ajouter la cliente
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
