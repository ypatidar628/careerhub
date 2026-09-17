import { Link, NavLink } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import { IconButton, Tooltip } from "@mui/material";
import { useApp } from "../../context/AppContext";
import LogoMark from "../common/LogoMark";
import { useSelector } from "react-redux";
import LogoutButton from "../auth/LogoutButton";
// Shared header keeps theme and session controls consistent on public and protected routes.
export default function SiteHeader() {
  const { dark, setDark } = useApp();
  const user = useSelector((s) => s.auth.user);
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <LogoMark />
        <nav className="hidden gap-6 text-sm font-medium md:flex">
          <NavLink className="hover:text-brand" to="/jobs">
            Explore jobs
          </NavLink>
          {user && (
            <NavLink className="hover:text-brand" to="/dashboard">
              Dashboard
            </NavLink>
          )}
        </nav>
        <div className="flex items-center gap-3">
          <Tooltip title={dark ? "Use light mode" : "Use dark mode"}>
            <IconButton
              aria-label="Toggle color theme"
              onClick={() => setDark(!dark)}
              sx={{ color: "inherit" }}
            >
              {dark ? <FiSun /> : <FiMoon />}
            </IconButton>
          </Tooltip>
          {user ? (
            <>
              <Link
                className="hidden text-sm font-semibold transition hover:text-brand sm:block"
                to="/profile"
              >
                {user.name}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              to="/auth"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
