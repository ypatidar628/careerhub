import { useState } from "react";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBriefcase,
  FiCalendar,
  FiGlobe,
  FiGithub,
  FiLinkedin,
  FiFileText,
  FiDownload,
  FiEye,
  FiMessageCircle,
  FiCheckCircle,
  FiAward,
  FiClock,
  FiDollarSign,
  FiX,
  FiEdit3,
} from "react-icons/fi";
import StatusBadge from "./StatusBadge";
import ApplicationTimeline from "./ApplicationTimeline";
import CustomSelect from "../common/CustomSelect";
import ResumePreviewModal, { getFullResumeUrl } from "../common/ResumePreviewModal";

export default function ApplicantDetails({
  application,
  onClose,
  onOpenChat,
  onUpdateStage,
  stages = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview",
    "Selected",
    "Rejected",
  ],
  isPage = false,
}) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [statusNote, setStatusNote] = useState("");
  const [updating, setUpdating] = useState(false);

  if (!application) return null;

  const candidateProfile = application.candidateProfile || {};
  const candidateUser = application.candidateId || {};
  const job = application.job || application.jobId || {};

  const candidateName =
    application.candidateName || candidateUser.name || "Candidate Name";
  const candidateEmail =
    application.candidateEmail || candidateUser.email || "N/A";
  const candidatePhone =
    application.candidatePhone ||
    candidateProfile.phone ||
    candidateUser.phone ||
    "";
  const candidateLocation =
    candidateProfile.location || application.location || "Not specified";
  const candidateExperience =
    candidateProfile.experience || "Not specified";
  const candidateBio =
    candidateProfile.bio || candidateUser.bio || "";
  const candidateSkills =
    candidateProfile.skills?.length > 0
      ? candidateProfile.skills
      : candidateUser.skills || [];
  const candidateEducation =
    candidateProfile.education || "Bachelor's Degree or Equivalent";
  const candidateAvatar =
    candidateProfile.avatarUrl ||
    candidateUser.profileImage ||
    application.candidateAvatar;

  const portfolioUrl =
    candidateProfile.portfolioUrl || candidateProfile.website;
  const githubUrl = candidateProfile.githubUrl;
  const linkedinUrl = candidateProfile.linkedinUrl;

  const matchScore = application.score || 85;
  const resumeUrl = application.resumeUrl || candidateProfile.resumeUrl;
  const resumeName =
    application.resumeName || candidateProfile.resumeName || "Candidate_Resume.pdf";
  const appId = application.id || application._id || "N/A";

  const handleStageChange = async (newStatus) => {
    if (!onUpdateStage) return;
    setUpdating(true);
    try {
      await onUpdateStage(appId, newStatus, statusNote);
      setStatusNote("");
    } finally {
      setUpdating(false);
    }
  };

  const content = (
    <div className="space-y-8">
      {/* Top Banner / Candidate Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand via-indigo-600 to-purple-600 p-6 text-white shadow-md sm:p-8">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-6">
          <div className="flex flex-wrap items-center gap-5">
            {/* Avatar */}
            <div className="flex h-20 w-20 sm:h-24 sm:w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white/30 bg-white shadow-lg dark:bg-slate-800">
              {candidateAvatar ? (
                <img
                  src={candidateAvatar}
                  alt={candidateName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-brand">
                  {candidateName?.[0]?.toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                  Applicant Profile
                </span>
                <span className="rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-200">
                  {matchScore}% Match
                </span>
              </div>

              <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                {candidateName}
              </h1>

              <p className="mt-0.5 text-xs sm:text-sm font-medium text-white/80">
                Applied for: <span className="font-bold text-white">{application.jobTitle || job.title}</span>
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/80">
                <span className="flex items-center gap-1">
                  <FiMapPin className="text-cyan-300" /> {candidateLocation}
                </span>
                <span className="flex items-center gap-1">
                  <FiBriefcase className="text-cyan-300" /> {candidateExperience}
                </span>
                <span className="flex items-center gap-1">
                  <FiCalendar className="text-cyan-300" /> Applied:{" "}
                  {new Date(application.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action buttons (Chat & Close) */}
          <div className="flex items-center gap-3">
            {onOpenChat && (
              <button
                type="button"
                onClick={() => onOpenChat(application)}
                className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-brand shadow-sm transition hover:bg-slate-100 active:scale-95"
              >
                <FiMessageCircle className="text-base" />
                <span>Chat with Candidate</span>
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

      {/* Main Grid: Candidate Profile Left, Application & Pipeline Right */}
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* LEFT COLUMN: Candidate Full Profile & Submitted Materials */}
        <div className="space-y-8">
          {/* 1. Candidate Contact & Profile Card */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Candidate Information
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 text-xs">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <FiMail className="text-base text-brand shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Email Address
                  </span>
                  <a
                    href={`mailto:${candidateEmail}`}
                    className="truncate font-semibold text-slate-800 hover:text-brand dark:text-slate-200"
                  >
                    {candidateEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <FiPhone className="text-base text-brand shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Phone Number
                  </span>
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                    {candidatePhone || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <FiMapPin className="text-base text-brand shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Location
                  </span>
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                    {candidateLocation}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
                <FiBriefcase className="text-base text-brand shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Total Experience
                  </span>
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-200">
                    {candidateExperience}
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            {candidateBio && (
              <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Professional Bio
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {candidateBio}
                </p>
              </div>
            )}

            {/* Skills */}
            {candidateSkills.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Skills & Proficiencies
                </h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {candidateSkills.map((skill, idx) => (
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

            {/* Social / Portfolio Links */}
            {(portfolioUrl || githubUrl || linkedinUrl) && (
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">
                {portfolioUrl && (
                  <a
                    href={portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
                  >
                    <FiGlobe /> Portfolio
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
                  >
                    <FiGithub /> GitHub
                  </a>
                )}
                {linkedinUrl && (
                  <a
                    href={linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-brand hover:text-brand dark:border-slate-700 dark:text-slate-300"
                  >
                    <FiLinkedin /> LinkedIn
                  </a>
                )}
              </div>
            )}
          </section>

          {/* 2. Submitted Application Details */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Application Submission Details
            </h2>

            {/* Resume Action Box */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-xl font-bold text-brand dark:bg-brand/20">
                    <FiFileText />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Submitted Resume
                    </span>
                    <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-200" title={resumeName}>
                      {resumeName}
                    </p>
                  </div>
                </div>

                {resumeUrl && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="flex items-center gap-1.5 rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-brand/90"
                    >
                      <FiEye /> View Resume
                    </button>
                    <a
                      href={getFullResumeUrl(resumeUrl)}
                      download={resumeName}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:border-brand hover:text-brand dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                    >
                      <FiDownload /> Download
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Additional submitted details (Expected Salary, Notice Period) */}
            {(application.expectedSalary || application.noticePeriod) && (
              <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                {application.expectedSalary && (
                  <div>
                    <span className="text-slate-400">Expected Salary</span>
                    <p className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                      {application.expectedSalary}
                    </p>
                  </div>
                )}
                {application.noticePeriod && (
                  <div>
                    <span className="text-slate-400">Notice Period</span>
                    <p className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                      {application.noticePeriod}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Cover Letter */}
            {application.coverLetter && (
              <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Cover Letter
                </h3>
                <div className="mt-2 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs sm:text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-300">
                  {application.coverLetter}
                </div>
              </div>
            )}

            {/* Custom Answers */}
            {application.answers?.length > 0 && (
              <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Custom Application Answers
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

        {/* RIGHT COLUMN: Stage Controls & Audit Timeline */}
        <div className="space-y-8">
          {/* 3. Recruiter Stage Action Box */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pipeline Stage
              </h3>
              <StatusBadge status={application.status} />
            </div>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Move Candidate to Stage:
              </label>
              <CustomSelect
                value={application.status}
                onChange={handleStageChange}
                disabled={updating}
                options={stages.map((s) => ({ label: s, value: s }))}
              />

              <div className="pt-2">
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">
                  Add Internal Note (optional):
                </label>
                <input
                  type="text"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Cleared technical interview round 1"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 outline-none transition focus:border-brand dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          </section>

          {/* 4. Application Timeline */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Application Timeline & Audit
            </h3>
            <ApplicationTimeline application={application} />
          </section>
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
      aria-labelledby="applicant-details-modal-title"
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
