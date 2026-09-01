import type { SVGProps } from "react";

interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function baseProps({ size = 19, strokeWidth = 1.4, ...rest }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none" as const,
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export function BellIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
      <path d="M10.5 20a2 2 0 0 0 3 0" />
    </svg>
  );
}

export function QrIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 8V5.5A1.5 1.5 0 0 1 5.5 4H8M16 4h2.5A1.5 1.5 0 0 1 20 5.5V8M20 16v2.5a1.5 1.5 0 0 1-1.5 1.5H16M8 20H5.5A1.5 1.5 0 0 1 4 18.5V16" />
      <path d="M3 12h18" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.5 4.5" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...baseProps({ strokeWidth: 1.6, ...props })}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function FlashIcon(props: IconProps) {
  return (
    <svg {...baseProps({ strokeWidth: 1.5, ...props })}>
      <path d="M13 2L5 13h5l-1 9 8-11h-5z" />
    </svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <svg {...baseProps({ strokeWidth: 1.7, ...props })}>
      <path d="M14 5l-7 7 7 7" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...baseProps({ strokeWidth: 1.6, ...props })}>
      <path d="M10 5l7 7-7 7" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...baseProps({ strokeWidth: 1.7, ...props })}>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...baseProps({ strokeWidth: 1.6, ...props })}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function PhoneIcon(props: IconProps) {
  return (
    <svg {...baseProps({ strokeWidth: 1.5, ...props })}>
      <path d="M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 6.5 6.5L17 13l4 1.5v3A2.5 2.5 0 0 1 18.2 20C10.4 19.3 4.7 13.6 4 5.8A2.5 2.5 0 0 1 6.5 3z" />
    </svg>
  );
}

export function ReturnIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 12a8 8 0 1 1 3 6.2" />
      <path d="M4 8v4h4" />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 11l8-6.5 8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

export function ReservationsIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 5h14v15H5zM8 3v4M16 3v4M5 10h14" />
    </svg>
  );
}

export function GalleryIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M9 4l3 2 3-2 4 3-2 3v10H7V10L5 7z" />
    </svg>
  );
}

export function ProfileIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 20c0-3.3 3.1-5.5 7-5.5s7 2.2 7 5.5M12 11.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5" />
    </svg>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="4" y="4" width="7" height="8" rx="1.5" />
      <rect x="13" y="4" width="7" height="5" rx="1.5" />
      <rect x="13" y="11" width="7" height="9" rx="1.5" />
      <rect x="4" y="14" width="7" height="6" rx="1.5" />
    </svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
      <path d="M16 4.5a3.25 3.25 0 0 1 0 6.3" />
      <path d="M18.5 15.3c2.6.5 3.5 2 3.5 4.7" />
    </svg>
  );
}

export function EmployeesIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  );
}

export function PlusCircleIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8.5v7M8.5 12h7" />
    </svg>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 20l.9-4.2L15.6 5.1a1.8 1.8 0 0 1 2.6 0l.7.7a1.8 1.8 0 0 1 0 2.6L8.2 19.1 4 20z" />
      <path d="M14 6.5l3.5 3.5" />
    </svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A9.9 9.9 0 0 1 12 5c5 0 9 4 9.9 7-.4 1.1-1 2.2-1.8 3.1M6.5 6.6C4.6 7.9 3.1 9.7 2.1 12c.9 3 4.9 7 9.9 7 1.5 0 2.9-.4 4.1-1" />
      <path d="M9.9 10.1a3 3 0 0 0 4 4" />
    </svg>
  );
}

export function UploadIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M12 15V4M8 8l4-4 4 4" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}

export function PrinterIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M6 9V4h12v5" />
      <rect x="4" y="9" width="16" height="8" rx="1.5" />
      <path d="M6 14h12v6H6z" />
    </svg>
  );
}

export function CalendarDaysIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...baseProps({ strokeWidth: 1.6, ...props })}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
