import { useSelector } from "react-redux";
import {
  FiBriefcase,
  FiUser,
  FiSettings,
  FiLayers,
  FiPlusCircle,
  FiMessageSquare,
} from "react-icons/fi";
import { NavLink, Outlet } from "react-router-dom";

export default function DashboardShell() {
  const user = useSelector((s) => s.auth.user);
  const navClass = ({ isActive }) =>
    `flex items-center gap-2 whitespace-nowrap rounded-xl p-3 transition ${isActive ? "bg-white text-ink shadow-lg" : "hover:bg-white/10"}`;
  const links = (
    <>
      <NavLink className={navClass} to="/dashboard">
        <FiBriefcase />
        Overview
      </NavLink>
      <NavLink className={navClass} to="/applications">
        <FiLayers />
        {user?.role === "recruiter" ? "Applicants" : "Applications"}
      </NavLink>
      <NavLink className={navClass} to="/messages">
        <FiMessageSquare />
        Messages
      </NavLink>
      {user?.role === "recruiter" && (
        <>
          <NavLink className={navClass} to="/manage-jobs">
            <FiPlusCircle />
            Manage jobs
          </NavLink>
          <NavLink className={navClass} to="/post-job">
            <FiPlusCircle />
            Post a job
          </NavLink>
        </>
      )}
      <NavLink className={navClass} to="/profile">
        <FiUser />
        Profile
      </NavLink>
      <NavLink className={navClass} to="/settings">
        <FiSettings />
        Settings
      </NavLink>
    </>
  );

  return (
    <div className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="hidden rounded-2xl bg-ink p-5 text-white shadow-xl lg:block self-start sticky top-20">
        <p className="font-mono-display text-xs uppercase tracking-widest text-slate-300">
          {user?.role} workspace
        </p>
        <h2 className="mb-6 mt-1 text-lg font-bold">
          Welcome, {user?.name?.split(" ")[0] || "User"}
        </h2>
        <nav aria-label="Dashboard navigation" className="space-y-2 text-sm">
          {links}
        </nav>
      </aside>
      <nav
        aria-label="Dashboard navigation"
        className="flex gap-2 overflow-x-auto rounded-2xl bg-ink p-2 text-sm text-white lg:hidden"
      >
        {links}
      </nav>
      <main className="min-w-0 w-full">
        <Outlet />
      </main>
    </div>
  );
}
