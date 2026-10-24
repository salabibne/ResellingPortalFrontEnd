"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  RotateCcw,
  Send,
  X,
} from "lucide-react";
import {
  CourierReturnRequest,
  Order,
  orderApi,
} from "@/services/order.api";

const STATUS_STYLES: Record<string, string> = {
  pending: "badge-warning text-slate-900",
  approved: "badge-info text-white",
  processing: "badge-info text-white",
  completed: "badge-success text-white",
  cancelled: "badge-error text-white",
};

function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
}

function getErrorMessage(err: any): string {
  if (!err?.response) {
    return "Cannot reach the backend API. Make sure the backend server is running on port 3000.";
  }
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || err?.message || "Something went wrong";
}

interface ReturnsPanelProps {
  onReturnCreated?: (order: Order) => void;
}

export default function ReturnsPanel({ onReturnCreated }: ReturnsPanelProps) {
  const [returns, setReturns] = useState<CourierReturnRequest[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<{ total?: number; totalPages?: number }>({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [eligibleOrders, setEligibleOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadReturns = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await orderApi.getCourierReturns(page);
      setReturns(res.data || []);
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
    loadReturns();
  }, [loadReturns]);

  const loadEligibleOrders = useCallback(async () => {
    try {
      setLoadingOrders(true);
      const res = await orderApi.getCourierShipments({
        page: 1,
        limit: 100,
        shipmentState: "BOOKED",
      });
      const eligible = (res.data || []).filter((order) => {
        const status = (order.courierReturnStatus || "").toLowerCase();
        return !status || status === "cancelled";
      });
      setEligibleOrders(eligible);
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  const handleOpenForm = () => {
    setShowForm(true);
    setSuccessMsg(null);
    loadEligibleOrders();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!selectedOrderId) {
      setErrorMsg("Select a booked shipment before submitting a return request.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await orderApi.createCourierReturn({
        orderId: selectedOrderId,
        ...(reason.trim() ? { reason: reason.trim() } : {}),
      });

      setSuccessMsg(
        `${res.message || "Return request created."}${
          res.order?.orderRef ? ` (${res.order.orderRef})` : ""
        }`
      );
      setSelectedOrderId("");
      setReason("");
      setShowForm(false);
      onReturnCreated?.(res.order);
      await loadReturns();
      await loadEligibleOrders();
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

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

      {successMsg && (
        <div className="alert alert-success text-white text-xs font-bold shadow-sm flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
          <button
            type="button"
            className="btn btn-ghost btn-xs ml-auto text-white"
            onClick={() => setSuccessMsg(null)}
          >
            ✕
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <RotateCcw size={18} className="text-primary" /> New Return Request
              </h2>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Select a booked shipment and send a return request to Steadfast.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-ghost btn-circle btn-sm text-slate-400"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Booked Shipment <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="select select-sm select-bordered w-full rounded-xl text-slate-900"
                required
              >
                <option value="">
                  {loadingOrders
                    ? "Loading booked shipments..."
                    : "Select a booked shipment..."}
                </option>
                {eligibleOrders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {(order.orderRef ||
                      `#${order.id.substring(0, 8).toUpperCase()}`) +
                      ` — ${order.customerName || order.customer?.name || "Customer"}` +
                      ` — #${order.courierConsignmentId || order.courierTrackingCode || "N/A"}`}
                  </option>
                ))}
              </select>
              {!loadingOrders && eligibleOrders.length === 0 && (
                <p className="text-[10px] text-amber-600 font-semibold mt-1">
                  No eligible booked shipments. Place an order with Steadfast
                  first.
                </p>
              )}
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Return Reason
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder="Why is this parcel being returned?"
                className="textarea textarea-bordered w-full rounded-xl text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              className="btn btn-ghost btn-sm font-bold rounded-xl"
              onClick={() => setShowForm(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || loadingOrders || !selectedOrderId}
              className="btn btn-primary btn-sm text-white font-bold rounded-xl gap-2"
            >
              {submitting ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Send size={14} />
              )}
              {submitting ? "Submitting..." : "Submit Return Request"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <RotateCcw size={16} className="text-primary" /> Steadfast Return Requests
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Return statuses are reconciled back onto the matching orders.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenForm}
              className="btn btn-xs btn-primary text-white rounded-lg font-bold gap-1"
            >
              <Plus size={12} /> New Return Request
            </button>
            <button
              onClick={loadReturns}
              disabled={loading}
              className="btn btn-xs btn-outline rounded-lg font-bold gap-1"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Refresh Returns
            </button>
          </div>
        </div>

        {loading ? (
          <div className="h-56 flex items-center justify-center">
            <span className="loading loading-spinner loading-md text-primary"></span>
          </div>
        ) : returns.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <RotateCcw size={40} className="mx-auto mb-2 opacity-60" />
            <p className="text-sm font-bold text-slate-700">No return requests</p>
            <p className="text-xs">
              Create a return from the Shipments tab to see it here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px]">
                <tr>
                  <th className="pl-4">Return ID</th>
                  <th>Consignment</th>
                  <th>Invoice</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="pr-4">Requested</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {returns.map((item, index) => {
                  const status = String(item.status || "unknown").toLowerCase();
                  return (
                    <tr key={`${item.id}-${index}`} className="align-top">
                      <td className="pl-4 font-mono font-bold text-indigo-600">
                        #{item.id}
                      </td>
                      <td className="font-mono">
                        {item.consignment_id ? `#${item.consignment_id}` : "-"}
                      </td>
                      <td>{item.invoice || "-"}</td>
                      <td className="max-w-[220px]">
                        <span title={item.reason || ""}>
                          {item.reason || "—"}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`badge font-bold text-[10px] uppercase py-1.5 px-2 ${
                            STATUS_STYLES[status] ||
                            "badge-neutral text-white"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="pr-4 whitespace-nowrap">
                        {formatDateTime(item.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {(meta.totalPages || 1) > 1 && (
          <div className="p-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-[11px] text-slate-500">
              Page {page}
              {meta.totalPages ? ` of ${meta.totalPages}` : ""}
              {meta.total !== undefined ? ` (${meta.total} returns)` : ""}
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
