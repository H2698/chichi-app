"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { Toast } from "@/components/ui/Toast";
import { useAppStore } from "@/lib/store";

const NAV_ROUTES = ["/home", "/dresses", "/reservations", "/profile"];

export function AppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const closeSheet = useAppStore((s) => s.closeSheet);

  useEffect(() => {
    closeSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const showNav = NAV_ROUTES.some((r) => pathname?.startsWith(r));

  return (
    <div className="min-h-dvh w-full bg-app sm:flex sm:min-h-dvh sm:items-start sm:justify-center sm:bg-[radial-gradient(120%_80%_at_50%_0%,#f2e9db_0%,#e6dbc9_100%)] sm:p-9">
      <div
        className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-app sm:min-h-[820px] sm:rounded-[40px] sm:shadow-[0_40px_80px_-30px_rgba(80,60,30,.45)] sm:ring-[10px] sm:ring-[#1e1913]"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* intentionally not `relative`: BottomSheet uses absolute inset-0 to
            escape this scroll container and cover the whole frame (incl. nav),
            which only works while this wrapper stays position:static */}
        <div className="flex-1 overflow-y-auto">{children}</div>
        {showNav ? <BottomNav /> : null}
        <Toast />
      </div>
    </div>
  );
}
