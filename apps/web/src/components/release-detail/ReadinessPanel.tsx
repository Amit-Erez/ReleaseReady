import type { ReleaseWithReadiness } from "@release-ready/shared";

type ReadinessPanelProps = {
  checks: ReleaseWithReadiness["readinessSummary"]["ruleChecks"];
};

export function ReadinessPanel({ checks }: ReadinessPanelProps) {
  return (
    <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      {checks.map((check) => (
        <li
          key={check.code}
          className="flex items-start gap-3 border-b border-border px-5 py-3.25 text-[0.95rem]/[normal] last:border-b-0"
        >
          <span
            className={`w-5 shrink-0 text-center font-bold ${check.passed ? "text-good" : "text-critical"}`}
            aria-hidden="true"
          >
            {check.passed ? "✓" : "✗"}
          </span>
          <span>
            <span className="sr-only">{check.passed ? "Passed: " : "Failed: "}</span>
            <span className={check.passed ? "text-text-soft" : "font-semibold text-text"}>{check.message}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
