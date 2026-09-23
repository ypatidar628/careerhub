import { Link } from "react-router-dom";
import {
  FiMapPin,
  FiAward,
  FiBriefcase,
  FiMessageCircle,
  FiBookmark,
  FiFileText,
  FiStar,
  FiCheckCircle,
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
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xs transition dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        {/* Top Profile Image */}
        <ProfileImage
          imageUrl={preview}
          name={user?.name}
          uploading={uploading === "avatar"}
          onImageChange={onImageChange}
        />

        {/* Name, Role & Star Rating */}
        <div className="mt-4 text-center">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white">
            {user?.name}
          </h2>

          <div className="mt-1.5 flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full bg-brand/10 px-3 py-0.5 text-xs font-bold text-brand uppercase tracking-wider dark:bg-brand/20">
              {role === "recruiter" ? "Recruiter" : role === "admin" ? "Admin" : "Candidate"}
            </span>

            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
              <FiStar className="fill-amber-400 text-amber-400" />
              <span>{rating}</span>
              <span className="text-[10px] opacity-75">({reviewsCount})</span>
            </span>
          </div>

          <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            {user?.email}
          </p>
        </div>

        {/* Platform Statistics */}
        <div className="mt-6">
          <ProfileStats stats={stats} role={role} />
        </div>

        {/* Details Meta (Location, Department, Enrollment) */}
        <div className="mt-6 space-y-3 border-t border-slate-100 pt-5 text-xs dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <FiMapPin className="text-base text-brand shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <FiAward className="text-base text-brand shrink-0" />
            <span className="truncate">{department}</span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <FiBriefcase className="text-base text-brand shrink-0" />
            <span className="font-mono font-medium">ID: {enrollmentNumber}</span>
          </div>
        </div>

        {/* Role-Specific Quick Action Buttons */}
        <div className="mt-6 border-t border-slate-100 pt-5 dark:border-slate-800">
          <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Actions
          </h3>

          <div className="space-y-2">
            {role === "candidate" && (
              <>
                <Link
                  to="/applications"
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FiFileText /> My Applications
                  </span>
                  <span className="text-[11px] text-slate-400">View</span>
                </Link>

                <Link
                  to="/messages"
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FiMessageCircle /> Direct Messages
                  </span>
                  <span className="text-[11px] text-slate-400">Chat</span>
                </Link>
              </>
            )}

            {role === "recruiter" && (
              <>
                <Link
                  to="/post-job"
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FiPlusCircle /> Post a Job
                  </span>
                  <span className="text-[11px] text-slate-400">Create</span>
                </Link>

                <Link
                  to="/manage-jobs"
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FiGrid /> Manage Jobs
                  </span>
                  <span className="text-[11px] text-slate-400">Manage</span>
                </Link>

                <Link
                  to="/applications"
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FiFileText /> Applicant Pipeline
                  </span>
                  <span className="text-[11px] text-slate-400">Review</span>
                </Link>
              </>
            )}

            {role === "admin" && (
              <Link
                to="/dashboard"
                className="flex items-center justify-between rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-brand/10 hover:text-brand dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <span className="flex items-center gap-2">
                  <FiGrid /> Admin Dashboard
                </span>
                <span className="text-[11px] text-slate-400">Access</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
