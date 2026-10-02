"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  User,
  Shield,
  Activity,
  Edit2,
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Building,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { userApi } from "@/services/user.api";

// Available User roles and statuses for editing
const ROLES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "SALES_EXECUTIVE",
  "INVENTOR",
  "RESELLER",
  "USER",
];

const STATUSES = ["ACTIVE", "DEACTIVATED", "PENDING"];

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState("");

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const [updating, setUpdating] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Trigger search / filters
  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getUsers({
        search,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: meta.limit,
      });
      setUsers(response.data);
      setMeta(response.meta);
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleResetFilters = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const openDetails = (user: any) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const openRoleEdit = (user: any) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsRoleModalOpen(true);
  };

  const openStatusEdit = (user: any) => {
    setSelectedUser(user);
    setNewStatus(user.status);
    setIsStatusModalOpen(true);
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      await userApi.updateRole(selectedUser.id, newRole);
      showToast(`Successfully updated ${selectedUser.name}'s role to ${newRole}`, "success");
      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update role", "error");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      await userApi.updateStatus(selectedUser.id, newStatus);
      showToast(`Successfully updated ${selectedUser.name}'s status to ${newStatus}`, "success");
      setIsStatusModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="badge badge-success text-white gap-1 py-3 px-3 text-xs font-semibold">
            <CheckCircle2 size={12} /> ACTIVE
          </span>
        );
      case "DEACTIVATED":
        return (
          <span className="badge badge-error text-white gap-1 py-3 px-3 text-xs font-semibold">
            <XCircle size={12} /> DEACTIVATED
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="badge badge-warning gap-1 py-3 px-3 text-xs font-semibold text-amber-900">
            <Clock size={12} /> PENDING
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="badge badge-neutral bg-purple-950 border-none text-purple-100 font-bold text-xs">SUPER ADMIN</span>;
      case "ADMIN":
        return <span className="badge badge-neutral bg-blue-950 border-none text-blue-100 font-bold text-xs">ADMIN</span>;
      case "MANAGER":
        return <span className="badge badge-neutral bg-teal-950 border-none text-teal-100 text-xs">MANAGER</span>;
      case "SALES_EXECUTIVE":
        return <span className="badge badge-neutral bg-indigo-950 border-none text-indigo-100 text-xs">SALES EXEC</span>;
      case "INVENTOR":
        return <span className="badge badge-neutral bg-orange-950 border-none text-orange-200 text-xs">INVENTOR</span>;
      case "RESELLER":
        return <span className="badge badge-neutral bg-emerald-950 border-none text-emerald-200 text-xs">RESELLER</span>;
      default:
        return <span className="badge badge-ghost text-black font-semibold text-xs border-slate-400">USER</span>;
    }
  };

  return (
    <div className="space-y-6 text-black">
      {/* Toast Notification */}
      {toast && (
        <div className="toast toast-top toast-end z-50">
          <div className={`alert ${toast.type === "success" ? "alert-success text-white" : "alert-error text-white"} shadow-lg rounded-xl`}>
            <div>
              {toast.type === "success" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              <span>{toast.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header Block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-black flex items-center gap-2">
            <User className="text-primary w-8 h-8" /> User Management
          </h1>
          <p className="text-black font-medium mt-1">
            Review registered accounts, update access roles, and toggle account activation statuses.
          </p>
        </div>
        <div className="bg-slate-100 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 flex items-center gap-2 text-black">
          <Shield className="w-4 h-4 text-primary" /> Total Accounts: {meta.total}
        </div>
      </div>

      {/* Filters Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-300 p-5">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <label className="text-xs font-bold text-black block mb-1">Search Keywords</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, email, phone..."
                  className="input input-bordered w-full pl-10 text-black bg-slate-50 border-slate-400 focus:bg-white placeholder-slate-700"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
              </div>
            </div>

            {/* Role Filter */}
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-black block mb-1">Filter by Role</label>
              <select
                className="select select-bordered w-full text-black bg-slate-50 border-slate-400"
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Roles</option>
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-black block mb-1">Filter by Status</label>
              <select
                className="select select-bordered w-full text-black bg-slate-50 border-slate-400"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex items-end gap-2">
              <button type="submit" className="btn btn-primary flex-1 shadow-sm text-white">
                Apply
              </button>
              <button
                type="button"
                className="btn btn-outline btn-square border-slate-400 text-black hover:bg-slate-100"
                onClick={handleResetFilters}
                title="Reset Filters"
              >
                <Filter size={18} />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-300 overflow-hidden">
        {loading ? (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-black font-bold">Fetching accounts details...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center">
            <User className="mx-auto w-12 h-12 text-black mb-3" />
            <h3 className="text-lg font-bold text-black">No users found</h3>
            <p className="text-black mt-1 max-w-sm mx-auto font-medium">
              No registered user profiles matched your current search filters or criteria.
            </p>
            <button className="btn btn-sm btn-outline mt-4 border-slate-400 text-black" onClick={handleResetFilters}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full text-black">
              <thead className="bg-slate-100 text-black font-extrabold border-b border-slate-300">
                <tr>
                  <th className="py-4 text-black font-bold">User Details</th>
                  <th className="text-black font-bold">Contact Info</th>
                  <th className="text-black font-bold">Role</th>
                  <th className="text-black font-bold">Status</th>
                  <th className="text-black font-bold">Registered</th>
                  <th className="text-center text-black font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors border-b border-slate-200">
                    {/* User Details */}
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="w-10 h-10 rounded-full bg-slate-300 text-black font-bold flex items-center justify-center">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              item.name.charAt(0).toUpperCase()
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="font-extrabold text-black flex items-center gap-1.5 flex-wrap">
                            {item.name}
                            {item.pageName && (
                              <span className="badge badge-sm badge-outline text-indigo-800 font-extrabold border-indigo-500 bg-indigo-50/50">
                                @{item.pageName}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-black mt-0.5 font-mono font-semibold">{item.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td>
                      <div className="space-y-1 text-sm font-semibold">
                        <div className="flex items-center gap-1.5 text-black">
                          <Mail size={13} className="text-black shrink-0" />
                          <span>{item.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-black">
                          <Phone size={13} className="text-black shrink-0" />
                          <span>{item.phone}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td>{getRoleBadge(item.role)}</td>

                    {/* Status */}
                    <td>{getStatusBadge(item.status)}</td>

                    {/* Registered Date */}
                    <td className="text-black text-sm font-semibold">
                      <div className="flex items-center gap-1">
                        <Calendar size={13} className="text-black" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="btn btn-sm btn-ghost text-black hover:bg-slate-200 btn-square"
                          onClick={() => openDetails(item)}
                          title="View Full Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost text-primary hover:bg-primary/10 btn-square"
                          onClick={() => openRoleEdit(item)}
                          title="Change Role"
                        >
                          <Shield size={16} />
                        </button>
                        <button
                          className="btn btn-sm btn-ghost text-orange-800 hover:bg-orange-100 btn-square"
                          onClick={() => openStatusEdit(item)}
                          title="Toggle Status"
                        >
                          <Activity size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Block */}
        {!loading && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-300 px-6 py-4 bg-slate-50">
            <div className="text-sm font-semibold text-black">
              Showing page <span className="font-extrabold text-black">{meta.page}</span> of{" "}
              <span className="font-extrabold text-black">{meta.totalPages}</span>
            </div>
            <div className="flex gap-1">
              <button
                className="btn btn-sm btn-outline text-black border-slate-400 hover:bg-slate-200 disabled:bg-slate-100"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={meta.page === 1}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <button
                className="btn btn-sm btn-outline text-black border-slate-400 hover:bg-slate-200 disabled:bg-slate-100"
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                disabled={meta.page === meta.totalPages}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: User Full Profile Details */}
      {isDetailsOpen && selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg bg-white p-6 rounded-2xl relative shadow-xl border border-slate-300">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-black hover:text-red-600"
              onClick={() => setIsDetailsOpen(false)}
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-200 pb-4 mb-4">
              <div className="avatar placeholder">
                <div className="w-16 h-16 rounded-full bg-slate-200 text-black font-extrabold text-2xl flex items-center justify-center">
                  {selectedUser.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedUser.imageUrl} alt={selectedUser.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    selectedUser.name.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-black">{selectedUser.name}</h3>
                <div className="flex gap-2 mt-1.5">
                  {getRoleBadge(selectedUser.role)}
                  {getStatusBadge(selectedUser.status)}
                </div>
              </div>
            </div>

            <div className="space-y-4 text-black">
              {/* Account General Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-black font-bold mb-1 uppercase tracking-wider">Page Name</div>
                  <div className="text-indigo-800 font-extrabold text-sm truncate" title={selectedUser.pageName || "None"}>
                    {selectedUser.pageName ? `@${selectedUser.pageName}` : "None"}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-black font-bold mb-1 uppercase tracking-wider">Account ID</div>
                  <div className="text-black font-mono text-xs truncate" title={selectedUser.id}>
                    {selectedUser.id}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="text-xs text-black font-bold mb-1 uppercase tracking-wider">Organization ID</div>
                  <div className="text-black font-mono text-xs truncate" title={selectedUser.OrganizationId}>
                    {selectedUser.OrganizationId}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-xs font-extrabold text-black uppercase tracking-wider mb-2">Contacts</h4>
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2.5">
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <Mail size={16} className="text-black shrink-0" />
                    <div>
                      <div className="text-xs text-black font-bold">Primary Email</div>
                      <div className="text-black">{selectedUser.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-semibold">
                    <Phone size={16} className="text-black shrink-0" />
                    <div>
                      <div className="text-xs text-black font-bold">Primary Phone</div>
                      <div className="text-black">{selectedUser.phone}</div>
                    </div>
                  </div>
                  {selectedUser.secondaryPhone && (
                    <div className="flex items-center gap-3 text-sm font-semibold">
                      <Phone size={16} className="text-black shrink-0" />
                      <div>
                        <div className="text-xs text-black font-bold">Secondary Phone</div>
                        <div className="text-black">{selectedUser.secondaryPhone}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-extrabold text-black uppercase tracking-wider mb-2">Present Address</h4>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-sm text-black flex gap-2 font-semibold">
                    <MapPin size={16} className="text-black shrink-0 mt-0.5" />
                    <div>
                      <div>Thana: {selectedUser.presentThana}</div>
                      <div className="font-extrabold text-black">District: {selectedUser.presentDistrict}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-black uppercase tracking-wider mb-2">Permanent Address</h4>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 text-sm text-black flex gap-2 font-semibold">
                    <Building size={16} className="text-black shrink-0 mt-0.5" />
                    <div>
                      <div>Thana: {selectedUser.permanentThana}</div>
                      <div className="font-extrabold text-black">District: {selectedUser.permanentDistrict}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Meta dates */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 flex justify-between text-xs text-black font-semibold">
                <div>Registered: {new Date(selectedUser.createdAt).toLocaleString()}</div>
                <div>Updated: {new Date(selectedUser.updatedAt).toLocaleString()}</div>
              </div>
            </div>
            
            <div className="modal-action mt-6">
              <button className="btn btn-outline border-slate-400 text-black w-full hover:bg-slate-200" onClick={() => setIsDetailsOpen(false)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Edit Access Role */}
      {isRoleModalOpen && selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box bg-white max-w-sm p-6 rounded-2xl relative shadow-xl border border-slate-300 text-black">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-black hover:text-red-600"
              onClick={() => setIsRoleModalOpen(false)}
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-lg text-black mb-1">Modify Access Role</h3>
            <p className="text-sm font-semibold text-black mb-4">
              Change the permission role level for <span className="font-bold text-indigo-700">{selectedUser.name}</span>.
            </p>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-black">Select Access Role</span>
                </label>
                <select
                  className="select select-bordered w-full bg-slate-50 border-slate-400 text-black"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-action mt-6 gap-2">
              <button
                type="button"
                className="btn btn-ghost border border-slate-400 text-black hover:bg-slate-200"
                onClick={() => setIsRoleModalOpen(false)}
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary text-white flex-1 animate-none"
                onClick={handleRoleUpdate}
                disabled={updating}
              >
                {updating ? <span className="loading loading-spinner"></span> : "Save Role"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Edit Status */}
      {isStatusModalOpen && selectedUser && (
        <div className="modal modal-open">
          <div className="modal-box bg-white max-w-sm p-6 rounded-2xl relative shadow-xl border border-slate-300 text-black">
            <button
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4 text-black hover:text-red-600"
              onClick={() => setIsStatusModalOpen(false)}
            >
              <X size={18} />
            </button>

            <h3 className="font-extrabold text-lg text-black mb-1">Update Account Status</h3>
            <p className="text-sm font-semibold text-black mb-4">
              Update activation status for <span className="font-bold text-indigo-700">{selectedUser.name}</span>.
            </p>

            <div className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-black">Account Status</span>
                </label>
                <div className="flex flex-col gap-2">
                  {STATUSES.map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-3 p-3 rounded-xl border border-slate-400 hover:bg-slate-50 cursor-pointer transition-all"
                    >
                      <input
                        type="radio"
                        name="accountStatus"
                        className="radio radio-primary border-slate-400"
                        value={status}
                        checked={newStatus === status}
                        onChange={(e) => setNewStatus(e.target.value)}
                      />
                      <span className="font-bold text-black text-sm">{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-action mt-6 gap-2">
              <button
                type="button"
                className="btn btn-ghost border border-slate-400 text-black hover:bg-slate-200"
                onClick={() => setIsStatusModalOpen(false)}
                disabled={updating}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary text-white flex-1"
                onClick={handleStatusUpdate}
                disabled={updating}
              >
                {updating ? <span className="loading loading-spinner"></span> : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
