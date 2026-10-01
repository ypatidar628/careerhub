import { useEffect, useState, useMemo } from "react";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaTimes,
  FaExclamationTriangle,
  FaFileDownload,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaFileAlt,
  FaEye,
} from "react-icons/fa";
import {
  getAllUsers,
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

  // Filters & Pagination
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [editRecruiter, setEditRecruiter] = useState(null);
  const [viewRecruiter, setViewRecruiter] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form State
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "RECRUITER",
    phone: "",
    company: "",
    location: "",
    bio: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers({
        role: "RECRUITER",
        page,
        limit: 15,
        search: search || undefined,
      });
      setRecruiters(data.users || []);
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
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchRecruiters();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Client-side sorting
  const sortedRecruiters = useMemo(() => {
    const list = [...recruiters];
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
  }, [recruiters, sortField, sortOrder]);

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

  // CSV Export
  const handleExportCsv = () => {
    try {
      const columns = [
        { label: "Recruiter ID", accessor: (row) => row.id },
        { label: "Name", accessor: (row) => row.name },
        { label: "Email", accessor: (row) => row.email },
        { label: "Company", accessor: (row) => row.company || "Independent" },
        { label: "Phone", accessor: (row) => row.phone || "" },
        { label: "Jobs Posted", accessor: (row) => row.jobsCount || 0 },
        { label: "Status", accessor: (row) => (row.isActive !== false ? "ACTIVE" : "DEACTIVATED") },
        { label: "Joined Date", accessor: (row) => (row.createdAt ? new Date(row.createdAt).toISOString() : "") },
      ];
      exportToCsv("careerhub-recruiters.csv", recruiters, columns);
      toast.success(`Exported ${recruiters.length} recruiters to CSV`);
    } catch (e) {
      toast.error(e.message || "Failed to export CSV");
    }
  };

  const handleOpenView = async (id) => {
    try {
      const data = await getUserById(id);
      setViewRecruiter(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load recruiter details");
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
        company: "",
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
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Recruiter & Enterprise Partners
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Oversee recruiting accounts, enterprise company profiles, posted vacancies, and applicant volume.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <FaFileDownload className="text-xs text-slate-500 dark:text-slate-400" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={() => setCreateModal(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
            >
              <FaPlus className="text-xs" />
              <span>Add Recruiter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <FaSearch className="absolute top-1/2 left-6.5 -translate-y-1/2 text-slate-400 text-xs" />
        <input
          type="text"
          placeholder="Search recruiters by name, company, or email address..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-8 text-xs text-slate-800 placeholder-slate-400 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
        />
      </div>

      {/* Recruiters Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400">
              <tr>
                <th
                  onClick={() => toggleSort("name")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Recruiter / Contact</span>
                    {renderSortIcon("name")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("company")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Company / Department</span>
                    {renderSortIcon("company")}
                  </div>
                </th>
                <th
                  onClick={() => toggleSort("jobsCount")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Jobs Posted</span>
                    {renderSortIcon("jobsCount")}
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
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                    <div className="mt-2 text-xs">Loading recruiters...</div>
                  </td>
                </tr>
              ) : sortedRecruiters.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-12 text-center text-slate-500 dark:text-slate-400">
                    No recruiters found.
                  </td>
                </tr>
              ) : (
                sortedRecruiters.map((rec) => {
                  const isActive = rec.isActive !== false;
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700 border border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/40">
                            {rec.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">{rec.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono dark:text-slate-400">{rec.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-slate-800 dark:text-slate-200">{rec.company || "Independent"}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                          <FaFileAlt className="text-[11px] text-indigo-600 dark:text-indigo-400" />
                          {rec.jobsCount || 0} Posted
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="View Company & Jobs"
                            onClick={() => handleOpenView(rec.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
                          >
                            <FaEye className="text-xs" />
                          </button>
                          <button
                            type="button"
                            title="Edit Recruiter"
                            onClick={() => setEditRecruiter(rec)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 dark:hover:bg-slate-800 dark:hover:text-indigo-400 transition"
                          >
                            <FaEdit className="text-xs" />
                          </button>
                          <button
                            type="button"
                            title={isActive ? "Deactivate" : "Activate"}
                            onClick={() => handleToggleStatus(rec)}
                            className={`rounded-lg p-1.5 transition ${
                              isActive ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400" : "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400"
                            }`}
                          >
                            {isActive ? <FaTimesCircle className="text-xs" /> : <FaCheckCircle className="text-xs" />}
                          </button>
                          <button
                            type="button"
                            title="Delete Recruiter"
                            onClick={() => setDeleteConfirm(rec)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition"
                          >
                            <FaTrashAlt className="text-xs" />
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
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-white">{sortedRecruiters.length}</span> of{" "}
            <span className="font-semibold text-slate-800 dark:text-white">{total}</span> recruiters
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
      {viewRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewRecruiter.user?.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{viewRecruiter.user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setViewRecruiter(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3.5 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-500 font-medium dark:text-slate-400">Enterprise Company:</span>
                  <div className="font-semibold text-slate-800 dark:text-white">{viewRecruiter.user?.profile?.company || "Independent"}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium dark:text-slate-400">Phone:</span>
                  <div className="font-semibold text-slate-800 dark:text-white">{viewRecruiter.user?.phone || "None registered"}</div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 text-xs dark:text-white">
                  Active Job Postings ({viewRecruiter.jobs?.length || 0})
                </h4>
                <div className="mt-2.5 space-y-2">
                  {viewRecruiter.jobs?.length ? (
                    viewRecruiter.jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-850"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{job.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">{job.location || "Remote"}</div>
                        </div>
                        <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-200 dark:bg-indigo-500/10 dark:border-indigo-500/20 dark:text-indigo-300">
                          {job.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 text-xs italic">No job listings posted yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end pt-3.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewRecruiter(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Recruiter</h3>
              <button
                type="button"
                onClick={() => setCreateModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address *</label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password * (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Company Name</label>
                  <input
                    type="text"
                    value={createForm.company}
                    onChange={(e) => setCreateForm({ ...createForm, company: e.target.value })}
                    placeholder="e.g. Acme Corp"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModal(false)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? "Creating..." : "Create Recruiter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editRecruiter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Recruiter: {editRecruiter.name}</h3>
              <button
                type="button"
                onClick={() => setEditRecruiter(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  required
                  value={editRecruiter.name}
                  onChange={(e) => setEditRecruiter({ ...editRecruiter, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={editRecruiter.email}
                  onChange={(e) => setEditRecruiter({ ...editRecruiter, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                <input
                  type="text"
                  value={editRecruiter.phone || ""}
                  onChange={(e) => setEditRecruiter({ ...editRecruiter, phone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditRecruiter(null)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900/40 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="rounded-lg bg-rose-50 p-2.5 dark:bg-rose-500/10">
                <FaExclamationTriangle className="text-lg" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Delete Recruiter?</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{deleteConfirm.name}</strong>? Their posted jobs and associated applicant data will be affected.
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
                {actionLoading ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
