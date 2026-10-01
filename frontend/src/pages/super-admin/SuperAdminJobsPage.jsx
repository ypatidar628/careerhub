import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaTrashAlt,
  FaFileDownload,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaEye,
  FaMapMarkerAlt,
  FaUsers,
  FaExclamationTriangle,
} from "react-icons/fa";
import { getPlatformJobsList, deletePlatformJob } from "../../api/superAdmin";
import { exportToCsv } from "../../utils/exportCsv";
import toast from "react-hot-toast";

export default function SuperAdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Delete modal
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getPlatformJobsList({
        page,
        limit: 15,
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchJobs();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Client sort
  const sortedJobs = useMemo(() => {
    const list = [...jobs];
    list.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [jobs, sortField, sortOrder]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return <FaSort className="text-slate-300 dark:text-slate-700" />;
    return sortOrder === "asc" ? <FaSortUp className="text-brand" /> : <FaSortDown className="text-brand" />;
  };

  const handleExportCsv = () => {
    try {
      const columns = [
        { label: "Job ID", accessor: (row) => row.id },
        { label: "Title", accessor: (row) => row.title },
        { label: "Company", accessor: (row) => row.company },
        { label: "Location", accessor: (row) => row.location },
        { label: "Mode", accessor: (row) => row.mode },
        { label: "Status", accessor: (row) => row.status },
        { label: "Recruiter Email", accessor: (row) => row.recruiterId?.email || "" },
        { label: "Applicants Count", accessor: (row) => row.applicantsCount || 0 },
        { label: "Posted At", accessor: (row) => (row.createdAt ? new Date(row.createdAt).toISOString() : "") },
      ];
      exportToCsv("careerhub-jobs-directory.csv", jobs, columns);
      toast.success(`Exported ${jobs.length} jobs to CSV`);
    } catch (e) {
      toast.error(e.message || "Failed to export CSV");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setActionLoading(true);
      await deletePlatformJob(deleteConfirm.id);
      toast.success(`Job "${deleteConfirm.title}" removed.`);
      setDeleteConfirm(null);
      fetchJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete job.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Platform Job Postings
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Monitor, inspect, search, export, and moderate all active and closed job vacancies.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <FaFileDownload className="text-xs text-slate-500 dark:text-slate-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs md:grid-cols-3 dark:border-slate-800 dark:bg-slate-900">
        <div className="relative md:col-span-2">
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search jobs by title, company, or location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-8 text-xs text-slate-800 placeholder-slate-400 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Jobs</option>
            <option value="Paused">Paused Jobs</option>
            <option value="Closed">Closed Jobs</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400">
              <tr>
                <th
                  onClick={() => toggleSort("title")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Job Title & Org</span>
                    {renderSortIcon("title")}
                  </div>
                </th>
                <th className="px-5 py-3">Location / Mode</th>
                <th className="px-5 py-3">Recruiter</th>
                <th
                  onClick={() => toggleSort("applicantsCount")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Applicants</span>
                    {renderSortIcon("applicantsCount")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("status")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {renderSortIcon("status")}
                  </div>
                </th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                    <div className="mt-2 text-xs">Loading jobs...</div>
                  </td>
                </tr>
              ) : sortedJobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                    No job postings found.
                  </td>
                </tr>
              ) : (
                sortedJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white text-xs">{job.title}</div>
                        <div className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400">{job.company}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        <FaMapMarkerAlt className="text-slate-400 text-[10px]" />
                        <span>{job.location}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{job.mode}</div>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      <div className="font-medium text-slate-900 dark:text-white">{job.recruiterId?.name || "Platform Recruiter"}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{job.recruiterId?.email}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                        <FaUsers className="text-[10px] text-sky-600 dark:text-sky-400" />
                        {job.applicantsCount || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          job.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                            : "bg-slate-100 text-slate-600 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            job.status === "Active" ? "bg-emerald-500" : "bg-slate-400"
                          }`}
                        />
                        {job.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/jobs/${job.id}`}
                          target="_blank"
                          title="View Public Job Listing"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
                        >
                          <FaEye className="text-xs" />
                        </Link>
                        <button
                          type="button"
                          title="Remove Job Posting"
                          onClick={() => setDeleteConfirm(job)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition"
                        >
                          <FaTrashAlt className="text-xs" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-white">{sortedJobs.length}</span> of{" "}
            <span className="font-semibold text-slate-800 dark:text-white">{total}</span> total jobs
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Previous
            </button>
            <span className="px-2 font-medium text-slate-500 dark:text-slate-400">Page {page} of {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900/40 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="rounded-lg bg-rose-50 p-2.5 dark:bg-rose-500/10">
                <FaExclamationTriangle className="text-lg" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Remove Job Posting?</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Are you sure you want to remove <strong className="text-slate-900 dark:text-white">{deleteConfirm.title}</strong>? All candidate applications associated with this job will be impacted.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDelete}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? "Removing..." : "Confirm Removal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
