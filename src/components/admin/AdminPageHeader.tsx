"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { ChevronLeftIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/Card";

export function AdminPageHeader({
  title,
  subtitle,
  action,
  back,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  back?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-center gap-3.5">
        {back ? (
          <IconCircle size={34} onClick={() => router.back()} className="flex-shrink-0 lg:hidden">
            <ChevronLeftIcon size={14} strokeWidth={1.7} />
          </IconCircle>
        ) : null}
        <div>
          <div className="font-serif text-[28px] leading-[1.1] text-ink lg:text-[32px]">{title}</div>
          {subtitle ? <div className="mt-1.5 text-[13px] text-secondary-2">{subtitle}</div> : null}
        </div>
      </div>
      {action ? <div className="flex-shrink-0">{action}</div> : null}
    </div>
  );
}
