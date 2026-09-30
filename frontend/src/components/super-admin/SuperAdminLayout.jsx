import { useState } from "react";
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
} from "react-icons/fa";
import LogoutButton from "../auth/LogoutButton";

export default function SuperAdminLayout() {
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-brand selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Brand & Authority Header */}
        <div className="flex h-20 items-center justify-between border-b border-slate-800/80 px-6">
          <Link to="/super-admin/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand via-purple-600 to-cyan-500 shadow-lg shadow-brand/25 ring-1 ring-white/20 transition group-hover:scale-105">
              <FaShieldAlt className="text-xl text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-base font-extrabold tracking-tight text-white">
                <span>Career</span>
                <span className="text-brand">Hub</span>
                <span className="rounded bg-brand/20 px-1.5 py-0.2 text-[9px] font-bold tracking-widest text-brand uppercase">PRO</span>
              </div>
              <div className="text-[10px] font-semibold tracking-wider uppercase text-cyan-400">
                {isSuperAdmin ? "Super Admin Portal" : "Admin Workspace"}
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* User Authority Badge Card */}
        <div className="p-4">
          <div
            className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
              isSuperAdmin
                ? "border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-950 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/20"
                : "border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-slate-900/90 to-slate-950 shadow-md ring-1 ring-indigo-500/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-black text-sm shadow-inner ${
                  isSuperAdmin
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                }`}
              >
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-bold text-white">
                  {user?.name || "Super Admin"}
                </div>
                <div className="truncate text-[11px] text-slate-400">
                  {user?.email}
                </div>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-slate-800/80 pt-2.5">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  isSuperAdmin
                    ? "bg-amber-400/15 text-amber-300 border border-amber-400/30"
                    : "bg-indigo-400/15 text-indigo-300 border border-indigo-400/30"
                }`}
              >
                {isSuperAdmin ? (
                  <>
                    <FaCrown className="text-amber-400 text-[10px]" />
                    <span>Super Admin</span>
                  </>
                ) : (
                  <>
                    <FaShieldAlt className="text-indigo-400 text-[10px]" />
                    <span>Admin</span>
                  </>
                )}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Session
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-2 scrollbar-thin scrollbar-thumb-slate-800">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                    className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-brand to-purple-600 text-white shadow-md shadow-brand/20"
                        : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                    }`}
                  >
                    <Icon
                      className={`text-sm transition-transform group-hover:scale-110 ${
                        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span className="flex-1">{item.label}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white shadow-sm" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Security Invariant Indicator */}
        <div className="px-4 py-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-800/80 bg-slate-900/40 px-3 py-2 text-[10px] text-slate-400">
            <FaLock className="text-amber-400 text-xs shrink-0" />
            <span className="truncate">1 Super Admin Invariant Active</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-slate-800/80 p-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <FaArrowLeft className="text-xs" />
            <span>Return to Main App</span>
          </Link>
          <div className="pt-1">
            <LogoutButton showLabel />
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col bg-[#0d111d]">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 lg:px-8 backdrop-blur-xl shadow-xs">
          {/* Left: Mobile Toggle & Dynamic Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:bg-slate-800 hover:text-white lg:hidden transition"
              aria-label="Open sidebar menu"
            >
              <FaBars className="text-base" />
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-slate-400 hidden sm:inline">
                {breadcrumbs[0]}
              </span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="font-bold text-white bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-800">
                {breadcrumbs[1]}
              </span>
            </div>
          </div>

          {/* Right: Operational Status, Invariant Badge, and Controls */}
          <div className="flex items-center gap-3">
            {/* System Status Pill */}
            <div className="hidden md:flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-xs">
              <FaServer className="text-cyan-400 text-xs" />
              <span className="text-slate-400">Cluster Status:</span>
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Operational
              </span>
            </div>

            {/* Single Super Admin Authority Verified */}
            <div className="flex items-center gap-1.5 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300">
              <FaCheckCircle className="text-xs text-amber-400" />
              <span className="hidden sm:inline">Single Authority Guarded</span>
            </div>

            {/* Notification Indicator */}
            <button
              type="button"
              title="System Alerts"
              className="relative rounded-xl border border-slate-800 bg-slate-900/80 p-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <FaBell className="text-sm" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-brand ring-2 ring-slate-950" />
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
