"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  ExternalLink,
  Filter,
  Package,
  PackageCheck,
  Phone,
  Receipt,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import {
  CourierAuthStatus,
  orderApi,
  Order,
} from "@/services/order.api";
import CourierStatusBadge from "@/components/courier/CourierStatusBadge";
import PickupsPanel from "@/components/courier/PickupsPanel";
import ReturnsPanel from "@/components/courier/ReturnsPanel";
import InvoicesPanel from "@/components/courier/InvoicesPanel";
import TrackPanel from "@/components/courier/TrackPanel";

type CourierTab =
  | "shipments"
  | "track"
  | "pickups"
  | "returns"
  | "invoices";

const COURIER_TABS: Array<{
  id: CourierTab;
  label: string;
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
}> = [
  { id: "shipments", label: "Shipments", icon: Truck },
  { id: "track", label: "Track Parcel", icon: Search },
  { id: "pickups", label: "Pickups", icon: PackageCheck },
  { id: "returns", label: "Returns", icon: RotateCcw },
  { id: "invoices", label: "Invoices", icon: Receipt },
];

const BOOKING_STATE_STYLES: Record<string, string> = {
  BOOKED: "badge-success text-white",
  BOOKING: "badge-info text-white",
  FAILED: "badge-error text-white",
  UNCERTAIN: "badge-warning text-slate-900 border border-amber-400",
};

const BOOKING_STATE_LABELS: Record<string, string> = {
  BOOKED: "Booked",
  BOOKING: "Booking...",
  FAILED: "Failed",
  UNCERTAIN: "Needs Reconciliation",
};

