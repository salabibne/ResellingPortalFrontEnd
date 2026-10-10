"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  Copy,
  ExternalLink,
  ShieldCheck,
  Building2,
  Smartphone,
  Banknote,
  DollarSign,
  AlertTriangle,
  User,
  Phone,
  Calendar,
  Send,
  Eye,
} from "lucide-react";
import {
  withdrawalApi,
  WithdrawalItem,
  AdminWithdrawalResponse,
  PayoutMethod,
  WithdrawalStatus,
  CompleteWithdrawalDto,
  RejectWithdrawalDto,
} from "@/services/withdrawal.api";

export default function AdminWithdrawalsPage() {
  const [data, setData] = useState<WithdrawalItem[]>([]);
  const [kpis, setKpis] = useState<AdminWithdrawalResponse["kpis"]>({
    totalPaidOut: 0,
    totalPendingAmount: 0,
    pendingCount: 0,
    completedCount: 0,
    rejectedCount: 0,
    totalRequests: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [payoutMethodFilter, setPayoutMethodFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Modals
  const [processModalWithdrawal, setProcessModalWithdrawal] = useState<WithdrawalItem | null>(null);
  const [rejectModalWithdrawal, setRejectModalWithdrawal] = useState<WithdrawalItem | null>(null);
  const [proofModalWithdrawal, setProofModalWithdrawal] = useState<WithdrawalItem | null>(null);

  // Form Submissions
  const [completeForm, setCompleteForm] = useState<CompleteWithdrawalDto>({
    transactionId: "",
    proofImageUrl: "",
    adminNotes: "",
  });
  const [rejectForm, setRejectForm] = useState<RejectWithdrawalDto>({
    adminNotes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await withdrawalApi.getAllAdmin({
        page,
        limit: 15,
        status: (statusFilter as WithdrawalStatus) || undefined,
        payoutMethod: (payoutMethodFilter as PayoutMethod) || undefined,
        search: searchTerm.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      setData(res.data);
      setKpis(res.kpis);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch admin withdrawals:", err);
      showToast("Failed to load withdrawal requests", "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, payoutMethodFilter, searchTerm, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Process Modal
  const handleOpenProcessModal = (w: WithdrawalItem) => {
    setProcessModalWithdrawal(w);
    setCompleteForm({
      transactionId: "",
      proofImageUrl: "",
      adminNotes: "",
    });
  };

  // Submit Complete Payout
  const handleSubmitComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!processModalWithdrawal) return;

    try {
      setIsSubmitting(true);
      await withdrawalApi.completeWithdrawalAdmin(processModalWithdrawal.id, {
        transactionId: completeForm.transactionId?.trim() || undefined,
        proofImageUrl: completeForm.proofImageUrl?.trim() || undefined,
        adminNotes: completeForm.adminNotes?.trim() || undefined,
      });

      showToast(`Payout of ৳${processModalWithdrawal.amount} marked as COMPLETED!`, "success");
      setProcessModalWithdrawal(null);
      await loadData();
    } catch (err: any) {
      console.error("Failed to complete payout:", err);
      showToast(err.response?.data?.message || "Failed to process withdrawal.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Reject Modal
  const handleOpenRejectModal = (w: WithdrawalItem) => {
    setRejectModalWithdrawal(w);
    setRejectForm({
      adminNotes: "",
    });
  };

  // Submit Reject Payout
  const handleSubmitReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalWithdrawal) return;

    if (!rejectForm.adminNotes.trim()) {
      showToast("Please provide a reason for rejecting this payout request.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await withdrawalApi.rejectWithdrawalAdmin(rejectModalWithdrawal.id, {
        adminNotes: rejectForm.adminNotes.trim(),
      });

      showToast(`Payout request rejected. Reseller balance restored.`, "success");
      setRejectModalWithdrawal(null);
      await loadData();
    } catch (err: any) {
      console.error("Failed to reject payout:", err);
      showToast(err.response?.data?.message || "Failed to reject withdrawal.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Copied to clipboard!", "success");
  };

  const renderStatusBadge = (status: WithdrawalStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="badge badge-success text-white font-bold gap-1 text-xs py-2 px-3">
            <CheckCircle2 size={13} /> Completed
          </span>
        );
      case "PENDING":
        return (
          <span className="badge badge-warning text-white font-bold gap-1 text-xs py-2 px-3">
            <Clock size={13} /> Pending Review
          </span>
        );
      case "PROCESSING":
        return (
          <span className="badge badge-info text-white font-bold gap-1 text-xs py-2 px-3">
            <RefreshCw size={13} className="animate-spin" /> Processing
          </span>
        );
      case "REJECTED":
        return (
          <span className="badge badge-error text-white font-bold gap-1 text-xs py-2 px-3">
            <XCircle size={13} /> Rejected
          </span>
        );
      case "CANCELLED":
        return (
          <span className="badge badge-neutral text-xs font-semibold py-2 px-3">
            Cancelled
          </span>
        );
      default:
        return <span className="badge text-xs">{status}</span>;
    }
  };

  const getMethodIcon = (method: PayoutMethod) => {
    switch (method) {
      case "BANK_TRANSFER":
        return <Building2 size={15} className="text-blue-600" />;
      case "CASH":
        return <Banknote size={15} className="text-emerald-600" />;
      default:
        return <Smartphone size={15} className="text-pink-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast toast-top toast-end z-50">
          <div
            className={`alert ${
              toastType === "success" ? "alert-success text-white" : "alert-error text-white"
            } shadow-lg text-sm font-semibold`}
          >
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-wider uppercase mb-1">
            <Wallet size={16} /> Finance & Payouts Administration
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Reseller Profit Withdrawals</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Review profit withdrawal requests from resellers, disburse payments, and attach verifiable proof documents and Transaction IDs (TrxID).
          </p>
        </div>

        <button
          onClick={loadData}
          className="btn btn-sm btn-outline border-white/30 text-white hover:bg-white/10 font-bold gap-2 self-start md:self-auto"
        >
          <RefreshCw size={16} /> Refresh Requests
        </button>
      </div>

      {/* ─── KPI SUMMARY METRICS ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pending Requests */}
        <div className="card bg-white border border-amber-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                Pending Approval
              </p>
              <h3 className="text-2xl font-black text-amber-700 mt-1">
                {kpis.pendingCount} <span className="text-sm font-normal text-amber-600">requests</span>
              </h3>
              <p className="text-[11px] text-amber-800 font-bold mt-1">
                Total ৳{kpis.totalPendingAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-200">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Total Disbursed / Paid Out */}
        <div className="card bg-white border border-emerald-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Total Paid Out
              </p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">
                ৳{kpis.totalPaidOut.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-700 mt-1">
                Across {kpis.completedCount} completed payouts
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-200">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        {/* Completed Count */}
        <div className="card bg-white border border-base-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Completed Payouts
              </p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                {kpis.completedCount}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Verified with proof</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>

        {/* Rejected Count */}
        <div className="card bg-white border border-base-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Rejected Requests
              </p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">
                {kpis.rejectedCount}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Returned to wallet</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-100">
              <XCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN TABLE CARD ──────────────────────────────────────── */}
      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
        {/* Filter Controls Bar */}
        <div className="p-4 border-b border-base-200 bg-base-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              placeholder="Search by reseller name, phone, email, or TrxID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="input input-sm input-bordered w-full pl-9 bg-base-100 text-base-content text-xs"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Select */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="select select-sm select-bordered bg-base-100 text-base-content text-xs font-semibold"
            >
              <option value="">All Statuses ({kpis.totalRequests})</option>
              <option value="PENDING">Pending Review ({kpis.pendingCount})</option>
              <option value="COMPLETED">Completed ({kpis.completedCount})</option>
              <option value="REJECTED">Rejected ({kpis.rejectedCount})</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Payout Method Select */}
            <select
              value={payoutMethodFilter}
              onChange={(e) => {
                setPayoutMethodFilter(e.target.value);
                setPage(1);
              }}
              className="select select-sm select-bordered bg-base-100 text-base-content text-xs font-semibold"
            >
              <option value="">All Methods</option>
              <option value="BKASH">bKash</option>
              <option value="NAGAD">Nagad</option>
              <option value="ROCKET">Rocket</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CASH">Cash</option>
            </select>

            {/* Clear Filters Button */}
            {(statusFilter || payoutMethodFilter || searchTerm || startDate || endDate) && (
              <button
                onClick={() => {
                  setStatusFilter("");
                  setPayoutMethodFilter("");
                  setSearchTerm("");
                  setStartDate("");
                  setEndDate("");
                  setPage(1);
                }}
                className="btn btn-sm btn-ghost text-xs text-error"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Requests Table */}
        {loading ? (
          <div className="p-12 text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-xs text-base-content/60 mt-2 font-medium">Loading withdrawal requests...</p>
          </div>
        ) : data.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40">
              <Wallet size={28} />
            </div>
            <h3 className="font-bold text-base text-base-content">No withdrawal requests found</h3>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
              No matching records found for the selected filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full text-sm">
              <thead className="bg-base-200/50 text-base-content font-bold text-xs uppercase">
                <tr>
                  <th>Request ID & Date</th>
                  <th>Reseller Details</th>
                  <th>Amount</th>
                  <th>Payout Channel & Details</th>
                  <th>Status</th>
                  <th>Proof & Reference</th>
                  <th className="text-right">Disbursement Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {data.map((w) => (
                  <tr key={w.id} className="hover:bg-base-200/30 transition-colors">
                    {/* ID & Date */}
                    <td>
                      <div className="font-mono text-xs font-bold text-base-content">
                        #{w.id.substring(0, 8)}
                      </div>
                      <div className="text-[11px] text-base-content/60">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-base-content/40 font-mono">
                        {new Date(w.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>

                    {/* Reseller Info */}
                    <td>
                      <div className="font-bold text-base-content text-sm">
                        {w.reseller?.name || "Unknown Reseller"}
                      </div>
                      <div className="text-xs text-base-content/70 flex items-center gap-1 font-mono">
                        <Phone size={11} /> {w.reseller?.phone}
                      </div>
                      {w.reseller?.pageName && (
                        <span className="badge badge-xs badge-outline text-[10px] mt-0.5">
                          {w.reseller.pageName}
                        </span>
                      )}
                    </td>

                    {/* Amount */}
                    <td>
                      <div className="font-extrabold text-base text-emerald-600">
                        ৳{Number(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    {/* Method & Recipient Account */}
                    <td className="max-w-xs">
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        {getMethodIcon(w.payoutMethod)}
                        <span>{w.payoutMethod.replace("_", " ")}</span>
                      </div>
                      <div className="text-xs text-base-content font-medium break-words mt-0.5">
                        {w.accountDetails}
                      </div>
                      {w.resellerNotes && (
                        <div className="text-[10px] text-base-content/60 italic mt-0.5">
                          Reseller Note: &ldquo;{w.resellerNotes}&rdquo;
                        </div>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td>{renderStatusBadge(w.status)}</td>

                    {/* Proof Details */}
                    <td>
                      {w.status === "COMPLETED" ? (
                        <div className="space-y-1">
                          {w.transactionId && (
                            <div className="font-mono text-xs font-bold text-primary flex items-center gap-1">
                              <span>Trx: {w.transactionId}</span>
                              <button
                                onClick={() => copyToClipboard(w.transactionId || "")}
                                className="btn btn-ghost btn-xs p-0.5"
                                title="Copy TrxID"
                              >
                                <Copy size={11} />
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => setProofModalWithdrawal(w)}
                            className="btn btn-xs btn-outline btn-success gap-1 text-[11px]"
                          >
                            <FileText size={12} /> View Proof Document
                          </button>
                        </div>
                      ) : w.status === "REJECTED" ? (
                        <div className="text-xs text-error font-medium max-w-xs">
                          {w.adminNotes || "Rejected by Admin"}
                        </div>
                      ) : (
                        <span className="text-xs text-base-content/40 italic">Awaiting Payment</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="text-right">
                      {w.status === "PENDING" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenProcessModal(w)}
                            className="btn btn-xs btn-success text-white font-bold gap-1 shadow-sm"
                          >
                            <CheckCircle2 size={13} /> Complete Payout
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(w)}
                            className="btn btn-xs btn-outline btn-error"
                          >
                            Reject
                          </button>
                        </div>
                      ) : w.status === "COMPLETED" ? (
                        <span className="text-xs text-emerald-700 font-semibold flex items-center justify-end gap-1">
                          <ShieldCheck size={14} /> Settled
                        </span>
                      ) : (
                        <span className="text-xs text-base-content/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-base-200 flex items-center justify-between">
            <span className="text-xs text-base-content/60">
              Page {page} of {totalPages}
            </span>
            <div className="join">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="join-item btn btn-xs btn-outline"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="join-item btn btn-xs btn-outline"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL 1: PROCESS & COMPLETE PAYOUT MODAL ──────────────── */}
      {processModalWithdrawal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg bg-base-100 text-base-content p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Complete Profit Payout</h3>
                  <p className="text-xs text-base-content/60">
                    Verify payout transfer and attach proof documents
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProcessModalWithdrawal(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            {/* Recipient Account Details Summary Card */}
            <div className="bg-base-200/50 p-4 rounded-xl space-y-2 border border-base-300/60">
              <div className="flex justify-between items-center">
                <span className="text-xs text-base-content/60 font-semibold">Reseller</span>
                <strong className="text-sm text-base-content">
                  {processModalWithdrawal.reseller?.name} ({processModalWithdrawal.reseller?.phone})
                </strong>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-xs text-base-content/60 font-semibold">Disbursement Amount</span>
                <strong className="text-2xl font-black text-emerald-600">
                  ৳{Number(processModalWithdrawal.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-base-300">
                <span className="text-xs text-base-content/60 font-semibold">Payment Channel</span>
                <span className="badge badge-primary font-bold text-xs">
                  {processModalWithdrawal.payoutMethod}
                </span>
              </div>

              <div className="pt-1">
                <span className="text-xs text-base-content/60 font-semibold block mb-0.5">
                  Recipient Account Details:
                </span>
                <div className="p-2.5 bg-white rounded-lg border border-base-300 font-mono text-xs text-black font-semibold flex items-center justify-between">
                  <span>{processModalWithdrawal.accountDetails}</span>
                  <button
                    onClick={() => copyToClipboard(processModalWithdrawal.accountDetails)}
                    className="btn btn-xs btn-ghost gap-1"
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmitComplete} className="space-y-4">
              {/* Transaction ID / Trx Number */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-base-content">
                  Transaction Number / TrxID (e.g. bKash / Bank Ref)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9J8762LK01 or FT260824001"
                  value={completeForm.transactionId}
                  onChange={(e) =>
                    setCompleteForm((prev) => ({ ...prev, transactionId: e.target.value }))
                  }
                  className="input input-bordered w-full bg-base-100 text-base-content font-mono font-bold"
                />
              </div>

              {/* Proof Document / Screenshot URL */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-base-content">
                  Proof Screenshot / Receipt Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://... or /api/image?name=receipt"
                  value={completeForm.proofImageUrl}
                  onChange={(e) =>
                    setCompleteForm((prev) => ({ ...prev, proofImageUrl: e.target.value }))
                  }
                  className="input input-bordered w-full bg-base-100 text-base-content text-xs"
                />
                <span className="text-[11px] text-base-content/50 mt-1">
                  URL to payment confirmation receipt or screenshot.
                </span>

                {/* Proof Image Preview */}
                {completeForm.proofImageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-base-300 max-h-36 bg-black/5 flex items-center justify-center">
                    <img
                      src={completeForm.proofImageUrl}
                      alt="Proof Preview"
                      className="max-h-36 object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-base-content">
                  Admin Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Transferred via Merchant bKash"
                  value={completeForm.adminNotes}
                  onChange={(e) =>
                    setCompleteForm((prev) => ({ ...prev, adminNotes: e.target.value }))
                  }
                  className="input input-sm input-bordered w-full bg-base-100 text-base-content text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="modal-action border-t border-base-200 pt-4">
                <button
                  type="button"
                  onClick={() => setProcessModalWithdrawal(null)}
                  className="btn btn-sm btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-sm btn-success text-white font-bold px-6 gap-2"
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <CheckCircle2 size={16} />
                  )}
                  Confirm Payout Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: REJECT PAYOUT MODAL ──────────────────────────── */}
      {rejectModalWithdrawal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-base-100 text-base-content p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div className="flex items-center gap-2 text-error">
                <AlertTriangle size={20} />
                <h3 className="text-lg font-bold">Reject Payout Request</h3>
              </div>
              <button
                onClick={() => setRejectModalWithdrawal(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-base-content/70">
              Rejecting this request will restore the requested amount (
              <strong>৳{Number(rejectModalWithdrawal.amount).toFixed(2)}</strong>) back to the reseller&apos;s available withdrawable balance.
            </p>

            <form onSubmit={handleSubmitReject} className="space-y-4">
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-base-content">
                  Rejection Reason (Visible to Reseller) *
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Account number is invalid or not registered on bKash. Please submit again with correct phone number."
                  value={rejectForm.adminNotes}
                  onChange={(e) =>
                    setRejectForm({ adminNotes: e.target.value })
                  }
                  className="textarea textarea-bordered w-full bg-base-100 text-base-content text-sm"
                  required
                />
              </div>

              <div className="modal-action border-t border-base-200 pt-3">
                <button
                  type="button"
                  onClick={() => setRejectModalWithdrawal(null)}
                  className="btn btn-sm btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-sm btn-error text-white font-bold px-6"
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Confirm Rejection"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: VIEW PROOF DOCUMENT MODAL ─────────────────────── */}
      {proofModalWithdrawal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg bg-base-100 text-base-content p-6 rounded-2xl shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Payout Verification Document</h3>
                  <p className="text-xs text-base-content/60">
                    Disbursement audit confirmation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProofModalWithdrawal(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {/* Summary Card */}
              <div className="bg-base-200/50 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-base-content/50 block">Amount Disbursed</span>
                  <strong className="text-2xl font-black text-emerald-600">
                    ৳{Number(proofModalWithdrawal.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-xs text-base-content/50 block">Channel</span>
                  <span className="badge badge-outline font-bold text-xs">
                    {proofModalWithdrawal.payoutMethod}
                  </span>
                </div>
              </div>

              {/* Transaction ID */}
              {proofModalWithdrawal.transactionId && (
                <div className="p-3 bg-base-200/30 rounded-xl border border-base-200">
                  <span className="text-xs text-base-content/60 font-semibold block mb-1">
                    Transaction ID / Reference (TrxID)
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-primary">
                      {proofModalWithdrawal.transactionId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(proofModalWithdrawal.transactionId || "")}
                      className="btn btn-xs btn-ghost gap-1"
                    >
                      <Copy size={13} /> Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Proof Image / Document */}
              {proofModalWithdrawal.proofImageUrl ? (
                <div className="space-y-2">
                  <span className="text-xs text-base-content/60 font-semibold block">
                    Proof Screenshot / Document:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-base-300 max-h-72 bg-black/5 flex items-center justify-center">
                    <img
                      src={proofModalWithdrawal.proofImageUrl}
                      alt="Disbursement Proof"
                      className="max-h-72 w-full object-contain"
                    />
                  </div>
                  <a
                    href={proofModalWithdrawal.proofImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink size={13} /> Open full size proof document
                  </a>
                </div>
              ) : (
                <div className="text-xs text-base-content/50 italic p-3 bg-base-200/20 rounded-xl">
                  No image proof was attached for this payout.
                </div>
              )}

              {/* Admin Remarks */}
              {proofModalWithdrawal.adminNotes && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs">
                  <strong className="text-indigo-900 block font-semibold mb-0.5">
                    Admin Remarks:
                  </strong>
                  <p className="text-indigo-800">{proofModalWithdrawal.adminNotes}</p>
                </div>
              )}

              {/* Audit Meta */}
              <div className="text-[11px] text-base-content/50 border-t border-base-200 pt-2 flex justify-between">
                <span>
                  Processed on:{" "}
                  {proofModalWithdrawal.processedAt
                    ? new Date(proofModalWithdrawal.processedAt).toLocaleString()
                    : "—"}
                </span>
                <span>
                  Processed by: {proofModalWithdrawal.processedByUser?.name || "Admin"}
                </span>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setProofModalWithdrawal(null)}
                className="btn btn-sm btn-primary w-full"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
