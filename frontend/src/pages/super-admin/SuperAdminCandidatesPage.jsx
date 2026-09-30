import { useEffect, useState, useMemo } from "react";
import {
  FaUserGraduate,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaFileDownload,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTimes,
  FaExclamationTriangle,
  FaFileAlt,
} from "react-icons/fa";
import {
  getCandidatesList,
  getUserById,
  createAdminUser,
  updateAdminUser,
  toggleUserStatus,
  deleteAdminUser,
} from "../../api/superAdmin";
import { exportToCsv } from "../../utils/exportCsv";
import toast from "react-hot-toast";

export default function SuperAdminCandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Modals
  const [viewCandidate, setViewCandidate] = useState(null);
  const [editCandidate, setEditCandidate] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "CANDIDATE",
    phone: "",
    location: "",
    bio: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const data = await getCandidatesList({ search, page, limit: 15 });
      setCandidates(data.candidates || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, [search, page]);

  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "name" || sortField === "email") {
        valA = String(valA || "").toLowerCase();
        valB = String(valB || "").toLowerCase();
      } else if (sortField === "applications") {
        valA = Number(a.applicationsCount || 0);
        valB = Number(b.applicationsCount || 0);
      } else if (sortField === "status") {
        valA = a.isActive !== false ? 1 : 0;
        valB = b.isActive !== false ? 1 : 0;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [candidates, sortField, sortDirection]);

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
      <FaSortUp className="text-sky-400 text-xs" />
    ) : (
      <FaSortDown className="text-sky-400 text-xs" />
    );
  };

  const handleExportCsv = () => {
    try {
      const columns = [
        { label: "Candidate ID", key: "id" },
        { label: "Full Name", key: "name" },
        { label: "Email Address", key: "email" },
        { label: "Phone", accessor: (row) => row.phone || "" },
        {
          label: "Applications Submitted",
          accessor: (row) => row.applicationsCount || 0,
        },
        {
          label: "Account Status",
          accessor: (row) => (row.isActive !== false ? "Active" : "Deactivated"),
        },
      ];
      exportToCsv("careerhub-candidates.csv", sortedCandidates, columns);
      toast.success(`Exported ${sortedCandidates.length} candidates to CSV`);
    } catch (e) {
      toast.error(e.message || "Failed to export candidates");
    }
  };

  const handleOpenView = async (id) => {
    try {
      const data = await getUserById(id);
      setViewCandidate(data);
    } catch {
      toast.error("Failed to load candidate profile.");
    }
  };

  const handleToggleStatus = async (cand) => {
    try {
      const res = await toggleUserStatus(cand.id);
      toast.success(res.message);
      setCandidates((prev) =>
        prev.map((c) => (c.id === cand.id ? { ...c, isActive: res.isActive } : c))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      setActionLoading(true);
      await deleteAdminUser(deleteConfirm.id);
      toast.success(`Candidate ${deleteConfirm.name} deleted.`);
      setDeleteConfirm(null);
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete candidate.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await createAdminUser(createForm);
      toast.success("Candidate created successfully.");
      setCreateModal(false);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        role: "CANDIDATE",
        phone: "",
        location: "",
        bio: "",
      });
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create candidate.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editCandidate) return;
    try {
      setActionLoading(true);
      await updateAdminUser(editCandidate.id, {
        name: editCandidate.name,
        email: editCandidate.email,
        phone: editCandidate.phone,
        isActive: editCandidate.isActive,
      });
      toast.success("Candidate updated successfully.");
      setEditCandidate(null);
      fetchCandidates();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update candidate.");
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
            Candidate Talent Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            View job seeker profiles, inspect submitted job applications, and regulate account states.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-200 shadow-sm transition hover:bg-slate-800 hover:text-white"
          >
            <FaFileDownload className="text-xs text-sky-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-500/25 transition hover:brightness-110 active:scale-95"
          >
            <FaPlus className="text-xs" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 backdrop-blur-xl">
        <FaSearch className="absolute top-1/2 left-7.5 -translate-y-1/2 text-slate-500 text-xs" />
        <input
          type="text"
          placeholder="Search candidates by name, email, or phone number..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pr-4 pl-10 text-xs text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none"
        />
      </div>

      {/* Candidates Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th
                  onClick={() => toggleSort("name")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Candidate Profile</span>
                    {renderSortIcon("name")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("email")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Email</span>
                    {renderSortIcon("email")}
                  </div>
                </th>
                <th className="px-6 py-4">Phone</th>
                <th
                  onClick={() => toggleSort("applications")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Applications</span>
                    {renderSortIcon("applications")}
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
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-sky-500 border-t-transparent" />
                    <div className="mt-2 text-xs">Loading candidates...</div>
                  </td>
                </tr>
              ) : sortedCandidates.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400">
                    No candidates found.
                  </td>
                </tr>
              ) : (
                sortedCandidates.map((cand) => {
                  const isActive = cand.isActive !== false;
                  return (
                    <tr key={cand.id} className="transition-colors duration-150 hover:bg-slate-900/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sky-500/20 text-xs font-black text-sky-300 border border-sky-500/30">
                            {cand.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-white">{cand.name}</span>
                            <div className="text-[10px] text-slate-500">ID: {cand.id?.slice(-6)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300 font-mono text-[11px]">{cand.email}</td>
                      <td className="px-6 py-4 text-slate-400">{cand.phone || "-"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1 text-xs font-bold text-sky-400 border border-slate-800">
                          <FaFileAlt className="text-[11px]" />
                          {cand.applicationsCount || 0} Submitted
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                          {isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            title="View Profile & Applications"
                            onClick={() => handleOpenView(cand.id)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            type="button"
                            title="Edit Candidate"
                            onClick={() => setEditCandidate(cand)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-sky-400 transition"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            type="button"
                            title={isActive ? "Deactivate" : "Activate"}
                            onClick={() => handleToggleStatus(cand)}
                            className={`rounded-xl p-2 transition ${
                              isActive ? "text-slate-400 hover:text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            {isActive ? <FaTimesCircle className="text-sm" /> : <FaCheckCircle className="text-sm" />}
                          </button>
                          <button
                            type="button"
                            title="Delete Candidate"
                            onClick={() => setDeleteConfirm(cand)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
                          >
                            <FaTrashAlt className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-800/80 px-6 py-4 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{sortedCandidates.length}</span> of{" "}
            <span className="font-semibold text-white">{total}</span> candidates
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

      {/* VIEW MODAL WITH SUBMITTED APPLICATIONS */}
      {viewCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{viewCandidate.user?.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{viewCandidate.user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewCandidate(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <FaTimes className="text-base" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-900/60 p-4 border border-slate-800/80">
                <div>
                  <span className="text-slate-400 font-medium">Phone:</span>
                  <div className="font-bold text-white">{viewCandidate.user?.phone || "None registered"}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Location:</span>
                  <div className="font-bold text-white">{viewCandidate.user?.profile?.location || "Not specified"}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">
                  Submitted Job Applications ({viewCandidate.applications?.length || 0})
                </h4>
                <div className="mt-2.5 space-y-2">
                  {viewCandidate.applications?.length ? (
                    viewCandidate.applications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-3"
                      >
                        <div>
                          <div className="font-bold text-white">{app.jobTitle}</div>
                          <div className="text-[11px] text-slate-400">{app.company}</div>
                        </div>
                        <span className="rounded-xl bg-sky-500/10 px-2.5 py-1 text-xs font-bold text-sky-400 border border-sky-500/20">
                          {app.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-xs italic">No applications submitted yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setViewCandidate(null)}
                className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CANDIDATE MODAL */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Add New Candidate</h3>
              <button
                type="button"
                onClick={() => setCreateModal(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <FaTimes className="text-base" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@example.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Password * (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Phone</label>
                <input
                  type="text"
                  maxLength={10}
                  placeholder="10 digits"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:brightness-110 disabled:opacity-50"
                >
                  {actionLoading ? "Adding..." : "Add Candidate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Edit Candidate</h3>
              <button
                type="button"
                onClick={() => setEditCandidate(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <FaTimes className="text-base" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">Name</label>
                <input
                  type="text"
                  required
                  value={editCandidate.name}
                  onChange={(e) => setEditCandidate({ ...editCandidate, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={editCandidate.email}
                  onChange={(e) => setEditCandidate({ ...editCandidate, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Phone</label>
                <input
                  type="text"
                  value={editCandidate.phone || ""}
                  onChange={(e) => setEditCandidate({ ...editCandidate, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditCandidate(null)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-sky-500/20 hover:brightness-110 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="rounded-2xl bg-rose-500/10 p-3">
                <FaExclamationTriangle className="text-xl" />
              </div>
              <h3 className="text-base font-bold text-white">Delete Candidate?</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Are you sure you want to permanently delete candidate{" "}
              <strong className="text-white">{deleteConfirm.name}</strong>? All their applications will also be deleted.
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
                onClick={handleDelete}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 disabled:opacity-50"
              >
                {actionLoading ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
