import { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import client from "../api/client";
import ApplicationChat from "../components/chat/ApplicationChat";
const colors = {
  Applied: "bg-blue-100 text-blue-700",
  "Under Review": "bg-amber-100 text-amber-700",
  Shortlisted: "bg-violet-100 text-violet-700",
  Interview: "bg-cyan-100 text-cyan-700",
  Rejected: "bg-rose-100 text-rose-700",
  Hired: "bg-emerald-100 text-emerald-700",
};
// One route serves candidate tracking and recruiter pipeline management based on the authenticated role.
export default function ApplicationsPage() {
  const user = useSelector((s) => s.auth.user);
  const [items, setItems] = useState([]);
  const [stages, setStages] = useState([]);
  const [chatApplication, setChatApplication] = useState(null);
  const closeChat = useCallback(() => setChatApplication(null), []);
  const recruiter = user.role === "recruiter";
  const load = useCallback(() => {
    client
      .get(recruiter ? "/applications" : "/applications/mine")
      .then(({ data }) => {
        setItems(data.applications);
        setStages(data.stages);
      })
      .catch(() => toast.error("Could not load applications."));
  }, [recruiter]);
  useEffect(() => {
    load();
  }, [load]);
  const stage = async (id, status) => {
    try {
      await client.patch(`/applications/${id}`, { status });
      toast.success("Pipeline stage updated");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Unable to update stage.");
    }
  };
  return (
    <div>
      <p className="font-mono-display text-xs uppercase tracking-widest text-brand">
        {recruiter ? "Recruiter workspace" : "Candidate workspace"}
      </p>
      <h1 className="mt-2 text-3xl font-bold dark:text-white">
        {recruiter ? "Applicant pipeline" : "My applications"}
      </h1>
      <div className="mt-7 space-y-4">
        {items.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold dark:text-white">
                  {recruiter ? item.candidateName : item.jobTitle}
                </h2>
                <p className="text-sm text-slate-500">
                  {recruiter
                    ? `${item.jobTitle} · Score ${item.score}`
                    : item.company}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${colors[item.status]}`}
              >
                {item.status}
              </span>
            </div>
            {recruiter && (
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <a
                  className="text-sm font-semibold text-brand"
                  href={item.resumeUrl || "#"}
                >
                  View resume
                </a>
                <select
                  aria-label="Update pipeline stage"
                  value={item.status}
                  onChange={(e) => stage(item.id, e.target.value)}
                  className="rounded-lg border bg-transparent p-2 text-sm"
                >
                  {stages.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            )}{" "}
            {!recruiter && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-500">
                  Submitted {new Date(item.createdAt).toLocaleDateString()}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setChatApplication((current) =>
                      current?.id === item.id ? null : item,
                    )
                  }
                  className="rounded-xl border border-brand px-4 py-2 text-sm font-bold text-brand hover:bg-brand/5"
                >
                  {chatApplication?.id === item.id
                    ? "Close chat"
                    : "Chat with recruiter"}
                </button>
              </div>
            )}
            {!recruiter && chatApplication?.id === item.id && (
              <ApplicationChat application={item} onClose={closeChat} />
            )}
          </article>
        ))}
        {!items.length && (
          <p className="rounded-2xl border border-dashed p-8 text-center text-slate-500">
            {recruiter
              ? "No applicants yet."
              : "You have not applied to any roles yet."}
          </p>
        )}
      </div>
    </div>
  );
}
