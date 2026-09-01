import {
  CalendarDaysIcon,
  DashboardIcon,
  EmployeesIcon,
  GalleryIcon,
  ReservationsIcon,
  UsersIcon,
} from "@/components/icons";

export const ADMIN_NAV = [
  { href: "/admin", label: "Dashboard", Icon: DashboardIcon, exact: true },
  { href: "/admin/dresses", label: "Robes", Icon: GalleryIcon, exact: false },
  { href: "/admin/reservations", label: "Réservations", Icon: ReservationsIcon, exact: false },
  { href: "/admin/customers", label: "Clientes", Icon: UsersIcon, exact: false },
  { href: "/admin/calendar", label: "Calendrier", Icon: CalendarDaysIcon, exact: false },
  { href: "/admin/employees", label: "Employées", Icon: EmployeesIcon, exact: false },
] as const;
