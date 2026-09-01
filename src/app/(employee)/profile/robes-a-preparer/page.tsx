"use client";

import { useRouter } from "next/navigation";
import { BackHeader } from "@/components/shell/BackHeader";
import { ImageSlot } from "@/components/ui/ImageSlot";
import { Dot } from "@/components/ui/Card";
import { useAppStore } from "@/lib/store";
import { findModel, unitLabel } from "@/lib/selectors";
import { badgeForUnitStatus } from "@/lib/status";

export default function RobesAPreparerPage() {
  const router = useRouter();
  const units = useAppStore((s) => s.units);
  const models = useAppStore((s) => s.models);

  const toPrepare = units.filter((u) => u.baseStatus === "nettoyage");

  return (
    <div className="chi-rise px-[22px] pb-[26px] pt-2.5">
      <BackHeader title="Robes à préparer" />
      <div className="mt-1.5 text-[13px] font-light text-secondary-2">
        {toPrepare.length} robe{toPrepare.length !== 1 ? "s" : ""} en attente de nettoyage
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {toPrepare.length === 0 ? (
          <div className="rounded-[18px] border border-border bg-card px-4 py-8 text-center text-[13.5px] text-secondary-2">
            Aucune robe à préparer pour le moment.
          </div>
        ) : (
          toPrepare.map((u) => {
            const model = findModel(u.modelId, models);
            const badge = badgeForUnitStatus(u.baseStatus);
            return (
              <div
                key={u.ref}
                onClick={() => router.push(`/dress/${u.ref}`)}
                className="flex cursor-pointer items-center gap-[13px] rounded-[18px] border border-border bg-card p-[13px] hover:border-[#dcc9a4]"
              >
                <div className="h-[74px] w-[58px] flex-shrink-0 overflow-hidden rounded-xl bg-[#efe6d5]">
                  <ImageSlot src={model?.photoUrl} placeholder="Robe" shape="rounded" radius={12} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-serif text-[19px] text-ink">{model?.name ?? u.modelId}</div>
                  <div className="mt-[3px] text-[12.5px] text-secondary-2">{unitLabel(u, models)}</div>
                  <div className="mt-1 font-caps text-[10px] tracking-[1.2px] text-tertiary">
                    {u.ref}
                  </div>
                  <div className="mt-[7px] flex items-center gap-1.5">
                    <Dot color={badge.dot} size={5} />
                    <div className="text-[12.5px]" style={{ color: badge.fg }}>
                      {badge.labelSoft}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
