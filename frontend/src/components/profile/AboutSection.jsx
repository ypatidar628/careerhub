export default function AboutSection({
  bio,
  isEditing,
  onChange,
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            About Me
          </h3>
          <p className="text-xs text-slate-400">
            A brief summary of your background, experience, and career aspirations.
          </p>
        </div>
      </div>

      <div className="pt-1">
        <textarea
          name="bio"
          value={bio}
          onChange={onChange}
          disabled={!isEditing}
          rows="4"
          maxLength={1000}
          placeholder="A beautiful dashboard for Bootstrap 4. It is Free and Open Source. Describe your background, experience, and interests here..."
          className={`w-full resize-none rounded-2xl border p-3.5 text-xs sm:text-sm font-medium leading-relaxed outline-none transition ${
            !isEditing
              ? "border-slate-200 bg-slate-100/70 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 cursor-not-allowed"
              : "border-slate-300 bg-white text-slate-800 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-brand"
          }`}
        />
        <div className="mt-1 flex justify-end text-[10px] text-slate-400">
          <span>{bio?.length || 0} / 1000 characters</span>
        </div>
      </div>
    </div>
  );
}
