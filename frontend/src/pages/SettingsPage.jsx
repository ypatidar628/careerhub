import { useApp } from "../context/AppContext";
export default function SettingsPage() {
  const { dark, setDark } = useApp();
  return (
    <div>
      <h1 className="text-3xl font-bold dark:text-white">Settings</h1>
      <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
        <div>
          <h2 className="font-bold dark:text-white">Dark mode</h2>
          <p className="text-sm text-slate-500">
            Use a softer theme for low-light work.
          </p>
        </div>
        <button
          role="switch"
          aria-checked={dark}
          onClick={() => setDark(!dark)}
          className={`h-7 w-12 rounded-full p-1 transition ${dark ? "bg-brand" : "bg-slate-300"}`}
        >
          <span
            className={`block h-5 w-5 rounded-full bg-white transition ${dark ? "translate-x-5" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
