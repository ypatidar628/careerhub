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
  if (!data) return <p>Loading dashboard…</p>;
  const admin = user.role === "admin",
    recruiter = user.role === "recruiter";
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
  return (
    <>
      <p className="text-sm font-bold uppercase tracking-wider text-brand">
        {user.role} dashboard
      </p>
      <h1 className="mt-1 text-2xl font-bold dark:text-white sm:text-3xl">
        Your workspace, at a glance.
      </h1>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {stats.map(([l, v], i) => (
          <StatCard
            key={l}
            label={l}
            value={v}
            icon={[<FiBriefcase />, <FiUsers />, <FiBookmark />][i]}
          />
        ))}
      </div>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="font-bold dark:text-white">Platform activity</h2>
        <div className="mt-4 h-60">
          <ResponsiveContainer>
            <BarChart data={data.activity}>
              <XAxis dataKey="name" />
              <Tooltip />
              <Bar dataKey="value" fill="#635bff" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="font-bold dark:text-white">
          {recruiter
            ? "Recent applicants"
            : admin
              ? "Audit log"
              : "Upcoming interviews"}
        </h2>
        <div className="mt-4 space-y-3 text-sm">
          {(recruiter
            ? data.applicantsList
            : admin
              ? data.auditLogs
              : data.upcoming
          ).map((item, i) => (
            <div
              key={i}
              className="rounded-lg bg-slate-50 p-3 dark:bg-slate-700"
            >
              {item.name || item.action || item.company}{" "}
              <span className="text-slate-500">
                {item.stage || item.actor || item.time}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
