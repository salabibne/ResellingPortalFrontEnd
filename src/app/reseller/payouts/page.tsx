"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  Clock,
  TrendingUp,
  FileText,
  Copy,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  PlusCircle,
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
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelTabs from "@/components/panel/PanelTabs";
import PanelTable from "@/components/panel/PanelTable";
import PanelEmpty from "@/components/panel/PanelEmpty";
import PanelSkeleton from "@/components/panel/PanelSkeleton";
import PanelModal from "@/components/panel/PanelModal";
import StatusBadge from "@/components/panel/StatusBadge";
import {
  usePendingReseller,
  ACCOUNT_PENDING_MESSAGE,
  isAccountPendingError,
} from "@/store/useResellerProfileStore";

/** Display-only Bangla labels; raw enum values are still used in logic / API calls. */
const STATUS_LABELS: Record<string, string> = {
  PENDING: "পেন্ডিং",
  COMPLETED: "সম্পন্ন",
  REJECTED: "প্রত্যাখ্যাত",
  CANCELLED: "বাতিল",
};

const METHOD_LABELS: Record<string, string> = {
  BKASH: "বিকাশ",
  NAGAD: "নগদ",
  ROCKET: "রকেট",
  BANK_TRANSFER: "ব্যাংক ট্রান্সফার",
  CASH: "ক্যাশ",
};

const methodLabel = (m: string) => METHOD_LABELS[m] || m.replace("_", " ");

