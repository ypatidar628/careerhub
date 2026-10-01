import { useState, useEffect } from "react";
import { NavLink, Outlet, Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaCrown,
  FaShieldAlt,
  FaTachometerAlt,
  FaUsers,
  FaUserGraduate,
  FaBriefcase,
  FaFileAlt,
  FaLayerGroup,
  FaArrowLeft,
  FaBars,
  FaTimes,
  FaCheckCircle,
  FaServer,
  FaBell,
  FaLock,
  FaSun,
  FaMoon,
} from "react-icons/fa";
import LogoutButton from "../auth/LogoutButton";

export default function SuperAdminLayout() {
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Classic Dual Theme State: defaults to "light" for clean classic style
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("superadmin_theme");
    return saved || "light";
  });

  useEffect(() => {
    localStorage.setItem("superadmin_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const userRole = String(user?.role || "").toUpperCase();
  const isSuperAdmin = userRole === "SUPER_ADMIN";

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path.includes("/super-admin/dashboard")) return ["System Control", "Executive Dashboard"];
    if (path.includes("/super-admin/users")) return ["System Control", "User Management"];
    if (path.includes("/super-admin/admins")) return ["Security Governance", "Admin Provisioning"];
    if (path.includes("/super-admin/candidates")) return ["Talent Directory", "Candidates"];
    if (path.includes("/super-admin/recruiters")) return ["Enterprise Partners", "Recruiters & Companies"];
    if (path.includes("/super-admin/jobs")) return ["Catalog", "Job Postings"];
    if (path.includes("/super-admin/applications")) return ["Talent Pipeline", "Applications"];
    return ["Super Admin", "Overview"];
  };

  const breadcrumbs = getBreadcrumbs();

  const navSections = [
    {
      title: "ANALYTICS & CONTROL",
      links: [
        { to: "/super-admin/dashboard", label: "Executive Dashboard", icon: FaTachometerAlt },
        { to: "/super-admin/users", label: "All Users", icon: FaUsers },
      ],
    },
    {
      title: "ACCESS & GOVERNANCE",
      links: [
        ...(isSuperAdmin
          ? [{ to: "/super-admin/admins", label: "Admin Team", icon: FaShieldAlt }]
          : []),
        { to: "/super-admin/candidates", label: "Candidates", icon: FaUserGraduate },
        { to: "/super-admin/recruiters", label: "Recruiters & Companies", icon: FaBriefcase },
      ],
    },
    {
      title: "PLATFORM OPERATIONS",
      links: [
        { to: "/super-admin/jobs", label: "Job Postings", icon: FaFileAlt },
        { to: "/super-admin/applications", label: "Applications", icon: FaLayerGroup },
      ],
    },
  ];

  return (
    <div className={`flex min-h-screen font-sans ${theme === "dark" ? "dark bg-[#0b0f19] text-slate-100" : "bg-slate-50/75 text-slate-800"}`}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Classic Enterprise Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-68 flex-col border-r border-slate-800 bg-[#0f172a] text-slate-300 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand & Authority Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
          <Link to="/super-admin/dashboard" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-white shadow-xs transition group-hover:scale-105">
              <FaShieldAlt className="text-base" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm font-bold tracking-tight text-white">
                <span>CareerHub</span>
                <span className="rounded bg-brand/25 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-indigo-300 uppercase">
                  PRO
                </span>
              </div>
              <div className="text-[10px] font-medium tracking-wide text-slate-400">
                {isSuperAdmin ? "Super Admin Console" : "Admin Workspace"}
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition"
          >
            <FaTimes className="text-base" />
          </button>
        </div>

        {/* User Authority Card */}
        <div className="p-3.5">
          <div className="rounded-xl border border-slate-800/90 bg-slate-900/80 p-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-bold text-xs ${
                  isSuperAdmin
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    : "bg-indigo-400/20 text-indigo-300 border border-indigo-400/30"
                }`}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-bold text-white">
                  {user?.name || "Administrator"}
                </div>
                <div className="truncate text-[10px] text-slate-400">
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="mt-2.5 flex items-center justify-between border-t border-slate-800 pt-2 text-[10px]">
              <span
                className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-bold uppercase tracking-wider ${
                  isSuperAdmin
                    ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                    : "bg-indigo-400/15 text-indigo-300 border border-indigo-400/30"
                }`}
              >
                {isSuperAdmin ? (
                  <>
                    <FaCrown className="text-[9px]" />
                    <span>Super Admin</span>
                  </>
                ) : (
                  <>
                    <FaShieldAlt className="text-[9px]" />
                    <span>Admin</span>
                  </>
                )}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-4 overflow-y-auto px-3 py-1">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
              {section.links.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition ${
                      isActive
                        ? "bg-brand text-white shadow-xs font-semibold"
                        : "text-slate-400 hover:bg-slate-850 hover:text-slate-100"
                    }`}
                  >
                    <Icon
                      className={`text-xs transition ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Security Rule Pill */}
        <div className="px-3 py-2">
          <div className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-[10px] text-slate-400">
            <FaLock className="text-amber-400 text-xs shrink-0" />
            <span className="truncate">Single Super Admin Guard Active</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800 p-3 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/90 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <FaArrowLeft className="text-xs" />
            <span>Return to Main App</span>
          </Link>
          <div className="pt-0.5">
            <LogoutButton showLabel />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Classic Clean Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 lg:hidden transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              aria-label="Open sidebar menu"
            >
              <FaBars className="text-sm" />
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-slate-500 hidden sm:inline dark:text-slate-400">
                {breadcrumbs[0]}
              </span>
              <span className="text-slate-300 hidden sm:inline dark:text-slate-600">/</span>
              <span className="font-semibold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
                {breadcrumbs[1]}
              </span>
            </div>
          </div>

          {/* Right: Operational Status, Theme Toggle, and Alerts */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* System Status Pill */}
            <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300">
              <FaServer className="text-cyan-600 text-xs dark:text-cyan-400" />
              <span>Cluster:</span>
              <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operational
              </span>
            </div>

            {/* Guard Indicator */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:border-amber-800/40 dark:bg-amber-950/30 dark:text-amber-300">
              <FaCheckCircle className="text-xs text-amber-500" />
              <span>Authority Guarded</span>
            </div>

            {/* Instant Theme Switcher Toggle (Classic Light / Slate Dark) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${theme === "light" ? "Classic Slate Dark" : "Classic Clean Light"} theme`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {theme === "light" ? (
                <>
                  <FaSun className="text-amber-500 text-xs" />
                  <span className="hidden sm:inline">Classic Light</span>
                </>
              ) : (
                <>
                  <FaMoon className="text-indigo-400 text-xs" />
                  <span className="hidden sm:inline">Slate Dark</span>
                </>
              )}
            </button>

            {/* Notification Button */}
            <button
              type="button"
              title="System Alerts"
              className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <FaBell className="text-xs" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-brand ring-1 ring-white dark:ring-slate-900" />
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
