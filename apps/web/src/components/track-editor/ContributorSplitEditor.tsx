import {
  replaceTrackContributorsSchema,
  type Contributor,
  type Release,
  type ReplaceTrackContributorsInput,
  type TrackCredit,
} from "@release-ready/shared";
import { Card } from "../ui/Card";
import {
  useFieldArray,
  useForm,
  useWatch,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/Button";
import {
  AddContributorDialog,
  type AddContributorDialogHandle,
} from "./AddContributorDialog";
import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTrackCreditSplits } from "../../lib/api";

type ContributorSplitEditorProps = {
  rows: TrackCredit[];
  release: Release;
  contributors: Contributor[];
  releaseId: string;
  trackId: string;
};

type ContributorsFormValues = z.input<typeof replaceTrackContributorsSchema>;

type ContributorCellProps = {
  rows: TrackCredit[];
  id: number;
  index: number;
  register: UseFormRegister<{ contributors: ContributorsFormValues }>;
  contributors: Contributor[];
  errors: FieldErrors<{ contributors: ContributorsFormValues }>;
};

export const ROLE_LABELS: Record<TrackCredit["role"], string> = {
  composer: "Composer",
  producer: "Producer",
  arranger: "Arranger",
  lyricist: "Lyricist",
};

function ContributorCell({
  rows,
  id,
  index,
  register,
  contributors,
  errors,
}: ContributorCellProps) {
  const existingContributor = rows.find((r) => r.contributor_id === id);

  return existingContributor ? (
    <span className="text-[0.95rem]/[normal] font-bold text-text">
      {existingContributor.name}
    </span>
  ) : (
    <div>
      <select
        {...register(`contributors.${index}.contributor_id`)}
        className={`w-full rounded-sm border ${
          errors.contributors?.[index]?.contributor_id
            ? "border-critical"
            : "border-border"
        } bg-page px-2.5 py-1.75 text-[0.88rem]/[normal] text-text focus-visible:outline-2 focus-visible:outline-offset-1 ${
          errors.contributors?.[index]?.contributor_id
            ? "focus-visible:outline-critical"
            : "focus-visible:outline-accent"
        }`}
      >
        {contributors.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      {errors.contributors?.[index]?.contributor_id && (
        <p className="mt-1 text-[0.74rem]/[normal] text-text-soft">
          {errors.contributors[index]?.contributor_id?.message}
        </p>
      )}
    </div>
  );
}

export function ContributorSplitEditor({
  rows,
  release,
  contributors,
  releaseId,
  trackId,
}: ContributorSplitEditorProps) {
  const addContributorDialogRef = useRef<AddContributorDialogHandle>(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
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

  const queryClient = useQueryClient();
  const updateCreditsMutation = useMutation({
    mutationFn: (formData: {contributors: ReplaceTrackContributorsInput;  trackId: string }) =>
      createTrackCreditSplits(formData.contributors, formData.trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["credits", trackId],
      });
    },
  });

  const onValid = (data: { contributors: ReplaceTrackContributorsInput }) => {
  updateCreditsMutation.mutate({
    ...data, trackId: trackId
  })
  };

  useEffect(() => {
      reset({contributors: rows})
  }, [rows, reset])

  return (
    <>
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
              <ContributorCell
                rows={rows}
                id={Number(field.contributor_id)}
                index={index}
                register={register}
                contributors={contributors}
                errors={errors}
              />
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
              <div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    aria-label={`Split percent for ${rows.find((r) => r.contributor_id === field.contributor_id)?.name}`}
                    className={`w-full p-1 rounded-sm border ${
                      errors.contributors?.[index]?.split_percent
                        ? "border-critical"
                        : "border-border"
                    } bg-page pr-6 text-right text-[0.88rem]/[normal] text-text focus-visible:outline-2 focus-visible:outline-offset-1 ${
                      errors.contributors?.[index]?.split_percent
                        ? "focus-visible:outline-critical"
                        : "focus-visible:outline-accent"
                    }`}
                    {...register(`contributors.${index}.split_percent`)}
                  />
                  <span
                    className="pointer-events-none absolute top-1/2 right-4.5 -translate-y-1/2 text-[0.85rem]/[normal] text-text-soft"
                    aria-hidden="true"
                  >
                    %
                  </span>
                </div>
                {errors.contributors?.[index]?.split_percent && (
                  <p className="mt-1 text-[0.74rem]/[normal] text-text-soft">
                    {errors.contributors[index]?.split_percent?.message}
                  </p>
                )}
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

          <div className="flex border-b border-border px-5.5 py-3">
            {release.status !== "submitted" && (
              <>
                <button
                  type="button"
                  onClick={() => addContributorDialogRef.current?.open()}
                  className="w-1/4 mr-2 bg-accent/10 rounded-sm border border-dashed border-accent p-2.5 text-[0.88rem]/[normal] font-semibold text-accent hover:border-accent hover:text-accent hover:bg-accent/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  + Add contributor
                </button>
                <button
                  type="button"
                  onClick={() =>
                    append({
                      contributor_id: 0,
                      role: "composer",
                      split_percent: 0,
                    })
                  }
                  className="w-full rounded-sm border border-dashed border-border p-2.5 text-[0.88rem]/[normal] font-semibold text-text-soft hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  + Add line
                </button>
              </>
            )}
          </div>

          <div
            className={`flex items-center justify-between px-5.5 py-3.5 text-[0.95rem]/[normal] font-bold ${
              isComplete
                ? "bg-good/10 text-good"
                : "bg-critical/10 text-critical"
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
      <AddContributorDialog
        ref={addContributorDialogRef}
        releaseId={releaseId}
      />
    </>
  );
}
