import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2, FiBriefcase } from "react-icons/fi";
import client from "../api/client";

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data } = await client.get("/jobs/mine");
      setJobs(data.jobs || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load your jobs.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const remove = async (job) => {
    const jobId = job.id || job._id;
    if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`))
      return;
    try {
      await client.delete(`/jobs/${jobId}`);
      setJobs((current) => current.filter((item) => (item.id || item._id) !== jobId));
      toast.success("Job deleted.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to delete this job.",
      );
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand dark:bg-brand/20">
            RECRUITER WORKSPACE
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
            Manage Job Postings
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            Edit listings, monitor applicant engagement, pause hiring, or remove roles that are closed.
          </p>
        </div>
        <Link
          to="/post-job"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-brand/90 hover:shadow"
        >
          <FiPlus /> Post a new job
        </Link>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const jobId = job.id || job._id;
            return (
              <article
                key={jobId}
                className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition duration-200 hover:border-brand/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-800 sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                        {job.title}
                      </h2>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        job.status === "open"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }`}>
                        {job.status || "open"}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                      {job.company} · {job.location || "Remote"} · {job.mode || "Full-time"} · {job.category || "General"}
                    </p>
                    {job.applicantsCount !== undefined && (
                      <p className="mt-2 text-xs font-semibold text-brand">
                        {job.applicantsCount} applicant{job.applicantsCount === 1 ? "" : "s"} received
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/post-job/${jobId}`}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200"
                    >
                      <FiEdit2 /> Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => remove(job)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/50"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
          {!jobs.length && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-brand/10 text-2xl text-brand dark:bg-brand/20">
                <FiBriefcase />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                You have not posted any jobs yet
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                Create and publish your first job listing to start receiving qualified candidates.
              </p>
              <Link
                to="/post-job"
                className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand/90"
              >
                Post Your First Job
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
