import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import {
  FiMapPin,
  FiBriefcase,
  FiClock,
  FiDollarSign,
  FiBookmark,
  FiArrowLeft,
  FiCheckCircle,
  FiFileText,
  FiSend,
  FiShare2,
} from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import client from "../api/client";

export default function JobDetailsPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);

    client
      .get(`/jobs/${id}`)
      .then(({ data }) => {
        if (!active) return;
        setJob(data.job);
      })
      .catch(() => {
        if (!active) return;
        toast.error("Role not found.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    // Check if job is saved & applied
    if (user && user.role === "candidate") {
      client
        .get("/saved-jobs/ids")
        .then(({ data }) => {
          if (active && data.ids?.includes(id)) {
            setIsSaved(true);
          }
        })
        .catch(() => {});

      client
        .get("/applications/mine")
        .then(({ data }) => {
          if (
            active &&
            data.applications?.some(
              (a) => (a.jobId?._id || a.jobId || a.job?.id) === id,
            )
          ) {
            setApplied(true);
          }
        })
        .catch(() => {});
    }

    return () => {
      active = false;
    };
  }, [id, user]);

  const toggleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save jobs.");
      return;
    }

    if (user.role !== "candidate") {
      toast.error("Only candidates can bookmark jobs.");
      return;
    }

    setSaving(true);
    try {
      if (isSaved) {
        await client.delete(`/jobs/${id}/save`);
        setIsSaved(false);
        toast.success("Job removed from saved.");
      } else {
        await client.post(`/jobs/${id}/save`);
        setIsSaved(true);
        toast.success("Job saved to your profile!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not update saved job.");
    } finally {
      setSaving(false);
    }
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!user) {
      nav("/auth");
      return;
    }

    if (user.role !== "candidate") {
      toast.error("Only candidates can apply for jobs.");
      return;
    }

    setSubmitting(true);
    try {
      await client.post(`/jobs/${id}/applications`, {
        coverLetter,
        resumeUrl: user.profile?.resumeUrl,
        resumeName: user.profile?.resumeName,
      });
      toast.success("Application submitted successfully!");
      setApplied(true);
      setApplying(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to submit application.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800" />
      </main>
    );
  }

  if (!job) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
          Job not found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          This position may have been closed or removed.
        </p>
        <Link
          to="/jobs"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm"
        >
          <FiArrowLeft /> Back to all jobs
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back button */}
      <Link
        to="/jobs"
        className="mb-6 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-brand"
      >
        <FiArrowLeft /> Back to job search
      </Link>

      {/* Header Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-lg bg-brand/10 px-3 py-1 text-xs font-bold text-brand dark:bg-brand/20">
              {job.company}
            </span>
            <h1 className="mt-3 text-2xl font-extrabold text-slate-900 sm:text-3xl dark:text-white">
              {job.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleSave}
              disabled={saving}
              title={isSaved ? "Saved to profile" : "Save job"}
              aria-label={isSaved ? "Saved" : "Save job"}
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-xs font-bold transition ${
                isSaved
                  ? "border-brand/30 bg-brand/10 text-brand dark:bg-brand/20"
                  : "border-slate-200 bg-white text-slate-700 hover:border-brand/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              }`}
            >
              {isSaved ? <FaBookmark className="text-brand" /> : <FiBookmark />}
              {isSaved ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        {/* Info badges */}
        <div className="mt-5 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <FiMapPin className="text-brand" /> {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <FiBriefcase className="text-brand" /> {job.mode || "Hybrid"}
          </span>
          {job.experience && (
            <span className="flex items-center gap-1.5">
              <FiClock className="text-brand" /> {job.experience}
            </span>
          )}
          {job.salary && (
            <span className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
              <FiDollarSign className="text-brand" /> {job.salary}
            </span>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {applied ? (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <FiCheckCircle className="text-lg" /> Applied for this role
              <Link
                to="/applications"
                className="ml-3 underline hover:text-emerald-900 dark:hover:text-emerald-100"
              >
                Track status & chat →
              </Link>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  nav("/auth");
                  return;
                }
                if (user.role !== "candidate") {
                  toast.error("Only candidates can submit applications.");
                  return;
                }
                setApplying(true);
              }}
              className="rounded-2xl bg-brand px-8 py-3.5 text-sm font-bold text-white shadow-md transition hover:bg-brand/90 hover:shadow-lg"
            >
              Apply Now
            </button>
          )}
        </div>
      </div>

      {/* Application Form Drawer / Section */}
      {applying && !applied && (
        <form
          onSubmit={submitApplication}
          className="mt-6 rounded-3xl border border-brand/40 bg-brand/5 p-6 shadow-sm transition sm:p-8 dark:border-brand/30 dark:bg-slate-800"
        >
          <div className="flex items-center justify-between border-b border-brand/20 pb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Apply for {job.title}
            </h3>
            <button
              type="button"
              onClick={() => setApplying(false)}
              className="text-xs font-semibold text-slate-500 hover:text-rose-500"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Profile & Resume
            </p>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {user.name} ({user.email})
                </p>
                <p className="text-xs text-slate-500">
                  Resume: {user.profile?.resumeName || "Default Profile Resume"}
                </p>
              </div>
              <Link
                to="/profile"
                className="text-xs font-bold text-brand hover:underline"
              >
                Update in Profile
              </Link>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Cover Letter / Note to Recruiter
            </label>
            <textarea
              rows={4}
              required
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself, mention relevant projects, and why you are interested in this position..."
              className="mt-1.5 w-full rounded-2xl border border-slate-300 bg-white p-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand"
            />
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setApplying(false)}
              className="rounded-xl px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !coverLetter.trim()}
              className="flex items-center gap-2 rounded-xl bg-brand px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand/90 disabled:opacity-50"
            >
              <FiSend /> {submitting ? "Submitting..." : "Send Application"}
            </button>
          </div>
        </form>
      )}

      {/* Description & Requirements */}
      <div className="mt-8 space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800 sm:p-8">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            About the Role
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {job.description}
          </p>
        </div>

        {job.skills && job.skills.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Required Skills & Technologies
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-xl bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand dark:bg-brand/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {job.requirements && job.requirements.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Qualifications & Requirements
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              {job.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
