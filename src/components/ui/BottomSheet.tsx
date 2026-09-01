"use client";

import type { ReactNode } from "react";

export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end">
      <div
        onClick={onClose}
        className="chi-fade-fast absolute inset-0 bg-[rgba(35,27,20,.45)]"
      />
      <div className="chi-sheet relative max-h-[78%] overflow-y-auto rounded-t-[28px] bg-app px-6 pb-8 pt-3">
        <div className="mx-auto mb-[18px] h-1 w-[42px] rounded-full bg-border-input" />
        {children}
      </div>
    </div>
  );
}
