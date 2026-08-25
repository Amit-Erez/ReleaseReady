import { useRef, useImperativeHandle, type Ref } from "react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createTrackSchema,
  type CreateTrackInput,
} from "@release-ready/shared";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createNewTrack } from "../../lib/api";

export type AddTrackDialogHandle = {
  open: () => void;
};

type AddTrackDialogProps = {
  ref?: Ref<AddTrackDialogHandle>;
  nextTrackNumber: number;
  releaseId: string;
};

const addTrackFormSchema = createTrackSchema.omit({ track_number: true });
export type TrackFormInput = z.infer<typeof addTrackFormSchema>;

export function AddTrackDialog({
  ref,
  nextTrackNumber,
  releaseId,
}: AddTrackDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(addTrackFormSchema),
  });

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.showModal(),
  }));

  const queryClient = useQueryClient();
  const addTrackMutation = useMutation({
    mutationFn: (formData: CreateTrackInput & { releaseId: string }) =>
      createNewTrack(formData.releaseId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tracks", releaseId],
      });
      dialogRef.current?.close();
      reset();
    },
  });

  function onValid(data: TrackFormInput) {
    addTrackMutation.mutate({
      releaseId,
      ...data,
      track_number: nextTrackNumber,
    });
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="add-track-title"
      className="w-[min(400px,92vw)] rounded-lg border border-border bg-bg p-0 text-text backdrop:bg-[rgba(20,18,14,0.42)]"
    >
      <div className="border-b border-border px-5.5 pt-5 pb-4">
        <h2
          id="add-track-title"
          className="mb-1 text-[1.15rem]/[normal] font-bold"
        >
          Add track
        </h2>
        <p className="text-[0.85rem]/[normal] text-text-soft">
          This will be added as track {nextTrackNumber}. ISRC can be added
          later, once it's assigned.
        </p>
      </div>

      <form
        id="add-track-form"
        method="dialog"
        className="flex flex-col gap-3.5 px-5.5 py-4.5"
        onSubmit={handleSubmit(onValid)}
      >
        <Field
          id="track-title"
          label="Title"
          placeholder="e.g. Neon Static"
          hasError={!!errors.title}
          hint={errors.title?.message}
          {...register("title")}
        />
        <Field
          id="track-isrc"
          label="ISRC"
          placeholder="Optional for now"
          hasError={!!errors.isrc}
          hint={errors.isrc?.message ??"Contributors and splits are added after the track is created."}
          {...register("isrc")}
        />
      </form>

      <div className="flex justify-end gap-2.5 border-t border-border px-5.5 pt-4 pb-5">
        <Button
          variant="secondary"
          type="button"
          onClick={() => {dialogRef.current?.close(); reset();}}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="add-track-form">
          Add track
        </Button>
      </div>
    </dialog>
  );
}
