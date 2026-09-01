import type { HTMLAttributes } from "react";

export function Card({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-[20px] border border-border bg-card ${className}`}
      {...rest}
    />
  );
}

export function Dot({ color, size = 5 }: { color: string; size?: number }) {
  return (
    <span
      className="inline-block flex-shrink-0 rounded-full"
      style={{ width: size, height: size, background: color }}
    />
  );
}

export function IconCircle({
  size = 36,
  border = true,
  onClick,
  children,
  className = "",
}: {
  size?: number;
  border?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      className={`flex items-center justify-center rounded-full text-secondary-2 ${
        border ? "border border-border-input bg-card" : ""
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}
