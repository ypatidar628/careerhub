import { FiUser, FiMail, FiPhone, FiAward, FiLock } from "react-icons/fi";

export default function PersonalInformation({
  form,
  user,
  isEditing,
  onChange,
  errors = {},
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Personal Information
          </h3>
          <p className="text-xs text-slate-400">
            Core personal and profile details.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 text-xs">
        {/* Full Name */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300">
            Full Name <span className="text-rose-500">*</span>
          </label>
          <div className="relative mt-1.5">
            <FiUser className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={onChange}
              disabled={!isEditing}
              placeholder="e.g. Yogendra Patidar"
              className={`w-full rounded-2xl border p-3 pl-10 text-xs font-semibold outline-none transition ${
                !isEditing
                  ? "border-slate-200 bg-slate-100/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
                  : "border-slate-300 bg-white text-slate-800 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand"
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-[11px] text-rose-500">{errors.name}</p>
          )}
        </div>

        {/* Email Address (Read-only) */}
        <div>
          <label className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
            <span>Email Address</span>
            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-normal">
              <FiLock className="text-[10px]" /> Read Only
            </span>
          </label>
          <div className="relative mt-1.5">
            <FiMail className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
            <input
              value={user?.email || ""}
              readOnly
              disabled
              className="w-full rounded-2xl border border-slate-200 bg-slate-100/70 p-3 pl-10 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300">
            Phone Number
          </label>
          <div className="relative mt-1.5">
            <FiPhone className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
            <input
              name="phone"
              type="tel"
              value={form.phone}
              onChange={onChange}
              disabled={!isEditing}
              placeholder="+91 98765 43210"
              className={`w-full rounded-2xl border p-3 pl-10 text-xs font-semibold outline-none transition ${
                !isEditing
                  ? "border-slate-200 bg-slate-100/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
                  : "border-slate-300 bg-white text-slate-800 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand"
              }`}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-[11px] text-rose-500">{errors.phone}</p>
          )}
        </div>

        {/* Role (Read-only) */}
        <div>
          <label className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
            <span>Account Role</span>
            <span className="flex items-center gap-1 text-[10px] text-slate-400 font-normal">
              <FiLock className="text-[10px]" /> Read Only
            </span>
          </label>
          <div className="relative mt-1.5">
            <input
              value={user?.role?.toUpperCase() || "CANDIDATE"}
              readOnly
              disabled
              className="w-full rounded-2xl border border-slate-200 bg-slate-100/70 p-3 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Department / Specialization */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300">
            Department / Specialization
          </label>
          <div className="relative mt-1.5">
            <FiAward className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
            <input
              name="department"
              type="text"
              value={form.department}
              onChange={onChange}
              disabled={!isEditing}
              placeholder="e.g. Computer Science & Engineering"
              className={`w-full rounded-2xl border p-3 pl-10 text-xs font-semibold outline-none transition ${
                !isEditing
                  ? "border-slate-200 bg-slate-100/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
                  : "border-slate-300 bg-white text-slate-800 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand"
              }`}
            />
          </div>
        </div>

        {/* Enrollment / ID Number */}
        <div>
          <label className="block font-bold text-slate-700 dark:text-slate-300">
            Enrollment / Candidate ID
          </label>
          <div className="relative mt-1.5">
            <input
              name="enrollmentNumber"
              type="text"
              value={form.enrollmentNumber}
              onChange={onChange}
              disabled={!isEditing}
              placeholder="e.g. CH-2026-8841"
              className={`w-full rounded-2xl border p-3 text-xs font-semibold outline-none transition ${
                !isEditing
                  ? "border-slate-200 bg-slate-100/70 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400 cursor-not-allowed"
                  : "border-slate-300 bg-white text-slate-800 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
