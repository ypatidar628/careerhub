import { useState } from "react";
import {
  FiX,
  FiFileText,
  FiDownload,
  FiMessageCircle,
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiEye,
} from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import ApplicationTimeline from "./ApplicationTimeline";
import ResumePreviewModal, { getFullResumeUrl } from "../common/ResumePreviewModal";

export default function ApplicationDetailsModal({
  application,
  isOpen,
  onClose,
  onOpenChat,
  onWithdraw,
  isRecruiter = false,
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!isOpen || !application) return null;

  const canWithdraw = !isRecruiter && ["Applied", "Under Review"].includes(application.status);

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-details-title"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
      >
        <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl transition dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 pb-5 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 id="app-details-title" className="text-xl font-bold text-slate-900 dark:text-white">
                  {application.jobTitle}
                </h2>
                <StatusBadge status={application.status} />
              </div>
              <p className="mt-1 text-sm font-medium text-slate-600 dark:text-slate-300">
                {application.company} · {application.location || "Remote"} ({application.mode || "Hybrid"})
              </p>
            </div>

            <button
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <FiX className="text-xl" />
            </button>
          </div>

          {/* Action bar */}
          <div className="my-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Applied on {new Date(application.createdAt || Date.now()).toLocaleDateString([], { dateStyle: "long" })}
            </div>
            <div className="flex items-center gap-2">
              {onOpenChat && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenChat(application);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-brand/90"
                >
                  <FiMessageCircle className="text-sm" />
                  {isRecruiter ? "Chat with Candidate" : "Chat with Recruiter"}
                </button>
              )}
              {canWithdraw && onWithdraw && (
                <button
                  onClick={() => onWithdraw(application.id || application._id)}
                  className="rounded-xl border border-rose-300 bg-white px-3.5 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
                >
                  Withdraw Application
                </button>
              )}
            </div>
          </div>

          {/* Candidate / Recruiter Information */}
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {isRecruiter ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Applicant Information
                </h3>
                <div className="space-y-1.5 text-xs">
                  <p className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                    <FiUser className="text-brand" /> {application.candidateName}
                  </p>
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <FiMail className="text-brand" /> {application.candidateEmail}
                  </p>
                  {application.candidatePhone && (
                    <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                      <FiPhone className="text-brand" /> {application.candidatePhone}
                    </p>
                  )}
                  {application.candidateProfile?.skills?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {application.candidateProfile.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-md bg-brand/10 px-2 py-0.5 text-[10px] font-semibold text-brand dark:bg-brand/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Recruiter Information
                </h3>
                <div className="space-y-1.5 text-xs">
                  <p className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                    <FiUser className="text-brand" /> {application.recruiterName || "Hiring Manager"}
                  </p>
                  <p className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <FiBriefcase className="text-brand" /> {application.company}
                  </p>
                </div>
              </div>
            )}

            {/* Resume Box */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Submitted Resume
              </h3>
              {application.resumeUrl ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 text-xs font-bold text-slate-800 shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    <div className="flex items-center gap-2 min-w-0">
                      <FiFileText className="text-base shrink-0 text-brand" />
                      <span className="truncate max-w-[140px]" title={application.resumeName || "Resume"}>
                        {application.resumeName || "Resume.pdf"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-brand px-3 py-2 text-xs font-bold text-white shadow-2xs transition hover:bg-brand/90"
                    >
                      <FiEye /> Preview
                    </button>
                    <a
                      href={getFullResumeUrl(application.resumeUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={application.resumeName || "Resume.pdf"}
                      className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <FiDownload /> Download
                    </a>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">No custom resume attached.</p>
              )}
            </div>
          </div>

          {/* Cover Letter */}
          {application.coverLetter && (
            <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <h3 className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Cover Letter
              </h3>
              <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                {application.coverLetter}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="mt-6">
            <ApplicationTimeline application={application} />
          </div>
        </div>
      </div>

      {application.resumeUrl && (
        <ResumePreviewModal
          isOpen={previewOpen}
          onClose={() => setPreviewOpen(false)}
          resumeUrl={application.resumeUrl}
          resumeName={application.resumeName || "Resume.pdf"}
        />
      )}
    </>
  );
}
