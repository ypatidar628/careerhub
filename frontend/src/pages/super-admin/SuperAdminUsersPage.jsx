import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  FaCrown,
  FaShieldAlt,
  FaBriefcase,
  FaGraduationCap,
  FaSearch,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaLock,
  FaTimes,
  FaExclamationTriangle,
  FaFileDownload,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaCheckSquare,
  FaSquare,
  FaCheck,
  FaBan,
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

const ROLE_BADGE = {
  SUPER_ADMIN: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/30",
  ADMIN: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-400/15 dark:text-purple-300 dark:border-purple-400/30",
  RECRUITER: "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-400/15 dark:text-indigo-300 dark:border-indigo-400/30",
  CANDIDATE: "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-400/15 dark:text-sky-300 dark:border-sky-400/30",
};

export default function SuperAdminUsersPage() {
  const currentUser = useSelector((s) => s.auth.user);
  const isSuperAdmin = String(currentUser?.role || "").toUpperCase() === "SUPER_ADMIN";

  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Sorting
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  // Form states
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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 15,
        search: search || undefined,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
      };
      const data = await getAllUsers(params);
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, statusFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Sorting logic
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedUsers = useMemo(() => {
    const list = [...users];
    list.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [users, sortField, sortDirection]);

  // Batch Selection
  const allSelected =
    users.length > 0 && selectedIds.length === users.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(users.map((u) => u.id));
    }
  };

  const toggleSelectRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Batch Status Toggle
  const handleBatchStatus = async (activate) => {
    if (!selectedIds.length) return;
    try {
      setBatchLoading(true);
      // Toggle for each selected user
      for (const id of selectedIds) {
        const target = users.find((u) => u.id === id);
        if (target && target.isActive !== activate) {
          await toggleUserStatus(id);
        }
      }
      toast.success(`Batch ${activate ? "activation" : "deactivation"} complete.`);
      setSelectedIds([]);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Batch status update failed");
    } finally {
      setBatchLoading(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    try {
      const exportList = selectedIds.length
        ? users.filter((u) => selectedIds.includes(u.id))
        : users;

      const columns = [
        { label: "ID", accessor: (row) => row.id },
        { label: "Name", accessor: (row) => row.name },
        { label: "Email", accessor: (row) => row.email },
        { label: "Role", accessor: (row) => row.role },
        { label: "Status", accessor: (row) => (row.isActive ? "ACTIVE" : "INACTIVE") },
        { label: "Phone", accessor: (row) => row.phone || "" },
        {
          label: "Created At",
          accessor: (row) => (row.createdAt ? new Date(row.createdAt).toISOString() : ""),
        },
      ];
      exportToCsv("careerhub-users-export.csv", exportList, columns);
      toast.success(`Exported ${exportList.length} users to CSV`);
    } catch (e) {
      toast.error(e.message || "Failed to export CSV");
    }
  };

  // Inspections
  const handleOpenView = async (id) => {
    try {
      const data = await getUserById(id);
      setViewUser(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch user profile");
    }
  };

  // Single User Actions
  const handleToggleStatus = async (user) => {
    if (user.role === "SUPER_ADMIN") {
      toast.error("Security Rule: The Super Admin account cannot be deactivated.");
      return;
    }
    try {
      const data = await toggleUserStatus(user.id);
      toast.success(data.message || "User status updated.");
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: data.isActive } : u))
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle user status.");
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    if (deleteConfirmUser.role === "SUPER_ADMIN") {
      toast.error("Security Rule: The Super Admin account cannot be deleted.");
      setDeleteConfirmUser(null);
      return;
    }

    try {
      setActionLoading(true);
      await deleteAdminUser(deleteConfirmUser.id);
      toast.success(`User ${deleteConfirmUser.name} deleted.`);
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!createForm.name || !createForm.email || !createForm.password) {
      toast.error("Please fill in name, email, and password.");
      return;
    }

    try {
      setActionLoading(true);
      await createAdminUser(createForm);
      toast.success(`${createForm.role} account created.`);
      setCreateModalOpen(false);
      setCreateForm({
        name: "",
        email: "",
        password: "",
        role: "CANDIDATE",
        phone: "",
        location: "",
        bio: "",
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create user.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editUser) return;

    try {
      setActionLoading(true);
      await updateAdminUser(editUser.id, {
        name: editUser.name,
        email: editUser.email,
        phone: editUser.phone,
        role: editUser.role,
        isActive: editUser.isActive,
      });
      toast.success("User updated successfully.");
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update user.");
    } finally {
      setActionLoading(false);
    }
  };

  // Quick stats calculations
  const activeCount = users.filter((u) => u.isActive !== false).length;
  const inactiveCount = users.filter((u) => u.isActive === false).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              User Management Directory
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Enterprise administration, full profile inspections, batch activation, and CSV exports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <FaFileDownload className="text-xs text-slate-500 dark:text-slate-400" />
              <span>
                {selectedIds.length ? `Export Selected (${selectedIds.length})` : "Export CSV"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-600"
            >
              <FaPlus className="text-xs" />
              <span>Add New User</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mini KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total In View
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{users.length}</div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 shadow-xs dark:border-emerald-800/40 dark:bg-emerald-950/20">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Active Status
          </div>
          <div className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-400">{activeCount}</div>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-4 shadow-xs dark:border-rose-800/40 dark:bg-rose-950/20">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
            Deactivated
          </div>
          <div className="mt-1 text-2xl font-bold text-rose-700 dark:text-rose-400">{inactiveCount}</div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs dark:border-amber-800/40 dark:bg-amber-950/20">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-amber-800 dark:text-amber-300">
            Super Admin
          </div>
          <div className="mt-1 text-2xl font-bold text-amber-800 dark:text-amber-300">1 (Guarded)</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs md:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-8 text-xs text-slate-800 placeholder-slate-400 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500"
          />
        </div>

        {/* Role Filter */}
        <div>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="RECRUITER">Recruiter</option>
            <option value="CANDIDATE">Candidate</option>
          </select>
        </div>

        {/* Status Filter */}
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
            <option value="ACTIVE">Active Accounts</option>
            <option value="INACTIVE">Deactivated Accounts</option>
          </select>
        </div>
      </div>

      {/* Batch Operations Toolbar (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3 dark:border-brand/40 dark:bg-brand/10">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-950 dark:text-white">
            <span className="rounded bg-brand px-2 py-0.5 text-white">
              {selectedIds.length}
            </span>
            <span>selected accounts</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={batchLoading}
              onClick={() => handleBatchStatus(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition disabled:opacity-50 dark:border-emerald-500/40 dark:bg-emerald-500/20 dark:text-emerald-300 dark:hover:bg-emerald-500/30"
            >
              <FaCheck className="text-[10px]" />
              <span>Bulk Activate</span>
            </button>
            <button
              type="button"
              disabled={batchLoading}
              onClick={() => handleBatchStatus(false)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition disabled:opacity-50 dark:border-rose-500/40 dark:bg-rose-500/20 dark:text-rose-300 dark:hover:bg-rose-500/30"
            >
              <FaBan className="text-[10px]" />
              <span>Bulk Deactivate</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/70 dark:text-slate-400">
              <tr>
                {/* Select All Checkbox */}
                <th className="px-5 py-3 w-10">
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    {allSelected ? (
                      <FaCheckSquare className="text-brand text-sm" />
                    ) : (
                      <FaSquare className="text-slate-300 dark:text-slate-700 text-sm" />
                    )}
                  </button>
                </th>

                {/* Name / User Info */}
                <th
                  onClick={() => handleSort("name")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>User Details</span>
                    {sortField === "name" ? (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    ) : (
                      <FaSort className="text-slate-300 dark:text-slate-700" />
                    )}
                  </div>
                </th>

                {/* Role */}
                <th
                  onClick={() => handleSort("role")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Account Role</span>
                    {sortField === "role" ? (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    ) : (
                      <FaSort className="text-slate-300 dark:text-slate-700" />
                    )}
                  </div>
                </th>

                {/* Status */}
                <th
                  onClick={() => handleSort("isActive")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {sortField === "isActive" ? (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    ) : (
                      <FaSort className="text-slate-300 dark:text-slate-700" />
                    )}
                  </div>
                </th>

                {/* Created Date */}
                <th
                  onClick={() => handleSort("createdAt")}
                  className="cursor-pointer px-5 py-3 transition hover:text-slate-800 dark:hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Joined Date</span>
                    {sortField === "createdAt" ? (
                      sortDirection === "asc" ? <FaSortUp /> : <FaSortDown />
                    ) : (
                      <FaSort className="text-slate-300 dark:text-slate-700" />
                    )}
                  </div>
                </th>

                {/* Actions */}
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    <div className="mt-2 text-xs">Querying enterprise accounts...</div>
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No users match your current filter parameters.
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => {
                  const isSelected = selectedIds.includes(user.id);
                  const isUserSuperAdmin = user.role === "SUPER_ADMIN";
                  const roleStr = String(user.role || "").toUpperCase();
                  const isActive = user.isActive !== false;

                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-slate-50/80 transition dark:hover:bg-slate-800/40 ${
                        isSelected ? "bg-indigo-50/50 dark:bg-brand/5" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => toggleSelectRow(user.id)}
                          className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        >
                          {isSelected ? (
                            <FaCheckSquare className="text-brand text-sm" />
                          ) : (
                            <FaSquare className="text-slate-300 dark:text-slate-700 text-sm" />
                          )}
                        </button>
                      </td>

                      {/* Name & Contact */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-bold text-xs ${
                              isUserSuperAdmin
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300"
                                : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-slate-900 truncate dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate dark:text-slate-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            ROLE_BADGE[roleStr] || "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                          }`}
                        >
                          {isUserSuperAdmin ? (
                            <>
                              <FaCrown className="text-amber-500 text-[10px]" />
                              <span>Super Admin</span>
                            </>
                          ) : roleStr === "ADMIN" ? (
                            <>
                              <FaShieldAlt className="text-purple-600 dark:text-purple-400 text-[10px]" />
                              <span>Admin</span>
                            </>
                          ) : roleStr === "RECRUITER" ? (
                            <>
                              <FaBriefcase className="text-indigo-600 dark:text-indigo-400 text-[10px]" />
                              <span>Recruiter</span>
                            </>
                          ) : (
                            <>
                              <FaGraduationCap className="text-sky-600 dark:text-sky-400 text-[10px]" />
                              <span>Candidate</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-[11px] dark:text-slate-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* View Modal Trigger */}
                          <button
                            type="button"
                            title="View Complete Profile"
                            onClick={() => handleOpenView(user.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
                          >
                            <FaEye className="text-xs" />
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            title="Edit User Details"
                            onClick={() => setEditUser(user)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand dark:hover:bg-slate-800 dark:hover:text-brand transition"
                          >
                            <FaEdit className="text-xs" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          {isUserSuperAdmin ? (
                            <span
                              className="rounded-lg p-1.5 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                              title="Super Admin cannot be deactivated"
                            >
                              <FaLock className="text-xs" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              title={isActive ? "Deactivate User" : "Activate User"}
                              onClick={() => handleToggleStatus(user)}
                              className={`rounded-lg p-1.5 transition ${
                                isActive
                                  ? "text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
                                  : "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10"
                              }`}
                            >
                              {isActive ? <FaTimesCircle className="text-xs" /> : <FaCheckCircle className="text-xs" />}
                            </button>
                          )}

                          {/* Delete */}
                          {isUserSuperAdmin ? null : (
                            <button
                              type="button"
                              title="Delete Account"
                              onClick={() => setDeleteConfirmUser(user)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 transition"
                            >
                              <FaTrashAlt className="text-xs" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-white">{sortedUsers.length}</span> of{" "}
            <span className="font-semibold text-slate-800 dark:text-white">{total}</span> total accounts
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
            <span className="px-2 font-medium text-slate-500 dark:text-slate-400">
              Page {page} of {totalPages}
            </span>
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

      {/* CREATE USER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create New Account</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Maya Patel"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="user@careerhub.dev"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Initial Password * (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Account Role *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="CANDIDATE">Candidate</option>
                    <option value="RECRUITER">Recruiter</option>
                    {isSuperAdmin && <option value="ADMIN">Admin</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="10 digits numeric"
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-600 disabled:opacity-50"
                >
                  {actionLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT USER MODAL */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit User: {editUser.name}</h3>
              <button
                type="button"
                onClick={() => setEditUser(null)}
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
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Role</label>
                  <select
                    disabled={editUser.role === "SUPER_ADMIN"}
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {editUser.role === "SUPER_ADMIN" ? (
                      <option value="SUPER_ADMIN">Super Admin (Protected)</option>
                    ) : (
                      <>
                        <option value="CANDIDATE">Candidate</option>
                        <option value="RECRUITER">Recruiter</option>
                        {isSuperAdmin && <option value="ADMIN">Admin</option>}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={editUser.phone || ""}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3.5 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-lg bg-brand px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-600 disabled:opacity-50"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW COMPLETE PROFILE MODAL */}
      {viewUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand/10 text-brand font-bold text-base">
                  {viewUser.user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{viewUser.user?.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{viewUser.user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white transition"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3.5 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/60">
                <div>
                  <span className="text-slate-500 font-medium dark:text-slate-400">Account Role:</span>
                  <div className="mt-0.5 font-bold text-slate-800 dark:text-white">{viewUser.user?.role}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium dark:text-slate-400">Account Status:</span>
                  <div className="mt-0.5 font-bold text-emerald-600 dark:text-emerald-400">
                    {viewUser.user?.isActive !== false ? "Active" : "Deactivated"}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium dark:text-slate-400">Phone:</span>
                  <div className="mt-0.5 text-slate-700 dark:text-slate-300">{viewUser.user?.phone || "Not set"}</div>
                </div>
                <div>
                  <span className="text-slate-500 font-medium dark:text-slate-400">Location:</span>
                  <div className="mt-0.5 text-slate-700 dark:text-slate-300">
                    {viewUser.user?.profile?.location || "Not set"}
                  </div>
                </div>
              </div>

              {viewUser.user?.profile?.bio && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Biography:</span>
                  <p className="mt-1 rounded-lg bg-slate-50 border border-slate-200 p-3 text-slate-700 leading-relaxed dark:bg-slate-800/40 dark:border-slate-700 dark:text-slate-300">
                    {viewUser.user.profile.bio}
                  </p>
                </div>
              )}

              {/* Related Candidate Applications */}
              {viewUser.applications && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Submitted Applications ({viewUser.applicationsCount}):
                  </span>
                  <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                    {viewUser.applications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] dark:border-slate-800 dark:bg-slate-850"
                      >
                        <span className="font-medium text-slate-800 dark:text-white">
                          {app.jobTitle} ({app.company})
                        </span>
                        <span className="rounded bg-brand/10 border border-brand/20 px-2 py-0.5 text-brand font-semibold">
                          {app.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Recruiter Jobs */}
              {viewUser.jobs && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Posted Job Positions ({viewUser.postedJobsCount}):
                  </span>
                  <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                    {viewUser.jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] dark:border-slate-800 dark:bg-slate-850"
                      >
                        <span className="font-medium text-slate-800 dark:text-white">{job.title}</span>
                        <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-emerald-700 font-semibold dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                          {job.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end pt-3.5 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-2xl dark:border-rose-900/40 dark:bg-slate-900">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="rounded-lg bg-rose-50 p-2.5 dark:bg-rose-500/10">
                <FaExclamationTriangle className="text-lg" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Permanently Delete User?</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              Are you sure you want to delete <strong className="text-slate-900 dark:text-white">{deleteConfirmUser.name}</strong> (
              {deleteConfirmUser.email})? This action cannot be reversed.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteUser}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-rose-700 disabled:opacity-50"
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
