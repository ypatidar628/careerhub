import { useEffect, useState, useMemo } from "react";
import {
  FaLayerGroup,
  FaSearch,
  FaFilter,
  FaEye,
  FaEdit,
  FaCheckCircle,
  FaClock,
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
  Applied: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Under Review": "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Shortlisted: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Interview: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  Selected: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  Withdrawn: "bg-slate-800 text-slate-400 border-slate-700",
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
  ]);

  // Sorting
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Modals
  const [viewApp, setViewApp] = useState(null);
  const [editStatusApp, setEditStatusApp] = useState(null);
  const [newStatus, setNewStatus] = useState("Under Review");
  const [statusNote, setStatusNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await getPlatformApplicationsList({
        search,
        status: statusFilter,
        page,
        limit: 15,
      });
      setApplications(data.applications || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.availableStages) setAvailableStages(data.availableStages);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [search, statusFilter, page]);

  const sortedApplications = useMemo(() => {
    return [...applications].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "candidateName") {
        valA = String(a.candidateName || a.candidateId?.name || "").toLowerCase();
        valB = String(b.candidateName || b.candidateId?.name || "").toLowerCase();
      } else if (sortField === "jobTitle") {
        valA = String(a.jobTitle || "").toLowerCase();
        valB = String(b.jobTitle || "").toLowerCase();
      } else if (sortField === "status") {
        valA = String(a.status || "").toLowerCase();
        valB = String(b.status || "").toLowerCase();
      } else if (sortField === "createdAt") {
        valA = new Date(a.createdAt || 0).getTime();
        valB = new Date(b.createdAt || 0).getTime();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [applications, sortField, sortDirection]);

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
      <FaSortUp className="text-cyan-400 text-xs" />
    ) : (
      <FaSortDown className="text-cyan-400 text-xs" />
    );
  };

  const handleExportCsv = () => {
    try {
      const columns = [
        { label: "Application ID", key: "id" },
        {
          label: "Candidate Name",
          accessor: (row) => row.candidateName || row.candidateId?.name || "",
        },
        {
          label: "Candidate Email",
          accessor: (row) => row.candidateEmail || row.candidateId?.email || "",
        },
        { label: "Job Title", key: "jobTitle" },
        { label: "Company", key: "company" },
        { label: "Current Stage", key: "status" },
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            Candidate Application Pipeline
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Inspect submissions, update candidate stages, review notes, and monitor hiring velocity.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-200 shadow-sm transition hover:bg-slate-800 hover:text-white"
        >
          <FaFileDownload className="text-xs text-cyan-400" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 backdrop-blur-xl md:grid-cols-3">
        <div className="relative md:col-span-2">
          <FaSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500 text-xs" />
          <input
            type="text"
            placeholder="Search by candidate name, email, job title, or company..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pr-4 pl-10 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-xs text-slate-200 focus:border-cyan-500 focus:outline-none"
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
      <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th
                  onClick={() => toggleSort("candidateName")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Candidate</span>
                    {renderSortIcon("candidateName")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("jobTitle")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Applied Job & Org</span>
                    {renderSortIcon("jobTitle")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("status")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Stage / Status</span>
                    {renderSortIcon("status")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Submitted Date</span>
                    {renderSortIcon("createdAt")}
                  </div>
                </th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                    <div className="mt-2 text-xs">Loading applications...</div>
                  </td>
                </tr>
              ) : sortedApplications.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No applications found matching criteria.
                  </td>
                </tr>
              ) : (
                sortedApplications.map((app) => (
                  <tr key={app.id} className="transition-colors duration-150 hover:bg-slate-900/50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-white">
                          {app.candidateName || app.candidateId?.name || "Candidate"}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {app.candidateEmail || app.candidateId?.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-white">{app.jobTitle}</div>
                        <div className="text-[11px] font-semibold text-cyan-400">{app.company}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          STAGE_COLORS[app.status] || "bg-slate-800 text-slate-300"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                      {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : "-"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          title="View Application Details"
                          onClick={() => setViewApp(app)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                        >
                          <FaEye className="text-sm" />
                        </button>
                        <button
                          type="button"
                          title="Update Application Stage"
                          onClick={() => {
                            setEditStatusApp(app);
                            setNewStatus(app.status);
                            setStatusNote("");
                          }}
                          className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition"
                        >
                          <FaEdit className="text-sm" />
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
            Showing <span className="font-semibold text-white">{sortedApplications.length}</span> of{" "}
            <span className="font-semibold text-white">{total}</span> total applications
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

      {/* VIEW DETAILS MODAL */}
      {viewApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Application Profile</h3>
                <p className="text-xs text-slate-400">Job: {viewApp.jobTitle} - {viewApp.company}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewApp(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <FaTimes className="text-base" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-900/60 p-4 border border-slate-800">
                <div>
                  <span className="text-slate-400 font-medium">Candidate:</span>
                  <div className="font-bold text-white mt-0.5">{viewApp.candidateName}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{viewApp.candidateEmail}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Current Stage:</span>
                  <div className="mt-1">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        STAGE_COLORS[viewApp.status] || "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {viewApp.status}
                    </span>
                  </div>
                </div>
              </div>

              {viewApp.resume && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-slate-300">
                    <FaFileAlt className="text-cyan-400 text-sm" />
                    <span className="font-medium">{viewApp.resume.fileName || "Submitted Resume"}</span>
                  </div>
                  {viewApp.resume.url && (
                    <a
                      href={viewApp.resume.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline font-bold"
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
                  <h4 className="font-bold text-white mb-2 text-xs">Stage Progression Ledger:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {viewApp.statusHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-[11px]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-400">{item.status}</span>
                          <span className="text-slate-400 text-[10px] font-mono">
                            {item.changedAt ? new Date(item.changedAt).toLocaleString() : ""}
                          </span>
                        </div>
                        <div className="text-slate-300 mt-1">
                          By: {item.changedByName || "Admin"} ({item.changedByRole || "ADMIN"})
                        </div>
                        {item.note && <div className="text-slate-400 italic mt-0.5">"{item.note}"</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setViewApp(null)}
                className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {editStatusApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white">Update Application Stage</h3>
              <button
                type="button"
                onClick={() => setEditStatusApp(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <FaTimes className="text-base" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Select New Stage
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  {availableStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Administrative Note (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Reason or interview notes for this update..."
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditStatusApp(null)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-600/20 hover:brightness-110 disabled:opacity-50"
                >
                  {actionLoading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
