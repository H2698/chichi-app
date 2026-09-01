import type { Viewport } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { AuthGate } from "@/components/shell/AuthGate";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#33291f",
  colorScheme: "light",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <AdminShell>{children}</AdminShell>
    </AuthGate>
  );
}
