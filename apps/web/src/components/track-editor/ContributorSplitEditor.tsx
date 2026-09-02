import {
  replaceTrackContributorsSchema,
  type Release,
  type ReplaceTrackContributorsInput,
  type TrackCredit,
} from "@release-ready/shared";
import { Card } from "../ui/Card";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/Button";

type ContributorSplitEditorProps = {
  rows: TrackCredit[];
  splitsTotal: number | null;
  release: Release;
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
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(
      z.object({ contributors: replaceTrackContributorsSchema }),
    ),
    defaultValues: { contributors: rows },
  });

  const watchedContributors = useWatch({
    control,
    name: "contributors",
  });

  const liveSplitsTotal = (watchedContributors ?? []).reduce(
    (sum, c) => sum + Number(c.split_percent || 0),
    0,
  );

  const isComplete = liveSplitsTotal === 100;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "contributors",
  });

  const onValid = ((data: { contributors: ReplaceTrackContributorsInput }) => {
  console.log(data); 
});

  return (
    <form onSubmit={handleSubmit(onValid)}>
      <Card>
        <div className="grid grid-cols-[2fr_1.2fr_0.9fr_40px] items-center gap-3.5 border-b border-border px-5.5 pt-3.5 pb-2.5 text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft">
          <span>Contributor</span>
          <span>Role</span>
          <span>Split</span>
          <span />
        </div>
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[2fr_1.2fr_0.9fr_40px] items-center gap-3.5 border-b border-border px-5.5 py-3"
          >
            <span className="text-[0.95rem]/[normal] font-bold text-text">
              {
                rows.find((r) => r.contributor_id === field.contributor_id)
                  ?.name
              }
            </span>
            <select
              aria-label={`Role for ${rows.find((r) => r.contributor_id === field.contributor_id)?.name}`}
              className="w-full rounded-sm border border-border bg-page px-2.5 py-1.75 text-[0.88rem]/[normal] text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
              {...register(`contributors.${index}.role`)}
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
                aria-label={`Split percent for ${rows.find((r) => r.contributor_id === field.contributor_id)?.name}`}
                className="w-full p-1 rounded-sm border border-border bg-page pr-6 text-right text-[0.88rem]/[normal] text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
                {...register(`contributors.${index}.split_percent`)}
              />
              <span
                className="pointer-events-none absolute top-1/2 right-4.5 -translate-y-1/2 text-[0.85rem]/[normal] text-text-soft"
                aria-hidden="true"
              >
                %
              </span>
            </div>
            {release.status !== "submitted" && (
              <button
                type="button"
                aria-label={`Remove ${rows.find((r) => r.contributor_id === field.contributor_id)?.name}`}
                onClick={() => remove(index)}
                className="h-7.5 w-7.5 rounded-sm border border-border text-[0.95rem]/[normal] text-text-soft hover:border-critical hover:text-critical focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-critical"
              >
                ×
              </button>
            )}
          </div>
        ))}

        <div className="border-b border-border px-5.5 py-3">
          {release.status !== "submitted" && (
            <button
              type="button"
              className="w-full rounded-sm border border-dashed border-border p-2.5 text-[0.88rem]/[normal] font-semibold text-text-soft hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              + Add contributor
            </button>
          )}
        </div>

        <div
          className={`flex items-center justify-between px-5.5 py-3.5 text-[0.95rem]/[normal] font-bold ${
            isComplete ? "bg-good/10 text-good" : "bg-critical/10 text-critical"
          }`}
        >
          <span>Total split</span>
          <span>
            {liveSplitsTotal ?? 0}%{" "}
            <span className="font-normal text-text-soft">of 100%</span>
          </span>
        </div>
      </Card>
            <Card className="mt-7 flex items-center justify-between gap-4 px-5.5 py-4.5">
        <span className="text-[0.88rem]/[normal] text-text-soft">
          Splits must total 100% before changes can be saved.
        </span>
        <Button
          type="submit"
          disabled={!isComplete || release.status === "submitted"}
          className="flex items-center justify-center w-30.75 max-h-9.5"
        >
          Save splits
        </Button>
      </Card>
    </form>
  );
}
