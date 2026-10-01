import { useEffect, useState, useMemo } from "react";
import {
  FaSearch,
  FaEye,
  FaEdit,
  FaTimes,
  FaFileAlt,
  FaExternalLinkAlt,
  FaFileDownload,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import {
  getPlatformApplicationsList,
  updatePlatformApplicationStatus,
} from "../../api/superAdmin";
import { exportToCsv } from "../../utils/exportCsv";
import toast from "react-hot-toast";

const STAGE_COLORS = {
  Applied: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  "Under Review": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Shortlisted: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20",
  Interview: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20",
  Selected: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  Rejected: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20",
  Withdrawn: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
};

export default function SuperAdminApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [availableStages, setAvailableStages] = useState([
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview",
    "Selected",
    "Rejected",
    "Withdrawn",
  ]);

  // Sorting
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modals
  const [viewApp, setViewApp] = useState(null);
  const [editStatusApp, setEditStatusApp] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getPlatformApplicationsList({
        page,
        limit: 15,
        search: search || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      });
      setApplications(data.applications || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.availableStages?.length) {
        setAvailableStages(data.availableStages);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchApplications();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Sort
  const sortedApplications = useMemo(() => {
    const list = [...applications];
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
  }, [applications, sortField, sortOrder]);

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
        { label: "Application ID", accessor: (row) => row.id },
        { label: "Candidate Name", accessor: (row) => row.candidateName },
        { label: "Candidate Email", accessor: (row) => row.candidateEmail },
        { label: "Job Title", accessor: (row) => row.jobTitle },
        { label: "Company", accessor: (row) => row.company },
        { label: "Status Stage", accessor: (row) => row.status },
        {
          label: "Submitted Date",
          accessor: (row) => (row.createdAt ? new Date(row.createdAt).toISOString() : ""),
        },
      ];
      exportToCsv("careerhub-applications.csv", sortedApplications, columns);
      toast.success(`Exported ${sortedApplications.length} applications to CSV`);
    } catch (e) {
      toast.error(e.message || "Failed to export applications");
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!editStatusApp) return;

    try {
      setActionLoading(true);
      await updatePlatformApplicationStatus(editStatusApp.id, {
        status: newStatus,
        note: statusNote,
      });
      toast.success(`Application updated to ${newStatus}`);
      setEditStatusApp(null);
      setStatusNote("");
      fetchApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
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
              Candidate Application Pipeline
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Inspect submissions, update candidate stages, review notes, and monitor hiring velocity.
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
            placeholder="Search by candidate name, email, job title, or company..."
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
            <option value="ALL">All Application Stages</option>
            {availableStages.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400">
              <tr>
                <th
                  onClick={() => toggleSort("candidateName")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Candidate</span>
                    {renderSortIcon("candidateName")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("jobTitle")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Applied Job & Org</span>
                    {renderSortIcon("jobTitle")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("status")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Stage / Status</span>
                    {renderSortIcon("status")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Submitted Date</span>
                    {renderSortIcon("createdAt")}
                  </div>
                </th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    <div className="mt-2 text-xs">Loading applications...</div>
                  </td>
                </tr>
              ) : sortedApplications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                    No applications found matching criteria.
                  </td>
                </tr>
              ) : (
                sortedApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {app.candidateName || app.candidateId?.name || "Candidate"}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {app.candidateEmail || app.candidateId?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{app.jobTitle}</div>
                        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{app.company}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          STAGE_COLORS[app.status] || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          title="View Application Details"
                          onClick={() => setViewApp(app)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
                        >
                          <FaEye className="text-xs" />
                        </button>
                        <button
                          type="button"
                          title="Update Application Stage"
                          onClick={() => {
                            setEditStatusApp(app);
                            setNewStatus(app.status);
                            setStatusNote("");
                          }}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-800 dark:hover:text-brand transition"
                        >
                          <FaEdit className="text-xs" />
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
            Showing <span className="font-semibold text-slate-800 dark:text-white">{sortedApplications.length}</span> of{" "}
            <span className="font-semibold text-slate-800 dark:text-white">{total}</span> total applications
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

      {/* VIEW MODAL */}
      {viewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewApp.jobTitle}</h3>
                <p className="text-xs text-brand font-semibold">{viewApp.company}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewApp(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3.5 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-500 font-medium dark:text-slate-400">Candidate:</span>
                  <div className="font-bold text-slate-800 mt-0.5 dark:text-white">{viewApp.candidateName}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{viewApp.candidateEmail}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium dark:text-slate-400">Current Stage:</span>
                  <div className="mt-1">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                        STAGE_COLORS[viewApp.status] || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {viewApp.status}
                    </span>
                  </div>
                </div>
              </div>

              {viewApp.resume && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 flex items-center justify-between dark:border-slate-800 dark:bg-slate-850">
                  <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
                    <FaFileAlt className="text-brand text-sm" />
                    <span className="font-medium">{viewApp.resume.fileName || "Submitted Resume"}</span>
                  </div>
                  {viewApp.resume.url && (
                    <a
                      href={viewApp.resume.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-brand hover:underline font-semibold"
                    >
                      <span>Open Document</span>
                      <FaExternalLinkAlt className="text-[10px]" />
                    </a>
                  )}
                </div>
              )}

              {/* Status History */}
              {viewApp.statusHistory && viewApp.statusHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 text-xs dark:text-white">Stage Progression Ledger:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {viewApp.statusHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] dark:border-slate-800 dark:bg-slate-850"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-brand">{item.status}</span>
                          <span className="text-slate-500 text-[10px] font-mono dark:text-slate-400">
                            {item.changedAt ? new Date(item.changedAt).toLocaleString() : ""}
                          </span>
                        </div>
                        <div className="text-slate-700 dark:text-slate-300 mt-1">
                          By: {item.changedByName || "Admin"} ({item.changedByRole || "ADMIN"})
                        </div>
                        {item.note && <div className="text-slate-500 dark:text-slate-400 italic mt-0.5">"{item.note}"</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end pt-3.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewApp(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {editStatusApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Update Application Stage</h3>
              <button
                type="button"
                onClick={() => setEditStatusApp(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Candidate</label>
                <div className="mt-1 rounded-lg bg-slate-50 border border-slate-200 p-2.5 font-medium text-slate-800 dark:bg-slate-800/40 dark:border-slate-700 dark:text-white">
                  {editStatusApp.candidateName}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Target Pipeline Stage *</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  {availableStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">Auditable Reason / Note</label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Reason for advance or status adjustment..."
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditStatusApp(null)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-600 disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Save Progression"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
