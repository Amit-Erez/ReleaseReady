import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-bg px-7 py-3.5">
      <Link to="/dashboard" className="text-lg font-bold tracking-tight text-text">
        ReleaseReady
      </Link>
      <ThemeToggle />
    </header>
  );
}
