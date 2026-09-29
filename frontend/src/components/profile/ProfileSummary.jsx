import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiAward,
  FiBriefcase,
  FiMessageCircle,
  FiFileText,
  FiStar,
  FiGrid,
  FiPlusCircle,
} from "react-icons/fi";
import ProfileImage from "./ProfileImage";
import ProfileStats from "./ProfileStats";

export default function ProfileSummary({
  user,
  stats,
  preview,
  uploading,
  onImageChange,
}) {
  const profile = user?.profile || {};
  const role = user?.role || "candidate";

  const rating = profile.rating || 4.8;
  const reviewsCount = profile.reviewsCount || 18;
  const department = profile.department || profile.education || (role === "recruiter" ? "Talent Acquisition" : "Engineering");
  const enrollmentNumber = profile.enrollmentNumber || `CH-${String(user?.id || user?._id || "2026").slice(-4).toUpperCase()}`;
  const location = profile.location || (profile.city && profile.country ? `${profile.city}, ${profile.country}` : "Location not specified");

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-xs transition dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        {/* Top Profile Image */}
        <ProfileImage
          imageUrl={preview}
          name={user?.name}
          uploading={uploading === "avatar"}
          onImageChange={onImageChange}
        />

        {/* Name, Role & Star Rating */}
        <div className="mt-3 text-center">
          <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white">
            {user?.name}
          </h2>

          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-bold text-brand uppercase tracking-wider dark:bg-brand/20">
              {role === "recruiter" ? "Recruiter" : role === "admin" ? "Admin" : "Candidate"}
            </span>

            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <FiStar className="fill-amber-400 text-amber-400" />
              <span>{rating}</span>
              <span className="text-[10px] opacity-75">({reviewsCount})</span>
            </span>
          </div>

          <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            {user?.email}
          </p>
        </div>

        {/* Platform Statistics */}
        <div className="mt-4">
          <ProfileStats stats={stats} role={role} />
        </div>

        {/* Details Meta (Location, Department, Enrollment) */}
        <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <FiMapPin className="text-sm text-brand shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <FiAward className="text-sm text-brand shrink-0" />
            <span className="truncate">{department}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <FiBriefcase className="text-sm text-brand shrink-0" />
            <span className="font-mono font-medium">ID: {enrollmentNumber}</span>
          </div>
        </div>

        {/* Role-Specific Quick Action Buttons */}
        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
          <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Quick Actions
          </h2>

          <div className="space-y-1.5">
            {role === "candidate" && (
              <>
                <Link
                  to="/applications"
                  aria-label="My Applications - View"
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FiFileText className="text-base text-brand" /> My Applications
                  </span>
                  <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    View
                  </span>
                </Link>

                <Link
                  to="/messages"
                  aria-label="Direct Messages - Chat"
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FiMessageCircle className="text-base text-brand" /> Direct Messages
                  </span>
                  <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    Chat
                  </span>
                </Link>
              </>
            )}

            {role === "recruiter" && (
              <>
                <Link
                  to="/post-job"
                  aria-label="Post a Job - Create"
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FiPlusCircle className="text-base text-brand" /> Post a Job
                  </span>
                  <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    Create
                  </span>
                </Link>

                <Link
                  to="/manage-jobs"
                  aria-label="Manage Jobs - Edit and Review"
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FiGrid className="text-base text-brand" /> Manage Jobs
                  </span>
                  <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    Manage
                  </span>
                </Link>

                <Link
                  to="/applications"
                  aria-label="Applicant Pipeline - Review"
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FiFileText className="text-base text-brand" /> Applicant Pipeline
                  </span>
                  <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    Review
                  </span>
                </Link>
              </>
            )}

            {role === "admin" && (
              <Link
                to="/dashboard"
                aria-label="Admin Dashboard - Access"
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span className="flex items-center gap-2">
                  <FiGrid className="text-base text-brand" /> Admin Dashboard
                </span>
                <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                  Access
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
