import { Link } from "react-router-dom";
import { FiMapPin, FiBookmark, FiBriefcase, FiClock, FiArrowRight } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import client from "../../api/client";
import { useState } from "react";

export default function JobCard({ job, isSavedInitial = false, onSaveToggled }) {
  const user = useSelector((s) => s.auth.user);
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [saving, setSaving] = useState(false);

  const toggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      toast.error("Please sign in to save jobs.");
      return;
    }

    if (user.role !== "candidate") {
      toast.error("Only candidates can bookmark jobs.");
      return;
    }

    setSaving(true);
    const jobId = job.id || job._id;

    try {
      if (isSaved) {
        await client.delete(`/jobs/${jobId}/save`);
        setIsSaved(false);
        toast.success("Job removed from saved.");
        if (onSaveToggled) onSaveToggled(jobId, false);
      } else {
        await client.post(`/jobs/${jobId}/save`);
        setIsSaved(true);
        toast.success("Job saved to your profile!");
        if (onSaveToggled) onSaveToggled(jobId, true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update saved job.");
    } finally {
      setSaving(false);
    }
  };

  const jobId = job.id || job._id;

  return (
    <article className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-brand/40 hover:shadow-xl dark:border-slate-800 dark:bg-slate-800">
      <div>
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <span className="inline-block rounded-lg bg-brand/10 px-2.5 py-1 text-xs font-bold text-brand dark:bg-brand/20">
              {job.company}
            </span>
            <h3 className="mt-2.5 line-clamp-1 text-lg font-bold text-slate-900 group-hover:text-brand dark:text-white dark:group-hover:text-brand">
              <Link to={`/jobs/${jobId}`}>{job.title}</Link>
            </h3>
          </div>

          <button
            type="button"
            onClick={toggleSave}
            disabled={saving}
            title={isSaved ? "Remove from saved jobs" : "Save job"}
            aria-label={isSaved ? "Saved" : "Save job"}
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-2xl border transition ${
              isSaved
                ? "border-brand/30 bg-brand/10 text-brand dark:bg-brand/20"
                : "border-slate-200 text-slate-400 hover:border-brand/40 hover:text-brand dark:border-slate-700 dark:text-slate-500 dark:hover:text-brand"
            }`}
          >
            {isSaved ? (
              <FaBookmark className="text-base text-brand" />
            ) : (
              <FiBookmark className="text-base" />
            )}
          </button>
        </div>

        {/* Location & Mode */}
        <div className="mt-3.5 flex flex-wrap items-center gap-y-1.5 gap-x-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <FiMapPin className="text-brand shrink-0" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <FiBriefcase className="text-brand shrink-0" />
            {job.mode || "Hybrid"}
          </span>
          {job.experience && (
            <span className="flex items-center gap-1">
              <FiClock className="text-brand shrink-0" />
              {job.experience}
            </span>
          )}
        </div>

        {/* Description snippet */}
        {job.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            {job.description}
          </p>
        )}

        {/* Skills Pills */}
        {job.skills && job.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                +{job.skills.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Bottom Footer */}
      <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
        <div>
          <span className="text-xs text-slate-400 block font-medium">Salary</span>
          <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
            {job.salary || "Disclosed on call"}
          </span>
        </div>

        <Link
          to={`/jobs/${jobId}`}
          className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-800 transition group-hover:bg-brand group-hover:text-white dark:bg-slate-800 dark:text-slate-200 dark:group-hover:bg-brand dark:group-hover:text-white"
        >
          View Role
          <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
