import type { ButtonHTMLAttributes } from "react";

type Variant = "dark" | "gold" | "outline" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

const base =
  "font-sans transition-colors cursor-pointer disabled:cursor-not-allowed select-none";

const variants: Record<Variant, string> = {
  dark: "border-none bg-ink text-gold-ink hover:bg-ink-hover rounded-2xl py-[17px] text-[13px] tracking-[2.2px] uppercase",
  gold: "border-none bg-gold-light text-scanner-frame hover:brightness-95 rounded-[15px] py-[15px] text-[13px] tracking-[2.2px] uppercase",
  outline:
    "border border-border-input bg-transparent text-ink hover:bg-card rounded-2xl py-[15px] text-[13.5px]",
  ghost: "border-none bg-transparent text-secondary-2 rounded-2xl py-[11px] text-[13.5px]",
};

export function Button({
  variant = "dark",
  fullWidth = true,
  className = "",
  disabled,
  style,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${
        disabled ? "opacity-60" : ""
      } ${className}`}
      disabled={disabled}
      style={style}
      {...rest}
    />
  );
}
