import { AppFrame } from "@/components/shell/AppFrame";
import { AuthGate } from "@/components/shell/AuthGate";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <AppFrame>{children}</AppFrame>
    </AuthGate>
  );
}
