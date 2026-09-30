import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  FaFileAlt,
  FaSearch,
  FaTrashAlt,
  FaEye,
  FaMapMarkerAlt,
  FaUsers,
  FaExclamationTriangle,
  FaFileDownload,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTimes,
  FaBriefcase,
} from "react-icons/fa";
import { getPlatformJobsList, deletePlatformJob } from "../../api/superAdmin";
import { exportToCsv } from "../../utils/exportCsv";
import toast from "react-hot-toast";

export default function SuperAdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState("title");
  const [sortDirection, setSortDirection] = useState("asc");

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getPlatformJobsList({
        search,
        status: statusFilter,
        page,
        limit: 15,
      });
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load platform jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [search, statusFilter, page]);

  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "title" || sortField === "company") {
        valA = String(valA || "").toLowerCase();
        valB = String(valB || "").toLowerCase();
      } else if (sortField === "applicantsCount") {
        valA = Number(a.applicantsCount || 0);
        valB = Number(b.applicantsCount || 0);
      } else if (sortField === "status") {
        valA = String(a.status || "").toLowerCase();
        valB = String(b.status || "").toLowerCase();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [jobs, sortField, sortDirection]);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) {
      return <FaSort className="text-slate-600 group-hover:text-slate-400 text-[10px]" />;
    }
    return sortDirection === "asc" ? (
      <FaSortUp className="text-emerald-400 text-xs" />
    ) : (
      <FaSortDown className="text-emerald-400 text-xs" />
    );
  };

  const handleExportCsv = () => {
    try {
      const columns = [
        { label: "Job ID", key: "id" },
        { label: "Title", key: "title" },
        { label: "Company", key: "company" },
        { label: "Location", key: "location" },
        { label: "Mode", key: "mode" },
        {
          label: "Recruiter Name",
          accessor: (row) => row.recruiterId?.name || "Platform",
        },
        {
          label: "Recruiter Email",
          accessor: (row) => row.recruiterId?.email || "",
        },
        { label: "Applicants", accessor: (row) => row.applicantsCount || 0 },
        { label: "Status", key: "status" },
      ];
      exportToCsv("careerhub-jobs.csv", sortedJobs, columns);
      toast.success(`Exported ${sortedJobs.length} jobs to CSV`);
    } catch (e) {
      toast.error(e.message || "Failed to export jobs");
    }
  };

  const handleDeleteJob = async () => {
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Platform Job Postings
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Monitor, inspect, search, export, and moderate all active and closed job vacancies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-200 shadow-sm transition hover:bg-slate-800 hover:text-white"
        >
          <FaFileDownload className="text-xs text-emerald-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 backdrop-blur-xl md:grid-cols-3">
        <div className="relative md:col-span-2">
          <FaSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500 text-xs" />
          <input
            type="text"
            placeholder="Search jobs by title, company, or location..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pr-4 pl-10 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active">Active Jobs</option>
            <option value="Paused">Paused Jobs</option>
            <option value="Closed">Closed Jobs</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th
                  onClick={() => toggleSort("title")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Job Title & Org</span>
                    {renderSortIcon("title")}
                  </div>
                </th>
                <th className="px-6 py-4">Location / Mode</th>
                <th className="px-6 py-4">Recruiter</th>
                <th
                  onClick={() => toggleSort("applicantsCount")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Applicants</span>
                    {renderSortIcon("applicantsCount")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("status")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {renderSortIcon("status")}
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
                    <div className="mt-2 text-xs">Loading jobs...</div>
                  </td>
                </tr>
              ) : sortedJobs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No job postings found.
                  </td>
                </tr>
              ) : (
                sortedJobs.map((job) => (
                  <tr key={job.id} className="transition-colors duration-150 hover:bg-slate-900/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-white text-sm">{job.title}</div>
                        <div className="text-[11px] font-semibold text-emerald-400">{job.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <FaMapMarkerAlt className="text-slate-500 text-xs" />
                        <span>{job.location}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">{job.mode}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="font-semibold text-white">{job.recruiterId?.name || "Platform Recruiter"}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{job.recruiterId?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1 text-xs font-bold text-sky-400 border border-slate-800">
                        <FaUsers className="text-xs" />
                        {job.applicantsCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          job.status === "Active"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            job.status === "Active" ? "bg-emerald-400" : "bg-slate-500"
                          }`}
                        />
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/jobs/${job.id}`}
                          target="_blank"
                          title="View Public Job Listing"
                          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                        >
                          <FaEye className="text-sm" />
                        </Link>
                        <button
                          type="button"
                          title="Remove Job Posting"
                          onClick={() => setDeleteConfirm(job)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
                        >
                          <FaTrashAlt className="text-sm" />
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
        <div className="flex items-center justify-between border-t border-slate-800/80 px-6 py-4 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{sortedJobs.length}</span> of{" "}
            <span className="font-semibold text-white">{total}</span> total jobs
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-400">Page {page} of {totalPages}</span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-1.5 font-bold text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="rounded-2xl bg-rose-500/10 p-3">
                <FaExclamationTriangle className="text-xl" />
              </div>
              <h3 className="text-base font-bold text-white">Remove Job Posting?</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Are you sure you want to remove job position{" "}
              <strong className="text-white">"{deleteConfirm.title}"</strong> ({deleteConfirm.company})?
              All candidate applications for this job will also be removed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteJob}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 disabled:opacity-50"
              >
                {actionLoading ? "Removing..." : "Confirm Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
