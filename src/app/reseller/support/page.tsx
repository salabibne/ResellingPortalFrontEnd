"use client";

import React, { useEffect, useState } from "react";
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  CreditCard,
  Package,
  Wrench,
  Tag,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";
import supportApi, {
  SupportTicket,
  SupportTicketReason,
} from "@/services/support.api";
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelTabs from "@/components/panel/PanelTabs";
import PanelEmpty from "@/components/panel/PanelEmpty";
import PanelSkeleton from "@/components/panel/PanelSkeleton";
import PanelModal from "@/components/panel/PanelModal";
import StatusBadge from "@/components/panel/StatusBadge";

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

  return (
    <PanelPage>
      <PanelPageHeader
        title="Support Tickets"
        subtitle="Have a question or facing an issue with payments, orders, or technical problems? Submit a ticket and receive a unique Ticket ID to track resolution."
        icon={LifeBuoy}
        actions={
          <button
            type="button"
            onClick={() => {
              setCreateError("");
              setIsCreateOpen(true);
            }}
            className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
          >
            <Plus size={16} /> Create Support Ticket
          </button>
        }
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-base-100 border border-base-200 p-4 rounded-2xl shadow-sm">
          <p className="text-xs text-base-content/60 font-semibold uppercase">Total Tickets</p>
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
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <PanelTabs
          ariaLabel="Filter tickets by status"
          value={selectedStatus}
          onChange={setSelectedStatus}
          tabs={["ALL", "OPEN", "IN_PROGRESS", "RESOLVED"].map((st) => ({
            id: st,
            label:
              st === "ALL"
                ? "All"
                : st.replace("_", " ").toLowerCase().replace(/^./, (c) => c.toUpperCase()),
          }))}
        />

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter tickets by reason"
            className="select select-sm select-bordered rounded-xl text-xs font-semibold"
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

          <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-48">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by Ticket ID..."
              className="input input-bordered input-sm rounded-xl pl-9 w-full text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <PanelSkeleton variant="cards" rows={3} />
      ) : tickets.length === 0 ? (
        <div className="bg-base-100 border border-base-200 rounded-2xl shadow-sm">
          <PanelEmpty
            icon={LifeBuoy}
            title="No support tickets found"
            text="You haven't created any tickets matching your filter criteria. Click below to submit a support inquiry."
            action={
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
              >
                <Plus size={16} /> Create Support Ticket
              </button>
            }
          />
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => {
            const reasonConfig = getReasonConfig(t.reason);
            const ReasonIcon = reasonConfig.icon;

            return (
              <div
                key={t.id}
                className="bg-base-100 border border-base-200 p-5 rounded-2xl shadow-sm hover:border-primary/40 transition-colors space-y-3"
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
                    <StatusBadge status={t.status} />
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
        <PanelModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create Support Ticket"
          size="md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="btn btn-ghost btn-sm rounded-xl"
                disabled={createSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                form="create-ticket-form"
                className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
                disabled={createSubmitting}
              >
                {createSubmitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  "Submit Ticket"
                )}
              </button>
            </>
          }
        >
          <form id="create-ticket-form" onSubmit={handleCreateSubmit} className="space-y-4">
            {createError && (
              <div className="alert alert-error text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{createError}</span>
              </div>
            )}

            {/* Reason Selector */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold text-base-content">
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
                      className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-colors text-xs font-bold ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                          : "border-base-200 hover:bg-base-200/60 text-base-content"
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
                <span className="label-text font-bold text-base-content">
                  Describe your issue / question in detail *
                </span>
              </label>
              <textarea
                rows={5}
                placeholder="Provide all relevant details (e.g. order number, payout amount, transaction date, or error description)..."
                className="textarea textarea-bordered w-full text-sm"
                value={createMessage}
                onChange={(e) => setCreateMessage(e.target.value)}
                maxLength={5000}
                required
              />
              <span className="label-text-alt text-base-content/50 text-right mt-1">
                {createMessage.length}/5000 characters
              </span>
            </div>
          </form>
        </PanelModal>
      )}

      {/* CONFIRMATION SUCCESS MODAL WITH TICKET ID */}
      {createdTicketId && (
        <PanelModal
          open={!!createdTicketId}
          onClose={() => setCreatedTicketId(null)}
          title="Support Ticket Created!"
          size="sm"
          footer={
            <button
              type="button"
              onClick={() => setCreatedTicketId(null)}
              className="btn btn-primary btn-sm rounded-xl w-full"
            >
              Done
            </button>
          }
        >
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>

            <p className="text-xs text-base-content/60 max-w-xs mx-auto">
              Your support request has been logged. Our representative will investigate and reply promptly.
            </p>

            {/* Generated Ticket ID Box */}
            <div className="bg-base-200/60 border border-base-200 rounded-2xl p-4 space-y-2">
              <p className="text-[11px] font-bold text-base-content/50 uppercase tracking-wider">
                Your Unique Ticket ID
              </p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-xl font-black text-primary tracking-widest select-all">
                  {createdTicketId}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdTicketId)}
                  className="btn btn-ghost btn-xs btn-square rounded-lg text-primary"
                  title="Copy Ticket ID"
                  aria-label="Copy Ticket ID"
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

            <p className="text-[11px] text-base-content/50">
              Please save or quote this Ticket ID if contacting support directly.
            </p>
          </div>
        </PanelModal>
      )}

      {/* VIEW TICKET DETAILS MODAL */}
      {viewTicket && (
        <PanelModal
          open={!!viewTicket}
          onClose={() => setViewTicket(null)}
          title={`Ticket Details — ${viewTicket.ticketId}`}
          size="md"
          footer={
            <button
              type="button"
              onClick={() => setViewTicket(null)}
              className="btn btn-ghost btn-sm rounded-xl"
            >
              Close
            </button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-base-content/60">Status</span>
              <StatusBadge status={viewTicket.status} />
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-base-content/60">Reason</span>
              <span className="font-bold text-base-content">
                {getReasonConfig(viewTicket.reason).label}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-bold text-base-content/60">Submitted At</span>
              <span className="text-base-content/70">
                {new Date(viewTicket.createdAt).toLocaleString()}
              </span>
            </div>

            <div className="space-y-1 pt-2 border-t border-base-200">
              <span className="font-bold text-base-content/70">Your Message:</span>
              <div className="bg-base-200/60 p-3 rounded-xl text-base-content leading-relaxed whitespace-pre-line border border-base-200">
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
          </div>
        </PanelModal>
      )}
    </PanelPage>
  );
}
