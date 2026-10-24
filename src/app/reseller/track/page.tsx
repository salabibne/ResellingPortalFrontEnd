"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  RefreshCw,
  Truck,
} from "lucide-react";
import { Order, orderApi } from "@/services/order.api";
import TrackPanel from "@/components/courier/TrackPanel";

function getErrorMessage(err: any): string {
  if (!err?.response) {
    return "Cannot reach the backend API. Make sure the backend server is running on port 3000.";
  }
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || err?.message || "Something went wrong";
}

export default function ResellerTrackPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await orderApi.getOrders(
        1,
        100,
        undefined,
        undefined,
        undefined,
        true
      );
      setOrders(res.data || []);
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const bookedOrders = orders.filter(
    (order) => order.courierConsignmentId || order.courierTrackingCode
  );

  const options = bookedOrders.map((order) => ({
    id: order.id,
    identifier:
      order.courierConsignmentId ||
      order.courierTrackingCode ||
      order.orderRef ||
      order.id,
    label: `${order.orderRef || `#${order.id.substring(0, 8).toUpperCase()}`} — ${
      order.customerName || order.customer?.name || "Customer"
    } — #${order.courierConsignmentId || order.courierTrackingCode || "N/A"}`,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-6 rounded-2xl border border-base-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-base-content flex items-center gap-2">
            <Truck className="text-primary" /> Track a Parcel
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Select one of your booked consignments to see its current Steadfast
            status and journey.
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="btn btn-sm btn-outline rounded-xl font-bold gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

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

      {loading ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 p-16 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : options.length === 0 ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 p-12 text-center">
          <Truck size={48} className="mx-auto mb-3 text-base-content/30" />
          <h2 className="text-lg font-bold text-base-content">
            No booked consignments yet
          </h2>
          <p className="text-sm text-base-content/60 mt-1 mb-5">
            Once the admin places one of your orders with Steadfast, its
            consignment ID will appear here.
          </p>
          <Link href="/reseller/orders" className="btn btn-primary btn-sm rounded-xl">
            View My Orders
          </Link>
        </div>
      ) : (
        <TrackPanel
          presetOptions={options}
          presetLoading={loading}
          allowManual={false}
          title="Track Your Parcel"
          description="Choose one of your booked consignments. Tracking is read-only and only includes your own orders."
        />
      )}
    </div>
  );
}
