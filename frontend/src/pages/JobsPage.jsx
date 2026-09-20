import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FiSearch, FiSliders, FiBriefcase, FiRotateCcw, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import client from "../api/client";
import JobCard from "../components/jobs/JobCard";
import JobFilters from "../components/jobs/JobFilters";

export default function JobsPage() {
  const [params, setParams] = useSearchParams();
  const user = useSelector((s) => s.auth.user);

  const [jobs, setJobs] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read initial filter values from URL params
  const search = params.get("search") || "";
  const category = params.get("category") || "";
  const mode = params.get("mode") || "";
  const location = params.get("location") || "";
  const experience = params.get("experience") || "";
  const sort = params.get("sort") || "newest";
  const page = parseInt(params.get("page") || "1", 10);

  const [searchInput, setSearchInput] = useState(search);
  const debounceTimerRef = useRef(null);

  // Sync saved jobs ids if logged in candidate
  useEffect(() => {
    if (user && user.role === "candidate") {
      client
        .get("/saved-jobs/ids")
        .then(({ data }) => setSavedIds(new Set(data.ids || [])))
        .catch(() => {});
    }
  }, [user]);

  // Fetch jobs whenever URL params change
  useEffect(() => {
    let active = true;
    setLoading(true);

    const queryParams = {
      search,
      category,
      mode,
      location,
      experience,
      sort,
      page,
      limit: 12,
    };

    client
      .get("/jobs", { params: queryParams })
      .then(({ data }) => {
        if (!active) return;
        setJobs(data.jobs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
      })
      .catch((err) => {
        console.error("Failed to load jobs:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [search, category, mode, location, experience, sort, page]);

  // Handle debounced search input
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      const nextParams = new URLSearchParams(params);
      if (val) nextParams.set("search", val);
      else nextParams.delete("search");
      nextParams.set("page", "1");
      setParams(nextParams);
    }, 350);
  };

  const updateFilters = (newFilters) => {
    const nextParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) nextParams.set(k, String(v));
    });
    setParams(nextParams);
  };

  const resetFilters = () => {
    setSearchInput("");
    setParams({});
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    const nextParams = new URLSearchParams(params);
    nextParams.set("page", String(newPage));
    setParams(nextParams);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentFilters = {
    search,
    category,
    mode,
    location,
    experience,
    sort,
    page,
  };

  return (
    <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {/* Hero Search Section */}
      <div className="relative mb-8 overflow-hidden rounded-3xl bg-linear-to-r from-brand/10 via-brand/5 to-cyan-500/10 p-6 sm:p-10 dark:from-brand/20 dark:via-slate-900 dark:to-cyan-950/20">
        <div className="max-w-3xl">
          <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand dark:bg-brand/20">
            EXPLORE OPPORTUNITIES
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
            Discover your next breakthrough role
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base dark:text-slate-300">
            Search top companies, apply with verified profile, and chat with recruiters instantly.
          </p>
        </div>

        {/* Big Search Input */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchChange}
              placeholder="Search by role (e.g. React Developer), company, or skills..."
              className="w-full rounded-2xl border border-slate-300 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand focus:ring-2 focus:ring-brand/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-brand"
            />
          </div>

          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 lg:hidden"
          >
            <FiSliders className="text-brand" /> Filters
          </button>
        </div>

        {/* Quick Category Chips */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Popular:
          </span>
          {["Engineering", "Design", "DevOps", "Data", "Product"].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                const nextCat = category === cat ? "" : cat;
                updateFilters({ ...currentFilters, category: nextCat, page: 1 });
              }}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                category === cat
                  ? "bg-brand text-white"
                  : "bg-white/80 text-slate-700 hover:bg-white dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Body with Sidebar + Grid */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Filters Sidebar */}
        <div className="shrink-0 lg:w-64 xl:w-72">
          <JobFilters
            filters={currentFilters}
            onChange={updateFilters}
            onReset={resetFilters}
            isOpenMobile={mobileFiltersOpen}
            onCloseMobile={() => setMobileFiltersOpen(false)}
          />
        </div>

        {/* Jobs Results Column */}
        <div className="flex-1 min-w-0">
          {/* Header Stats */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {loading ? "Searching..." : `${total} job${total === 1 ? "" : "s"} found`}
              </p>
              {(search || category || mode || location || experience) && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Filtered results for active search criteria
                </p>
              )}
            </div>

            {(search || category || mode || location || experience) && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition hover:text-brand dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
              >
                <FiRotateCcw className="text-xs" /> Clear all filters
              </button>
            )}
          </div>

          {/* Loading Skeleton */}
          {loading && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="h-64 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800"
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !jobs.length && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-700">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-brand/10 text-3xl text-brand dark:bg-brand/20">
                <FiBriefcase />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                No matching jobs found
              </h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                We couldn't find any roles matching your current search and filter criteria.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand/90"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Jobs Grid */}
          {!loading && jobs.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {jobs.map((job) => (
                <JobCard
                  key={job.id || job._id}
                  job={job}
                  isSavedInitial={savedIds.has(job.id || job._id)}
                  onSaveToggled={(jobId, isSaved) => {
                    setSavedIds((prev) => {
                      const next = new Set(prev);
                      if (isSaved) next.add(jobId);
                      else next.delete(jobId);
                      return next;
                    });
                  }}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {!loading && totalPages > 1 && (
            <div className="mt-10 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
                className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <FiChevronLeft /> Previous
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePageChange(p)}
                    className={`grid h-8 w-8 place-items-center rounded-xl text-xs font-bold transition ${
                      p === page
                        ? "bg-brand text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => handlePageChange(page + 1)}
                className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
