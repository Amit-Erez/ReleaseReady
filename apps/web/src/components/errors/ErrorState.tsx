type ErrorStateProps = {
  title: string;
  message: string;
  onRetry: () => void;
};

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div role="alert" className="flex flex-col items-center px-8 py-14 text-center">
      <span
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-critical/10 text-[1.15rem]/[normal] font-bold text-critical"
        aria-hidden="true"
      >
        !
      </span>
      <p className="mb-1.5 text-[1.15rem]/[normal] font-bold text-text">{title}</p>
      <p className="mb-5.5 max-w-[42ch] text-[0.9rem]/[normal] text-text-soft">
        Something went wrong talking to the server.{" "}
        <code className="rounded bg-critical/10 px-1.25 py-0.5 font-mono text-[0.85em] text-critical">
          {message}
        </code>
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-sm border border-border px-4.5 py-2.25 text-[0.92rem]/[normal] font-bold text-text hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Try again
      </button>
    </div>
  );
}
