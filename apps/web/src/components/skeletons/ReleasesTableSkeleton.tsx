import { SkeletonBar } from "./SkeletonBar";

const SKELETON_ROW_COUNT = 4;

export function ReleasesTableSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading releases…</span>
      <table className="w-full border-collapse" aria-hidden="true">
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className="px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft">Title</th>
            <th scope="col" className="px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft">Artist</th>
            <th scope="col" className="px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft">Release date</th>
            <th scope="col" className="px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft">Status</th>
            <th scope="col" className="px-5 py-3 text-left text-[0.72rem]/[normal] font-bold uppercase tracking-wide text-text-soft">Readiness</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => (
            <tr key={i} className="border-b border-border last:border-b-0">
              <td className="px-5 py-3.5">
                <SkeletonBar className="w-3/5" />
              </td>
              <td className="px-5 py-3.5">
                <SkeletonBar className="w-2/3" />
              </td>
              <td className="px-5 py-3.5">
                <SkeletonBar className="w-1/2" />
              </td>
              <td className="px-5 py-3.5">
                <SkeletonBar className="h-5 w-13 rounded-sm" />
              </td>
              <td className="px-5 py-3.5">
                <SkeletonBar className="w-4/5" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
