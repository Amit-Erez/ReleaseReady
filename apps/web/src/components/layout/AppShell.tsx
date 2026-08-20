import { Outlet } from "react-router-dom";
import { TopBar } from "./TopBar";

export function AppShell() {
  return (
    <div className="min-h-screen bg-page">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-sm focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-contrast focus:outline-none"
      >
        Skip to main content
      </a>
      <TopBar />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-5xl px-7 py-10">
        <Outlet />
      </main>
    </div>
  );
}
