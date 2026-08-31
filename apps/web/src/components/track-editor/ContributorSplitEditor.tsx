import type { Release, TrackCredit } from "@release-ready/shared";
import { Card } from "../ui/Card";

type ContributorSplitEditorProps = {
  rows: TrackCredit[];
  splitsTotal: number | null;
  release: Release
};

const ROLE_LABELS: Record<TrackCredit["role"], string> = {
  composer: "Composer",
  producer: "Producer",
  arranger: "Arranger",
  lyricist: "Lyricist",
};

export function ContributorSplitEditor({
  rows,
  splitsTotal,
  release,
}: ContributorSplitEditorProps) {
  const isComplete = splitsTotal === 100;

  return (
    <Card>
      <div className="grid grid-cols-[2fr_1.2fr_0.9fr_40px] items-center gap-3.5 border-b border-border px-5.5 pt-3.5 pb-2.5 text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft">
        <span>Contributor</span>
        <span>Role</span>
        <span>Split</span>
        <span />
      </div>

      {rows &&
        rows.map((row) => (
          <div
            key={row.contributor_id}
            className="grid grid-cols-[2fr_1.2fr_0.9fr_40px] items-center gap-3.5 border-b border-border px-5.5 py-3"
          >
            <span className="text-[0.95rem]/[normal] font-bold text-text">
              {row.name}
            </span>
            <select
              defaultValue={row.role}
              aria-label={`Role for ${row.name}`}
              className="w-full rounded-sm border border-border bg-page px-2.5 py-1.75 text-[0.88rem]/[normal] text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            >
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="relative">
              <input
                type="number"
                defaultValue={row.split_percent}
                aria-label={`Split percent for ${row.name}`}
                className="w-full rounded-sm border border-border bg-page py-1.75 pr-6 pl-2.5 text-right text-[0.88rem]/[normal] text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
              />
              <span
                className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[0.85rem]/[normal] text-text-soft"
                aria-hidden="true"
              >
                %
              </span>
            </div>
            <button
              type="button"
              aria-label={`Remove ${row.name}`}
              className="h-7.5 w-7.5 rounded-sm border border-border text-[0.95rem]/[normal] text-text-soft hover:border-critical hover:text-critical focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-critical"
            >
              ×
            </button>
          </div>
        ))}

      <div className="border-b border-border px-5.5 py-3">
        {release.status !== "submitted" &&
        <button
        type="button"
        className="w-full rounded-sm border border-dashed border-border p-2.5 text-[0.88rem]/[normal] font-semibold text-text-soft hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          + Add contributor
        </button>
        }
      </div>

      <div
        className={`flex items-center justify-between px-5.5 py-3.5 text-[0.95rem]/[normal] font-bold ${
          isComplete ? "bg-good/10 text-good" : "bg-critical/10 text-critical"
        }`}
      >
        <span>Total split</span>
        <span>
          {splitsTotal ?? 0}%{" "}
          <span className="font-normal text-text-soft">of 100%</span>
        </span>
      </div>
    </Card>
  );
}
