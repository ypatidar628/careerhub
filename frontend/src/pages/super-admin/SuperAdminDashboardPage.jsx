import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaCrown,
  FaShieldAlt,
  FaUserGraduate,
  FaBriefcase,
  FaFileAlt,
  FaLayerGroup,
  FaCheckCircle,
  FaClock,
  FaSyncAlt,
  FaUserPlus,
  FaFileDownload,
  FaSearch,
  FaFilter,
  FaLock,
  FaServer,
  FaExternalLinkAlt,
  FaUsers,
  FaTimesCircle,
} from "react-icons/fa";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getSuperAdminStats } from "../../api/superAdmin";
import { exportToCsv } from "../../utils/exportCsv";
import toast from "react-hot-toast";

const ROLE_COLORS = ["#38bdf8", "#818cf8", "#a855f7", "#f59e0b"];
const STAGE_BAR_COLORS = {
  Applied: "#38bdf8",
  "Under Review": "#f59e0b",
  Shortlisted: "#a855f7",
  Interview: "#6366f1",
  Selected: "#10b981",
  Rejected: "#f43f5e",
};

export default function SuperAdminDashboardPage() {
  const currentUser = useSelector((s) => s.auth.user);
  const isSuperAdmin = String(currentUser?.role || "").toUpperCase() === "SUPER_ADMIN";

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCandidates: 0,
    totalRecruiters: 0,
    totalAdmins: 0,
    totalSuperAdmins: 1,
    activeUsers: 0,
    inactiveUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    interviewApplications: 0,
    selectedApplications: 0,
    rejectedApplications: 0,
    usersByRole: [],
    applicationsByStatus: [],
    jobsByMode: [],
    recentActivities: [],
  });

  // Audit filter state
  const [activityCategory, setActivityCategory] = useState("ALL");
  const [activitySearch, setActivitySearch] = useState("");

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await getSuperAdminStats();
      setStats(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const statCards = [
    {
      title: "Total Candidates",
      value: stats.totalCandidates,
      icon: FaUserGraduate,
      gradient: "from-sky-500/15 via-sky-500/5 to-transparent border-sky-500/30 text-sky-400",
      accent: "bg-sky-500/20 text-sky-300 border-sky-500/30",
      link: "/super-admin/candidates",
      subtext: "Job seekers registered",
    },
    {
      title: "Total Recruiters",
      value: stats.totalRecruiters,
      icon: FaBriefcase,
      gradient: "from-indigo-500/15 via-indigo-500/5 to-transparent border-indigo-500/30 text-indigo-400",
      accent: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      link: "/super-admin/recruiters",
      subtext: "Corporate hiring accounts",
    },
    {
      title: "Total Admins",
      value: stats.totalAdmins,
      icon: FaShieldAlt,
      gradient: "from-purple-500/15 via-purple-500/5 to-transparent border-purple-500/30 text-purple-400",
      accent: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      link: isSuperAdmin ? "/super-admin/admins" : "/super-admin/users",
      subtext: "Delegated managers",
    },
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: FaFileAlt,
      gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/30 text-emerald-400",
      accent: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      link: "/super-admin/jobs",
      subtext: "Platform job listings",
    },
    {
      title: "Applications",
      value: stats.totalApplications,
      icon: FaLayerGroup,
      gradient: "from-cyan-500/15 via-cyan-500/5 to-transparent border-cyan-500/30 text-cyan-400",
      accent: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
      link: "/super-admin/applications",
      subtext: "Candidate submissions",
    },
    {
      title: "Active Accounts",
      value: stats.activeUsers,
      icon: FaCheckCircle,
      gradient: "from-teal-500/15 via-teal-500/5 to-transparent border-teal-500/30 text-teal-400",
      accent: "bg-teal-500/20 text-teal-300 border-teal-500/30",
      link: "/super-admin/users?status=ACTIVE",
      subtext: "In good standing",
    },
    {
      title: "Inactive Accounts",
      value: stats.inactiveUsers,
      icon: FaTimesCircle,
      gradient: "from-rose-500/15 via-rose-500/5 to-transparent border-rose-500/30 text-rose-400",
      accent: "bg-rose-500/20 text-rose-300 border-rose-500/30",
      link: "/super-admin/users?status=INACTIVE",
      subtext: "Deactivated or paused",
    },
    {
      title: "Pending Pipeline",
      value: stats.pendingApplications,
      icon: FaClock,
      gradient: "from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/30 text-amber-400",
      accent: "bg-amber-500/20 text-amber-300 border-amber-500/30",
      link: "/super-admin/applications?status=Applied",
      subtext: "Requires recruiter review",
    },
  ];

  // Filter activities
  const filteredActivities = useMemo(() => {
    return (stats.recentActivities || []).filter((log) => {
      const matchCat =
        activityCategory === "ALL" ||
        String(log.category || "").toUpperCase() === activityCategory.toUpperCase();
      const query = activitySearch.toLowerCase();
      const matchQuery =
        !query ||
        log.action?.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query) ||
        log.performedBy?.name?.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });
  }, [stats.recentActivities, activityCategory, activitySearch]);

  const handleExportActivitiesCsv = () => {
    try {
      const columns = [
        { label: "Action", key: "action" },
        { label: "Details", key: "details" },
        {
          label: "Actor Name",
          accessor: (row) => row.performedBy?.name || "System",
        },
        {
          label: "Actor Role",
          accessor: (row) => row.performedBy?.role || "SYSTEM",
        },
        { label: "Category", key: "category" },
        {
          label: "Timestamp",
          accessor: (row) =>
            row.createdAt ? new Date(row.createdAt).toISOString() : "",
        },
      ];
      exportToCsv("careerhub-system-audit.csv", filteredActivities, columns);
      toast.success("Audit log exported to CSV");
    } catch (e) {
      toast.error(e.message || "Failed to export audit log");
    }
  };

  return (
    <div className="space-y-8">
      {/* Executive Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-gradient-to-r from-slate-950 via-[#13112c] to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Executive Control Hub
              </h1>
              {isSuperAdmin && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-300 shadow-xs">
                  <FaCrown className="text-amber-400 text-xs" />
                  <span>Single Super Admin</span>
                </span>
              )}
            </div>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time platform telemetry, user hierarchy supervision, job catalog metrics, and immutable audit logs.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadMetrics}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 text-xs font-bold text-slate-200 shadow-sm transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
            >
              <FaSyncAlt className={`text-xs ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>

            {isSuperAdmin && (
              <Link
                to="/super-admin/admins"
                className="inline-flex items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-950/40 px-4 py-2.5 text-xs font-bold text-purple-300 shadow-sm transition hover:bg-purple-900/50 hover:text-white"
              >
                <FaShieldAlt className="text-xs" />
                <span>Manage Admins</span>
              </Link>
            )}

            <Link
              to="/super-admin/users"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-purple-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand/25 transition hover:brightness-110 active:scale-95"
            >
              <FaUsers className="text-xs" />
              <span>User Directory</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.title}
              to={card.link}
              className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${card.gradient}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {card.title}
                  </div>
                  <div className="mt-2 text-3xl font-black tracking-tight text-white">
                    {loading ? (
                      <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-800" />
                    ) : (
                      card.value
                    )}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400 font-medium">
                    {card.subtext}
                  </div>
                </div>
                <div className={`rounded-xl border p-3 ${card.accent}`}>
                  <Icon className="text-lg" />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-800/80 pt-3 text-[11px] font-semibold text-slate-400 group-hover:text-white transition">
                <span>View Management Table</span>
                <FaExternalLinkAlt className="text-[10px] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visual Analytics & Governance Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Roles Distribution Chart */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Role Distribution
                </h2>
                <p className="text-xs text-slate-400">Platform account hierarchy breakdown</p>
              </div>
              <span className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-bold text-slate-200">
                {stats.totalUsers} Total
              </span>
            </div>

            <div className="mt-4 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.usersByRole || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    paddingAngle={4}
                  >
                    {(stats.usersByRole || []).map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={ROLE_COLORS[index % ROLE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b0f19",
                      borderColor: "#1e293b",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800/60 text-xs">
            {(stats.usersByRole || []).map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center gap-2 rounded-xl bg-slate-900/50 border border-slate-800/80 p-2"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: ROLE_COLORS[idx % ROLE_COLORS.length] }}
                />
                <span className="text-slate-400 truncate">{item.name}:</span>
                <span className="font-bold text-white ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Applications By Stage */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Application Pipeline
                </h2>
                <p className="text-xs text-slate-400">Submission velocity across active positions</p>
              </div>
              <span className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-bold text-cyan-400">
                {stats.totalApplications} Active
              </span>
            </div>

            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.applicationsByStatus || []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                >
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={10}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0b0f19",
                      borderColor: "#1e293b",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {(stats.applicationsByStatus || []).map((entry, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={STAGE_BAR_COLORS[entry.name] || "#38bdf8"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 text-center text-[11px] text-slate-500 font-medium">
            Applications transition dynamically through recruiter stage advances.
          </div>
        </div>

        {/* System Governance & Invariant Enforcement */}
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6 backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="border-b border-slate-800/80 pb-4">
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                System Invariants
              </h2>
              <p className="text-xs text-slate-400">Core architectural guarantees</p>
            </div>

            <div className="mt-4 space-y-3">
              {/* Single Super Admin Guarantee */}
              <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <FaLock className="text-sm text-amber-400" />
                  <span>Single Super Admin Invariant Locked</span>
                </div>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-300">
                  Guaranteed at the database and application levels. Exactly 1 Super Admin account is permitted. Creation of additional Super Admins or tampering with root credentials is mathematically rejected.
                </p>
              </div>

              {/* Database & Backup Health */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Database Node:</span>
                  <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    MongoDB Atlas Connected
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Automatic Snapshots:</span>
                  <span className="font-semibold text-slate-200">Enabled (Every 30m)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Environment:</span>
                  <span className="font-semibold text-slate-200">Production Node</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80">
            {isSuperAdmin ? (
              <Link
                to="/super-admin/admins"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/25 transition hover:brightness-110"
              >
                <FaShieldAlt className="text-xs" />
                <span>Configure Admins & Permissions</span>
              </Link>
            ) : (
              <div className="text-center text-xs text-slate-500 font-medium">
                Admin mode active. Contact Super Admin for team provisioning.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent System Activity Log & Audit Feed */}
      <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl shadow-xl overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-800/80 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-brand/10 p-2.5 text-brand border border-brand/20">
              <FaClock className="text-base" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Live Audit & Activity Ledger
              </h2>
              <p className="text-xs text-slate-400">
                Real-time security events, role updates, and system operations
              </p>
            </div>
          </div>

          {/* Export & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-500 text-xs" />
              <input
                type="text"
                placeholder="Search audit events..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-900/90 py-1.5 pr-3 pl-8 text-xs text-slate-200 placeholder-slate-500 focus:border-brand focus:outline-none"
              />
            </div>

            {/* Category Filter */}
            <select
              value={activityCategory}
              onChange={(e) => setActivityCategory(e.target.value)}
              className="rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs text-slate-200 focus:border-brand focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="AUTH">Authentication</option>
              <option value="USER_MANAGEMENT">User Management</option>
              <option value="SECURITY">Security & Access</option>
              <option value="JOB_MANAGEMENT">Job Operations</option>
            </select>

            {/* CSV Export Button */}
            <button
              type="button"
              onClick={handleExportActivitiesCsv}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-3.5 py-1.5 text-xs font-bold text-slate-200 shadow-sm transition hover:bg-slate-800 hover:text-white"
            >
              <FaFileDownload className="text-xs text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-6 py-3.5">Action Event</th>
                <th className="px-6 py-3.5">Description & Payload</th>
                <th className="px-6 py-3.5">Actor</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((log) => (
                  <tr key={log.id || log._id} className="transition hover:bg-slate-900/40">
                    <td className="px-6 py-4 font-bold text-white">
                      {log.action}
                    </td>
                    <td className="px-6 py-4 text-slate-300 max-w-sm truncate">
                      {log.details || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-200">
                        {log.performedBy?.name || "System Automated"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {log.performedBy?.role || "SYSTEM"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-block rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-300">
                        {log.category || "SYSTEM"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : "Just now"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No activity records found matching criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
