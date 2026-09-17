import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import client from "../api/client";

export default function ManageJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const { data } = await client.get("/jobs/mine");
      setJobs(data.jobs);
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
    if (!window.confirm(`Delete "${job.title}"? This cannot be undone.`))
      return;
    try {
      await client.delete(`/jobs/${job.id}`);
      setJobs((current) => current.filter((item) => item.id !== job.id));
      toast.success("Job deleted.");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Unable to delete this job.",
      );
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono-display text-xs uppercase tracking-widest text-brand">
            Recruiter workspace
          </p>
          <h1 className="mt-2 text-3xl font-bold dark:text-white">
            Your job posts
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Edit listings, pause hiring, or remove roles that are no longer
            open.
          </p>
        </div>
        <Link
          to="/post-job"
          className="inline-flex items-center gap-2 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white"
        >
          <FiPlus /> Post a job
        </Link>
      </div>

      {loading ? (
        <p className="mt-8 text-slate-500">Loading your jobs...</p>
      ) : (
        <div className="mt-7 space-y-4">
          {jobs.map((job) => (
            <article
              key={job.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold dark:text-white">
                    {job.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {job.company} · {job.location} · {job.mode}
                  </p>
                  <span className="mt-3 inline-block rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                    {job.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/post-job/${job.id}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-brand px-3 py-2 text-sm font-semibold text-brand"
                  >
                    <FiEdit2 /> Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(job)}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!jobs.length && (
            <div className="rounded-2xl border border-dashed p-10 text-center text-slate-500">
              You have not posted any jobs yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
