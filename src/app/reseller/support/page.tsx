"use client";

import React, { useEffect, useState } from "react";
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  Package,
  Wrench,
  Tag,
  HelpCircle,
  X,
  MessageSquare,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import supportApi, {
  SupportTicket,
  SupportTicketReason,
  SupportTicketStatus,
} from "@/services/support.api";

const REASONS: { id: SupportTicketReason; label: string; icon: any; color: string }[] = [
  { id: "PAYMENT", label: "Payment / Payout", icon: CreditCard, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { id: "ORDER", label: "Order / Delivery", icon: Package, color: "text-blue-600 bg-blue-50 border-blue-200" },
  { id: "TECHNICAL", label: "Technical Issue", icon: Wrench, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { id: "PRODUCT", label: "Product / Catalog", icon: Tag, color: "text-purple-600 bg-purple-50 border-purple-200" },
  { id: "OTHER", label: "Other Inquiries", icon: HelpCircle, color: "text-slate-600 bg-slate-50 border-slate-200" },
];

export default function ResellerSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedReason, setSelectedReason] = useState<string>("ALL");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createReason, setCreateReason] = useState<SupportTicketReason>("PAYMENT");
  const [createMessage, setCreateMessage] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Confirmation Success Modal
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // View Ticket Details Modal
  const [viewTicket, setViewTicket] = useState<SupportTicket | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const query: any = {};
      if (selectedStatus !== "ALL") query.status = selectedStatus;
      if (selectedReason !== "ALL") query.reason = selectedReason;
      if (search.trim()) query.search = search.trim();

      const res = await supportApi.getMyTickets(query);
      setTickets(res.data || []);
    } catch (err: any) {
      console.error("Failed to load tickets:", err);
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

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createMessage.trim()) {
      setCreateError("Please write your message or issue description.");
      return;
    }

    try {
      setCreateSubmitting(true);
      setCreateError("");
      const res = await supportApi.createTicket({
        reason: createReason,
        message: createMessage.trim(),
      });

      // Close create form and open Confirmation Dialog with generated Ticket ID
      setIsCreateOpen(false);
      setCreateMessage("");
      setCreatedTicketId(res.ticketId);
      await fetchTickets();
    } catch (err: any) {
      console.error("Create ticket error:", err);
      setCreateError(err.response?.data?.message || "Failed to create support ticket.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getReasonConfig = (reason: SupportTicketReason) => {
    return (
      REASONS.find((r) => r.id === reason) || {
        id: "OTHER",
        label: "Other",
        icon: HelpCircle,
        color: "text-slate-600 bg-slate-50 border-slate-200",
      }
    );
  };

  const getStatusBadge = (status: SupportTicketStatus) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="badge badge-warning text-xs font-bold gap-1 py-2.5 px-3">
            <Clock size={12} /> Open
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="badge badge-info text-xs font-bold gap-1 py-2.5 px-3">
            <RefreshCw size={12} className="animate-spin" /> In Progress
          </span>
        );
      case "RESOLVED":
        return (
          <span className="badge badge-success text-white text-xs font-bold gap-1 py-2.5 px-3">
            <CheckCircle2 size={12} /> Resolved
          </span>
        );
      case "CLOSED":
        return (
          <span className="badge badge-ghost text-xs font-bold gap-1 py-2.5 px-3 text-slate-500">
            Closed
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
            <LifeBuoy size={14} /> Reseller Support Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Support Tickets
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            Have a question or facing an issue with payments, orders, or technical problems? Submit a ticket and receive a unique Ticket ID to track resolution.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError("");
            setIsCreateOpen(true);
          }}
          className="btn btn-primary text-white font-bold flex items-center gap-2 shadow-md shrink-0"
        >
          <Plus size={18} /> Create Support Ticket
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card bg-base-100 border border-base-200 p-4 rounded-xl shadow-xs">
          <p className="text-xs text-slate-500 font-semibold uppercase">Total Tickets</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{tickets.length}</p>
        </div>
        <div className="card bg-base-100 border border-base-200 p-4 rounded-xl shadow-xs">
          <p className="text-xs text-amber-600 font-semibold uppercase">Open</p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {tickets.filter((t) => t.status === "OPEN").length}
          </p>
        </div>
        <div className="card bg-base-100 border border-base-200 p-4 rounded-xl shadow-xs">
          <p className="text-xs text-blue-600 font-semibold uppercase">In Progress</p>
          <p className="text-2xl font-black text-blue-600 mt-1">
            {tickets.filter((t) => t.status === "IN_PROGRESS").length}
          </p>
        </div>
        <div className="card bg-base-100 border border-base-200 p-4 rounded-xl shadow-xs">
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
          {["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedStatus === st
                  ? "bg-primary text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-base-200"
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

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-64">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search by Ticket ID..."
            className="input input-bordered input-sm pl-9 w-full text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="py-16 text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-xs text-slate-400 mt-2">Loading support tickets...</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="card bg-base-100 border border-base-200 rounded-2xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
            <LifeBuoy size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No support tickets found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You haven&apos;t created any tickets matching your filter criteria. Click below to submit a support inquiry.
          </p>
          <div>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="btn btn-primary btn-sm text-white font-bold"
            >
              <Plus size={16} /> Create Support Ticket
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => {
            const reasonConfig = getReasonConfig(t.reason);
            const ReasonIcon = reasonConfig.icon;

            return (
              <div
                key={t.id}
                className="card bg-base-100 border border-base-200 p-5 rounded-2xl shadow-xs hover:border-primary/40 transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-base-200 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-black text-sm text-primary tracking-wide bg-primary/10 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      {t.ticketId}
                      <button
                        onClick={() => copyToClipboard(t.ticketId)}
                        className="hover:text-primary-focus transition"
                        title="Copy Ticket ID"
                      >
                        <Copy size={13} />
                      </button>
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${reasonConfig.color}`}
                    >
                      <ReasonIcon size={12} />
                      {reasonConfig.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400">
                      {new Date(t.createdAt).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                    {getStatusBadge(t.status)}
                  </div>
                </div>

                {/* Message Body */}
                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {t.message}
                </div>

                {/* Admin Response Box (if exists) */}
                {t.adminNotes && (
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <ShieldCheck size={14} /> Admin Response:
                    </div>
                    <p className="text-xs text-emerald-900 leading-relaxed whitespace-pre-line">
                      {t.adminNotes}
                    </p>
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setViewTicket(t)}
                    className="btn btn-ghost btn-xs text-primary font-bold hover:bg-primary/10"
                  >
                    View Full Details &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE TICKET MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <LifeBuoy size={20} className="text-primary" /> Create Support Ticket
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose a category and describe your issue. You will receive a unique Ticket ID immediately.
                </p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="btn btn-ghost btn-circle btn-sm text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {createError && (
                <div className="alert alert-error text-xs p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{createError}</span>
                </div>
              )}

              {/* Reason Selector */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-slate-800">
                    What is the reason for your ticket? *
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {REASONS.map((r) => {
                    const Icon = r.icon;
                    const isSelected = createReason === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setCreateReason(r.id)}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition text-xs font-bold ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <Icon size={16} />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Textarea */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-slate-800">
                    Describe your issue / question in detail *
                  </span>
                </label>
                <textarea
                  rows={5}
                  placeholder="Provide all relevant details (e.g. order number, payout amount, transaction date, or error description)..."
                  className="textarea textarea-bordered w-full text-sm text-black"
                  value={createMessage}
                  onChange={(e) => setCreateMessage(e.target.value)}
                  maxLength={5000}
                  required
                />
                <span className="label-text-alt text-slate-400 text-right mt-1">
                  {createMessage.length}/5000 characters
                </span>
              </div>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="btn btn-ghost btn-sm"
                  disabled={createSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm text-white font-bold"
                  disabled={createSubmitting}
                >
                  {createSubmitting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Submit Ticket"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMATION SUCCESS MODAL WITH TICKET ID */}
      {createdTicketId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-7 text-center space-y-4 border border-slate-100 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                Support Ticket Created!
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Your support request has been logged. Our representative will investigate and reply promptly.
              </p>
            </div>

            {/* Generated Ticket ID Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Your Unique Ticket ID
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl font-black text-primary tracking-widest select-all">
                  {createdTicketId}
                </span>
                <button
                  onClick={() => copyToClipboard(createdTicketId)}
                  className="btn btn-ghost btn-xs btn-circle text-primary"
                  title="Copy Ticket ID"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>
              {copied && (
                <p className="text-[10px] text-emerald-600 font-bold">
                  Copied to clipboard!
                </p>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Please save or quote this Ticket ID if contacting support directly.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setCreatedTicketId(null)}
                className="btn btn-primary w-full text-white font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TICKET DETAILS MODAL */}
      {viewTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                  {viewTicket.ticketId}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Ticket Details
                </h3>
              </div>
              <button
                onClick={() => setViewTicket(null)}
                className="btn btn-ghost btn-circle btn-sm text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Status</span>
                {getStatusBadge(viewTicket.status)}
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Reason</span>
                <span className="font-bold text-slate-800">
                  {getReasonConfig(viewTicket.reason).label}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-500">Submitted At</span>
                <span className="text-slate-600">
                  {new Date(viewTicket.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="font-bold text-slate-700">Your Message:</span>
                <div className="bg-slate-50 p-3 rounded-xl text-slate-800 leading-relaxed whitespace-pre-line border border-slate-200">
                  {viewTicket.message}
                </div>
              </div>

              {viewTicket.adminNotes && (
                <div className="space-y-1 pt-2">
                  <span className="font-bold text-emerald-800 flex items-center gap-1">
                    <ShieldCheck size={14} /> Support Team Response:
                  </span>
                  <div className="bg-emerald-50/80 p-3.5 rounded-xl text-emerald-950 leading-relaxed whitespace-pre-line border border-emerald-200">
                    {viewTicket.adminNotes}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setViewTicket(null)}
                  className="btn btn-ghost btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
