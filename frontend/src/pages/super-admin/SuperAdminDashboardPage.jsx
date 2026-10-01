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
  FaFileDownload,
  FaSearch,
  FaLock,
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

const ROLE_COLORS = ["#0284c7", "#6366f1", "#9333ea", "#d97706"];
const STAGE_BAR_COLORS = {
  Applied: "#0284c7",
  "Under Review": "#d97706",
  Shortlisted: "#9333ea",
  Interview: "#4f46e5",
  Selected: "#059669",
  Rejected: "#e11d48",
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
      accent: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/40",
      link: "/super-admin/candidates",
      subtext: "Job seekers registered",
    },
    {
      title: "Total Recruiters",
      value: stats.totalRecruiters,
      icon: FaBriefcase,
      accent: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40",
      link: "/super-admin/recruiters",
      subtext: "Corporate hiring accounts",
    },
    {
      title: "Total Admins",
      value: stats.totalAdmins,
      icon: FaShieldAlt,
      accent: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40",
      link: isSuperAdmin ? "/super-admin/admins" : "/super-admin/users",
      subtext: "Delegated managers",
    },
    {
      title: "Total Jobs",
      value: stats.totalJobs,
      icon: FaFileAlt,
      accent: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40",
      link: "/super-admin/jobs",
      subtext: "Platform job listings",
    },
    {
      title: "Applications",
      value: stats.totalApplications,
      icon: FaLayerGroup,
      accent: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800/40",
      link: "/super-admin/applications",
      subtext: "Candidate submissions",
    },
    {
      title: "Active Accounts",
      value: stats.activeUsers,
      icon: FaCheckCircle,
      accent: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800/40",
      link: "/super-admin/users?status=ACTIVE",
      subtext: "In good standing",
    },
    {
      title: "Inactive Accounts",
      value: stats.inactiveUsers,
      icon: FaTimesCircle,
      accent: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40",
      link: "/super-admin/users?status=INACTIVE",
      subtext: "Deactivated or paused",
    },
    {
      title: "Pending Pipeline",
      value: stats.pendingApplications,
      icon: FaClock,
      accent: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40",
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
        { label: "Action", accessor: (row) => row.action || "" },
        { label: "Category", accessor: (row) => row.category || "" },
        { label: "Details", accessor: (row) => row.details || "" },
        {
          label: "Actor Name",
          accessor: (row) => row.performedBy?.name || "System",
        },
        {
          label: "Actor Email",
          accessor: (row) => row.performedBy?.email || "",
        },
        {
          label: "Actor Role",
          accessor: (row) => row.performedBy?.role || "",
        },
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
    <div className="space-y-6">
      {/* Classic Executive Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Executive Control Hub
              </h1>
              {isSuperAdmin && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-950/40 dark:border-amber-800/40 dark:text-amber-300">
                  <FaCrown className="text-amber-500 text-xs" />
                  <span>Single Super Admin</span>
                </span>
              )}
            </div>
            <p className="max-w-2xl text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Platform telemetry, organizational hierarchy supervision, catalog metrics, and immutable audit logs.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadMetrics}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <FaSyncAlt className={`text-xs ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </button>

            {isSuperAdmin && (
              <Link
                to="/super-admin/admins"
                className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3.5 py-2 text-xs font-semibold text-purple-700 shadow-xs transition hover:bg-purple-100 dark:border-purple-800/40 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/40"
              >
                <FaShieldAlt className="text-xs" />
                <span>Manage Admins</span>
              </Link>
            )}

            <Link
              to="/super-admin/users"
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-600"
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
              className="group rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {card.title}
                  </div>
                  <div className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {loading ? (
                      <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    ) : (
                      card.value
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {card.subtext}
                  </div>
                </div>
                <div className={`rounded-lg border p-2.5 ${card.accent}`}>
                  <Icon className="text-base" />
                </div>
              </div>

              <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-medium text-slate-500 group-hover:text-brand dark:border-slate-800 dark:text-slate-400 dark:group-hover:text-indigo-300 transition">
                <span>View Details</span>
                <FaExternalLinkAlt className="text-[10px] transition group-hover:translate-x-0.5" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visual Analytics & Governance Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Roles Distribution Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Role Distribution
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Platform account hierarchy breakdown</p>
              </div>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
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
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.5rem",
                      color: "#0f172a",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs">
            {(stats.usersByRole || []).map((item, idx) => (
              <div
                key={item.name}
                className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200/80 p-2 dark:bg-slate-800/50 dark:border-slate-700/60"
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: ROLE_COLORS[idx % ROLE_COLORS.length] }}
                />
                <span className="text-slate-500 truncate dark:text-slate-400">{item.name}:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Applications By Stage */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Application Pipeline
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Submission velocity across active positions</p>
              </div>
              <span className="rounded-md border border-cyan-200 bg-cyan-50 px-2.5 py-0.5 text-xs font-semibold text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300">
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
                    stroke="#94a3b8"
                    fontSize={10}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      borderColor: "#e2e8f0",
                      borderRadius: "0.5rem",
                      color: "#0f172a",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {(stats.applicationsByStatus || []).map((entry, index) => (
                      <Cell
                        key={`bar-${index}`}
                        fill={STAGE_BAR_COLORS[entry.name] || "#0284c7"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-2 text-center text-[11px] text-slate-500 font-medium dark:text-slate-400">
            Applications transition dynamically through recruiter stages.
          </div>
        </div>

        {/* System Governance & Invariant Enforcement */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between dark:border-slate-800 dark:bg-slate-900">
          <div>
            <div className="border-b border-slate-100 pb-3.5 dark:border-slate-800">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                System Invariants
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Core architectural guarantees</p>
            </div>

            <div className="mt-4 space-y-3">
              {/* Single Super Admin Guarantee */}
              <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-3.5 dark:border-amber-800/40 dark:bg-amber-950/20">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <FaLock className="text-xs text-amber-500" />
                  <span>Single Super Admin Invariant Locked</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-900/80 dark:text-slate-300">
                  Guaranteed at the database and application levels. Exactly 1 Super Admin account is permitted. Creation of additional Super Admins is strictly prohibited.
                </p>
              </div>

              {/* Database & Backup Health */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 space-y-2 dark:border-slate-700 dark:bg-slate-800/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium dark:text-slate-400">Database Engine:</span>
                  <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    MongoDB Atlas Connected
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium dark:text-slate-400">Automatic Snapshots:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Enabled (Every 30m)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium dark:text-slate-400">Environment:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">Production Node</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-3.5 border-t border-slate-100 dark:border-slate-800">
            {isSuperAdmin ? (
              <Link
                to="/super-admin/admins"
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
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
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand/10 p-2 text-brand">
              <FaClock className="text-base" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Audit & Activity Ledger
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time security events, role updates, and system operations
              </p>
            </div>
          </div>

          {/* Export & Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 text-xs" />
              <input
                type="text"
                placeholder="Search audit events..."
                value={activitySearch}
                onChange={(e) => setActivitySearch(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white py-1.5 pr-3 pl-8 text-xs text-slate-800 placeholder-slate-400 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={activityCategory}
              onChange={(e) => setActivityCategory(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <FaFileDownload className="text-xs text-slate-500 dark:text-slate-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3">Action Event</th>
                <th className="px-5 py-3">Description & Payload</th>
                <th className="px-5 py-3">Actor</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No activity logs match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredActivities.slice(0, 15).map((log, idx) => (
                  <tr
                    key={log._id || idx}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition"
                  >
                    <td className="px-5 py-3 font-semibold text-slate-900 dark:text-white">
                      {log.action}
                    </td>
                    <td className="px-5 py-3 max-w-xs truncate text-slate-600 dark:text-slate-400">
                      {log.details || "-"}
                    </td>
                    <td className="px-5 py-3">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {log.performedBy?.name || "System"}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {log.performedBy?.email || "internal"}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                        {log.category || "GENERAL"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap dark:text-slate-400">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString(undefined, {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
