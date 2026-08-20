import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-page">
      <Link
        to="/dashboard"
        className="text-3xl font-bold tracking-tight text-text hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        ReleaseReady
      </Link>
      <span className="text-sm text-text-soft">Click to enter</span>
    </main>
  );
}
