import { useEffect, useState, useMemo } from "react";
import {
  FaCrown,
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
  FaUserShield,
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
          label: "Created Date",
          accessor: (row) => (row.createdAt ? new Date(row.createdAt).toISOString() : ""),
        },
      ];
      exportToCsv("careerhub-admins.csv", filteredAdmins, columns);
      toast.success(`Exported ${filteredAdmins.length} admin accounts to CSV`);
    } catch (e) {
      toast.error(e.message || "Failed to export admins");
    }
  };

  const handleTogglePermission = (permId) => {
    setForm((prev) => {
      const exists = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== permId)
          : [...prev.permissions, permId],
      };
    });
  };

  const handleToggleEditPermission = (permId) => {
    if (!editAdmin) return;
    const exists = editAdmin.permissions?.includes(permId);
    const updated = exists
      ? editAdmin.permissions.filter((p) => p !== permId)
      : [...(editAdmin.permissions || []), permId];
    setEditAdmin({ ...editAdmin, permissions: updated });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email, and password (min 8 chars) are required.");
      return;
    }

    try {
      setActionLoading(true);
      await createAdminAccount(form);
      toast.success(`Admin ${form.name} created successfully.`);
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
      toast.success("Admin updated successfully.");
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
              Admin Governance & Delegation
            </h1>
            <span className="rounded-full bg-amber-400/15 border border-amber-400/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              Super Admin Exclusive
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Provision subordinate administrators, configure permission scopes, audit activities, and revoke access.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-200 shadow-sm transition hover:bg-slate-800 hover:text-white"
          >
            <FaFileDownload className="text-xs text-purple-400" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/25 transition hover:brightness-110 active:scale-95"
          >
            <FaPlus className="text-xs" />
            <span>Provision New Admin</span>
          </button>
        </div>
      </div>

      {/* Security Rule Card */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-r from-purple-950/40 via-slate-950 to-slate-950 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-start gap-3.5">
          <div className="rounded-2xl bg-purple-500/15 border border-purple-500/30 p-3 text-purple-400">
            <FaShieldAlt className="text-xl" />
          </div>
          <div className="text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-purple-300 text-sm">
                Super Admin Hierarchy Invariant
              </span>
              <FaLock className="text-amber-400 text-xs" />
            </div>
            <p className="text-slate-300 leading-relaxed max-w-4xl">
              All provisioned Admins possess strictly scoped operational permissions. They cannot create or promote other accounts to Super Admin, cannot deactivate or tamper with the root Super Admin, and have zero access to this governance console.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 backdrop-blur-xl">
        <FaSearch className="absolute top-1/2 left-7.5 -translate-y-1/2 text-slate-500 text-xs" />
        <input
          type="text"
          placeholder="Filter administrators by name or email address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pr-4 pl-10 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
        />
      </div>

      {/* Admins Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            <div className="mt-2 text-xs">Loading administrators...</div>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-slate-800 bg-slate-950/60 py-16 text-center text-slate-400">
            No Admin accounts found. Click "Provision New Admin" to add one.
          </div>
        ) : (
          filteredAdmins.map((admin) => {
            const isActive = admin.isActive !== false;
            return (
              <div
                key={admin.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-purple-500/40 hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-500/20 text-sm font-black text-purple-300 border border-purple-500/30">
                        {admin.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm">{admin.name}</h3>
                        <p className="text-xs text-slate-400 font-mono">{admin.email}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-rose-400"}`} />
                      {isActive ? "Active" : "Deactivated"}
                    </span>
                  </div>

                  {/* Permissions Chips */}
                  <div className="mt-5 pt-4 border-t border-slate-800/80">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Granted Delegations:
                    </span>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {(admin.permissions || []).map((perm) => (
                        <span
                          key={perm}
                          className="rounded-lg bg-slate-900 border border-slate-800 px-2.5 py-1 text-[10px] font-semibold text-purple-300"
                        >
                          {perm.replace("manage_", "").toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(admin)}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold transition ${
                      isActive ? "text-slate-400 hover:text-rose-400" : "text-emerald-400 hover:text-emerald-300"
                    }`}
                  >
                    {isActive ? <FaTimesCircle /> : <FaCheckCircle />}
                    <span>{isActive ? "Deactivate" : "Activate"}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditAdmin(admin)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                      title="Edit Admin & Permissions"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(admin)}
                      className="rounded-xl p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
                      title="Revoke Admin Access"
                    >
                      <FaTrashAlt className="text-sm" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Provision New Admin</h3>
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
                <label className="block text-xs font-bold text-slate-300">Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Operations Admin"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Email *</label>
                <input
                  type="email"
                  required
                  placeholder="admin.ops@careerhub.dev"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Password * (min 8 chars)</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              {/* Permissions Checklist */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Assign Administrative Permissions:
                </label>
                <div className="space-y-2">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = form.permissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`cursor-pointer rounded-2xl border p-3 transition flex items-start gap-3 ${
                          isChecked
                            ? "border-purple-500/50 bg-purple-950/20"
                            : "border-slate-800 bg-slate-900/40 opacity-70"
                        }`}
                      >
                        <div
                          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-md border ${
                            isChecked
                              ? "bg-purple-600 border-purple-500 text-white"
                              : "border-slate-700 bg-slate-800"
                          }`}
                        >
                          {isChecked && <FaCheck className="text-[10px]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{perm.label}</div>
                          <div className="text-[10px] text-slate-400">{perm.desc}</div>
                        </div>
                      </div>
                    );
                  })}
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
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/20 hover:brightness-110 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Edit Admin: {editAdmin.name}</h3>
              <button
                type="button"
                onClick={() => setEditAdmin(null)}
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
                  value={editAdmin.name}
                  onChange={(e) => setEditAdmin({ ...editAdmin, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={editAdmin.email}
                  onChange={(e) => setEditAdmin({ ...editAdmin, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Update Delegated Permissions:
                </label>
                <div className="space-y-2">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = editAdmin.permissions?.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleToggleEditPermission(perm.id)}
                        className={`cursor-pointer rounded-2xl border p-3 transition flex items-start gap-3 ${
                          isChecked
                            ? "border-purple-500/50 bg-purple-950/20"
                            : "border-slate-800 bg-slate-900/40 opacity-70"
                        }`}
                      >
                        <div
                          className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-md border ${
                            isChecked
                              ? "bg-purple-600 border-purple-500 text-white"
                              : "border-slate-700 bg-slate-800"
                          }`}
                        >
                          {isChecked && <FaCheck className="text-[10px]" />}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">{perm.label}</div>
                          <div className="text-[10px] text-slate-400">{perm.desc}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditAdmin(null)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-purple-600/20 hover:brightness-110 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="rounded-2xl bg-rose-500/10 p-3">
                <FaExclamationTriangle className="text-xl" />
              </div>
              <h3 className="text-base font-bold text-white">Revoke Admin Access?</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Are you sure you want to permanently delete Admin{" "}
              <strong className="text-white">{deleteConfirm.name}</strong> ({deleteConfirm.email})?
              All administrative access will be instantly revoked.
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
                onClick={handleDeleteAdmin}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 disabled:opacity-50"
              >
                {actionLoading ? "Revoking..." : "Confirm Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
