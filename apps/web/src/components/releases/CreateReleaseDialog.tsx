import { useRef, useImperativeHandle, type Ref } from "react";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";

export type CreateReleaseDialogHandle = {
  open: () => void;
};

type CreateReleaseDialogProps = {
  ref?: Ref<CreateReleaseDialogHandle>;
};

export function CreateReleaseDialog({ ref }: CreateReleaseDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useImperativeHandle(ref, () => ({
    open: () => dialogRef.current?.showModal(),
  }));

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="create-release-title"
      className="w-[min(440px,92vw)] rounded-lg border border-border bg-bg p-0 text-text backdrop:bg-[rgba(20,18,14,0.42)]"
    >
      <div className="border-b border-border px-5.5 pt-5 pb-4">
        <h2 id="create-release-title" className="mb-1 text-[1.15rem]/[normal] font-bold">
          New release
        </h2>
        <p className="text-[0.85rem]/[normal] text-text-soft">
          You can leave title and UPC blank for now and fill them in later.
        </p>
      </div>

      <form id="create-release-form" method="dialog" className="flex flex-col gap-3.5 px-5.5 py-4.5">
        <Field id="artist-name" label="Artist name" placeholder="e.g. Nova Sinclair" />
        <Field
          id="release-title"
          label="Title"
          placeholder="Optional for now"
          hint="Required before this release can be submitted."
        />
        <Field id="upc" label="UPC" placeholder="12 or 13 digits, optional for now" />
        <Field id="release-date" label="Release date" type="date" />
      </form>

      <div className="flex justify-end gap-2.5 border-t border-border px-5.5 pt-4 pb-5">
        <Button variant="secondary" type="button" onClick={() => dialogRef.current?.close()}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" form="create-release-form">
          Create release
        </Button>
      </div>
    </dialog>
  );
}
