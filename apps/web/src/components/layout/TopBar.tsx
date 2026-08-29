import { Link } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import logo from "../../assets/onlyLogo.png";
import logoText from "../../assets/onlyText-light.png";
import logoTextDark from "../../assets/onlyText-dark.png"

export function TopBar() {
  return (
    <header className="flex items-center justify-between border-b border-border bg-bg px-7 py-3.5">
      <Link
        to="/dashboard"
        className="text-lg font-bold tracking-tight text-text"
      >
        <div className="flex items-center">
          <img src={logo} alt="" height={30} width={30} className="mr-2" />
          <img src={logoText} alt="ReleaseReady" className="h-5.5 w-auto mt-1 dark:hidden" />
          <img src={logoTextDark} alt="ReleaseReady" className="h-5.5 w-auto mt-1 hidden dark:block" />
        </div>
      </Link>
      <ThemeToggle />
    </header>
  );
}
