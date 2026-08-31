import { SkeletonBar } from "./SkeletonBar";
import { Card } from "../ui/Card";

const CREDIT_SKELETON_ROW_COUNT = 2;

function SkeletonShape({ className = "" }: { className?: string }) {
  return (
    <span className={`relative block overflow-hidden bg-skeleton ${className}`}>
      <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-skeleton-shine to-transparent motion-reduce:animate-none motion-reduce:opacity-70" />
    </span>
  );
}

export function TrackEditorSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading track…</span>
      <div aria-hidden="true">
        <SkeletonShape className="mb-5.5 h-3.75 w-30 rounded" />

        <div className="mb-7">
          <SkeletonShape className="mb-1.5 h-6.5 w-55 rounded" />
          <SkeletonShape className="h-4 w-20 rounded" />
        </div>

        <div>
          <SkeletonShape className="mb-2.5 h-3 w-25 rounded" />
          <Card className="flex gap-4.5 px-5.5 py-5">
            <div className="flex-2">
              <SkeletonShape className="mb-1.25 h-3.25 w-10 rounded" />
              <SkeletonShape className="h-9.5 w-full rounded-sm" />
            </div>
            <div className="flex-2">
              <SkeletonShape className="mb-1.25 h-3.25 w-10 rounded" />
              <SkeletonShape className="h-9.5 w-full rounded-sm" />
            </div>
          </Card>
        </div>

        <div className="mt-7">
          <SkeletonShape className="mb-2.5 h-3 w-40 rounded" />
          <Card className="overflow-hidden">
            <div className="grid grid-cols-[2fr_1.2fr_0.9fr_40px] items-center gap-3.5 border-b border-border px-5.5 py-3">
              <SkeletonShape className="h-3 w-20 rounded" />
              <SkeletonShape className="h-3 w-10 rounded" />
              <SkeletonShape className="h-3 w-8 rounded" />
              <span />
            </div>
            {Array.from({ length: CREDIT_SKELETON_ROW_COUNT }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-[2fr_1.2fr_0.9fr_40px] items-center gap-3.5 border-b border-border px-5.5 py-3"
              >
                <SkeletonBar className="w-2/3" />
                <SkeletonShape className="h-7.5 w-full rounded-sm" />
                <SkeletonShape className="h-7.5 w-full rounded-sm" />
                <SkeletonShape className="h-7.5 w-7.5 rounded-sm" />
              </div>
            ))}
            <div className="flex items-center justify-between px-5.5 py-3.5">
              <SkeletonBar className="w-20" />
              <SkeletonBar className="w-24" />
            </div>
          </Card>
        </div>

        <Card className="mt-7 flex items-center justify-between gap-4 px-5.5 py-4.5">
          <SkeletonBar className="w-62.5" />
          <SkeletonShape className="h-9.5 w-32.5 rounded-sm" />
        </Card>
      </div>
    </div>
  );
}
