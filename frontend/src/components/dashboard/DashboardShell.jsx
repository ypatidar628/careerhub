import { useSelector } from "react-redux";
import {
  FiBriefcase,
  FiUser,
  FiSettings,
  FiLayers,
  FiPlusCircle,
} from "react-icons/fi";
import { NavLink, Outlet } from "react-router-dom";
// Dashboard links use semantic navigation and clear icon labels for keyboard and screen-reader users.
export default function DashboardShell() {
  const user = useSelector((s) => s.auth.user);
  const navClass = ({ isActive }) =>
    `flex items-center gap-2 rounded-xl p-3 transition ${isActive ? "bg-white text-ink shadow-lg" : "hover:translate-x-1 hover:bg-white/10"}`;
  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 md:grid-cols-[210px_1fr]">
      <aside className="rounded-2xl bg-ink p-5 text-white shadow-xl">
        <p className="font-mono-display text-xs uppercase tracking-widest text-slate-300">
          {user.role} workspace
        </p>
        <h2 className="mb-6 mt-1 text-lg font-bold">
          Welcome, {user.name.split(" ")[0]}
        </h2>
        <nav aria-label="Dashboard navigation" className="space-y-2 text-sm">
          <NavLink className={navClass} to="/dashboard">
            <FiBriefcase />
            Overview
          </NavLink>
          <NavLink className={navClass} to="/applications">
            <FiLayers />
            {user.role === "recruiter" ? "Applicants" : "Applications"}
          </NavLink>
          {user.role === "recruiter" && (
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
        </nav>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
