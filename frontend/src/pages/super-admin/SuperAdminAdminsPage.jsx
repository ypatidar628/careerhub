import { useEffect, useState, useMemo } from "react";
import {
  FaShieldAlt,
  FaPlus,
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaCheck,
  FaTimes,
  FaLock,
  FaExclamationTriangle,
  FaFileDownload,
  FaSearch,
} from "react-icons/fa";
import {
  getAdminsList,
  createAdminAccount,
  updateAdminAccount,
  deleteAdminAccount,
  toggleUserStatus,
} from "../../api/superAdmin";
import { exportToCsv } from "../../utils/exportCsv";
import toast from "react-hot-toast";

const AVAILABLE_PERMISSIONS = [
  { id: "manage_candidates", label: "Candidate Management", desc: "View, edit, activate & delete candidate accounts" },
  { id: "manage_recruiters", label: "Recruiter & Company Management", desc: "View & moderate recruiters and jobs" },
  { id: "manage_jobs", label: "Job Postings Oversight", desc: "Inspect, manage, and remove platform job listings" },
  { id: "manage_applications", label: "Application Stage Oversight", desc: "View & advance job application stages" },
];

export default function SuperAdminAdminsPage() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [createModal, setCreateModal] = useState(false);
  const [editAdmin, setEditAdmin] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Form
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    permissions: [
      "manage_candidates",
      "manage_recruiters",
      "manage_jobs",
      "manage_applications",
    ],
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const data = await getAdminsList();
      setAdmins(data.admins || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const q = search.toLowerCase();
      return (
        !q ||
        admin.name?.toLowerCase().includes(q) ||
        admin.email?.toLowerCase().includes(q)
      );
    });
  }, [admins, search]);

  const handleExportCsv = () => {
    try {
      const columns = [
        { label: "Admin ID", key: "id" },
        { label: "Name", key: "name" },
        { label: "Email", key: "email" },
        {
          label: "Permissions",
          accessor: (row) => (row.permissions || []).join("; "),
        },
        {
          label: "Status",
          accessor: (row) => (row.isActive !== false ? "Active" : "Deactivated"),
        },
        {
          label: "Created At",
          accessor: (row) => (row.createdAt ? new Date(row.createdAt).toISOString() : ""),
        },
      ];
      exportToCsv("careerhub-admin-team.csv", filteredAdmins, columns);
      toast.success(`Exported ${filteredAdmins.length} admins to CSV`);
    } catch (e) {
      toast.error(e.message || "Failed to export CSV");
    }
  };

  const handleTogglePermission = (id) => {
    setForm((prev) => {
      const exists = prev.permissions.includes(id);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== id)
          : [...prev.permissions, id],
      };
    });
  };

  const handleToggleEditPermission = (id) => {
    if (!editAdmin) return;
    setEditAdmin((prev) => {
      const perms = prev.permissions || [];
      const exists = perms.includes(id);
      return {
        ...prev,
        permissions: exists ? perms.filter((p) => p !== id) : [...perms, id],
      };
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email, and password are required.");
      return;
    }

    try {
      setActionLoading(true);
      await createAdminAccount(form);
      toast.success("Administrator account provisioned.");
      setCreateModal(false);
      setForm({
        name: "",
        email: "",
        password: "",
        permissions: [
          "manage_candidates",
          "manage_recruiters",
          "manage_jobs",
          "manage_applications",
        ],
      });
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create Admin.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editAdmin) return;
    try {
      setActionLoading(true);
      await updateAdminAccount(editAdmin.id, {
        name: editAdmin.name,
        email: editAdmin.email,
        permissions: editAdmin.permissions,
        isActive: editAdmin.isActive,
      });
      toast.success("Admin profile updated.");
      setEditAdmin(null);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update Admin.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    try {
      const res = await toggleUserStatus(admin.id);
      toast.success(res.message);
      setAdmins((prev) =>
        prev.map((a) => (a.id === admin.id ? { ...a, isActive: res.isActive } : a))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status.");
    }
  };

  const handleDeleteAdmin = async () => {
    if (!deleteConfirm) return;
    try {
      setActionLoading(true);
      await deleteAdminAccount(deleteConfirm.id);
      toast.success(`Admin ${deleteConfirm.name} deleted.`);
      setDeleteConfirm(null);
      fetchAdmins();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete Admin.");
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
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Admin Governance & Delegation
              </h1>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-950/40 dark:border-amber-800/40 dark:text-amber-300">
                Super Admin Exclusive
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Provision subordinate administrators, configure permission scopes, audit activities, and revoke access.
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
              <span>Provision New Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Rule Card */}
      <div className="rounded-xl border border-purple-200 bg-purple-50/70 p-4.5 shadow-xs dark:border-purple-800/40 dark:bg-purple-950/20">
        <div className="flex items-start gap-3.5">
          <div className="rounded-lg bg-purple-100 p-2.5 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
            <FaShieldAlt className="text-lg" />
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-900 dark:text-purple-300 text-sm">
                Super Admin Hierarchy Invariant
              </span>
              <FaLock className="text-amber-500 text-xs" />
            </div>
            <p className="text-purple-950/80 leading-relaxed max-w-4xl dark:text-slate-300">
              All provisioned Admins possess strictly scoped operational permissions. They cannot create or promote other accounts to Super Admin, cannot deactivate or tamper with the root Super Admin, and have zero access to this governance console.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <FaSearch className="absolute top-1/2 left-6.5 -translate-y-1/2 text-slate-400 text-xs" />
        <input
          type="text"
          placeholder="Filter administrators by name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-8 text-xs text-slate-800 placeholder-slate-400 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
        />
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <div className="mt-2 text-xs">Loading administrators...</div>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="col-span-full rounded-xl border border-slate-200 bg-white py-16 text-center text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            No Admin accounts found. Click "Provision New Admin" to add one.
          </div>
        ) : (
          filteredAdmins.map((admin) => {
            const isActive = admin.isActive !== false;
            return (
              <div
                key={admin.id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-lg bg-purple-50 text-xs font-bold text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/40">
                        {admin.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm dark:text-white">{admin.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{admin.email}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        isActive
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                          : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {isActive ? "Active" : "Deactivated"}
                    </span>
                  </div>

                  {/* Permissions Chips */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Granted Delegations:
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {(admin.permissions || []).map((perm) => (
                        <span
                          key={perm}
                          className="rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300"
                        >
                          {perm.replace("manage_", "").toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(admin)}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold transition ${
                      isActive ? "text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400" : "text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    }`}
                  >
                    {isActive ? <FaTimesCircle className="text-xs" /> : <FaCheckCircle className="text-xs" />}
                    <span>{isActive ? "Deactivate" : "Activate"}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditAdmin(admin)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
                      title="Edit Admin & Permissions"
                    >
                      <FaEdit className="text-xs" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(admin)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition"
                      title="Revoke Admin Access"
                    >
                      <FaTrashAlt className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE ADMIN MODAL */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Provision New Admin</h3>
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
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations Admin"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="admin.ops@careerhub.dev"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Password * (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Permissions Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Assign Administrative Permissions:
                </label>
                <div className="space-y-2">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = form.permissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`cursor-pointer rounded-lg border p-3 transition flex items-start gap-3 ${
                          isChecked
                            ? "border-indigo-300 bg-indigo-50/70 dark:border-indigo-500/50 dark:bg-indigo-950/20"
                            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40"
                        }`}
                      >
                        <div
                          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                            isChecked
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                          }`}
                        >
                          {isChecked && <FaCheck className="text-[9px]" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">{perm.label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{perm.desc}</div>
                        </div>
                      </div>
                    );
                  })}
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
                  {actionLoading ? "Provisioning..." : "Create Admin Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ADMIN MODAL */}
      {editAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Admin: {editAdmin.name}</h3>
              <button
                type="button"
                onClick={() => setEditAdmin(null)}
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
                  value={editAdmin.name}
                  onChange={(e) => setEditAdmin({ ...editAdmin, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={editAdmin.email}
                  onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Permissions Checklist */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Update Delegated Permissions:
                </label>
                <div className="space-y-2">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = (editAdmin.permissions || []).includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleToggleEditPermission(perm.id)}
                        className={`cursor-pointer rounded-lg border p-3 transition flex items-start gap-3 ${
                          isChecked
                            ? "border-indigo-300 bg-indigo-50/70 dark:border-indigo-500/50 dark:bg-indigo-950/20"
                            : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/40"
                        }`}
                      >
                        <div
                          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded border ${
                            isChecked
                              ? "bg-indigo-600 border-indigo-600 text-white"
                              : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800"
                          }`}
                        >
                          {isChecked && <FaCheck className="text-[9px]" />}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-slate-900 dark:text-white">{perm.label}</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{perm.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditAdmin(null)}
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Revoke Admin Access?</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Are you sure you want to revoke administrative credentials for{" "}
              <strong className="text-slate-900 dark:text-white">{deleteConfirm.name}</strong> ({deleteConfirm.email})? They will lose access immediately.
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
                onClick={handleDeleteAdmin}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
              >
                {actionLoading ? "Revoking..." : "Revoke Access"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
