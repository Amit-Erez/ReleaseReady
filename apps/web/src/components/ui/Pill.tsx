import type { ReactNode } from "react";

type PillProps = {
  children: ReactNode;
};

export function Pill({ children }: PillProps) {
  return (
    <span className="inline-block whitespace-nowrap rounded-sm bg-pill-bg px-2.5 py-1 text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-pill-text">
      {children}
    </span>
  );
}
