import { Link } from "react-router-dom";
import lightLogo from "../assets/Light-selection.png"

export function LandingPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-page">
      <Link
        to="/dashboard"
        className="text-3xl font-bold tracking-tight text-text hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
      >
        <img
          src={lightLogo}
          alt="ReleaseReady"
          className="transition-transform duration-300 ease-out hover:-translate-y-1 motion-reduce:hover:translate-y-0"
        />
        
      </Link>
      <span className="text-sm text-text-soft">Click to enter</span>
    </main>
  );
}
