type CompactEmptyStateProps = {
  title: string;
  message: string;
};

export function CompactEmptyState({ title, message }: CompactEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-5 text-center">
      <span
        className="mb-2 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-text-soft/10 text-[0.85rem]/[normal] font-bold text-text-soft"
        aria-hidden="true"
      >
        –
      </span>
      <p className="mb-1 text-[0.85rem]/[normal] font-bold text-text">{title}</p>
      <p className="max-w-[30ch] text-[0.78rem]/[normal] text-text-soft">{message}</p>
    </div>
  );
}
