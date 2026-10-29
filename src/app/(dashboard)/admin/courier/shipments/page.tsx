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
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelTabs from "@/components/panel/PanelTabs";
import PanelTable from "@/components/panel/PanelTable";
import PanelEmpty from "@/components/panel/PanelEmpty";
import PanelSkeleton from "@/components/panel/PanelSkeleton";
import PanelModal from "@/components/panel/PanelModal";

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
  UNCERTAIN: "badge-warning text-base-content border border-amber-400",
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
    <PanelPage>
      {/* Header */}
      <PanelPageHeader
        title="Courier Management"
        subtitle="Booked Steadfast shipments, saved consignment details, and manual status refresh using each order's consignment ID."
        icon={Truck}
        actions={
          <>
            <Link
              href="/admin/courier"
              className="btn btn-outline btn-sm rounded-xl gap-2"
            >
              <SlidersHorizontal size={16} /> Courier Policy
            </Link>
            <button
              type="button"
              onClick={handleSyncAll}
              disabled={refreshingAll}
              className="btn btn-info btn-sm rounded-xl gap-2 text-white"
              title="Refresh every active shipment from Steadfast"
            >
              <Truck size={16} className={refreshingAll ? "animate-bounce" : ""} />
              {refreshingAll ? "Syncing..." : "Sync All Active"}
            </button>
            <button
              type="button"
              onClick={fetchShipments}
              disabled={loading}
              className="btn btn-outline btn-sm rounded-xl gap-2"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh List
            </button>
          </>
        }
      />

      <div className="inline-flex flex-wrap items-center gap-3 rounded-xl bg-base-200 px-4 py-2.5 text-base-content">
        <Wallet size={18} className="text-emerald-600" />
        <div>
          <div className="text-[10px] uppercase tracking-wider text-base-content/50 font-bold">
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
          className="btn btn-ghost btn-xs btn-square rounded-lg"
          title="Refresh Steadfast wallet balance"
          aria-label="Refresh Steadfast wallet balance"
        >
          <RefreshCw size={12} className={loadingBalance ? "animate-spin" : ""} />
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
                : authStatus.balanceError || "Steadfast API rejected the credentials"
          }
        >
          {authStatus === null
            ? "API Checking"
            : authStatus.balanceOk
              ? `API Connected${
                  authStatus.preferredSource ? ` (${authStatus.preferredSource})` : ""
                }`
              : "API Rejected"}
        </span>

        {balanceError && (
          <span className="text-[10px] text-rose-600 font-semibold">{balanceError}</span>
        )}
      </div>

      {/* Tabs */}
      <PanelTabs
        ariaLabel="Courier sections"
        value={activeTab}
        onChange={(id) => setActiveTab(id as CourierTab)}
        tabs={COURIER_TABS.map((tab) => ({
          id: tab.id,
          label: tab.label,
          icon: tab.icon,
        }))}
      />

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
      <div className="bg-base-100 p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
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
              className="input input-sm input-bordered w-full rounded-2xl pl-9 text-base-content text-xs"
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
              className="input input-xs input-bordered bg-base-100 text-base-content font-bold rounded-xl w-40"
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
              className="select select-xs select-bordered bg-base-100 text-base-content font-bold rounded-xl"
            >
              <option value="ALL">All Courier Statuses</option>
              <option value="NOT_SENT">Not Placed with Courier</option>
              <option value="PENDING">Pending / In Review</option>
              <option value="IN_TRANSIT">In Transit / Active</option>
              <option value="DELIVERED">Delivered</option>
              <option value="PARTIAL">Partially Delivered</option>
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
              className="select select-xs select-bordered bg-base-100 text-base-content font-bold rounded-xl"
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
              className="input input-xs input-bordered bg-base-100 text-base-content font-bold rounded-xl"
            />
            <span>To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="input input-xs input-bordered bg-base-100 text-base-content font-bold rounded-xl"
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
              className="input input-xs input-bordered bg-base-100 text-base-content font-bold rounded-xl w-36"
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
      {loading ? (
        <PanelSkeleton variant="table" rows={8} />
      ) : shipments.length === 0 ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm">
          <PanelEmpty
            icon={Truck}
            title="No Shipments Found"
            text="No orders match the current courier filters."
          />
        </div>
      ) : (
          <PanelTable>
              <thead>
                <tr>
                  <th className="py-4 pl-6">Order</th>
                  <th>Uddokta</th>
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
                            "Uddokta"
                          : "Direct"}
                      </td>

                      <td>
                        <div className="font-bold text-base-content text-xs">
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
                            <span className="badge badge-warning text-base-content text-[9px] font-bold uppercase py-1 px-1.5">
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
          </PanelTable>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-base-200 flex items-center justify-between bg-base-200/40 rounded-2xl">
            <span className="text-xs font-medium text-base-content/60">
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
        <PanelModal
          open={!!returnOrder}
          onClose={() => setReturnOrder(null)}
          title="Request Return"
          size="sm"
          footer={
            <>
              <button
                type="button"
                className="btn btn-ghost btn-sm rounded-xl"
                onClick={() => setReturnOrder(null)}
                disabled={creatingReturn}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-xl gap-2 text-white"
                onClick={handleCreateReturn}
                disabled={creatingReturn}
              >
                {creatingReturn ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <RotateCcw size={16} />
                )}
                {creatingReturn ? "Submitting..." : "Submit Return Request"}
              </button>
            </>
          }
        >
          <div className="text-xs space-y-3">
            <div className="bg-base-200/60 p-3 rounded-xl border border-base-200">
              <div className="font-bold text-base-content">
                {returnOrder.orderRef ||
                  `#${returnOrder.id.substring(0, 8).toUpperCase()}`}
              </div>
              <div className="text-base-content/60 mt-1">
                Consignment: #{returnOrder.courierConsignmentId || "N/A"}
              </div>
              <div className="text-base-content/60">
                Tracking: {returnOrder.courierTrackingCode || "N/A"}
              </div>
            </div>

            <div>
              <label className="block font-bold text-base-content/70 mb-1">
                Return Reason
              </label>
              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                rows={3}
                placeholder="Why is this parcel being returned?"
                className="textarea textarea-bordered w-full rounded-xl"
                maxLength={500}
              />
            </div>
          </div>
        </PanelModal>
      )}
    </PanelPage>
  );
}
