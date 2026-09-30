import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import client from "../api/client";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import StatCard from "../components/common/StatCard";
import { FiBookmark, FiBriefcase, FiUsers, FiShield, FiArrowRight } from "react-icons/fi";
import { FaCrown, FaShieldAlt } from "react-icons/fa";

export default function DashboardPage() {
  const user = useSelector((s) => s.auth.user);
  const [data, setData] = useState();

  useEffect(() => {
    client.get("/dashboard").then((r) => setData(r.data));
  }, []);

  if (!data) return <p className="text-slate-500 py-6">Loading dashboard…</p>;

  const userRole = String(user?.role || "").toUpperCase();
  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const admin = isSuperAdmin || userRole === "ADMIN";
  const recruiter = userRole === "RECRUITER";

  const stats = admin
    ? [
        ["Total users", data.totalUsers],
        ["Jobs", data.jobs],
        ["Applications", data.applications],
      ]
    : recruiter
      ? [
          ["Active jobs", data.activeJobs],
          ["Applicants", data.applicants],
          ["Shortlisted", data.shortlisted],
        ]
      : [
          ["Applications", data.applications],
          ["Interviews", data.interviews],
          ["Saved jobs", data.savedJobs],
        ];

  const activityList = recruiter
    ? data.applicantsList
    : admin
      ? data.auditLogs
      : data.upcoming;

  return (
    <div className="w-full space-y-6">
      {admin && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 p-4 text-white sm:flex-row sm:items-center sm:justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-lg">
              <FiShield />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="inline-flex items-center gap-2">{isSuperAdmin ? <FaCrown className="text-amber-400" /> : <FaShieldAlt className="text-purple-400" />} <span>{isSuperAdmin ? "Single Super Admin Portal" : "Admin Control Center"}</span></span>
              </div>
              <p className="text-xs text-slate-300">
                Full user management, platform audit logs, candidates, recruiters, and job controls.
              </p>
            </div>
          </div>
          <Link
            to="/super-admin/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:bg-amber-400"
          >
            <span>Launch System Control</span>
            <FiArrowRight />
          </Link>
        </div>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-brand">
          {userRole} dashboard
        </p>
        <h1 className="mt-1 font-sans text-2xl font-extrabold tracking-tight dark:text-white sm:text-3xl">
          Your workspace, at a glance.
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([l, v], i) => (
          <StatCard
            key={l}
            label={l}
            value={v}
            icon={[<FiBriefcase key="1" />, <FiUsers key="2" />, <FiBookmark key="3" />][i]}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-bold text-slate-800 dark:text-white">Platform activity</h2>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.activity}
                margin={{ top: 12, right: 12, left: 12, bottom: 4 }}
              >
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    borderRadius: "8px",
                    border: "none",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="#635bff"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={48}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h2 className="font-bold text-slate-800 dark:text-white">
            {recruiter
              ? "Recent applicants"
              : admin
                ? "Audit log"
                : "Upcoming interviews"}
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            {activityList?.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-xl bg-slate-50 p-3.5 dark:bg-slate-700/50"
              >
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  {item.name || item.action || item.company}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {item.stage || item.actor || item.time}
                </span>
              </div>
            ))}
            {!activityList?.length && (
              <p className="text-xs italic text-slate-400">No recent activity recorded yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
