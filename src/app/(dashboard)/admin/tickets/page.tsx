"use client";

import React, { useEffect, useState } from "react";
import {
  LifeBuoy,
  Search,
  CheckCircle2,
  Clock,
  RefreshCw,
  Copy,
  Check,
  CreditCard,
  Package,
  Wrench,
  Tag,
  HelpCircle,
  X,
  User,
  Phone,
  Mail,
  ShieldCheck,
  AlertCircle,
  Filter,
} from "lucide-react";
import supportApi, {
  SupportTicket,
  SupportTicketReason,
  SupportTicketStatus,
} from "@/services/support.api";
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelTable from "@/components/panel/PanelTable";
import PanelEmpty from "@/components/panel/PanelEmpty";
import PanelSkeleton from "@/components/panel/PanelSkeleton";
import PanelModal from "@/components/panel/PanelModal";
import StatusBadge from "@/components/panel/StatusBadge";

const REASONS: { id: SupportTicketReason; label: string; icon: any; color: string }[] = [
  { id: "PAYMENT", label: "Payment / Payout", icon: CreditCard, color: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { id: "ORDER", label: "Order / Delivery", icon: Package, color: "text-blue-700 bg-blue-50 border-blue-200" },
  { id: "TECHNICAL", label: "Technical Issue", icon: Wrench, color: "text-amber-700 bg-amber-50 border-amber-200" },
  { id: "PRODUCT", label: "Product / Catalog", icon: Tag, color: "text-purple-700 bg-purple-50 border-purple-200" },
  { id: "OTHER", label: "Other Inquiries", icon: HelpCircle, color: "text-slate-700 bg-slate-50 border-slate-200" },
];

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedReason, setSelectedReason] = useState<string>("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Manage Modal State
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [editStatus, setEditStatus] = useState<SupportTicketStatus>("OPEN");
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const query: any = {};
      if (selectedStatus !== "ALL") query.status = selectedStatus;
      if (selectedReason !== "ALL") query.reason = selectedReason;
      if (search.trim()) query.search = search.trim();

      const res = await supportApi.getAllTicketsAdmin(query);
      setTickets(res.data || []);
    } catch (err: any) {
      console.error("Failed to load admin tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [selectedStatus, selectedReason]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTickets();
  };

  const openManageModal = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setEditStatus(ticket.status);
    setAdminNotes(ticket.adminNotes || "");
    setUpdateError("");
    setUpdateSuccess(false);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    try {
      setUpdating(true);
      setUpdateError("");
      const updated = await supportApi.updateTicketStatusAdmin(selectedTicket.id, {
        status: editStatus,
        adminNotes: adminNotes.trim() || undefined,
      });

      setSelectedTicket(updated);
      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
        setSelectedTicket(null);
      }, 1200);

      await fetchTickets();
    } catch (err: any) {
      console.error("Update ticket status error:", err);
      setUpdateError(err.response?.data?.message || "Failed to update ticket status.");
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getReasonConfig = (reason: SupportTicketReason) => {
    return (
      REASONS.find((r) => r.id === reason) || {
        id: "OTHER",
        label: "Other",
        icon: HelpCircle,
        color: "text-slate-700 bg-slate-50 border-slate-200",
      }
    );
  };

  return (
    <PanelPage>
      <PanelPageHeader
        title="Support Tickets Management"
        subtitle="Monitor and resolve incoming uddokta inquiries. Search by Ticket ID, customer name, or keyword, and update resolution notes."
        icon={LifeBuoy}
        actions={
          <button
            type="button"
            onClick={fetchTickets}
            className="btn btn-outline btn-sm rounded-xl gap-2"
            title="Refresh list"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-base-100 border border-base-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Inquiries</p>
          <p className="text-2xl font-black text-base-content mt-1">{tickets.length}</p>
        </div>
        <div className="bg-base-100 border border-base-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-amber-600 font-semibold uppercase">Open</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {tickets.filter((t) => t.status === "OPEN").length}
          </p>
        </div>
        <div className="bg-base-100 border border-base-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-blue-600 font-semibold uppercase">In Progress</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {tickets.filter((t) => t.status === "IN_PROGRESS").length}
          </p>
        </div>
        <div className="bg-base-100 border border-base-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-emerald-600 font-semibold uppercase">Resolved</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {tickets.filter((t) => t.status === "RESOLVED").length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-base-100 p-4 rounded-xl border border-base-200">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Tabs */}
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedStatus === st
                  ? "bg-primary text-white shadow-sm"
                  : "text-slate-600 hover:text-base-content hover:bg-base-200"
              }`}
            >
              {st === "ALL" ? "All Statuses" : st.replace("_", " ")}
            </button>
          ))}

          {/* Reason Filter */}
          <select
            className="select select-bordered select-sm text-xs font-semibold"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            <option value="ALL">All Reasons</option>
            {REASONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {/* Search input (Ticket ID, Reseller Name, Email) */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by Ticket ID (e.g. TKT-...) or Name..."
            className="input input-bordered input-sm pl-9 pr-14 w-full text-xs text-base-content"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-1 top-1/2 -translate-y-1/2 btn btn-primary btn-xs text-white"
          >
            Find
          </button>
        </form>
      </div>

      {/* Tickets Table / List */}
      {loading ? (
        <PanelSkeleton variant="table" rows={6} />
      ) : tickets.length === 0 ? (
        <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm">
          <PanelEmpty
            icon={LifeBuoy}
            title="No support tickets found"
            text={
              search
                ? `No tickets matching search "${search}".`
                : "No tickets currently submitted under this category."
            }
            action={
              search ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    fetchTickets();
                  }}
                  className="btn btn-ghost btn-sm rounded-xl text-primary"
                >
                  Clear Search
                </button>
              ) : undefined
            }
          />
        </div>
      ) : (
        <PanelTable>
              <thead>
                <tr>
                  <th>Ticket ID</th>
                  <th>Uddokta</th>
                  <th>Reason</th>
                  <th>Message Preview</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => {
                  const reasonConfig = getReasonConfig(t.reason);
                  const ReasonIcon = reasonConfig.icon;

                  return (
                    <tr key={t.id} className="hover">
                      {/* Ticket ID */}
                      <td className="font-mono font-bold whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-primary">
                          <span>{t.ticketId}</span>
                          <button
                            onClick={() => copyToClipboard(t.ticketId)}
                            className="text-slate-400 hover:text-primary transition"
                            title="Copy Ticket ID"
                          >
                            {copiedId === t.ticketId ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Reseller Info */}
                      <td>
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 flex items-center gap-1">
                            <User size={11} className="text-slate-400" />
                            {t.user?.name || "Unknown"}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Mail size={11} className="text-slate-400" />
                            {t.user?.email || "No email"}
                          </p>
                          {t.user?.phone && (
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Phone size={11} className="text-slate-400" />
                              {t.user?.phone}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Reason */}
                      <td>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border whitespace-nowrap ${reasonConfig.color}`}
                        >
                          <ReasonIcon size={12} />
                          {reasonConfig.label}
                        </span>
                      </td>

                      {/* Message Preview */}
                      <td className="max-w-xs">
                        <p className="truncate text-slate-700 leading-snug" title={t.message}>
                          {t.message}
                        </p>
                        {t.adminNotes && (
                          <p className="text-[10px] text-emerald-700 font-semibold truncate flex items-center gap-1 mt-0.5">
                            <ShieldCheck size={11} /> Reply: {t.adminNotes}
                          </p>
                        )}
                      </td>

                      {/* Status */}
                      <td><StatusBadge status={t.status} /></td>

                      {/* Date */}
                      <td className="whitespace-nowrap text-slate-500">
                        {new Date(t.createdAt).toLocaleString(undefined, {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </td>

                      {/* Action */}
                      <td className="text-right whitespace-nowrap">
                        <button
                          onClick={() => openManageModal(t)}
                          className="btn btn-primary btn-xs text-white font-bold"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
          </PanelTable>
      )}

      {/* MANAGE TICKET MODAL */}
      {selectedTicket && (
        <PanelModal
          open={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Manage Support Ticket — ${selectedTicket.ticketId}`}
          size="lg"
          footer={
            <>
              <button
                type="button"
                className="btn btn-ghost btn-sm rounded-xl"
                onClick={() => setSelectedTicket(null)}
                disabled={updating}
              >
                Close
              </button>
              <button
                type="submit"
                form="admin-ticket-form"
                className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
                disabled={updating}
              >
                {updating ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </>
          }
        >
          <form id="admin-ticket-form" onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              {updateSuccess && (
                <div className="alert alert-success text-white text-xs p-3 rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>Ticket status updated successfully!</span>
                </div>
              )}

              {updateError && (
                <div className="alert alert-error text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{updateError}</span>
                </div>
              )}

              {/* Reseller Info Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Uddokta Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-800">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Name</span>
                    <span className="font-bold">{selectedTicket.user?.name || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Email</span>
                    <span className="font-bold truncate block">{selectedTicket.user?.email || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Phone</span>
                    <span className="font-bold">{selectedTicket.user?.phone || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Ticket Metadata */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <span className="text-slate-400 text-[10px] block">Category / Reason</span>
                  <span className="font-bold text-slate-800">
                    {getReasonConfig(selectedTicket.reason).label}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Submitted On</span>
                  <span className="text-slate-600">
                    {new Date(selectedTicket.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Reseller's Message */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Uddokta Message:</label>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 leading-relaxed whitespace-pre-line">
                  {selectedTicket.message}
                </div>
              </div>

              {/* Update Status Dropdown */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-slate-800">
                    Update Ticket Status *
                  </span>
                </label>
                <select
                  className="select select-bordered select-sm w-full font-bold text-base-content"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as SupportTicketStatus)}
                >
                  <option value="OPEN">OPEN (Awaiting Review)</option>
                  <option value="IN_PROGRESS">IN_PROGRESS (Investigating)</option>
                  <option value="RESOLVED">RESOLVED (Resolved with Solution)</option>
                  <option value="CLOSED">CLOSED (Completed / Inactive)</option>
                </select>
              </div>

              {/* Admin Notes / Reply */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-slate-800">
                    Admin Resolution Notes / Reply
                  </span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Enter resolution details, tracking notes, or message for the uddokta..."
                  className="textarea textarea-bordered w-full text-xs text-base-content"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
                <span className="label-text-alt text-slate-400 mt-1">
                  These notes will be visible to the uddokta when viewing their ticket details.
                </span>
              </div>
            </form>
        </PanelModal>
      )}
    </PanelPage>
  );
}
