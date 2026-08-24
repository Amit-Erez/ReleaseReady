type CompactErrorStateProps = {
  title: string;
  message: string;
  onRetry: () => void;
};

export function CompactErrorState({ title, message, onRetry }: CompactErrorStateProps) {
  return (
    <div role="alert" className="flex flex-1 flex-col items-center justify-center p-5 text-center">
      <span
        className="mb-2 flex h-6.5 w-6.5 items-center justify-center rounded-full bg-critical/10 text-[0.85rem]/[normal] font-bold text-critical"
        aria-hidden="true"
      >
        !
      </span>
      <p className="mb-1 text-[0.85rem]/[normal] font-bold text-text">{title}</p>
      <p className="mb-3.5 max-w-[30ch] text-[0.78rem]/[normal] text-text-soft">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-sm border border-border px-3.5 py-1.5 text-[0.8rem]/[normal] font-bold text-text hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Try again
      </button>
    </div>
  );
}
