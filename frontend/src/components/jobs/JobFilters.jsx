import { FiFilter, FiRotateCcw, FiX } from "react-icons/fi";
import CustomSelect from "../common/CustomSelect";

export const CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Engineering", value: "Engineering" },
  { label: "Design", value: "Design" },
  { label: "Product", value: "Product" },
  { label: "Data", value: "Data" },
  { label: "DevOps", value: "DevOps" },
  { label: "Marketing", value: "Marketing" },
  { label: "Sales", value: "Sales" },
];

export const WORK_MODES = ["All", "Remote", "Hybrid", "On-site"];

export const EXPERIENCE_LEVELS = [
  { label: "All Experience", value: "" },
  { label: "Entry Level (0-2 yrs)", value: "1" },
  { label: "Mid Level (3-5 yrs)", value: "3" },
  { label: "Senior Level (5+ yrs)", value: "5" },
];

export const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Job Title (A-Z)", value: "title_asc" },
  { label: "Highest Salary", value: "salary_high" },
];

export default function JobFilters({
  filters,
  onChange,
  onReset,
  isOpenMobile,
  onCloseMobile,
}) {
  const handleSelect = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 });
  };

  const handleModeToggle = (mode) => {
    const nextMode = mode === "All" ? "" : mode;
    onChange({ ...filters, mode: nextMode, page: 1 });
  };

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <FiFilter className="text-brand" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Filter Jobs
          </h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-brand dark:text-slate-400 dark:hover:text-brand"
        >
          <FiRotateCcw className="text-xs" /> Reset
        </button>
      </div>

      {/* Sort By */}
      <div>
        <CustomSelect
          label="Sort By"
          value={filters.sort || "newest"}
          options={SORT_OPTIONS}
          onChange={(val) => handleSelect("sort", val)}
        />
      </div>

      {/* Category Dropdown */}
      <div>
        <CustomSelect
          label="Job Category"
          value={filters.category || ""}
          options={CATEGORIES}
          onChange={(val) => handleSelect("category", val)}
        />
      </div>

      {/* Work Mode */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Workplace Mode
        </label>
        <div className="flex flex-wrap gap-2">
          {WORK_MODES.map((mode) => {
            const isSelected =
              (!filters.mode && mode === "All") || filters.mode === mode;
            return (
              <button
                key={mode}
                type="button"
                onClick={() => handleModeToggle(mode)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  isSelected
                    ? "bg-brand text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {mode}
              </button>
            );
          })}
        </div>
      </div>

      {/* Experience Level */}
      <div>
        <CustomSelect
          label="Experience Level"
          value={filters.experience || ""}
          options={EXPERIENCE_LEVELS}
          onChange={(val) => handleSelect("experience", val)}
        />
      </div>

      {/* Location Search Input */}
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">
          Location
        </label>
        <input
          type="text"
          value={filters.location || ""}
          onChange={(e) => handleSelect("location", e.target.value)}
          placeholder="e.g. Bengaluru, Remote"
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand"
        />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-24 rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-800">
          {content}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800 dark:text-white">
                Filters
              </h2>
              <button
                type="button"
                onClick={onCloseMobile}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <FiX className="text-lg" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{content}</div>
            <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full rounded-xl bg-brand py-3 text-sm font-bold text-white shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
