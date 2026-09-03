import { useRef, useImperativeHandle, type Ref } from "react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import {
  createContributorSchema,
  type Contributor,
  type CreateContributorInput,
} from "@release-ready/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ROLE_LABELS } from "./ContributorSplitEditor";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addContributor } from "../../lib/api";

export type AddContributorDialogHandle = {
  open: () => void;
};

type AddContributorDialogProps = {
  ref?: Ref<AddContributorDialogHandle>;
  releaseId: string;
};

export function AddContributorDialog({
  ref,
  releaseId,
}: AddContributorDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(createContributorSchema),
  });

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.showModal(),
  }));

  const queryClient = useQueryClient();
  const addContributorMutation = useMutation({
    mutationFn: (formData: CreateContributorInput) => addContributor(formData),
    onSuccess: (newContributor) => {
      queryClient.setQueryData(
        ["contributors", releaseId],
        (old: Contributor[] | undefined) =>
          old ? [...old, newContributor] : [newContributor],
      );
      dialogRef.current?.close();
      reset();
    },
  });

  function onValid(data: CreateContributorInput) {
    addContributorMutation.mutate({ ...data });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="add-contributor-title"
      className="w-[min(400px,92vw)] h-80 rounded-lg border border-border bg-bg p-0 text-text backdrop:bg-[rgba(20,18,14,0.42)]"
    >
      <div className="border-b border-border px-5.5 pt-5 pb-4">
        <h2
          id="add-contributor-title"
          className="mb-1 text-[1.15rem]/[normal] font-bold"
        >
          Add contributor
        </h2>
      </div>

      <form
        id="add-contributor-form"
        method="dialog"
        className="flex flex-col gap-3.5 px-5.5 py-4.5"
        onSubmit={handleSubmit(onValid)}
      >
        <Field
          id="contributor-name"
          label="Name"
          hasError={!!errors.name}
          hint={errors.name?.message}
          {...register("name")}
        />
        <div>
          <label
            htmlFor="contributor-role"
            className="mb-1.25 block text-[0.8rem]/[normal] font-bold text-text"
          >
            Default role
          </label>
          <select
            id="contributor-role"
            className="w-full rounded-sm border border-border bg-page px-2.5 py-1.75 text-[0.88rem]/[normal] text-text focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            {...register("default_role")}
          >
            {Object.entries(ROLE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </form>

      <div className="flex justify-end gap-2.5 border-t border-border px-5.5 pt-4 pb-5">
        <Button
          variant="secondary"
          type="button"
          onClick={() => {
            dialogRef.current?.close();
            reset();
          }}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="add-contributor-form">
          Add contributor
        </Button>
      </div>
    </dialog>
  );
}