export default function ResellerPayoutsPage() {
  const pending = usePendingReseller();
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
      showToast("উইথড্র ইতিহাস লোড করা যায়নি", "error");
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenRequestModal = () => {
    if (pending) {
      showToast(ACCOUNT_PENDING_MESSAGE, "error");
      return;
    }
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
    if (pending) {
      showToast(ACCOUNT_PENDING_MESSAGE, "error");
      return;
    }
    const numAmount = Number(formData.amount);

    if (isNaN(numAmount) || numAmount < 100) {
      showToast("সর্বনিম্ন উইথড্র পরিমাণ ৳100.00", "error");
      return;
    }

    if (summary && numAmount > summary.withdrawableBalance) {
      showToast(
        `অনুরোধকৃত পরিমাণ (৳${numAmount}) আপনার উত্তোলনযোগ্য ব্যালেন্সের (৳${summary.withdrawableBalance}) চেয়ে বেশি`,
        "error",
      );
      return;
    }

    if (!formData.accountDetails.trim()) {
      showToast("প্রাপকের অ্যাকাউন্ট / মোবাইল নম্বর দিন", "error");
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

      showToast("উইথড্র অনুরোধ সফলভাবে জমা হয়েছে! অ্যাডমিন শীঘ্রই যাচাই করবেন।", "success");
      setIsRequestModalOpen(false);
      await loadData();
    } catch (err: any) {
      console.error("Failed to submit request:", err);
      if (isAccountPendingError(err)) {
        showToast(ACCOUNT_PENDING_MESSAGE, "error");
      } else {
        showToast(err.response?.data?.message || "উইথড্র অনুরোধ জমা দেওয়া যায়নি।", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!confirm("আপনি কি নিশ্চিতভাবে এই পেন্ডিং উইথড্র অনুরোধটি বাতিল করতে চান?")) return;
    try {
      await withdrawalApi.cancelWithdrawal(id);
      showToast("উইথড্র অনুরোধ সফলভাবে বাতিল হয়েছে।", "success");
      await loadData();
    } catch (err: any) {
      console.error("Failed to cancel withdrawal:", err);
      if (isAccountPendingError(err)) {
        showToast(ACCOUNT_PENDING_MESSAGE, "error");
      } else {
        showToast(err.response?.data?.message || "অনুরোধ বাতিল করা যায়নি।", "error");
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("কপি করা হয়েছে!", "success");
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
    <PanelPage>
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

      <PanelPageHeader
        title="উইথড্র ও ওয়ালেট"
        subtitle="সম্পন্ন অর্ডারের প্রফিট উইথড্রর অনুরোধ করুন, পেমেন্ট অ্যাকাউন্ট ম্যানেজ করুন এবং লেনদেনের প্রমাণপত্র দেখুন।"
        icon={Wallet}
        actions={
          <button
            type="button"
            onClick={handleOpenRequestModal}
            disabled={pending || !summary || summary.withdrawableBalance < 100}
            className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
          >
            <PlusCircle size={16} /> উইথড্র অনুরোধ
          </button>
        }
      />

      {pending && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800">
          <Clock size={14} className="mt-0.5 shrink-0" />
          <span>{ACCOUNT_PENDING_MESSAGE}</span>
        </div>
      )}

      {/* ─── WALLET BALANCE KPI METRIC CARDS ───────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Available Withdrawable Balance */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                উত্তোলনযোগ্য ব্যালেন্স
              </p>
              <h3 className="text-3xl font-black text-emerald-700 mt-1">
                ৳{(summary?.withdrawableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-700/80 mt-1">
                এই মুহূর্তে উত্তোলনযোগ্য নিট প্রফিট
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30">
              <Wallet size={24} />
            </div>
          </div>
        </div>

        {/* Total Lifetime Earned Profit */}
        <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                মোট অর্জিত প্রফিট
              </p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                ৳{(summary?.totalEarnedProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                ডেলিভারড ও পেইড অর্ডার থেকে
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold border border-indigo-100">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Pending Withdrawals */}
        <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                পেন্ডিং উইথড্র
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                ৳{(summary?.pendingWithdrawal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                অ্যাডমিনের যাচাইয়ের অপেক্ষায়
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Total Paid Out */}
        <div className="bg-base-100 rounded-2xl border border-base-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                মোট উত্তোলন
              </p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">
                ৳{(summary?.totalWithdrawn || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                সফলভাবে আপনাকে পরিশোধ করা হয়েছে
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold border border-base-200">
              <ShieldCheck size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── WITHDRAWAL HISTORY SECTION ───────────────────────────── */}
      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
        {/* Table Filter Header */}
        <div className="p-4 border-b border-base-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-base-content">উইথড্র ইতিহাস</h2>
              <span className="badge badge-sm badge-neutral font-mono">{withdrawals.length}টি রেকর্ড</span>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="btn btn-ghost btn-sm btn-square rounded-xl"
              aria-label="উইথড্র তালিকা রিফ্রেশ করুন"
              title="রিফ্রেশ"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <PanelTabs
            ariaLabel="স্ট্যাটাস অনুযায়ী উইথড্র ফিল্টার করুন"
            value={statusFilter}
            onChange={(id) => {
              setStatusFilter(id);
              setPage(1);
            }}
            tabs={[
              { id: "", label: "সব" },
              { id: "PENDING", label: STATUS_LABELS.PENDING },
              { id: "COMPLETED", label: STATUS_LABELS.COMPLETED },
              { id: "REJECTED", label: STATUS_LABELS.REJECTED },
              { id: "CANCELLED", label: STATUS_LABELS.CANCELLED },
            ]}
          />
        </div>

        {/* Table Content */}
        {loading ? (
          <div className="p-4">
            <PanelSkeleton variant="table" rows={6} />
          </div>
        ) : withdrawals.length === 0 ? (
          <PanelEmpty
            icon={Wallet}
            title="কোনো উইথড্র অনুরোধ পাওয়া যায়নি"
            text="আপনি এখনো কোনো উইথড্র অনুরোধ করেননি। ডেলিভারড অর্ডার থেকে প্রফিট আসলে এখান থেকে টাকা উইথড্র করতে পারবেন।"
            action={
              !pending && summary && summary.withdrawableBalance >= 100 ? (
                <button
                  type="button"
                  onClick={handleOpenRequestModal}
                  className="btn btn-primary btn-sm rounded-xl gap-2"
                >
                  <PlusCircle size={16} /> প্রথম উইথড্র অনুরোধ করুন
                </button>
              ) : undefined
            }
          />
        ) : (
          <PanelTable>
            <thead>
              <tr>
                <th>তারিখ ও অনুরোধ আইডি</th>
                <th>পরিমাণ</th>
                <th>পেমেন্ট মাধ্যম</th>
                <th>অ্যাকাউন্টের তথ্য</th>
                <th>স্ট্যাটাস</th>
                <th>প্রমাণ ও বিস্তারিত</th>
                <th className="text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody>
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
                        <span>{methodLabel(w.payoutMethod)}</span>
                      </div>
                    </td>

                    <td className="max-w-xs">
                      <p className="text-xs font-medium text-base-content break-words">
                        {w.accountDetails}
                      </p>
                      {w.resellerNotes && (
                        <p className="text-[10px] text-base-content/60 italic mt-0.5">
                          নোট: &ldquo;{w.resellerNotes}&rdquo;
                        </p>
                      )}
                    </td>

                    <td><StatusBadge status={w.status} label={STATUS_LABELS[w.status]} /></td>

                    <td>
                      {w.status === "COMPLETED" ? (
                        <button
                          onClick={() => setSelectedProofWithdrawal(w)}
                          className="btn btn-xs btn-outline btn-success gap-1 font-semibold"
                        >
                          <FileText size={12} /> প্রমাণ দেখুন
                        </button>
                      ) : w.status === "REJECTED" ? (
                        <div className="text-xs text-error font-medium">
                          {w.adminNotes || "অ্যাডমিন প্রত্যাখ্যান করেছেন"}
                        </div>
                      ) : (
                        <span className="text-xs text-base-content/40 italic">প্রসেসিংয়ের অপেক্ষায়</span>
                      )}
                    </td>

                    <td className="text-right">
                      {w.status === "PENDING" ? (
                        <button
                          onClick={() => handleCancelRequest(w.id)}
                          className="btn btn-xs btn-ghost text-error hover:bg-error/10"
                        >
                          বাতিল করুন
                        </button>
                      ) : (
                        <span className="text-xs text-base-content/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
          </PanelTable>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-base-200 flex items-center justify-between">
            <span className="text-xs text-base-content/60">
              পৃষ্ঠা {page} / {totalPages}
            </span>
            <div className="join">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="join-item btn btn-xs btn-outline"
              >
                <ChevronLeft size={14} /> আগের
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="join-item btn btn-xs btn-outline"
              >
                পরের <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── MODAL 1: REQUEST PAYOUT MODAL ─────────────────────────── */}
      {isRequestModalOpen && (
        <PanelModal
          open={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          title="প্রফিট উইথড্র অনুরোধ"
          size="md"
          footer={
            <>
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(false)}
                className="btn btn-ghost btn-sm rounded-xl"
              >
                বাতিল
              </button>
              <button
                type="submit"
                form="payout-request-form"
                disabled={isSubmitting || pending}
                className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <PlusCircle size={16} />
                )}
                উইথড্র অনুরোধ জমা দিন
              </button>
            </>
          }
        >
          <div className="space-y-4">
            {pending && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800">
                <Clock size={14} className="mt-0.5 shrink-0" />
                <span>{ACCOUNT_PENDING_MESSAGE}</span>
              </div>
            )}

            {/* Current Balance Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800 block">
                  উত্তোলনযোগ্য ব্যালেন্স
                </span>
                <strong className="text-2xl font-black text-emerald-700">
                  ৳{(summary?.withdrawableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <span className="badge badge-success text-white text-xs font-bold">লাইভ ওয়ালেট</span>
            </div>

            <form id="payout-request-form" onSubmit={handleSubmitRequest} className="space-y-4">
              <fieldset disabled={pending} className="space-y-4">
              {/* Amount Input */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-base-content">
                  উইথড্র পরিমাণ (৳) *
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
                    placeholder="যেমন: 500.00"
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
                      {pct === 100 ? "সর্বোচ্চ" : `${pct}%`}
                    </button>
                  ))}
                </div>
                <span className="text-[11px] text-base-content/60 mt-1">
                  সর্বনিম্ন উইথড্র: ৳100.00
                </span>
              </div>

              {/* Payout Method */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-base-content">
                  পেমেন্ট মাধ্যম *
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
                      <span className="text-[10px] mt-1">{methodLabel(m)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Account Details */}
              <div className="form-control">
                <label className="label font-bold text-xs uppercase tracking-wider text-base-content">
                  প্রাপকের অ্যাকাউন্টের তথ্য *
                </label>
                <textarea
                  rows={2}
                  placeholder={
                    formData.payoutMethod === "BANK_TRANSFER"
                      ? "অ্যাকাউন্টের নাম, ব্যাংকের নাম, শাখার নাম, অ্যাকাউন্ট নম্বর, রাউটিং নম্বর"
                      : formData.payoutMethod === "CASH"
                      ? "প্রাপকের নাম, মোবাইল নম্বর, সংগ্রহের স্থান / স্টোর নোট"
                      : `${methodLabel(formData.payoutMethod)} পার্সোনাল / এজেন্ট মোবাইল নম্বর (যেমন: 017xxxxxxxx)`
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
                  নোট / রেফারেন্স (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: আমার প্রধান বিকাশ নম্বরে পাঠান"
                  value={formData.resellerNotes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, resellerNotes: e.target.value }))
                  }
                  className="input input-sm input-bordered w-full bg-base-100 text-base-content text-xs"
                />
              </div>
              </fieldset>
            </form>
          </div>
        </PanelModal>
      )}

      {/* ─── MODAL 2: VIEW PROOF & TRANSACTION DETAILS MODAL ──────── */}
      {selectedProofWithdrawal && (
        <PanelModal
          open={!!selectedProofWithdrawal}
          onClose={() => setSelectedProofWithdrawal(null)}
          title="লেনদেনের প্রমাণপত্র"
          size="md"
          footer={
            <button
              type="button"
              onClick={() => setSelectedProofWithdrawal(null)}
              className="btn btn-primary btn-sm rounded-xl"
            >
              বন্ধ করুন
            </button>
          }
        >
          <div className="space-y-3 text-sm">
              {/* Amount & Method Summary */}
              <div className="bg-base-200/50 p-3.5 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs text-base-content/50 block">পরিশোধিত পরিমাণ</span>
                  <strong className="text-2xl font-black text-emerald-600">
                    ৳{Number(selectedProofWithdrawal.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-xs text-base-content/50 block">মাধ্যম</span>
                  <span className="badge badge-outline font-bold text-xs">
                    {methodLabel(selectedProofWithdrawal.payoutMethod)}
                  </span>
                </div>
              </div>

              {/* Transaction ID */}
              {selectedProofWithdrawal.transactionId && (
                <div className="p-3 bg-base-200/30 rounded-xl border border-base-200">
                  <span className="text-xs text-base-content/60 font-semibold block mb-1">
                    ট্রানজেকশন আইডি / রেফারেন্স (TrxID)
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-base text-primary">
                      {selectedProofWithdrawal.transactionId}
                    </span>
                    <button
                      onClick={() => copyToClipboard(selectedProofWithdrawal.transactionId || "")}
                      className="btn btn-xs btn-ghost gap-1"
                    >
                      <Copy size={13} /> কপি
                    </button>
                  </div>
                </div>
              )}

              {/* Proof Image / Document */}
              {selectedProofWithdrawal.proofImageUrl ? (
                <div className="space-y-2">
                  <span className="text-xs text-base-content/60 font-semibold block">
                    প্রমাণের স্ক্রিনশট / রসিদ:
                  </span>
                  <div className="rounded-xl overflow-hidden border border-base-300 max-h-72 bg-black/5 flex items-center justify-center">
                    <img
                      src={selectedProofWithdrawal.proofImageUrl}
                      alt="পেমেন্টের প্রমাণ"
                      className="max-h-72 w-full object-contain"
                    />
                  </div>
                  <a
                    href={selectedProofWithdrawal.proofImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-bold inline-flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink size={13} /> পূর্ণ আকারে প্রমাণপত্র দেখুন
                  </a>
                </div>
              ) : (
                <div className="text-xs text-base-content/50 italic p-3 bg-base-200/20 rounded-xl">
                  এই লেনদেনের জন্য অ্যাডমিন কোনো প্রমাণের ছবি সংযুক্ত করেননি।
                </div>
              )}

              {/* Admin Remarks */}
              {selectedProofWithdrawal.adminNotes && (
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs">
                  <strong className="text-indigo-900 block font-semibold mb-0.5">
                    অ্যাডমিনের মন্তব্য:
                  </strong>
                  <p className="text-indigo-800">{selectedProofWithdrawal.adminNotes}</p>
                </div>
              )}

              {/* Audit Meta */}
              <div className="text-[11px] text-base-content/50 border-t border-base-200 pt-2 flex justify-between">
                <span>
                  প্রসেসের তারিখ:{" "}
                  {selectedProofWithdrawal.processedAt
                    ? new Date(selectedProofWithdrawal.processedAt).toLocaleString()
                    : "—"}
                </span>
                <span>
                  প্রসেস করেছেন: {selectedProofWithdrawal.processedByUser?.name || "অ্যাডমিন"}
                </span>
              </div>
            </div>
        </PanelModal>
      )}
    </PanelPage>
  );
}
