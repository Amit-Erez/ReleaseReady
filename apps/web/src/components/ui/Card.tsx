import type { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`overflow-hidden rounded-lg border border-border bg-bg ${className}`}>
      {children}
    </div>
  );
}
