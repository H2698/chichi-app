import { AppFrame } from "@/components/shell/AppFrame";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return <AppFrame>{children}</AppFrame>;
}
