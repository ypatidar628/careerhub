import { useEffect, useState, useMemo } from "react";
import {
  FaBriefcase,
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
  getRecruitersList,
  getUserById,
  createAdminUser,
  updateAdminUser,
  toggleUserStatus,
  deleteAdminUser,
} from "../../api/superAdmin";
import { exportToCsv } from "../../utils/exportCsv";
import toast from "react-hot-toast";

export default function SuperAdminRecruitersPage() {
  const [recruiters, setRecruiters] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");

  // Modals
  const [viewRecruiter, setViewRecruiter] = useState(null);
  const [editRecruiter, setEditRecruiter] = useState(null);
  const [createModal, setCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "RECRUITER",
    phone: "",
    department: "",
    location: "",
    bio: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const data = await getRecruitersList({ search, page, limit: 15 });
      setRecruiters(data.recruiters || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load recruiters");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruiters();
  }, [search, page]);

  const sortedRecruiters = useMemo(() => {
    return [...recruiters].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "name" || sortField === "email" || sortField === "company") {
        valA = String(valA || "").toLowerCase();
        valB = String(valB || "").toLowerCase();
      } else if (sortField === "jobsCount") {
        valA = Number(a.jobsCount || 0);
        valB = Number(b.jobsCount || 0);
      } else if (sortField === "status") {
        valA = a.isActive !== false ? 1 : 0;
        valB = b.isActive !== false ? 1 : 0;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [recruiters, sortField, sortDirection]);

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
      <FaSortUp className="text-indigo-400 text-xs" />
    ) : (
      <FaSortDown className="text-indigo-400 text-xs" />
    );
  };

  const handleExportCsv = () => {
    try {
      const columns = [
        { label: "Recruiter ID", key: "id" },
        { label: "Contact Name", key: "name" },
        { label: "Email Address", key: "email" },
        { label: "Company / Org", accessor: (row) => row.company || "Independent" },
        { label: "Jobs Posted", accessor: (row) => row.jobsCount || 0 },
        {
          label: "Status",
          accessor: (row) => (row.isActive !== false ? "Active" : "Deactivated"),
        },
      ];
      exportToCsv("careerhub-recruiters.csv", sortedRecruiters, columns);
      toast.success(`Exported ${sortedRecruiters.length} recruiters to CSV`);
    } catch (e) {
      toast.error(e.message || "Failed to export recruiters");
    }
  };

  const handleOpenView = async (id) => {
    try {
      const data = await getUserById(id);
      setViewRecruiter(data);
    } catch {
      toast.error("Failed to load recruiter details.");
    }
  };

  const handleToggleStatus = async (rec) => {
    try {
      const res = await toggleUserStatus(rec.id);
      toast.success(res.message);
      setRecruiters((prev) =>
        prev.map((r) => (r.id === rec.id ? { ...r, isActive: res.isActive } : r))
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
      toast.success(`Recruiter ${deleteConfirm.name} deleted.`);
      setDeleteConfirm(null);
      fetchRecruiters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete recruiter.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await createAdminUser(createForm);
      toast.success("Recruiter created successfully.");
      setCreateModal(false);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        role: "RECRUITER",
        phone: "",
        department: "",
        location: "",
        bio: "",
      });
      fetchRecruiters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create recruiter.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editRecruiter) return;
    try {
      setActionLoading(true);
      await updateAdminUser(editRecruiter.id, {
        name: editRecruiter.name,
        email: editRecruiter.email,
        phone: editRecruiter.phone,
        isActive: editRecruiter.isActive,
      });
      toast.success("Recruiter updated successfully.");
      setEditRecruiter(null);
      fetchRecruiters();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update recruiter.");
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
            Recruiter & Enterprise Partners
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Oversee recruiting accounts, enterprise company profiles, posted vacancies, and applicant volume.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-200 shadow-sm transition hover:bg-slate-800 hover:text-white"
          >
            <FaFileDownload className="text-xs text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:brightness-110 active:scale-95"
          >
            <FaPlus className="text-xs" />
            <span>Add Recruiter</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 backdrop-blur-xl">
        <FaSearch className="absolute top-1/2 left-7.5 -translate-y-1/2 text-slate-500 text-xs" />
        <input
          type="text"
          placeholder="Search recruiters by name, company, or email address..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pr-4 pl-10 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
        />
      </div>

      {/* Recruiters Table */}
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
                    <span>Recruiter / Contact</span>
                    {renderSortIcon("name")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("company")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company / Department</span>
                    {renderSortIcon("company")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("jobsCount")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Jobs Posted</span>
                    {renderSortIcon("jobsCount")}
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
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                    <div className="mt-2 text-xs">Loading recruiters...</div>
                  </td>
                </tr>
              ) : sortedRecruiters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No recruiters found.
                  </td>
                </tr>
              ) : (
                sortedRecruiters.map((rec) => {
                  const isActive = rec.isActive !== false;
                  return (
                    <tr key={rec.id} className="transition-colors duration-150 hover:bg-slate-900/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-indigo-500/20 text-xs font-black text-indigo-300 border border-indigo-500/30">
                            {rec.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white">{rec.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{rec.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-200">{rec.company || "Independent"}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-1 text-xs font-bold text-indigo-400 border border-slate-800">
                          <FaFileAlt className="text-[11px]" />
                          {rec.jobsCount || 0} Posted
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
                            title="View Company & Jobs"
                            onClick={() => handleOpenView(rec.id)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                          >
                            <FaEye className="text-sm" />
                          </button>
                          <button
                            type="button"
                            title="Edit Recruiter"
                            onClick={() => setEditRecruiter(rec)}
                            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-indigo-400 transition"
                          >
                            <FaEdit className="text-sm" />
                          </button>
                          <button
                            type="button"
                            title={isActive ? "Deactivate" : "Activate"}
                            onClick={() => handleToggleStatus(rec)}
                            className={`rounded-xl p-2 transition ${
                              isActive ? "text-slate-400 hover:text-rose-400" : "text-emerald-400"
                            }`}
                          >
                            {isActive ? <FaTimesCircle className="text-sm" /> : <FaCheckCircle className="text-sm" />}
                          </button>
                          <button
                            type="button"
                            title="Delete Recruiter"
                            onClick={() => setDeleteConfirm(rec)}
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
            Showing <span className="font-semibold text-white">{sortedRecruiters.length}</span> of{" "}
            <span className="font-semibold text-white">{total}</span> recruiters
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

      {/* VIEW MODAL */}
      {viewRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">{viewRecruiter.user?.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{viewRecruiter.user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewRecruiter(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <FaTimes className="text-base" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-900/60 p-4 border border-slate-800/80">
                <div>
                  <span className="text-slate-400 font-medium">Company / Department:</span>
                  <div className="font-bold text-white mt-0.5">
                    {viewRecruiter.user?.profile?.department || "Independent Recruiter"}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Applications Received:</span>
                  <div className="font-bold text-indigo-400 mt-0.5">
                    {viewRecruiter.applicationsReceived || 0}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white text-sm">
                  Posted Jobs ({viewRecruiter.postedJobsCount || 0})
                </h4>
                <div className="mt-2.5 space-y-2 max-h-48 overflow-y-auto">
                  {viewRecruiter.jobs?.length ? (
                    viewRecruiter.jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-3"
                      >
                        <div>
                          <div className="font-bold text-white">{job.title}</div>
                          <div className="text-[11px] text-slate-400">{job.company}</div>
                        </div>
                        <span className="rounded-xl bg-emerald-500/10 px-2.5 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/20">
                          {job.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-xs italic">No active jobs posted.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setViewRecruiter(null)}
                className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE RECRUITER MODAL */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Add New Recruiter</h3>
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
                  placeholder="e.g. Elena Rostova"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="elena@techcorp.com"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
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
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300">Company Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Stripe, Infosys"
                    value={createForm.department}
                    onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
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
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
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
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:brightness-110 disabled:opacity-50"
                >
                  {actionLoading ? "Adding..." : "Add Recruiter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Edit Recruiter</h3>
              <button
                type="button"
                onClick={() => setEditRecruiter(null)}
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
                  value={editRecruiter.name}
                  onChange={(e) => setEditRecruiter({ ...editRecruiter, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={editRecruiter.email}
                  onChange={(e) => setEditRecruiter({ ...editRecruiter, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Phone</label>
                <input
                  type="text"
                  value={editRecruiter.phone || ""}
                  onChange={(e) => setEditRecruiter({ ...editRecruiter, phone: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditRecruiter(null)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:brightness-110 disabled:opacity-50"
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
              <h3 className="text-base font-bold text-white">Delete Recruiter?</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Are you sure you want to permanently delete recruiter{" "}
              <strong className="text-white">{deleteConfirm.name}</strong>? All their posted jobs and associated applications will also be removed.
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
