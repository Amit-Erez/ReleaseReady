import { SkeletonBar } from "./SkeletonBar";
import { Card } from "../ui/Card";

const TRACK_SKELETON_ROW_COUNT = 3;
const READINESS_SKELETON_ROW_COUNT = 6;

/**
 * Like SkeletonBar, but with no built-in height, for the handful of shapes
 * here (title, pill, buttons, icon circles) that aren't the default 14px bar.
 */
function SkeletonShape({ className = "" }: { className?: string }) {
  return (
    <span className={`relative block overflow-hidden bg-skeleton ${className}`}>
      <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-skeleton-shine to-transparent motion-reduce:animate-none motion-reduce:opacity-70" />
    </span>
  );
}

export function ReleaseDetailSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading release…</span>
      <div aria-hidden="true">
        <div className="mb-8">
          <SkeletonShape className="mb-2.5 h-5.5 w-70 rounded" />
          <SkeletonShape className="mb-4 h-3.75 w-40 rounded" />
          <div className="flex flex-wrap items-center gap-3.5">
            <SkeletonShape className="h-5 w-16 rounded-sm" />
            <SkeletonBar className="w-35" />
            <SkeletonBar className="w-25" />
          </div>
        </div>

        <div className="flex items-start gap-6">
          <section className="flex min-w-0 flex-1 flex-col">
            <div className="mb-2.5 flex min-h-6.75 items-center justify-between gap-3">
              <SkeletonShape className="h-3 w-17.5 rounded" />
              <SkeletonShape className="h-6.5 w-23 rounded-sm" />
            </div>
            <Card className="flex h-71.5 flex-col overflow-hidden">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="w-7 px-5 py-3" />
                    <th className="px-5 py-3" />
                    <th className="px-5 py-3" />
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: TRACK_SKELETON_ROW_COUNT }).map((_, i) => (
                    <tr key={i} className="border-b border-border last:border-b-0">
                      <td className="px-5 py-3.5">
                        <SkeletonBar className="w-3.5" />
                      </td>
                      <td className="px-5 py-3.5">
                        <SkeletonBar className="w-3/4" />
                      </td>
                      <td className="px-5 py-3.5">
                        <SkeletonBar className="w-5/6" />
                      </td>
                      <td className="px-5 py-3.5">
                        <SkeletonBar className="w-1/2" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </section>

          <section className="flex min-w-0 flex-1 flex-col">
            <div className="mb-2.5 flex min-h-6.75 items-center">
              <SkeletonShape className="h-3 w-17.5 rounded" />
            </div>
            <Card className="flex h-71.5 flex-col overflow-hidden">
              <ul>
                {Array.from({ length: READINESS_SKELETON_ROW_COUNT }).map((_, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 border-b border-border px-5 py-3.25 last:border-b-0"
                  >
                    <SkeletonShape className="h-4 w-4 shrink-0 rounded-full" />
                    <SkeletonBar className="flex-1" />
                  </li>
                ))}
              </ul>
            </Card>
          </section>
        </div>

        <Card className="mt-7 flex items-center justify-between gap-4 px-5.5 py-4.5">
          <SkeletonBar className="w-37.5" />
          <SkeletonShape className="h-9.5 w-32.5 rounded-sm" />
        </Card>
      </div>
    </div>
  );
}
