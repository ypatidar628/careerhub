import { useState } from "react";
import {
  FiBriefcase,
  FiMapPin,
  FiDollarSign,
  FiClock,
  FiCalendar,
  FiUsers,
  FiFileText,
  FiDownload,
  FiEye,
  FiMessageCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiAlertCircle,
  FiLayers,
  FiInfo,
  FiGlobe,
  FiX,
  FiArrowLeft,
} from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import ApplicationTimeline from "./ApplicationTimeline";
import ResumePreviewModal, { getFullResumeUrl } from "../common/ResumePreviewModal";

export default function AppliedJobDetails({
  application,
  onClose,
  onOpenChat,
  onWithdraw,
  isPage = false,
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!application) return null;

  const job = application.job || application.jobId || {};
  const recruiter = application.recruiterId || {};
  const candidateProfile = application.candidateProfile || {};

  const canWithdraw = ["Applied", "Under Review"].includes(application.status);

  const formatShortDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Job data helpers
  const jobTitle = job.title || application.jobTitle || "Job Position";
  const companyName = job.company || application.company || "Company";
  const jobLocation = job.location || application.location || "Remote";
  const jobMode = job.mode || application.mode || "Hybrid";
  const jobSalary = job.salary || "Not disclosed";
  const jobCategory = job.category || "Engineering";
  const jobExperience = job.experience || "Not specified";
  const jobDescription =
    job.description || "No detailed job description was provided for this posting.";
  const jobSkills =
    job.skills?.length > 0
      ? job.skills
      : candidateProfile.skills?.length > 0
      ? candidateProfile.skills
      : [];
  const jobRequirements = job.requirements || [];
  const jobStatus = job.status || "Active";
  const postedDate = job.createdAt || job.postedAt || application.createdAt;
  const deadline = job.deadline || "Open until filled";
  const openings = job.openings || job.numberOfOpenings || "1 Opening";

  // Application data
  const appId = application.id || application._id || "N/A";
  const appliedDate = application.createdAt;
  const lastUpdated = application.updatedAt || application.createdAt;
  const resumeUrl = application.resumeUrl || candidateProfile.resumeUrl;
  const resumeName =
    application.resumeName || candidateProfile.resumeName || "Submitted_Resume.pdf";

  const content = (
    <div className="space-y-8">
      {/* Top Banner / Header Bar */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand via-indigo-600 to-cyan-600 p-6 text-white shadow-md sm:p-8">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                Applied Role
              </span>
              <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-bold text-emerald-200">
                Job Status: {jobStatus}
              </span>
            </div>

            <h1 className="mt-3 text-2xl font-black sm:text-3xl lg:text-4xl">
              {jobTitle}
            </h1>
            <p className="mt-1 text-base font-semibold text-white/90">
              {companyName}
            </p>

            {/* Quick Meta Chips */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-white/80 sm:text-sm">
              <span className="flex items-center gap-1.5">
                <FiMapPin className="text-emerald-300" /> {jobLocation} ({jobMode})
              </span>
              <span className="flex items-center gap-1.5">
                <FiDollarSign className="text-emerald-300" /> {jobSalary}
              </span>
              <span className="flex items-center gap-1.5">
                <FiBriefcase className="text-emerald-300" /> {jobCategory}
              </span>
              <span className="flex items-center gap-1.5">
                <FiClock className="text-emerald-300" /> Exp: {jobExperience}
              </span>
            </div>
          </div>

          {/* Action buttons (Close / Chat) */}
          <div className="flex items-center gap-3">
            {onOpenChat && (
              <button
                type="button"
                onClick={() => onOpenChat(application)}
                className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-brand shadow-sm transition hover:bg-slate-100 active:scale-95"
              >
                <FiMessageCircle className="text-base" />
                <span>Chat with Recruiter</span>
              </button>
            )}

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur-xs transition hover:bg-white/30"
              >
                <FiX className="text-xl" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid: Left Column = Job Details, Right Column = Application & Recruiter Info */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* LEFT COLUMN: Complete Job Information & Candidate Submitted Data */}
        <div className="space-y-8">
          {/* 1. Job Description & Requirements */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Job Description
            </h2>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {jobDescription}
            </div>

            {/* Required Skills */}
            {jobSkills.length > 0 && (
              <div className="mt-8 border-t border-slate-100 pt-6 dark:border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Required Skills
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {jobSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl bg-brand/10 px-3 py-1.5 text-xs font-bold text-brand dark:bg-brand/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Key Job Requirements / Highlights */}
            {jobRequirements.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Key Requirements
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {jobRequirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <FiCheckCircle className="mt-1 shrink-0 text-emerald-500" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Job Meta Summary Table */}
            <div className="mt-8 grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-800/50 text-xs">
              <div>
                <span className="block text-slate-400">Experience</span>
                <span className="mt-1 block font-bold text-slate-800 dark:text-slate-200">
                  {jobExperience}
                </span>
              </div>
              <div>
                <span className="block text-slate-400">Salary Range</span>
                <span className="mt-1 block font-bold text-slate-800 dark:text-slate-200">
                  {jobSalary}
                </span>
              </div>
              <div>
                <span className="block text-slate-400">Posted Date</span>
                <span className="mt-1 block font-bold text-slate-800 dark:text-slate-200">
                  {formatShortDate(postedDate)}
                </span>
              </div>
              <div>
                <span className="block text-slate-400">Openings</span>
                <span className="mt-1 block font-bold text-slate-800 dark:text-slate-200">
                  {openings}
                </span>
              </div>
            </div>
          </section>

          {/* 2. Your Application Section (Submitted snapshot) */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Your Application
                </h2>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Information and documents submitted for this role.
                </p>
              </div>
              <StatusBadge status={application.status} size="lg" />
            </div>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Applicant Name
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {application.candidateName}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </span>
                  <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                    {application.candidateEmail}
                  </p>
                </div>

                {application.candidatePhone && (
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Phone Number
                    </span>
                    <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {application.candidatePhone}
                    </p>
                  </div>
                )}
              </div>

              {/* Submitted Resume Box */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Submitted Resume
                </span>
                {resumeUrl ? (
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      <FiFileText className="text-lg text-brand shrink-0" />
                      <span className="truncate flex-1" title={resumeName}>
                        {resumeName}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewOpen(true)}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-brand/90"
                      >
                        <FiEye /> View
                      </button>

                      <a
                        href={getFullResumeUrl(resumeUrl)}
                        download={resumeName}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                      >
                        <FiDownload /> Download
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-slate-400">
                    No custom resume attached.
                  </p>
                )}
              </div>
            </div>

            {/* Cover Letter */}
            {application.coverLetter && (
              <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Cover Letter
                </h3>
                <div className="mt-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
                  {application.coverLetter}
                </div>
              </div>
            )}

            {/* Custom Questions Answers if any */}
            {application.answers?.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Submitted Answers
                </h3>
                <div className="mt-3 space-y-3">
                  {application.answers.map((ans, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                    >
                      <p className="font-bold text-slate-800 dark:text-slate-200">
                        {ans.question || `Question ${idx + 1}`}
                      </p>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        {ans.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN: Application Status, Timeline, Recruiter Info, Withdraw */}
        <div className="space-y-8">
          {/* 3. Application Status & Meta Card */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Application Summary
            </h3>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <span className="text-slate-500">Status</span>
                <StatusBadge status={application.status} />
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <span className="text-slate-500">Application ID</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  #{String(appId).slice(-8).toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <span className="text-slate-500">Applied On</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatShortDate(appliedDate)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                <span className="text-slate-500">Last Updated</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatShortDate(lastUpdated)}
                </span>
              </div>
            </div>
          </section>

          {/* 4. Application Timeline (Authentic backend history) */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Application Timeline
            </h3>
            <ApplicationTimeline application={application} />
          </section>

          {/* 5. Recruiter & Company Information */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Hiring Organization
            </h3>

            <div className="flex items-start gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-xl font-bold text-brand dark:bg-brand/20">
                {companyName?.[0]?.toUpperCase() || "C"}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {companyName}
                </h4>
                <p className="text-xs text-slate-500">
                  {application.recruiterName || recruiter.name || "Talent Acquisition Team"}
                </p>
                {jobLocation && (
                  <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                    <FiMapPin className="text-brand" /> {jobLocation}
                  </p>
                )}
              </div>
            </div>

            {/* Chat Action */}
            {onOpenChat && (
              <button
                type="button"
                onClick={() => onOpenChat(application)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-brand/90 active:scale-98"
              >
                <FiMessageCircle className="text-base" />
                <span>Chat with Recruiter</span>
              </button>
            )}
          </section>

          {/* 6. Withdraw Application Action */}
          {canWithdraw && onWithdraw && (
            <div className="rounded-3xl border border-rose-100 bg-rose-50/60 p-6 text-center dark:border-rose-900/40 dark:bg-rose-950/20">
              <p className="text-xs text-rose-700 dark:text-rose-300">
                Changed your mind? You can withdraw this application before it reaches advanced stages.
              </p>
              <button
                type="button"
                onClick={() => onWithdraw(appId)}
                className="mt-3 rounded-2xl border border-rose-300 bg-white px-5 py-2 text-xs font-bold text-rose-600 shadow-2xs transition hover:bg-rose-50 dark:border-rose-800 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
              >
                Withdraw Application
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resume Preview Modal */}
      {resumeUrl && (
        <ResumePreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          resumeUrl={resumeUrl}
          resumeName={resumeName}
        />
      )}
    </div>
  );

  if (isPage) {
    return content;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="applied-job-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div className="relative my-auto max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[32px] bg-slate-50/70 p-4 sm:p-6 dark:bg-slate-950/80 shadow-2xl">
        {content}
      </div>
    </div>
  );
}
