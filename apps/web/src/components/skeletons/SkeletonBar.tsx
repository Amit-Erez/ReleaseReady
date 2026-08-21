export function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <span className={`relative block h-3.5 overflow-hidden rounded bg-skeleton ${className}`}>
      <span className="absolute inset-0 animate-shimmer bg-linear-to-r from-transparent via-skeleton-shine to-transparent motion-reduce:animate-none motion-reduce:opacity-70" />
    </span>
  );
}
