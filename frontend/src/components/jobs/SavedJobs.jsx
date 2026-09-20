import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiBookmark, FiTrash2, FiExternalLink, FiMapPin, FiBriefcase, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import client from "../../api/client";

export default function SavedJobs() {
  const [savedList, setSavedList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      const { data } = await client.get("/saved-jobs");
      setSavedList(data.savedJobs || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load saved jobs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemove = async (jobId) => {
    try {
      await client.delete(`/jobs/${jobId}/save`);
      setSavedList((prev) => prev.filter((item) => (item.job?.id || item.job?._id) !== jobId && item.jobId !== jobId));
      toast.success("Job removed from bookmarks.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to remove job.");
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="h-44 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
        ))}
      </div>
    );
  }

  if (!savedList.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
        <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-brand/10 text-2xl text-brand dark:bg-brand/20">
          <FiBookmark />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">
          No Saved Jobs Yet
        </h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Bookmark interesting job opportunities while exploring to review or apply to them later.
        </p>
        <Link
          to="/jobs"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand/90"
        >
          Explore Open Roles <FiArrowRight />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {savedList.map((item) => {
        const job = item.job || {};
        const jobId = job.id || job._id || item.jobId;

        return (
          <div
            key={item.id || jobId}
            className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition hover:border-brand/40 hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-lg bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand dark:bg-brand/20">
                    {job.company || "Company"}
                  </span>
                  <h4 className="mt-2 text-base font-bold text-slate-900 dark:text-white">
                    {job.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(jobId)}
                  title="Remove from saved"
                  aria-label="Remove job"
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                >
                  <FiTrash2 className="text-base" />
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <FiMapPin className="text-brand" /> {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <FiBriefcase className="text-brand" /> {job.mode || "Hybrid"}
                </span>
              </div>

              {job.salary && (
                <p className="mt-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Salary: {job.salary}
                </p>
              )}
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="text-[11px] text-slate-400">
                Saved {new Date(item.savedAt || Date.now()).toLocaleDateString()}
              </span>
              <Link
                to={`/jobs/${jobId}`}
                className="flex items-center gap-1 rounded-xl bg-brand px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-brand/90"
              >
                Apply Now <FiExternalLink />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