function formatDateTime(value?: string | null): string {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isStale(value?: string | null): boolean {
  if (!value) return true;
  const synced = new Date(value).getTime();
  if (Number.isNaN(synced)) return true;
  return Date.now() - synced > 24 * 60 * 60 * 1000;
}

function getCodAmount(order: Order): number {
  if (order.courierCodAmount !== null && order.courierCodAmount !== undefined) {
    return Number(order.courierCodAmount);
  }
  if (order.paymentStatus === "PAID") return 0;

  let base = Number(order.total || 0);
  if (order.isResellerOrder && order.resellerSellPrice) {
    base = Number(order.resellerSellPrice) + Number(order.courierCharge || 0);
  }
  if (order.isAdvanceCourierPaid && order.advanceCourierAmount) {
    base -= Number(order.advanceCourierAmount);
  }
  return Math.max(0, Math.round(base));
}

function getTrackingUrl(order: Order): string | null {
  if (order.courierTrackingLink) return order.courierTrackingLink;
  if (order.courierTrackingCode) {
    return `https://steadfast.com.bd/t/${order.courierTrackingCode}`;
  }
  return null;
}

function getErrorMessage(err: any): string {
  if (!err?.response) {
    return "Cannot reach the backend API. Make sure the backend server is running on port 3000.";
  }
  const message = err?.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return message || err?.message || "Something went wrong";
}

export default function CourierShipmentsPage() {
  const [shipments, setShipments] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [search, setSearch] = useState<string>("");
  const [courierStatus, setCourierStatus] = useState<string>("ALL");
  const [shipmentState, setShipmentState] = useState<string>("");
  const [consignmentId, setConsignmentId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");

  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [refreshingAll, setRefreshingAll] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<CourierTab>("shipments");
  const [balance, setBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<CourierAuthStatus | null>(null);

  const [returnOrder, setReturnOrder] = useState<Order | null>(null);
  const [returnReason, setReturnReason] = useState<string>("");
  const [creatingReturn, setCreatingReturn] = useState<boolean>(false);

  const fetchBalance = useCallback(async () => {
    try {
      setLoadingBalance(true);
      setBalanceError(null);

      try {
        const auth = await orderApi.getCourierAuthStatus();
        setAuthStatus(auth);
      } catch (err: any) {
        setAuthStatus({
          preferredSource: null,
          envConfigured: false,
          databaseConfigured: false,
          balanceOk: false,
          balanceError: getErrorMessage(err),
        });
      }

      const res = await orderApi.getCourierBalance();
      if (res.status === 200) {
        setBalance(Number(res.current_balance));
      } else {
        setBalance(null);
        setBalanceError(res.error || "Unable to load Steadfast balance.");
      }
    } catch (err: any) {
      setBalance(null);
      setBalanceError(getErrorMessage(err));
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleCreateReturn = async () => {
    if (!returnOrder) return;
    try {
      setCreatingReturn(true);
      setSuccessMsg(null);
      setErrorMsg(null);
      const res = await orderApi.createCourierReturn({
        orderId: returnOrder.id,
        ...(returnReason.trim() ? { reason: returnReason.trim() } : {}),
      });
      replaceShipment(res.order);
      setSuccessMsg(
        `Return request created for ${
          returnOrder.orderRef || returnOrder.id
        }.`
      );
      setReturnOrder(null);
      setReturnReason("");
    } catch (err: any) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setCreatingReturn(false);
    }
  };

  const fetchShipments = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await orderApi.getCourierShipments({
        page,
        limit,
        search: search.trim() || undefined,
        courierStatus,
        shipmentState: shipmentState || undefined,
        consignmentId: consignmentId.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        customerPhone: customerPhone.trim() || undefined,
      });
      setShipments(res.data || []);
      setMeta({
        total: res.meta?.total || 0,
        totalPages: res.meta?.totalPages || 1,
      });
    } catch (err: any) {
      console.error("Failed to load courier shipments:", err);
      setErrorMsg(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    search,
    courierStatus,
    shipmentState,
    consignmentId,
    startDate,
    endDate,
    customerPhone,
  ]);

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  const replaceShipment = (updated: Order) => {
    setShipments((prev) =>
      prev.map((shipment) => (shipment.id === updated.id ? updated : shipment))
    );
  };

  const handleRefreshStatus = async (order: Order) => {
    if (!order.courierConsignmentId && !order.courierTrackingCode) return;
    try {
      setRefreshingId(order.id);
      setSuccessMsg(null);
      setErrorMsg(null);
      const res = await orderApi.syncCourierStatus(order.id);
      replaceShipment(res.order);
      setSuccessMsg(
        `Order ${order.orderRef || order.id}: status updated to ${res.deliveryStatus}`
      );
    } catch (err: any) {
      console.error("Failed to refresh courier status:", err);
      setErrorMsg(getErrorMessage(err));
    } finally {
      setRefreshingId(null);
    }
  };

  const handleSyncAll = async () => {
    try {
      setRefreshingAll(true);
      setSuccessMsg(null);
      setErrorMsg(null);
      const res = await orderApi.syncAllCourierOrders();
      setSuccessMsg(
        `${res.message} (${res.syncedCount} synced, ${res.failedCount} failed)`
      );
      await fetchShipments();
    } catch (err: any) {
      console.error("Failed to sync all courier orders:", err);
      setErrorMsg(getErrorMessage(err));
    } finally {
      setRefreshingAll(false);
    }
  };

  const handleCopy = (order: Order) => {
    if (!order.courierConsignmentId) return;
    navigator.clipboard.writeText(order.courierConsignmentId);
    setCopiedId(order.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetFilters = () => {
    setSearch("");
    setCourierStatus("ALL");
    setShipmentState("");
    setConsignmentId("");
    setStartDate("");
    setEndDate("");
    setCustomerPhone("");
    setPage(1);
  };

  const hasFilters =
    !!search ||
    courierStatus !== "ALL" ||
    !!shipmentState ||
    !!consignmentId ||
    !!startDate ||
    !!endDate ||
    !!customerPhone;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Truck className="text-primary" /> Courier Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Booked Steadfast shipments, saved consignment details, and manual status refresh using each order&apos;s consignment ID.
          </p>

          <div className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-950 to-slate-900 px-4 py-2.5 text-white shadow-sm">
            <Wallet size={18} className="text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold">
                Steadfast Balance
              </div>
              <div className="text-lg font-black leading-tight">
                {loadingBalance
                  ? "Loading..."
                  : balanceError
                    ? "Unavailable"
                    : balance !== null
                      ? `৳ ${balance.toLocaleString()}`
                      : "—"}
              </div>
            </div>
            <button
              type="button"
              onClick={fetchBalance}
              disabled={loadingBalance}
              className="btn btn-ghost btn-xs text-indigo-200 hover:text-white ml-1"
              title="Refresh Steadfast wallet balance"
            >
              <RefreshCw
                size={12}
                className={loadingBalance ? "animate-spin" : ""}
              />
            </button>

            <span
              className={`badge badge-xs font-bold uppercase ${
                authStatus === null
                  ? "badge-neutral text-white"
                  : authStatus.balanceOk
                    ? "badge-success text-white"
                    : "badge-error text-white"
              }`}
              title={
                authStatus === null
                  ? "Checking Steadfast API health"
                  : authStatus.balanceOk
                    ? `Connected via ${authStatus.preferredSource || (authStatus.envConfigured ? "env" : "database")}`
                    : authStatus.balanceError ||
                      "Steadfast API rejected the credentials"
              }
            >
              {authStatus === null
                ? "API Checking"
                : authStatus.balanceOk
                  ? `API Connected${
                      authStatus.preferredSource
                        ? ` (${authStatus.preferredSource})`
                        : ""
                    }`
                  : "API Rejected"}
            </span>
          </div>

          {balanceError && (
            <p className="text-[10px] text-rose-600 font-semibold mt-1 max-w-md">
              {balanceError}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Link
            href="/admin/courier"
            className="btn btn-sm btn-outline rounded-xl font-bold gap-2"
          >
            <SlidersHorizontal size={14} /> Courier Policy
          </Link>
          <button
            onClick={handleSyncAll}
            disabled={refreshingAll}
            className="btn btn-sm btn-info text-white rounded-xl font-bold gap-2"
            title="Refresh every active shipment from Steadfast"
          >
            <Truck size={14} className={refreshingAll ? "animate-bounce" : ""} />
            {refreshingAll ? "Syncing..." : "Sync All Active"}
          </button>
          <button
            onClick={fetchShipments}
            disabled={loading}
            className="btn btn-sm btn-outline rounded-xl font-bold gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh List
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200/80 shadow-sm">
        {COURIER_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm rounded-xl gap-2 font-bold ${
                isActive
                  ? "btn-primary text-white"
                  : "btn-ghost text-slate-600"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

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

      {activeTab === "shipments" && (
        <>
      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Order ref, name, address, tracking..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input input-sm input-bordered w-full rounded-2xl pl-9 text-slate-900 text-xs"
            />
            <Search
              size={16}
              className="absolute left-3 top-2.5 text-slate-400 pointer-events-none"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Truck size={14} className="text-primary" /> Consignment:
            <input
              type="text"
              placeholder="Consignment ID..."
              value={consignmentId}
              onChange={(e) => {
                setConsignmentId(e.target.value);
                setPage(1);
              }}
              className="input input-xs input-bordered bg-white text-slate-900 font-bold rounded-xl w-40"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Filter size={14} /> Status:
            <select
              value={courierStatus}
              onChange={(e) => {
                setCourierStatus(e.target.value);
                setPage(1);
              }}
              className="select select-xs select-bordered bg-white text-slate-900 font-bold rounded-xl"
            >
              <option value="ALL">All Courier Statuses</option>
              <option value="NOT_SENT">Not Placed with Courier</option>
              <option value="IN_TRANSIT">In Transit / Active</option>
              <option value="DELIVERED">Delivered</option>
              <option value="PARTIAL_DELIVERED">Partially Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="HOLD">On Hold</option>
              <option value="RETURNED">Returned</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Package size={14} /> Booking:
            <select
              value={shipmentState}
              onChange={(e) => {
                setShipmentState(e.target.value);
                setPage(1);
              }}
              className="select select-xs select-bordered bg-white text-slate-900 font-bold rounded-xl"
            >
              <option value="">All Booking States</option>
              <option value="NOT_BOOKED">Not Booked</option>
              <option value="BOOKED">Booked</option>
              <option value="BOOKING">Booking In Progress</option>
              <option value="FAILED">Booking Failed</option>
              <option value="UNCERTAIN">Needs Reconciliation</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Calendar size={14} className="text-primary" /> From:
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="input input-xs input-bordered bg-white text-slate-900 font-bold rounded-xl"
            />
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="input input-xs input-bordered bg-white text-slate-900 font-bold rounded-xl"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Phone size={14} className="text-primary" /> Mobile:
            <input
              type="text"
              placeholder="Customer phone..."
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value);
                setPage(1);
              }}
              className="input input-xs input-bordered bg-white text-slate-900 font-bold rounded-xl w-36"
            />
          </div>

          {hasFilters && (
            <button
              onClick={resetFilters}
              className="btn btn-xs btn-ghost text-rose-600 font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Shipments Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : shipments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Truck size={48} className="mx-auto mb-3 opacity-60" />
            <p className="text-lg font-bold text-slate-700">No Shipments Found</p>
            <p className="text-xs text-slate-500 mt-1">
              No orders match the current courier filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 pl-6">Order</th>
                  <th>Reseller</th>
                  <th>Customer</th>
                  <th>Delivery Address</th>
                  <th>Steadfast Shipment</th>
                  <th>COD</th>
                  <th>Courier Status</th>
                  <th>Booking</th>
                  <th>Last Updated</th>
                  <th className="text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {shipments.map((order) => {
                  const trackingUrl = getTrackingUrl(order);
                  const codAmount = getCodAmount(order);
                  const stale = isStale(order.courierLastSyncedAt);
                  const canRefresh = !!(
                    order.courierConsignmentId || order.courierTrackingCode
                  );
                  const isRefreshing = refreshingId === order.id;

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/80 transition-colors align-top">
                      <td className="pl-6 py-4">
                        <div className="font-mono font-bold text-indigo-600 text-xs">
                          {order.orderRef || `#${order.id.substring(0, 8).toUpperCase()}`}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="text-xs text-slate-600 font-medium">
                        {order.isResellerOrder
                          ? order.reseller?.name ||
                            order.customer?.name ||
                            "Reseller"
                          : "Direct"}
                      </td>

                      <td>
                        <div className="font-bold text-slate-900 text-xs">
                          {order.customerName || order.customer?.name || "Customer"}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {order.customerPhone || order.customer?.phone || "N/A"}
                        </div>
                      </td>

                      <td className="max-w-[220px]">
                        <div
                          className="text-[11px] text-slate-600 line-clamp-2"
                          title={order.shippingAddress || ""}
                        >
                          {order.shippingAddress || "No address"}
                        </div>
                        {(order.customerThana || order.customerDistrict) && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {[order.customerThana, order.customerDistrict]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="text-[11px] font-bold text-slate-700">
                          {order.courierProvider || "STEADFAST"}
                        </div>
                        {order.courierConsignmentId ? (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-mono text-[11px] text-slate-700">
                              #{order.courierConsignmentId}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(order)}
                              className="btn btn-ghost btn-xs text-primary px-1 h-auto min-h-0"
                              title="Copy consignment ID"
                            >
                              {copiedId === order.id ? (
                                <Check size={11} className="text-success" />
                              ) : (
                                <Copy size={11} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="text-[10px] text-slate-400 italic mt-1">
                            Not booked
                          </div>
                        )}

                        {trackingUrl ? (
                          <a
                            href={trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 font-mono text-[11px] font-bold text-indigo-700 hover:text-indigo-950 mt-1 underline decoration-dotted"
                          >
                            {order.courierTrackingCode || "Tracking"}
                            <ExternalLink size={10} />
                          </a>
                        ) : null}
                      </td>

                      <td className="text-xs font-black text-indigo-950">
                        ৳{codAmount.toLocaleString()}
                      </td>

                      <td>
                        <CourierStatusBadge status={order.courierStatus} />
                        {order.courierReturnStatus && (
                          <div className="mt-1">
                            <span className="badge badge-warning text-slate-900 text-[9px] font-bold uppercase py-1 px-1.5">
                              Return: {order.courierReturnStatus}
                            </span>
                          </div>
                        )}
                      </td>

                      <td>
                        {order.courierBookingState ? (
                          <span
                            className={`badge font-bold text-[10px] uppercase py-1.5 px-2 ${
                              BOOKING_STATE_STYLES[order.courierBookingState] ||
                              "badge-neutral text-white"
                            }`}
                          >
                            {BOOKING_STATE_LABELS[order.courierBookingState] ||
                              order.courierBookingState}
                          </span>
                        ) : order.courierConsignmentId ? (
                          <span className="badge badge-success text-white font-bold text-[10px] uppercase py-1.5 px-2">
                            Booked
                          </span>
                        ) : (
                          <span className="badge badge-ghost text-slate-500 font-bold text-[10px] uppercase py-1.5 px-2">
                            Not Booked
                          </span>
                        )}
                      </td>

                      <td className="text-[11px] text-slate-600">
                        {canRefresh ? (
                          <>
                            <div className="font-medium">
                              {formatDateTime(order.courierLastSyncedAt)}
                            </div>
                            <div
                              className={`text-[10px] font-bold mt-0.5 ${
                                stale ? "text-amber-600" : "text-emerald-600"
                              }`}
                            >
                              {stale ? "Stale" : "Recent"}
                            </div>
                          </>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">
                            Not booked
                          </span>
                        )}
                      </td>

                      <td className="text-right pr-6">
                        <div className="flex flex-col items-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleRefreshStatus(order)}
                            disabled={!canRefresh || isRefreshing}
                            className="btn btn-xs btn-outline btn-primary rounded-lg font-bold gap-1"
                            title={
                              canRefresh
                                ? "Refresh status from Steadfast using the stored consignment ID"
                                : "No consignment ID available"
                            }
                          >
                            <RefreshCw
                              size={12}
                              className={isRefreshing ? "animate-spin" : ""}
                            />
                            {isRefreshing ? "Refreshing..." : "Refresh Status"}
                          </button>
                          {canRefresh && !order.courierReturnStatus && (
                            <button
                              type="button"
                              onClick={() => {
                                setReturnOrder(order);
                                setReturnReason("");
                              }}
                              className="btn btn-xs btn-ghost text-amber-600 rounded-lg font-bold gap-1"
                            >
                              <RotateCcw size={12} /> Request Return
                            </button>
                          )}
                          <Link
                            href={`/orders?search=${encodeURIComponent(
                              order.orderRef || order.id
                            )}`}
                            className="btn btn-xs btn-ghost rounded-lg font-bold gap-1 text-slate-600"
                          >
                            Manage Order
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-medium text-slate-500">
              Page {page} of {meta.totalPages} ({meta.total} shipments)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="btn btn-xs btn-outline rounded-lg gap-1"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                className="btn btn-xs btn-outline rounded-lg gap-1"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
        </>
      )}

      {activeTab === "track" && <TrackPanel allowManual />}
      {activeTab === "pickups" && <PickupsPanel />}
      {activeTab === "returns" && (
        <ReturnsPanel onReturnCreated={(order) => replaceShipment(order)} />
      )}
      {activeTab === "invoices" && <InvoicesPanel />}

      {/* Request Return Modal */}
      {returnOrder && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white p-6 space-y-4 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <RotateCcw size={18} className="text-primary" /> Request Return
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-circle btn-sm text-slate-400"
                onClick={() => setReturnOrder(null)}
                disabled={creatingReturn}
              >
                <X size={18} />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900">
                  {returnOrder.orderRef ||
                    `#${returnOrder.id.substring(0, 8).toUpperCase()}`}
                </div>
                <div className="text-slate-500 mt-1">
                  Consignment: #{returnOrder.courierConsignmentId || "N/A"}
                </div>
                <div className="text-slate-500">
                  Tracking: {returnOrder.courierTrackingCode || "N/A"}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Return Reason
                </label>
                <textarea
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  rows={3}
                  placeholder="Why is this parcel being returned?"
                  className="textarea textarea-bordered w-full rounded-xl text-slate-900"
                  maxLength={500}
                />
              </div>
            </div>

            <div className="modal-action border-t border-slate-100 pt-4">
              <button
                type="button"
                className="btn btn-ghost btn-sm font-bold rounded-xl"
                onClick={() => setReturnOrder(null)}
                disabled={creatingReturn}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm font-bold rounded-xl gap-2 text-white"
                onClick={handleCreateReturn}
                disabled={creatingReturn}
              >
                {creatingReturn ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <RotateCcw size={14} />
                )}
                {creatingReturn ? "Submitting..." : "Submit Return Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
