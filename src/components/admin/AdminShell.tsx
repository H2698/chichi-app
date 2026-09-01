"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminBottomNav } from "./AdminBottomNav";
import { Toast } from "@/components/ui/Toast";
import { useAppStore } from "@/lib/store";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const closeSheet = useAppStore((s) => s.closeSheet);

  useEffect(() => {
    closeSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="min-h-dvh w-full bg-app lg:flex">
      <AdminSidebar />

      {/* Mobile/tablet: same phone-card treatment as the employee app.
          Desktop (lg+): full-width column next to the sidebar. */}
      <div className="sm:flex sm:min-h-dvh sm:items-start sm:justify-center sm:bg-[radial-gradient(120%_80%_at_50%_0%,#f2e9db_0%,#e6dbc9_100%)] sm:p-9 lg:block lg:min-h-dvh lg:flex-1 lg:bg-app lg:p-0">
        <div
          className="relative mx-auto flex min-h-dvh w-full max-w-[430px] flex-col overflow-hidden bg-app sm:min-h-[820px] sm:rounded-[40px] sm:shadow-[0_40px_80px_-30px_rgba(80,60,30,.45)] sm:ring-[10px] sm:ring-[#1e1913] lg:max-w-none lg:min-h-dvh lg:rounded-none lg:shadow-none lg:ring-0"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          <div className="flex-1 overflow-y-auto lg:px-10 lg:py-9">
            <div className="lg:mx-auto lg:max-w-[1100px]">{children}</div>
          </div>
          <AdminBottomNav />
          <Toast />
        </div>
      </div>
    </div>
  );
}
