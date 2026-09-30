import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  FaCrown,
  FaShieldAlt,
  FaBriefcase,
  FaGraduationCap,
  FaUsers,
  FaSearch,
  FaFilter,
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
  SUPER_ADMIN: "bg-amber-400/15 text-amber-300 border-amber-400/30",
  ADMIN: "bg-purple-400/15 text-purple-300 border-purple-400/30",
  RECRUITER: "bg-indigo-400/15 text-indigo-300 border-indigo-400/30",
  CANDIDATE: "bg-sky-400/15 text-sky-300 border-sky-400/30",
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
  const [sortDirection, setSortDirection] = useState("desc"); // 'asc' | 'desc'

  // Batch selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);

  // Modals
  const [viewUser, setViewUser] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  // Form States
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
      const data = await getAllUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        limit: 20,
      });
      setUsers(data.users || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      setSelectedIds([]); // Clear selection upon refetch
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter, statusFilter, page]);

  // Client-side sorting on loaded page
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === "name" || sortField === "email" || sortField === "role") {
        valA = String(valA || "").toLowerCase();
        valB = String(valB || "").toLowerCase();
      } else if (sortField === "createdAt") {
        valA = new Date(valA || 0).getTime();
        valB = new Date(valB || 0).getTime();
      } else if (sortField === "status") {
        valA = a.isActive !== false ? 1 : 0;
        valB = b.isActive !== false ? 1 : 0;
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [users, sortField, sortDirection]);

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
      <FaSortUp className="text-brand text-xs" />
    ) : (
      <FaSortDown className="text-brand text-xs" />
    );
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === sortedUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedUsers.map((u) => u.id));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Batch status toggle
  const handleBatchStatus = async (targetActiveState) => {
    if (!selectedIds.length) return;
    const targetUsers = users.filter((u) => selectedIds.includes(u.id));
    const nonSuperAdmins = targetUsers.filter((u) => u.role !== "SUPER_ADMIN");

    if (nonSuperAdmins.length === 0) {
      toast.error("Super Admin status cannot be altered.");
      return;
    }

    try {
      setBatchLoading(true);
      // Run sequential toggles for selected users
      let count = 0;
      for (const u of nonSuperAdmins) {
        if ((u.isActive !== false) !== targetActiveState) {
          await toggleUserStatus(u.id);
          count++;
        }
      }
      toast.success(`Updated status for ${count} users.`);
      fetchUsers();
    } catch {
      toast.error("Failed to complete batch update.");
    } finally {
      setBatchLoading(false);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    try {
      const dataToExport = selectedIds.length
        ? users.filter((u) => selectedIds.includes(u.id))
        : sortedUsers;

      const columns = [
        { label: "User ID", key: "id" },
        { label: "Name", key: "name" },
        { label: "Email", key: "email" },
        { label: "Role", key: "role" },
        { label: "Phone", accessor: (row) => row.phone || "" },
        {
          label: "Status",
          accessor: (row) => (row.isActive !== false ? "Active" : "Deactivated"),
        },
        {
          label: "Created Date",
          accessor: (row) => (row.createdAt ? new Date(row.createdAt).toISOString() : ""),
        },
      ];

      exportToCsv("careerhub-users-export.csv", dataToExport, columns);
      toast.success(`Exported ${dataToExport.length} users to CSV`);
    } catch (e) {
      toast.error(e.message || "Failed to export users");
    }
  };

  const handleOpenView = async (userId) => {
    try {
      setViewLoading(true);
      const data = await getUserById(userId);
      setViewUser(data);
    } catch {
      toast.error("Failed to load user details.");
    } finally {
      setViewLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.role === "SUPER_ADMIN") {
      toast.error("Security Rule: The Super Admin cannot be deactivated.");
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
            User Management Directory
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Enterprise administration, full profile inspections, batch activation, and CSV exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-2.5 text-xs font-bold text-slate-200 shadow-sm transition hover:bg-slate-800 hover:text-white"
          >
            <FaFileDownload className="text-xs text-cyan-400" />
            <span>
              {selectedIds.length ? `Export Selected (${selectedIds.length})` : "Export CSV"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-brand/25 transition hover:brightness-110 active:scale-95"
          >
            <FaPlus className="text-xs" />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Mini KPI Ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3.5 backdrop-blur-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Total In View
          </div>
          <div className="mt-1 text-xl font-black text-white">{users.length}</div>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 backdrop-blur-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            Active Status
          </div>
          <div className="mt-1 text-xl font-black text-emerald-400">{activeCount}</div>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3.5 backdrop-blur-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400">
            Deactivated
          </div>
          <div className="mt-1 text-xl font-black text-rose-400">{inactiveCount}</div>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-3.5 backdrop-blur-xl">
          <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
            Super Admin
          </div>
          <div className="mt-1 text-xl font-black text-amber-300">1 (Guarded)</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 backdrop-blur-xl md:grid-cols-4">
        {/* Search Input */}
        <div className="relative md:col-span-2">
          <FaSearch className="absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-500 text-xs" />
          <input
            type="text"
            placeholder="Search by name, email, or phone number..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2.5 pr-4 pl-10 text-xs text-white placeholder-slate-500 focus:border-brand focus:outline-none"
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
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-xs text-slate-200 focus:border-brand focus:outline-none"
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
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2.5 text-xs text-slate-200 focus:border-brand focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Accounts</option>
            <option value="INACTIVE">Deactivated Accounts</option>
          </select>
        </div>
      </div>

      {/* Batch Operations Toolbar (when items selected) */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/40 bg-brand/10 p-3.5 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <span className="rounded-lg bg-brand px-2 py-0.5 text-white">
              {selectedIds.length}
            </span>
            <span>selected accounts</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={batchLoading}
              onClick={() => handleBatchStatus(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/30 transition disabled:opacity-50"
            >
              <FaCheck className="text-[10px]" />
              <span>Bulk Activate</span>
            </button>
            <button
              type="button"
              disabled={batchLoading}
              onClick={() => handleBatchStatus(false)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/20 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/30 transition disabled:opacity-50"
            >
              <FaBan className="text-[10px]" />
              <span>Bulk Deactivate</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-700"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* User Management Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-950/70 backdrop-blur-xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                {/* Select All Checkbox */}
                <th className="w-12 px-4 py-4 text-center">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-white transition"
                    title={selectedIds.length === sortedUsers.length ? "Deselect all" : "Select all"}
                  >
                    {selectedIds.length > 0 && selectedIds.length === sortedUsers.length ? (
                      <FaCheckSquare className="text-brand text-base" />
                    ) : (
                      <FaSquare className="text-slate-700 text-base" />
                    )}
                  </button>
                </th>

                {/* Sortable: Name */}
                <th
                  onClick={() => toggleSort("name")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Name & Profile</span>
                    {renderSortIcon("name")}
                  </div>
                </th>

                {/* Sortable: Email */}
                <th
                  onClick={() => toggleSort("email")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Email Address</span>
                    {renderSortIcon("email")}
                  </div>
                </th>

                {/* Sortable: Role */}
                <th
                  onClick={() => toggleSort("role")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Role</span>
                    {renderSortIcon("role")}
                  </div>
                </th>

                {/* Sortable: Status */}
                <th
                  onClick={() => toggleSort("status")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Status</span>
                    {renderSortIcon("status")}
                  </div>
                </th>

                {/* Sortable: Created Date */}
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="cursor-pointer px-6 py-4 transition hover:text-white group select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Created Date</span>
                    {renderSortIcon("createdAt")}
                  </div>
                </th>

                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                    <div className="mt-2 text-xs">Loading user registry...</div>
                  </td>
                </tr>
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    No accounts found matching search filters.
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => {
                  const roleStr = String(user.role || "").toUpperCase();
                  const isUserSuperAdmin = roleStr === "SUPER_ADMIN";
                  const isActive = user.isActive !== false;
                  const isSelected = selectedIds.includes(user.id);

                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors duration-150 hover:bg-slate-900/50 ${
                        isSelected ? "bg-brand/5" : ""
                      } ${isUserSuperAdmin ? "bg-amber-500/5 font-medium" : ""}`}
                    >
                      {/* Checkbox */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectOne(user.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <FaCheckSquare className="text-brand text-sm" />
                          ) : (
                            <FaSquare className="text-slate-700 text-sm" />
                          )}
                        </button>
                      </td>

                      {/* Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                              isUserSuperAdmin
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : roleStr === "ADMIN"
                                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                : roleStr === "RECRUITER"
                                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                                : "bg-sky-500/20 text-sky-300 border border-sky-500/30"
                            }`}
                          >
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isUserSuperAdmin && (
                                <FaCrown className="text-amber-400 text-xs shrink-0" title="Super Admin Account" />
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {user.phone || "No phone registered"}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-slate-300 font-mono text-[11px]">
                        {user.email}
                      </td>

                      {/* Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            ROLE_BADGE[roleStr] || "bg-slate-800 text-slate-300 border-slate-700"
                          }`}
                        >
                          {isUserSuperAdmin ? (
                            <>
                              <FaCrown className="text-amber-400 text-[10px]" />
                              <span>Super Admin</span>
                            </>
                          ) : roleStr === "ADMIN" ? (
                            <>
                              <FaShieldAlt className="text-purple-400 text-[10px]" />
                              <span>Admin</span>
                            </>
                          ) : roleStr === "RECRUITER" ? (
                            <>
                              <FaBriefcase className="text-indigo-400 text-[10px]" />
                              <span>Recruiter</span>
                            </>
                          ) : (
                            <>
                              <FaGraduationCap className="text-sky-400 text-[10px]" />
                              <span>Candidate</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-emerald-400" : "bg-rose-400"
                            }`}
                          />
                          {isActive ? "Active" : "Deactivated"}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View Modal Trigger */}
                          <button
                            type="button"
                            title="View Complete Profile"
                            onClick={() => handleOpenView(user.id)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                          >
                            <FaEye className="text-sm" />
                          </button>

                          {/* Edit Details */}
                          <button
                            type="button"
                            title="Edit User Details"
                            onClick={() => setEditUser(user)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-brand transition"
                          >
                            <FaEdit className="text-sm" />
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          {isUserSuperAdmin ? (
                            <span
                              className="rounded-lg p-2 text-slate-600 cursor-not-allowed"
                              title="Super Admin cannot be deactivated"
                            >
                              <FaLock className="text-xs" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              title={isActive ? "Deactivate User" : "Activate User"}
                              onClick={() => handleToggleStatus(user)}
                              className={`rounded-lg p-2 transition ${
                                isActive
                                  ? "text-slate-400 hover:bg-rose-500/10 hover:text-rose-400"
                                  : "text-emerald-400 hover:bg-emerald-500/10"
                              }`}
                            >
                              {isActive ? <FaTimesCircle className="text-sm" /> : <FaCheckCircle className="text-sm" />}
                            </button>
                          )}

                          {/* Delete User */}
                          {isUserSuperAdmin ? (
                            <span
                              className="rounded-lg p-2 text-slate-600 cursor-not-allowed"
                              title="Super Admin cannot be deleted"
                            >
                              <FaLock className="text-xs" />
                            </span>
                          ) : (
                            <button
                              type="button"
                              title="Delete User Permanently"
                              onClick={() => setDeleteConfirmUser(user)}
                              className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
                            >
                              <FaTrashAlt className="text-sm" />
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
        <div className="flex items-center justify-between border-t border-slate-800/80 px-6 py-4 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-white">{sortedUsers.length}</span> of{" "}
            <span className="font-semibold text-white">{total}</span> total accounts
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
            <span className="px-2 font-semibold text-slate-400">
              Page {page} of {totalPages}
            </span>
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

      {/* CREATE USER MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Create New Account</h3>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <FaTimes className="text-base" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Maya Patel"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="user@careerhub.dev"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">
                  Initial Password * (min 8 characters)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-brand focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Account Role *
                  </label>
                  <select
                    value={createForm.role}
                    onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand focus:outline-none"
                  >
                    <option value="CANDIDATE">Candidate</option>
                    <option value="RECRUITER">Recruiter</option>
                    {isSuperAdmin && <option value="ADMIN">Admin</option>}
                  </select>
                  <p className="mt-1 text-[10px] text-amber-400">
                    Exactly ONE Super Admin allowed in system.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    maxLength={10}
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="10 digits numeric"
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-gradient-to-r from-brand to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-brand/20 hover:brightness-110 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Edit User: {editUser.name}</h3>
              <button
                type="button"
                onClick={() => setEditUser(null)}
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
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-brand focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300">Email</label>
                <input
                  type="email"
                  required
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-brand focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300">Role</label>
                  <select
                    disabled={editUser.role === "SUPER_ADMIN"}
                    value={editUser.role}
                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-xs text-white focus:border-brand focus:outline-none disabled:opacity-50"
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
                  <label className="block text-xs font-bold text-slate-300">Phone</label>
                  <input
                    type="text"
                    value={editUser.phone || ""}
                    onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs text-white focus:border-brand focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="rounded-xl bg-gradient-to-r from-brand to-purple-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-brand/20 hover:brightness-110 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/20 text-brand font-black text-lg border border-brand/30">
                  {viewUser.user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{viewUser.user?.name}</h3>
                  <p className="text-xs text-slate-400 font-mono">{viewUser.user?.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <FaTimes className="text-base" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-900/60 p-4 border border-slate-800/80">
                <div>
                  <span className="text-slate-400 font-medium">Account Role:</span>
                  <div className="mt-1 font-bold text-white">{viewUser.user?.role}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Account Status:</span>
                  <div className="mt-1 font-bold text-emerald-400">
                    {viewUser.user?.isActive !== false ? "Active" : "Deactivated"}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Phone:</span>
                  <div className="mt-1 text-slate-200">{viewUser.user?.phone || "Not set"}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-medium">Location:</span>
                  <div className="mt-1 text-slate-200">
                    {viewUser.user?.profile?.location || "Not set"}
                  </div>
                </div>
              </div>

              {viewUser.user?.profile?.bio && (
                <div>
                  <span className="font-bold text-slate-300">Biography:</span>
                  <p className="mt-1.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 p-3.5 text-slate-300 leading-relaxed">
                    {viewUser.user.profile.bio}
                  </p>
                </div>
              )}

              {/* Related Candidate Applications */}
              {viewUser.applications && (
                <div>
                  <span className="font-bold text-slate-300">
                    Submitted Applications ({viewUser.applicationsCount}):
                  </span>
                  <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                    {viewUser.applications.map((app) => (
                      <div
                        key={app.id}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-[11px]"
                      >
                        <span className="font-semibold text-white">
                          {app.jobTitle} ({app.company})
                        </span>
                        <span className="rounded-lg bg-brand/10 border border-brand/20 px-2 py-0.5 text-brand font-bold">
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
                  <span className="font-bold text-slate-300">
                    Posted Job Positions ({viewUser.postedJobsCount}):
                  </span>
                  <div className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                    {viewUser.jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-2.5 text-[11px]"
                      >
                        <span className="font-semibold text-white">{job.title}</span>
                        <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-emerald-400 font-bold">
                          {job.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setViewUser(null)}
                className="rounded-xl bg-slate-800 px-5 py-2 text-xs font-bold text-white hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-3xl border border-rose-500/30 bg-slate-950 p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="rounded-2xl bg-rose-500/10 p-3">
                <FaExclamationTriangle className="text-xl" />
              </div>
              <h3 className="text-base font-bold text-white">Permanently Delete User?</h3>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-300">
              Are you sure you want to delete <strong className="text-white">{deleteConfirmUser.name}</strong> (
              {deleteConfirmUser.email})? This action cannot be reversed.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
                className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleDeleteUser}
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
