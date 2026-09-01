"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";
import { IconCircle } from "@/components/ui/Card";

export function BackHeader({
  title,
  eyebrow,
  size = "lg",
  onBack,
}: {
  title: string;
  eyebrow?: boolean;
  size?: "lg" | "md";
  onBack?: () => void;
}) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-3.5">
      <IconCircle size={34} onClick={onBack ?? (() => router.back())}>
        <ChevronLeftIcon size={14} strokeWidth={1.7} />
      </IconCircle>
      {eyebrow ? (
        <div className="font-caps text-[9.5px] tracking-[2.2px] text-gold">{title}</div>
      ) : (
        <div
          className={`font-serif text-ink ${size === "lg" ? "text-[26px]" : "text-[23px]"}`}
        >
          {title}
        </div>
      )}
    </div>
  );
}
