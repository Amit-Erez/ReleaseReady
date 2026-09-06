import { SkeletonBar } from "./SkeletonBar";

const TRACK_SKELETON_ROW_COUNT = 3;

export function TracksTableSkeleton() {
  return (
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
  );
}
