import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const VARIANTS = {
  primary:
    "bg-accent text-accent-contrast hover:brightness-110 focus-visible:outline-text text-[1.1rem]/[normal] font-bold px-4.5 py-2.5",
  secondary:
    "border border-border bg-transparent text-text hover:border-accent focus-visible:outline-accent text-[0.88rem]/[normal] font-semibold px-4 py-2.25",
};

export function Button({
  variant = "primary",
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
