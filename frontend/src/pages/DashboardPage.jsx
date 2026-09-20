import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import client from "../api/client";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import StatCard from "../components/common/StatCard";
import { FiBookmark, FiBriefcase, FiUsers } from "react-icons/fi";

export default function DashboardPage() {
  const user = useSelector((s) => s.auth.user);
  const [data, setData] = useState();

  useEffect(() => {
    client.get("/dashboard").then((r) => setData(r.data));
  }, []);

  if (!data) return <p className="text-slate-500 py-6">Loading dashboard…</p>;

  const admin = user?.role === "admin";
  const recruiter = user?.role === "recruiter";

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
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-brand">
          {user?.role} dashboard
        </p>
        <h1 className="mt-1 text-2xl font-extrabold dark:text-white sm:text-3xl">
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
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.activity}>
                <XAxis dataKey="name" />
                <Tooltip />
                <Bar dataKey="value" fill="#635bff" radius={[6, 6, 0, 0]} />
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
              <p className="text-xs text-slate-400 italic">No recent activity recorded yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
