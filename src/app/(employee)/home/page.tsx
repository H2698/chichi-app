"use client";

import { useRouter } from "next/navigation";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Dot, IconCircle } from "@/components/ui/Card";
import { BellIcon, ChevronRightIcon, PlusIcon, QrIcon, ReturnIcon, SearchIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";
import { getCurrentEmployee, getHomeStats, getNotifications, getTodayAgenda, unitLabel } from "@/lib/selectors";
import { CURRENT_EMPLOYEE_ID, TODAY_WEEKDAY_LABEL } from "@/lib/mock-data";

export default function HomePage() {
  const router = useRouter();
  const models = useAppStore((s) => s.models);
  const units = useAppStore((s) => s.units);
  const reservations = useAppStore((s) => s.reservations);
  const customers = useAppStore((s) => s.customers);
  const employees = useAppStore((s) => s.employees);
  const authUserId = useAppStore((s) => s.authUserId);
  const authUserEmail = useAppStore((s) => s.authUserEmail);
  const readNotificationIds = useAppStore((s) => s.readNotificationIds);
  const showToast = useAppStore((s) => s.showToast);

  // Every screen used to greet whoever opened the app as "Chichi" — the
  // original shared account — regardless of which employee actually signed
  // in. Resolve the real signed-in person, falling back to the legacy
  // constant only when there's no real session (local demo mode).
  const me =
    getCurrentEmployee(employees, authUserId, authUserEmail) ??
    employees.find((e) => e.id === CURRENT_EMPLOYEE_ID);

  const stats = getHomeStats(units, reservations);
  const agenda = getTodayAgenda(reservations).slice(0, 3);
  const unreadCount = getNotifications(reservations, units, models, customers).filter(
    (n) => !readNotificationIds.includes(n.id)
  ).length;

  const statCards = [
    { n: stats.pickupsToday, label: "Retraits aujourd’hui", color: "#33291f" },
    { n: stats.returnsToday, label: "Retours aujourd’hui", color: "#33291f" },
    { n: stats.availableUnits, label: "Robes disponibles", color: "#5f7355" },
    { n: stats.lateCount, label: "En retard", color: "#b1553f" },
  ];

  const quick = [
    {
      label: "Nouvelle réservation",
      icon: <PlusIcon size={19} />,
      onClick: () => router.push("/dresses"),
    },
    {
      label: "Rechercher une cliente",
      icon: <SearchIcon size={19} />,
      onClick: () => {
        showToast("Choisissez une robe pour commencer une réservation");
        router.push("/dresses");
      },
    },
    {
      label: "Voir les retours",
      icon: <ReturnIcon size={19} />,
      onClick: () => router.push("/reservations"),
    },
  ];

  return (
    <div className="chi-rise px-6 pb-[26px] pt-2.5">
      <div className="flex items-start justify-between">
        <div>
          <div className="font-caps text-[9.5px] tracking-[2.4px] text-gold">
            {TODAY_WEEKDAY_LABEL}
          </div>
          <div className="mt-1.5 font-serif text-[33px] leading-[1.1] text-ink">
            Bonjour, {me?.firstName ?? "Chichi"}
          </div>
        </div>
        <div className="flex items-center gap-2.5 pt-1">
          <IconCircle size={38} onClick={() => router.push("/profile/notifications")}>
            <div className="relative">
              <BellIcon size={17} />
              {unreadCount > 0 ? (
                <div className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#b1553f]" />
              ) : null}
            </div>
          </IconCircle>
          <div
            onClick={() => router.push("/profile")}
            className="flex h-[38px] w-[38px] cursor-pointer items-center justify-center rounded-full border border-border-input bg-card p-1.5"
          >
            <ImageSlot src="/assets/bychichi-logo.png" alt="Profil" shape="circle" fit="contain" />
          </div>
        </div>
      </div>

      <div
        onClick={() => router.push("/scanner")}
        className="mt-[22px] flex cursor-pointer items-center gap-[18px] rounded-[22px] bg-ink p-5 shadow-[0_18px_30px_-20px_rgba(51,41,31,.9)] hover:bg-ink-hover-2"
      >
        <div className="flex h-[46px] w-[46px] flex-shrink-0 items-center justify-center rounded-[14px] border border-[rgba(201,168,105,.5)] text-[#c9a869]">
          <QrIcon size={22} strokeWidth={1.3} />
        </div>
        <div className="flex-1">
          <div className="font-serif text-[22px] text-gold-ink">Scanner une robe</div>
          <div className="mt-0.5 text-[12px] font-light text-[rgba(246,236,217,.6)]">
            Fiche robe et disponibilités instantanées
          </div>
        </div>
        <div className="text-[20px] text-[#c9a869]">
          <ChevronRightIcon size={18} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 overflow-hidden rounded-[20px] border border-border bg-card">
        {statCards.map((st) => (
          <div
            key={st.label}
            className="box-border border-b border-r border-border-soft px-4 py-[18px]"
          >
            <div className="flex items-baseline gap-[7px]">
              <div className="font-serif text-[32px] leading-none" style={{ color: st.color }}>
                {st.n}
              </div>
              <Dot color={st.color} size={5} />
            </div>
            <div className="mt-[7px] text-[11.5px] font-light tracking-[0.3px] text-secondary-2">
              {st.label}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-[30px] flex items-center justify-between">
        <div className="font-serif text-[23px] text-ink">À venir aujourd&apos;hui</div>
        <div
          onClick={() => router.push("/reservations")}
          className="cursor-pointer text-[12px] tracking-[0.4px] text-gold"
        >
          Tout voir
        </div>
      </div>

      <div className="mt-3.5 flex flex-col gap-3">
        {agenda.length === 0 ? (
          <div className="rounded-[18px] border border-border bg-card px-4 py-5 text-center text-[13px] font-light text-secondary-2">
            Rien de prévu pour le moment aujourd&apos;hui.
          </div>
        ) : (
          agenda.map((a, i) => {
            const unit = units.find((u) => u.ref === a.unitRef);
            const customer = customers.find((c) => c.id === a.customerId);
            const isPickup = a.kind === "RETRAIT";
            return (
              <div
                key={i}
                onClick={() => router.push(`/dress/${a.unitRef}`)}
                className="flex cursor-pointer items-center gap-[13px] rounded-[18px] border border-border bg-card p-[13px] hover:border-[#dcc9a4]"
              >
                <div className="h-[74px] w-[58px] flex-shrink-0 overflow-hidden rounded-xl bg-[#efe6d5]">
                  <ImageSlot placeholder="Robe" shape="rounded" radius={12} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-[9px]">
                    <div className="font-serif text-[20px] text-ink">{a.time}</div>
                    <div
                      className="rounded-md px-2 py-[3px] font-caps text-[9px] tracking-[1.6px]"
                      style={{
                        background: isPickup ? "#f1f4ee" : "#f6ebee",
                        color: isPickup ? "#5f7355" : "#7c5a6b",
                      }}
                    >
                      {a.kind}
                    </div>
                  </div>
                  <div className="mt-[5px] text-[14.5px] text-ink">
                    {customer ? `${customer.firstName} ${customer.lastName}` : "Cliente"}
                  </div>
                  <div className="text-[12.5px] font-light text-secondary-2">
                    {unit ? unitLabel(unit, models) : ""}
                  </div>
                  <div className="mt-[3px] font-sans text-[10.5px] tracking-[1.1px] text-tertiary">
                    {a.unitRef}
                  </div>
                </div>
                <div className="text-[18px] text-[#c9a869]">
                  <ChevronRightIcon size={16} />
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-[30px] font-serif text-[23px] text-ink">Actions rapides</div>
      <div className="mt-3.5 flex flex-col gap-[11px]">
        {quick.map((q) => (
          <div
            key={q.label}
            onClick={q.onClick}
            className="flex cursor-pointer items-center gap-[14px] rounded-[32px] bg-pill px-[18px] py-[11px] hover:bg-pill-hover"
          >
            <div className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full border border-[#e3d4b3] bg-card text-gold">
              {q.icon}
            </div>
            <div className="flex-1 text-[15px] text-[#3b3226]">{q.label}</div>
            <div className="text-[18px] text-[#c9a869]">
              <ChevronRightIcon size={16} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
