"use client";

import { useRouter } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Dot } from "@/components/ui/Card";
import { ChevronRightIcon, PlusIcon } from "@/components/icons";
import { useAppStore } from "@/lib/store";

export default function AdminEmployeesPage() {
  const router = useRouter();
  const employees = useAppStore((s) => s.employees);

  return (
    <div className="px-[22px] pb-10 pt-2.5 lg:px-0 lg:pt-0">
      <AdminPageHeader
        title="Employées"
        subtitle={`${employees.length} membres de l'équipe`}
        action={
          <Button
            variant="dark"
            fullWidth={false}
            className="!w-auto gap-2 !py-3 !text-[12.5px]"
            onClick={() => router.push("/admin/employees/new")}
          >
            <span className="inline-flex items-center gap-2">
              <PlusIcon size={15} /> Ajouter une employée
            </span>
          </Button>
        }
      />

      <div className="grid gap-2.5 lg:grid-cols-2">
        {employees.map((e) => {
          const active = e.status === "Actif";
          return (
            <div
              key={e.id}
              onClick={() => router.push(`/admin/employees/${e.id}`)}
              className="flex cursor-pointer items-center gap-3.5 rounded-2xl border border-border bg-card px-4 py-3.5 hover:border-[#dcc9a4]"
            >
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-pill font-caps text-[13px] text-gold">
                {e.firstName[0]}
                {e.lastName[0]}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <div className="font-serif text-[18px] text-ink">
                    {e.firstName} {e.lastName}
                  </div>
                  <div
                    className="rounded-md px-1.5 py-[2px] font-caps text-[8px] tracking-[1.4px]"
                    style={{
                      background: e.role === "Admin" ? "#f6ecd9" : "#f7f1e6",
                      color: e.role === "Admin" ? "#8a6a2c" : "#7c6a58",
                    }}
                  >
                    {e.role.toUpperCase()}
                  </div>
                </div>
                <div className="mt-0.5 truncate text-[12px] font-light text-secondary-2">
                  {e.recentActivity}
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1.5">
                <Dot color={active ? "#7f9476" : "#a49c8e"} size={6} />
                <span className="text-[12px]" style={{ color: active ? "#5f7355" : "#a49c8e" }}>
                  {e.status}
                </span>
              </div>
              <ChevronRightIcon size={15} className="flex-shrink-0 text-[#c9a869]" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
