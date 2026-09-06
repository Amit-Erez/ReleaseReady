type EmptyStateProps = {
  title: string;
  message: string;
  action?: { label: string; onClick: () => void };
};

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-8 py-14 text-center">
      <span
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-text-soft/10 text-[1.15rem]/[normal] font-bold text-text-soft"
        aria-hidden="true"
      >
        –
      </span>
      <p className="mb-1.5 text-[1.15rem]/[normal] font-bold text-text">{title}</p>
      <p className="mb-5.5 max-w-[42ch] text-[0.9rem]/[normal] text-text-soft">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="rounded-sm border border-border px-4.5 py-2.25 text-[0.92rem]/[normal] font-bold text-text hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
