import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FiMenu, FiMoon, FiSun, FiX } from "react-icons/fi";
import { IconButton, Tooltip } from "@mui/material";
import { useApp } from "../../context/AppContext";
import LogoMark from "../common/LogoMark";
import { useSelector } from "react-redux";
import LogoutButton from "../auth/LogoutButton";

const navClass = ({ isActive }) =>
  `rounded-lg px-3 py-2.5 transition ${
    isActive
      ? "bg-brand/10 text-brand"
      : "text-slate-600 hover:bg-slate-100 hover:text-brand dark:text-slate-300 dark:hover:bg-slate-800"
  }`;

export default function SiteHeader() {
  const { dark, setDark } = useApp();
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-5">
        <LogoMark />
        <nav className="hidden items-center gap-1 text-sm font-medium lg:flex">
          <NavLink className={navClass} to="/">
            Home
          </NavLink>
          <NavLink className={navClass} to="/jobs">
            Explore jobs
          </NavLink>
          {user && (
            <NavLink className={navClass} to="/dashboard">
              Dashboard
            </NavLink>
          )}
        </nav>
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-2">
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
                className="hidden max-w-40 truncate text-sm font-semibold transition hover:text-brand lg:block"
                to="/profile"
              >
                {user.name}
              </Link>
              <div className="hidden lg:block">
                <LogoutButton />
              </div>
            </>
          ) : (
            <Link
              to="/auth"
              className="hidden rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:shadow-lg lg:inline-flex"
            >
              Sign in
            </Link>
          )}
          <button
            type="button"
            className="rounded-lg border border-slate-200 p-2 text-xl hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800 lg:hidden"
            aria-label={
              menuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>
      {menuOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-30 bg-slate-950/40 lg:hidden"
            aria-label="Close navigation menu"
            onClick={() => setMenuOpen(false)}
          />
          <nav
            id="mobile-navigation"
            aria-label="Mobile navigation"
            className="absolute inset-x-0 top-full z-40 border-b border-t border-slate-200/80 bg-white px-4 py-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 lg:hidden"
          >
            <div className="mx-auto flex max-w-7xl flex-col gap-1 text-sm font-medium">
              <NavLink className={navClass} to="/">
                Home
              </NavLink>
              <NavLink className={navClass} to="/jobs">
                Explore jobs
              </NavLink>
              {user && (
                <>
                  <NavLink className={navClass} to="/dashboard">
                    Dashboard
                  </NavLink>
                  <NavLink className={navClass} to="/applications">
                    {user.role === "recruiter" ? "Applicants" : "Applications"}
                  </NavLink>
                  <NavLink className={navClass} to="/profile">
                    Profile
                  </NavLink>
                  <NavLink className={navClass} to="/settings">
                    Settings
                  </NavLink>
                  {user.role === "recruiter" && (
                    <>
                      <NavLink className={navClass} to="/manage-jobs">
                        Manage jobs
                      </NavLink>
                      <NavLink className={navClass} to="/post-job">
                        Post a job
                      </NavLink>
                    </>
                  )}
                  <div className="mt-2 border-t border-slate-200 pt-2 dark:border-slate-800">
                    <LogoutButton showLabel />
                  </div>
                </>
              )}
              {!user && (
                <Link
                  to="/auth"
                  className="mt-2 rounded-lg bg-brand px-3 py-2.5 text-center font-semibold text-white"
                >
                  Sign in
                </Link>
              )}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
