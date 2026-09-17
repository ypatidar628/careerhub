export default function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{label}</p>
        <span className="text-brand">{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold dark:text-white">{value}</p>
    </div>
  );
}
