export default function ProfileStats({ stats, role }) {
  // Default values based on role if stats object provided
  const statItems =
    role === "recruiter"
      ? [
          { label: "Posted Jobs", value: stats?.activeJobs ?? 0 },
          { label: "Applicants", value: stats?.applicants ?? 0 },
          { label: "Interviews", value: stats?.interviews ?? 0 },
        ]
      : [
          { label: "Applications", value: stats?.applications ?? 0 },
          { label: "Saved Jobs", value: stats?.savedJobs ?? 0 },
          { label: "Interviews", value: stats?.interviews ?? 0 },
        ];

  return (
    <div className="grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-slate-50/80 py-3 text-center dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-800/50">
      {statItems.map((item, idx) => (
        <div key={idx} className="px-2">
          <span className="block text-base sm:text-lg font-black text-slate-800 dark:text-white">
            {item.value}
          </span>
          <span className="block text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
