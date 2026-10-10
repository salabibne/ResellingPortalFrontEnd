"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  FileText,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  PlusCircle,
  DollarSign,
  ShieldCheck,
  Building2,
  Smartphone,
  Banknote,
} from "lucide-react";
import {
  withdrawalApi,
  WithdrawalItem,
  ResellerWalletSummary,
  PayoutMethod,
  WithdrawalStatus,
} from "@/services/withdrawal.api";

export default function ResellerPayoutsPage() {
  const [summary, setSummary] = useState<ResellerWalletSummary | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Modal States
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedProofWithdrawal, setSelectedProofWithdrawal] = useState<WithdrawalItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  // Form State
  const [formData, setFormData] = useState<{
    amount: string;
    payoutMethod: PayoutMethod;
    accountDetails: string;
    resellerNotes: string;
  }>({
    amount: "",
    payoutMethod: "BKASH",
    accountDetails: "",
    resellerNotes: "",
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await withdrawalApi.getMyWithdrawals({
        page,
        limit: 10,
        status: (statusFilter as WithdrawalStatus) || undefined,
      });
      setWithdrawals(res.data);
      setSummary(res.summary);
      setTotalPages(res.meta.totalPages || 1);
    } catch (err) {
      console.error("Failed to load withdrawals:", err);
      showToast("Failed to load withdrawal history", "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenRequestModal = () => {
    setFormData({
      amount: "",
      payoutMethod: "BKASH",
      accountDetails: "",
      resellerNotes: "",
    });
    setIsRequestModalOpen(true);
  };

  const handleQuickAmount = (percentage: number) => {
    if (!summary?.withdrawableBalance) return;
    const val = Math.floor((summary.withdrawableBalance * percentage) / 100);
    setFormData((prev) => ({ ...prev, amount: val.toString() }));
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = Number(formData.amount);

    if (isNaN(numAmount) || numAmount < 100) {
      showToast("Minimum withdrawal amount is ৳100.00", "error");
      return;
    }

    if (summary && numAmount > summary.withdrawableBalance) {
      showToast(
        `Requested amount (৳${numAmount}) exceeds available balance (৳${summary.withdrawableBalance})`,
        "error",
      );
      return;
    }

    if (!formData.accountDetails.trim()) {
      showToast("Please provide recipient account / phone details", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await withdrawalApi.createRequest({
        amount: numAmount,
        payoutMethod: formData.payoutMethod,
        accountDetails: formData.accountDetails.trim(),
        resellerNotes: formData.resellerNotes.trim() || undefined,
      });

      showToast("Withdrawal request submitted successfully! Admin will review shortly.", "success");
      setIsRequestModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Failed to submit request:", err);
      showToast(err.response?.data?.message || "Failed to submit withdrawal request.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this pending withdrawal request?")) return;
    try {
      await withdrawalApi.cancelWithdrawal(id);
      showToast("Withdrawal request cancelled successfully.", "success");
      await loadData();
    } catch (err: any) {
      console.error("Failed to cancel withdrawal:", err);
      showToast(err.response?.data?.message || "Failed to cancel request.", "error");
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
        return <Building2 size={16} className="text-blue-600" />;
      case "CASH":
        return <Banknote size={16} className="text-emerald-600" />;
      default:
        return <Smartphone size={16} className="text-pink-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
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
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-wider uppercase mb-1">
            <Wallet size={16} /> Reseller Profit Payouts
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Withdrawals & Wallet</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Request withdrawals for earned profits from completed orders, manage payout accounts, and review official transaction proof documents.
          </p>
        </div>

        <button
          onClick={handleOpenRequestModal}
          disabled={!summary || summary.withdrawableBalance < 100}
          className="btn btn-primary bg-emerald-500 hover:bg-emerald-600 border-none text-white font-bold gap-2 px-6 shadow-lg shadow-emerald-500/20"
        >
          <PlusCircle size={20} /> Request Payout
        </button>
      </div>

      {/* ─── WALLET BALANCE KPI METRIC CARDS ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Withdrawable Balance */}
        <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Available to Withdraw
              </p>
              <h3 className="text-3xl font-black text-emerald-700 mt-1">
                ৳{(summary?.withdrawableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-700/80 mt-1">
                Net profit available right now
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        {/* Total Lifetime Earned Profit */}
        <div className="card bg-white border border-base-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Earned Profit
              </p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                ৳{(summary?.totalEarnedProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                From delivered & paid orders
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="card bg-white border border-base-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Pending Withdrawals
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                ৳{(summary?.pendingWithdrawal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Under administrator verification
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Total Paid Out */}
        <div className="card bg-white border border-base-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Withdrawn
              </p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                ৳{(summary?.totalWithdrawn || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                Successfully disbursed to you
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold border border-base-200">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── WITHDRAWAL HISTORY SECTION ───────────────────────────── */}
      <div className="card bg-base-100 border border-base-200 shadow-sm overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-4 border-b border-base-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-base text-base-content">Payout History</h2>
            <span className="badge badge-sm badge-neutral font-mono">{withdrawals.length} records</span>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="select select-sm select-bordered bg-base-100 text-base-content font-medium"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending Review</option>
              <option value="COMPLETED">Completed</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              onClick={loadData}
              className="btn btn-sm btn-ghost btn-square"
              title="Refresh"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-12 text-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-xs text-base-content/60 mt-2 font-medium">Loading withdrawal history...</p>
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-base-200 flex items-center justify-center text-base-content/40">
              <Wallet size={28} />
            </div>
            <h3 className="font-bold text-base text-base-content">No withdrawal requests found</h3>
            <p className="text-xs text-base-content/60 max-w-sm mx-auto">
              You have not submitted any withdrawal requests yet. When you earn profit from delivered orders, you can withdraw funds here.
            </p>
            {summary && summary.withdrawableBalance >= 100 && (
              <button
                onClick={handleOpenRequestModal}
                className="btn btn-sm btn-primary mt-2 gap-2"
              >
                <PlusCircle size={16} /> Request First Payout
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full text-sm">
              <thead className="bg-base-200/50 text-base-content font-bold text-xs uppercase">
                <tr>
                  <th>Date & Request ID</th>
                  <th>Amount</th>
                  <th>Payout Method</th>
                  <th>Account Details</th>
                  <th>Status</th>
                  <th>Proof & Details</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-base-200/30 transition-colors">
                    <td>
                      <div className="font-mono text-xs font-semibold text-base-content">
                        {new Date(w.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-base-content/50 font-mono">
                        {new Date(w.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • #{w.id.substring(0, 8)}
                      </div>
                    </td>

                    <td>
                      <div className="font-extrabold text-base text-base-content">
                        ৳{Number(w.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </td>

                    <td>
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        {getMethodIcon(w.payoutMethod)}
                        <span>{w.payoutMethod.replace("_", " ")}</span>
                      </div>
                    </td>

                    <td className="max-w-xs">
                      <p className="text-xs font-medium text-base-content break-words">
                        {w.accountDetails}
                      </p>
                      {w.resellerNotes && (
                        <p className="text-[10px] text-base-content/60 italic mt-0.5">
                          Note: &ldquo;{w.resellerNotes}&rdquo;
                        </p>
                      )}
                    </td>

                    <td>{renderStatusBadge(w.status)}</td>

                    <td>
                      {w.status === "COMPLETED" ? (
                        <button
                          onClick={() => setSelectedProofWithdrawal(w)}
                          className="btn btn-xs btn-outline btn-success gap-1 font-semibold"
                        >
                          <FileText size={12} /> View Proof
                        </button>
                      ) : w.status === "REJECTED" ? (
                        <div className="text-xs text-error font-medium">
                          {w.adminNotes || "Rejected by Admin"}
                        </div>
                      ) : (
                        <span className="text-xs text-base-content/40 italic">Awaiting Processing</span>
                      )}
                    </td>

                    <td className="text-right">
                      {w.status === "PENDING" ? (
                        <button
                          onClick={() => handleCancelRequest(w.id)}
                          className="btn btn-xs btn-ghost text-error hover:bg-error/10"
                        >
                          Cancel
                        </button>
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

      {/* ─── MODAL 1: REQUEST PAYOUT MODAL ─────────────────────────── */}
      {isRequestModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-lg bg-base-100 text-base-content p-4 sm:p-6 rounded-2xl shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div>
                <h3 className="text-lg font-bold">Request Profit Payout</h3>
                <p className="text-xs text-base-content/60">
                  Withdraw earned profit to your payment account.
                </p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            {/* Current Balance Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800 block">
                  Available Withdrawable Balance
                </span>
                <strong className="text-2xl font-black text-emerald-700">
                  ৳{(summary?.withdrawableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <span className="badge badge-success text-white text-xs font-bold">Live Wallet</span>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-4">
              {/* Amount Input */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-base-content">
                  Withdrawal Amount (৳) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-3 flex items-center text-base-content/50 font-bold">
                    ৳
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="100"
                    max={summary?.withdrawableBalance || 0}
                    placeholder="e.g. 500.00"
                    value={formData.amount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                    className="input input-bordered w-full pl-8 bg-base-100 text-base-content font-bold text-lg"
                    required
                  />
                </div>

                {/* Quick percentage buttons */}
                <div className="flex gap-2 mt-2">
                  {[25, 50, 75, 100].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleQuickAmount(pct)}
                      className="btn btn-xs btn-outline flex-1 text-[11px] font-semibold"
                    >
                      {pct === 100 ? "Max" : `${pct}%`}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-base-content/60 mt-1">
                  Minimum withdrawal threshold: ৳100.00
                </span>
              </div>

              {/* Payout Method */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-base-content">
                  Payout Method *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(["BKASH", "NAGAD", "ROCKET", "BANK_TRANSFER", "CASH"] as PayoutMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, payoutMethod: m }))}
                      className={`btn btn-sm text-xs font-bold rounded-xl flex flex-col h-auto py-2.5 ${
                        formData.payoutMethod === m
                          ? "btn-primary text-white shadow"
                          : "btn-outline border-base-300"
                      }`}
                    >
                      {getMethodIcon(m)}
                      <span className="text-[10px] mt-1">{m.replace("_", " ")}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Account Details */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-base-content">
                  Recipient Account Details *
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    formData.payoutMethod === "BANK_TRANSFER"
                      ? "Account Name, Bank Name, Branch Name, Account Number, Routing Number"
                      : formData.payoutMethod === "CASH"
                      ? "Receiver Name, Mobile Number, Collection Location / Store Note"
                      : `${formData.payoutMethod} Personal / Agent Mobile Number (e.g. 017xxxxxxxx)`
                  }
                  value={formData.accountDetails}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, accountDetails: e.target.value }))
                  }
                  className="textarea textarea-bordered w-full bg-base-100 text-base-content text-sm"
                  required
                />
              </div>

              {/* Reseller Note (Optional) */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-base-content">
                  Optional Note / Reference
                </label>
                <input
                  type="text"
                  placeholder="e.g. Please disburse to my primary bKash number"
                  value={formData.resellerNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, resellerNotes: e.target.value }))
                  }
                  className="input input-sm input-bordered w-full bg-base-100 text-base-content text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="modal-action border-t border-base-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="btn btn-sm btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-sm btn-primary px-6 gap-2"
                >
                  {isSubmitting ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <PlusCircle size={16} />
                  )}
                  Submit Payout Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: VIEW PROOF & TRANSACTION DETAILS MODAL ──────── */}
      {selectedProofWithdrawal && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-lg bg-base-100 text-base-content p-4 sm:p-6 rounded-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold">Transaction Proof Document</h3>
                  <p className="text-xs text-base-content/60">
                    Disbursement confirmation details
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProofWithdrawal(null)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {/* Amount & Method Summary */}
              <div className="bg-base-200/50 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-base-content/50 block">Amount Paid Out</span>
                  <strong className="text-2xl font-black text-emerald-600">
                    ৳{Number(selectedProofWithdrawal.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-xs text-base-content/50 block">Method</span>
                  <span className="badge badge-outline font-bold text-xs">
                    {selectedProofWithdrawal.payoutMethod}
                  </span>
                </div>
              </div>

              {/* Transaction ID */}
              {selectedProofWithdrawal.transactionId && (
                <div className="p-3 bg-base-200/30 rounded-xl border border-base-200">
                  <span className="text-xs text-base-content/60 font-semibold block mb-1">
                    Transaction ID / Reference (TrxID)
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-primary">
                      {selectedProofWithdrawal.transactionId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedProofWithdrawal.transactionId || "")}
                      className="btn btn-xs btn-ghost gap-1"
                    >
                      <Copy size={13} /> Copy
                    </button>
                  </div>
                </div>
              )}

              {/* Proof Image / Document */}
              {selectedProofWithdrawal.proofImageUrl ? (
                <div className="space-y-2">
                  <span className="text-xs text-base-content/60 font-semibold block">
                    Proof Screenshot / Receipt Document:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-base-300 max-h-72 bg-black/5 flex items-center justify-center">
                    <img
                      src={selectedProofWithdrawal.proofImageUrl}
                      alt="Disbursement Proof"
                      className="max-h-72 w-full object-contain"
                    />
                  </div>
                  <a
                    href={selectedProofWithdrawal.proofImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink size={13} /> Open full size proof document
                  </a>
                </div>
              ) : (
                <div className="text-xs text-base-content/50 italic p-3 bg-base-200/20 rounded-xl">
                  No proof document image was attached by administrator for this transaction.
                </div>
              )}

              {/* Admin Remarks */}
              {selectedProofWithdrawal.adminNotes && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs">
                  <strong className="text-indigo-900 block font-semibold mb-0.5">
                    Admin Remarks:
                  </strong>
                  <p className="text-indigo-800">{selectedProofWithdrawal.adminNotes}</p>
                </div>
              )}

              {/* Audit Meta */}
              <div className="text-[11px] text-base-content/50 border-t border-base-200 pt-2 flex justify-between">
                <span>
                  Processed on:{" "}
                  {selectedProofWithdrawal.processedAt
                    ? new Date(selectedProofWithdrawal.processedAt).toLocaleString()
                    : "—"}
                </span>
                <span>
                  Processed by: {selectedProofWithdrawal.processedByUser?.name || "Admin"}
                </span>
              </div>
            </div>

            <div className="modal-action">
              <button
                onClick={() => setSelectedProofWithdrawal(null)}
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
