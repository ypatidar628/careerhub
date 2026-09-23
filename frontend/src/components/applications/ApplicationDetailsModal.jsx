import { useState } from "react";
import {
  FiX,
  FiFileText,
  FiDownload,
  FiMessageCircle,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiEye,
  FiMapPin,
  FiUsers,
  FiAward,
  FiClock,
  FiChevronDown,
  FiChevronUp,
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
  const [showDetails, setShowDetails] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!isOpen || !application) return null;

  const canWithdraw =
    !isRecruiter && ["Applied", "Under Review"].includes(application.status);

  const candidateAvatar =
    application.candidateAvatar ||
    application.candidateProfile?.avatarUrl ||
    application.candidateProfileImage;

  const displayName = isRecruiter
    ? application.candidateName || "Candidate"
    : application.candidateName || "Candidate Profile";

  const displayLocation =
    application.candidateProfile?.location ||
    application.location ||
    "Remote / Flexible";

  const displayRole = application.jobTitle || "Job Application";
  const displayCompanyOrSub = isRecruiter
    ? application.candidateProfile?.bio || application.jobTitle
    : `${application.company || "Company"} · ${application.mode || "Full-time"}`;

  const matchScore = application.score ? `${application.score}%` : "95%";
  const experienceVal = application.candidateProfile?.experience
    ? String(application.candidateProfile.experience).includes("yr") ||
      String(application.candidateProfile.experience).includes("year")
      ? application.candidateProfile.experience
      : `${application.candidateProfile.experience} Yrs`
    : "3+ Yrs";
  const skillsCount =
    application.candidateProfile?.skills?.length ||
    (application.skills?.length ? application.skills.length : 5);

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-details-title"
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="relative my-auto w-full max-w-2xl overflow-hidden rounded-[36px] bg-white shadow-2xl transition dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
          {/* Top Bokeh Gradient Banner */}
          <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gradient-to-r from-[#ff4b72] via-[#ff6088] to-[#ff7c65] p-6">
            {/* Bokeh blurred glowing circles */}
            <div className="pointer-events-none absolute -left-10 -top-10 h-44 w-44 rounded-full bg-white/20 blur-xl" />
            <div className="pointer-events-none absolute right-12 top-4 h-32 w-32 rounded-full bg-white/25 blur-lg" />
            <div className="pointer-events-none absolute right-1/3 -bottom-8 h-36 w-36 rounded-full bg-white/15 blur-2xl" />
            <div className="pointer-events-none absolute left-1/4 top-10 h-20 w-20 rounded-full bg-white/20 blur-md" />

            {/* Top Close Button */}
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="absolute right-5 top-5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition hover:bg-black/35 hover:scale-105 active:scale-95"
            >
              <FiX className="text-lg" />
            </button>
          </div>

          {/* Overlapping Profile Card Section */}
          <div className="relative px-6 sm:px-10 pb-8 -mt-20">
            {/* Centered Circular Avatar */}
            <div className="relative z-10 mx-auto flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-xl dark:border-slate-900 dark:bg-slate-800">
              {candidateAvatar ? (
                <img
                  src={candidateAvatar}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-[#ff4b72] to-[#ff7c65] text-3xl sm:text-4xl font-black text-white">
                  {displayName?.[0]?.toUpperCase() || "U"}
                </div>
              )}
            </div>

            {/* Top Left & Right Action Bar */}
            <div className="relative -mt-16 sm:-mt-20 mb-12 flex items-center justify-between">
              {/* Left: Status / Connect badge */}
              <div className="flex items-center gap-2 rounded-full bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-[#ff4b72] dark:bg-rose-950/40 dark:text-rose-300">
                <FiUsers className="text-sm" />
                <span>{application.status || "Active Candidate"}</span>
              </div>

              {/* Right: Message action */}
              {onOpenChat && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChat(application);
                  }}
                  className="flex items-center gap-2 rounded-full bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-[#ff4b72] transition hover:bg-rose-100 hover:text-[#e03a5a] dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
                >
                  <FiMessageCircle className="text-sm" />
                  <span>Message</span>
                </button>
              )}
            </div>

            {/* Candidate / Job Typography */}
            <div className="text-center">
              <h2
                id="app-details-title"
                className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white"
              >
                {displayName}
              </h2>
              <p className="mt-1 flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
                <FiMapPin className="text-[#ff4b72]" />
                {displayLocation}
              </p>

              <div className="mt-4 space-y-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  {displayRole}
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  {displayCompanyOrSub}
                </p>
              </div>
            </div>

            {/* 3 Metric Counters */}
            <div className="my-6 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/70 py-4 text-center dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-800/50">
              <div>
                <span className="block text-lg sm:text-2xl font-black text-slate-800 dark:text-white">
                  {matchScore}
                </span>
                <span className="mt-0.5 block text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                  Match Score
                </span>
              </div>
              <div>
                <span className="block text-lg sm:text-2xl font-black text-slate-800 dark:text-white">
                  {experienceVal}
                </span>
                <span className="mt-0.5 block text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                  Experience
                </span>
              </div>
              <div>
                <span className="block text-lg sm:text-2xl font-black text-slate-800 dark:text-white">
                  {skillsCount}
                </span>
                <span className="mt-0.5 block text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400">
                  Key Skills
                </span>
              </div>
            </div>

            {/* Coral-Pink Gradient "Show more" Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff4b72] via-[#ff5e82] to-[#ff7a63] px-8 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-rose-500/25 transition-all duration-200 hover:scale-[1.03] hover:shadow-lg hover:shadow-rose-500/40 active:scale-95"
              >
                <span>{showDetails ? "Show less" : "Show more"}</span>
                {showDetails ? <FiChevronUp /> : <FiChevronDown />}
              </button>
            </div>

            {/* Expandable Application Details */}
            {showDetails && (
              <div className="mt-8 space-y-6 border-t border-slate-100 pt-6 dark:border-slate-800 animate-in fade-in slide-in-from-top-3 duration-200">
                {/* Contact & Resume Row */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Contact Info */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Contact Information
                    </h3>
                    <div className="space-y-2 text-xs">
                      {application.candidateEmail && (
                        <p className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                          <FiMail className="text-[#ff4b72]" />
                          <span>{application.candidateEmail}</span>
                        </p>
                      )}
                      {application.candidatePhone && (
                        <p className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
                          <FiPhone className="text-[#ff4b72]" />
                          <span>{application.candidatePhone}</span>
                        </p>
                      )}
                      <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <FiClock className="text-[#ff4b72]" />
                        <span>
                          Applied on{" "}
                          {new Date(
                            application.createdAt || Date.now(),
                          ).toLocaleDateString([], { dateStyle: "long" })}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Submitted Resume Card */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <h3 className="mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Attached Resume
                    </h3>
                    {application.resumeUrl ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                          <FiFileText className="text-base text-[#ff4b72] shrink-0" />
                          <span
                            className="truncate flex-1"
                            title={application.resumeName || "Resume.pdf"}
                          >
                            {application.resumeName || "Candidate Resume.pdf"}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPreviewOpen(true)}
                            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#ff4b72] px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-[#e03a5a]"
                          >
                            <FiEye /> Preview
                          </button>
                          <a
                            href={getFullResumeUrl(application.resumeUrl)}
                            download={application.resumeName || "Resume.pdf"}
                            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-[#ff4b72] hover:text-[#ff4b72] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            <FiDownload /> Download
                          </a>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">
                        No custom resume file attached.
                      </p>
                    )}
                  </div>
                </div>

                {/* Candidate Skills */}
                {application.candidateProfile?.skills?.length > 0 && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Skills & Proficiencies
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {application.candidateProfile.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="rounded-xl bg-rose-50 border border-rose-100/60 px-3 py-1 text-xs font-semibold text-[#ff4b72] dark:bg-rose-950/30 dark:border-rose-900/40 dark:text-rose-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Cover Letter */}
                {application.coverLetter && (
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                    <h3 className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Cover Letter
                    </h3>
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {application.coverLetter}
                    </p>
                  </div>
                )}

                {/* Application Timeline */}
                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Application Stage & History
                  </h3>
                  <ApplicationTimeline application={application} />
                </div>

                {/* Candidate Withdrawal Action */}
                {canWithdraw && onWithdraw && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        onWithdraw(application.id || application._id)
                      }
                      className="rounded-xl border border-rose-200 bg-white px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/50"
                    >
                      Withdraw Application
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resume Preview Modal */}
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
