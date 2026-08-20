import { useRef, useImperativeHandle, type Ref } from "react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";

export type AddTrackDialogHandle = {
  open: () => void;
};

type AddTrackDialogProps = {
  ref?: Ref<AddTrackDialogHandle>;
  nextTrackNumber: number;
};

export function AddTrackDialog({ ref, nextTrackNumber }: AddTrackDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.showModal(),
  }));

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="add-track-title"
      className="w-[min(400px,92vw)] rounded-lg border border-border bg-bg p-0 text-text backdrop:bg-[rgba(20,18,14,0.42)]"
    >
      <div className="border-b border-border px-5.5 pt-5 pb-4">
        <h2 id="add-track-title" className="mb-1 text-[1.15rem]/[normal] font-bold">
          Add track
        </h2>
        <p className="text-[0.85rem]/[normal] text-text-soft">
          This will be added as track {nextTrackNumber}. ISRC can be added later, once it's assigned.
        </p>
      </div>

      <form id="add-track-form" method="dialog" className="flex flex-col gap-3.5 px-5.5 py-4.5">
        <Field id="track-title" label="Title" placeholder="e.g. Neon Static" />
        <Field
          id="track-isrc"
          label="ISRC"
          placeholder="Optional for now"
          hint="Contributors and splits are added after the track is created."
        />
      </form>

      <div className="flex justify-end gap-2.5 border-t border-border px-5.5 pt-4 pb-5">
        <Button variant="secondary" type="button" onClick={() => dialogRef.current?.close()}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="add-track-form">
          Add track
        </Button>
      </div>
    </dialog>
  );
}
