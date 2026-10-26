"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { CourierPayment, orderApi } from "@/services/order.api";

function formatDate(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function formatAmount(value: number | string | null | undefined): string {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? amount.toLocaleString() : "-";
}

function getErrorMessage(err: any): string {
  if (!err?.response) {
    return "Cannot reach the backend API. Make sure the backend server is running on port 3000.";
  }
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || err?.message || "Something went wrong";
}

export default function InvoicesPanel() {
  const [payments, setPayments] = useState<CourierPayment[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ total?: number; totalPages?: number }>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await orderApi.getCourierPayments(page);
      setPayments(res.data || []);
      setMeta({
        total:
          res.meta?.total ??
          (Array.isArray(res.data) ? res.data.length : undefined),
        totalPages: res.meta?.last_page ?? res.meta?.totalPages,
      });
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  const togglePayment = async (payment: CourierPayment) => {
    const id = String(payment.id);
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }

    setExpandedId(id);
    setDetail(null);
    try {
      setLoadingDetail(true);
      const res = await orderApi.getCourierPayment(payment.id);
      setDetail(res?.data ?? res);
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
      setExpandedId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const consignments: any[] = Array.isArray(detail?.consignments)
    ? detail.consignments
    : Array.isArray(detail?.data?.consignments)
      ? detail.data.consignments
      : Array.isArray(detail?.data)
        ? detail.data
        : [];

  return (
    <div className="space-y-4">
      {errorMsg && (
        <div className="alert alert-error text-white text-xs font-bold shadow-sm flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="flex-1">{errorMsg}</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs text-white"
            onClick={() => setErrorMsg(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="bg-base-100 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-base-content flex items-center gap-2">
              <Receipt size={16} className="text-primary" /> Courier Invoices / Payments
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Steadfast payment batches. Expand a batch to see its consignments.
            </p>
          </div>
          <button
            onClick={loadPayments}
            disabled={loading}
            className="btn btn-xs btn-outline rounded-lg font-bold gap-1"
          >
            <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            Refresh Invoices
          </button>
        </div>

        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        ) : payments.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <Receipt size={40} className="mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-slate-700">No payments found</p>
            <p className="text-xs">
              Payment batches from Steadfast will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {payments.map((payment) => {
              const id = String(payment.id);
              const isOpen = expandedId === id;
              return (
                <div key={id}>
                  <button
                    type="button"
                    onClick={() => togglePayment(payment)}
                    className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-slate-50 text-left transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold text-indigo-600 text-xs">
                        #{payment.id}
                      </span>
                      <span className="font-black text-base-content text-sm">
                        ৳{formatAmount(payment.amount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[11px] text-slate-500">
                        {formatDate(payment.created_at)}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={15} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={15} className="text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 bg-slate-50/50">
                      {loadingDetail ? (
                        <div className="py-4 text-center">
                          <span className="loading loading-spinner loading-sm text-primary"></span>
                        </div>
                      ) : consignments.length === 0 ? (
                        <p className="text-[11px] text-slate-500 py-2">
                          No consignment breakdown returned for this payment.
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-base-100">
                          <table className="table table-xs w-full text-[11px]">
                            <thead className="bg-slate-100 text-slate-600 uppercase text-[10px]">
                              <tr>
                                <th>Consignment</th>
                                <th>Invoice</th>
                                <th>Tracking</th>
                                <th>Amount</th>
                                <th>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {consignments.map((item, idx) => (
                                <tr key={`${id}-${item.consignment_id || idx}`}>
                                  <td className="font-mono">
                                    {item.consignment_id
                                      ? `#${item.consignment_id}`
                                      : "-"}
                                  </td>
                                  <td>{item.invoice || "-"}</td>
                                  <td className="font-mono">
                                    {item.tracking_code || "-"}
                                  </td>
                                  <td>৳{formatAmount(item.amount)}</td>
                                  <td className="uppercase">
                                    {item.status || "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {(meta.totalPages || 1) > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-[11px] text-slate-500">
              Page {page}
              {meta.totalPages ? ` of ${meta.totalPages}` : ""}
              {meta.total !== undefined ? ` (${meta.total} payments)` : ""}
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-xs btn-outline rounded-lg"
              >
                <ChevronLeft size={12} />
              </button>
              <button
                disabled={!!meta.totalPages && page >= meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="btn btn-xs btn-outline rounded-lg"
              >
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
