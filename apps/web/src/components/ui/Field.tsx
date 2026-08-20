import type { InputHTMLAttributes } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: string;
  hasError?: boolean;
};

export function Field({ label, hint, id, hasError = false, ...props }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.25 block text-[0.8rem]/[normal] font-bold text-text">
        {label}
      </label>
      <input
        id={id}
        className={`w-full rounded-sm border ${hasError ? "border-critical" : "border-border"} bg-page px-2.75 py-2.25 text-[0.92rem]/[normal] text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent`}
        {...props}
      />
      {hint && <p className="mt-1 text-[0.74rem]/[normal] text-text-soft">{hint}</p>}
    </div>
  );
}
