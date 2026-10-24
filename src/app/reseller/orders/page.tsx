"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  Eye,
  Search,
  Filter,
  User,
  Phone,
  MapPin,
  FileText,
  DollarSign,
  TrendingUp,
  X,
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  orderApi,
  Order,
  OrderProcessingStatus,
  CourierTrackResult,
} from "@/services/order.api";
import CourierStatusBadge from "@/components/courier/CourierStatusBadge";
import { exportOrdersToCSV } from "@/utils/csvExporter";

export default function ResellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [search, setSearch] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [exporting, setExporting] = useState<boolean>(false);
  const [copiedTrackingCode, setCopiedTrackingCode] = useState<string | null>(null);
  const [courierTrack, setCourierTrack] = useState<CourierTrackResult | null>(null);
  const [courierTrackLoading, setCourierTrackLoading] = useState<boolean>(false);
  const [courierTrackError, setCourierTrackError] = useState<string | null>(null);

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTrackingCode(code);
    setTimeout(() => setCopiedTrackingCode(null), 2000);
  };

  const getTrackingUrl = (order: Order) =>
    order.courierTrackingLink ||
    (order.courierTrackingCode
      ? `https://steadfast.com.bd/t/${order.courierTrackingCode}`
      : null);

  const resetCourierTrack = () => {
    setCourierTrack(null);
    setCourierTrackError(null);
    setCourierTrackLoading(false);
  };

  const openOrderDetails = (order: Order) => {
    resetCourierTrack();
    setSelectedOrder(order);
  };

  const closeOrderDetails = () => {
    resetCourierTrack();
    setSelectedOrder(null);
  };

  const handleShowCourierStatus = async () => {
    const consignmentId = selectedOrder?.courierConsignmentId;
    if (!consignmentId) return;
    setCourierTrackError(null);
    setCourierTrackLoading(true);
    try {
      setCourierTrack(await orderApi.trackCourierParcel(consignmentId));
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setCourierTrackError(
        Array.isArray(message)
          ? message.join(", ")
          : message || err?.message || "Could not fetch courier status"
      );
    } finally {
      setCourierTrackLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const data = await orderApi.exportOrders(
        search || undefined,
        selectedStatus !== "ALL"
          ? (selectedStatus as OrderProcessingStatus)
          : undefined,
        undefined,
        true, // isResellerOnly
        startDate || undefined,
        endDate || undefined,
        customerPhone || undefined
      );
      exportOrdersToCSV(data, "reseller_orders_export");
    } catch (err) {
      console.error("Failed to export reseller orders CSV:", err);
      alert("Failed to export CSV. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await orderApi.getOrders(
        page,
        limit,
        search || undefined,
        selectedStatus !== "ALL"
          ? (selectedStatus as OrderProcessingStatus)
          : undefined,
        undefined,
        true, // isResellerOnly
        startDate || undefined,
        endDate || undefined,
        customerPhone || undefined
      );
      setOrders(res.data || []);
      setMeta({
        total: res.meta?.total || 0,
        totalPages: res.meta?.totalPages || 1,
      });
      setSelectedOrder((current) => {
        if (!current) return current;
        return (res.data || []).find((o) => o.id === current.id) || current;
      });
    } catch (err) {
      console.error("Failed to load reseller orders:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [page, limit, search, selectedStatus, startDate, endDate, customerPhone]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // DB-only refresh so admin bookings/returns appear without a full reload.
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchOrders(true);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchOrders]);

  const clearFilters = () => {
    setSearch("");
    setSelectedStatus("ALL");
    setStartDate("");
    setEndDate("");
    setCustomerPhone("");
    setPage(1);
  };

  const renderCourierBadge = (status?: string | null) => {
    if (!status) return null;
    const s = status.toLowerCase();
    switch (s) {
      case "delivered":
        return (
          <span className="badge badge-success text-white text-[10px] font-bold py-1.5 px-2 gap-1">
            <Check size={10} /> Delivered
          </span>
        );
      case "in_review":
        return (
          <span className="badge badge-warning text-slate-900 text-[10px] font-bold py-1.5 px-2 gap-1">
            <Clock size={10} /> In Review
          </span>
        );
      case "pending":
      case "in_transit":
        return (
          <span className="badge badge-info text-white text-[10px] font-bold py-1.5 px-2 gap-1">
            <Truck size={10} /> In Transit
          </span>
        );
      case "cancelled":
        return (
          <span className="badge badge-error text-white text-[10px] font-bold py-1.5 px-2 gap-1">
            <X size={10} /> Courier Cancelled
          </span>
        );
      case "hold":
        return (
          <span className="badge badge-warning text-white text-[10px] font-bold py-1.5 px-2 gap-1">
            <AlertTriangle size={10} /> On Hold
          </span>
        );
      case "partial_delivered":
        return (
          <span className="badge badge-warning text-slate-900 font-extrabold text-[10px] uppercase py-1.5 px-2 gap-1 border border-amber-400">
            <CheckCircle2 size={10} /> Partial Delivered
          </span>
        );
      case "partial_delivered_approval_pending":
        return (
          <span className="badge badge-accent text-white font-bold text-[10px] uppercase py-1.5 px-2 gap-1">
            <Clock size={10} /> Part. Deliv. Pending Appr.
          </span>
        );
      case "delivered_approval_pending":
        return (
          <span className="badge badge-accent text-white font-bold text-[10px] uppercase py-1.5 px-2 gap-1">
            <CheckCircle2 size={10} /> Deliv. Pending Appr.
          </span>
        );
      case "cancelled_approval_pending":
        return (
          <span className="badge badge-error text-white font-bold text-[10px] uppercase py-1.5 px-2 gap-1">
            <Clock size={10} /> Canc. Pending Appr.
          </span>
        );
      case "cancelled_return_received":
        return (
          <span className="badge badge-error text-white font-extrabold text-[10px] uppercase py-1.5 px-2 gap-1 border border-red-300">
            <XCircle size={10} /> Returned & Restocked
          </span>
        );
      case "partial_delivered_return_received":
        return (
          <span className="badge badge-warning text-slate-900 font-extrabold text-[10px] uppercase py-1.5 px-2 gap-1 border border-amber-400">
            <CheckCircle2 size={10} /> Part. Return Received
          </span>
        );
      case "cancelled_return_processing":
      case "cancelled_return_rider_assigned":
        return (
          <span className="badge badge-error text-white font-bold text-[10px] uppercase py-1.5 px-2 gap-1">
            <Truck size={10} /> Return In Transit
          </span>
        );
      case "partial_delivered_return_proccessing":
      case "partial_delivered_return_rider_assigned":
        return (
          <span className="badge badge-warning text-slate-900 font-bold text-[10px] uppercase py-1.5 px-2 gap-1">
            <Truck size={10} /> Part. Return In Transit
          </span>
        );
      case "exceptional":
        return (
          <span className="badge badge-error text-white font-bold text-[10px] uppercase py-1.5 px-2 gap-1">
            <AlertTriangle size={10} /> Exceptional
          </span>
        );
      default:
        return (
          <span className="badge badge-ghost text-[10px] font-semibold py-1.5 px-2">
            {status}
          </span>
        );
    }
  };

  const getStatusBadge = (status: OrderProcessingStatus) => {
    switch (status) {
      case "PENDING":
        return <span className="badge badge-warning gap-1"><Clock size={12} /> Pending</span>;
      case "CONFIRMED":
        return <span className="badge badge-info gap-1"><CheckCircle2 size={12} /> Confirmed</span>;
      case "PROCESSING":
        return <span className="badge badge-secondary gap-1"><Package size={12} /> Processing</span>;
      case "SHIPPED":
        return <span className="badge badge-accent gap-1"><Truck size={12} /> Shipped</span>;
      case "DELIVERED":
        return <span className="badge badge-success text-white gap-1"><CheckCircle2 size={12} /> Delivered</span>;
      case "CANCELLED":
        return <span className="badge badge-error text-white gap-1"><XCircle size={12} /> Cancelled</span>;
      case "RETURNED":
        return <span className="badge badge-neutral gap-1">Returned</span>;
      default:
        return <span className="badge badge-ghost">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-base-100 p-6 rounded-2xl border border-base-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-extrabold text-base-content">My Reseller Orders</h1>
          <p className="text-sm text-base-content/60 mt-1">
            Track fulfillment status, end-customer information, and reseller profit for all orders placed.
          </p>
        </div>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="btn btn-sm btn-success text-white font-bold gap-2 self-start sm:self-auto"
        >
          {exporting ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <FileSpreadsheet size={14} />
          )}
          Export CSV
        </button>
      </div>


      {/* Search & Filters Toolbar */}
      <div className="bg-base-100 p-3 sm:p-4 rounded-xl border border-base-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* General Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
            <input
              type="text"
              placeholder="Search ref, customer name, address..."
              className="input input-bordered pl-10 w-full input-sm"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-base-content/70">
            <span>From:</span>
            <input
              type="date"
              className="input input-bordered input-sm text-xs flex-1 sm:flex-none"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
            <span>To:</span>
            <input
              type="date"
              className="input input-bordered input-sm text-xs flex-1 sm:flex-none"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Customer Mobile Filter */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-base-content/70">
            <span>Mobile:</span>
            <input
              type="text"
              placeholder="017xxxxxxxx"
              className="input input-bordered input-sm text-xs w-full sm:w-36"
              value={customerPhone}
              onChange={(e) => {
                setCustomerPhone(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {(search || selectedStatus !== "ALL" || startDate || endDate || customerPhone) && (
            <button
              onClick={clearFilters}
              className="btn btn-ghost btn-xs text-error font-bold self-end sm:self-center"
            >
              Clear Filters
            </button>
          )}

        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <Filter size={16} className="text-base-content/40 shrink-0" />
          {["ALL", "PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map((status) => (
            <button
              key={status}
              className={`btn btn-xs ${selectedStatus === status ? "btn-primary" : "btn-outline"} shrink-0`}
              onClick={() => {
                setSelectedStatus(status);
                setPage(1);
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 p-4">
            <ShoppingBag className="mx-auto text-base-content/30 mb-3" size={48} />
            <h3 className="font-bold text-lg">No reseller orders found</h3>
            <p className="text-sm text-base-content/60">
              Placed orders on behalf of your customers will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr className="bg-base-200/50 text-xs text-base-content/70">
                  <th>Order Ref</th>
                  <th>Customer Info</th>
                  <th>Steadfast Courier</th>
                  <th>Location</th>
                  <th>Selling Price</th>
                  <th>Reseller Profit</th>
                  <th>Advance Courier</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {orders.map((order) => {
                  const displayRef = order.orderRef || `#${order.id.substring(0, 8).toUpperCase()}`;
                  const customerName = order.customerName || order.customer?.name || "N/A";
                  const customerPhone = order.customerPhone || order.customer?.phone || "N/A";
                  const district = order.customerDistrict || "N/A";
                  const thana = order.customerThana || "N/A";
                  const calculatedItemProfit =
                    order.orderItems?.reduce((sum, item) => {
                      const purchasePrice = Number(item.product?.purchasePrice || 0);
                      const resellerPrice = Number(
                        item.resellerUnitCost || item.product?.resellerPrice || item.snapshotPrice || 0
                      );
                      const sellingPrice = Number(item.resellerSellingPrice || resellerPrice);
                      return sum + (sellingPrice - purchasePrice) * item.quantity;
                    }, 0) || 0;

                  const profit =
                    order.resellerProfit && Number(order.resellerProfit) > 0
                      ? Number(order.resellerProfit)
                      : calculatedItemProfit;

                  const isEarned =
                    order.processingStatus === "DELIVERED" && order.paymentStatus === "PAID";

                  return (
                    <tr key={order.id} className="hover:bg-base-200/40 transition-colors">
                      <td className="font-mono font-bold text-xs text-primary">
                        {displayRef}
                        <div className="text-[10px] text-base-content/50 font-sans font-normal">
                          {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>

                      </td>
                      <td>
                        <div className="font-bold text-xs text-base-content">{customerName}</div>
                        <div className="text-xs text-base-content/60">{customerPhone}</div>
                      </td>
                      <td>
                        {order.courierTrackingCode ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 font-mono text-xs font-bold text-base-content">
                              <Truck size={12} className="text-primary" />
                              <span>{order.courierTrackingCode}</span>
                            </div>
                            <div>{renderCourierBadge(order.courierStatus)}</div>
                            {order.courierReturnStatus && (
                              <span className="badge badge-warning text-slate-900 text-[9px] font-bold uppercase py-1 px-1.5">
                                Return: {order.courierReturnStatus}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-base-content/40 italic">
                            Processing
                          </span>
                        )}
                      </td>
                      <td className="text-xs">
                        <span className="font-semibold">{district}</span>
                        <div className="text-[11px] text-base-content/60">{thana}</div>
                      </td>
                      <td className="font-bold text-xs text-base-content">
                        ৳{(order.resellerSellPrice || order.subtotal).toLocaleString()}
                      </td>
                      <td>
                        {isEarned ? (
                          <div>
                            <span className="font-extrabold text-xs text-emerald-600">
                              +৳{profit.toLocaleString()}
                            </span>
                            <div className="text-[10px] font-bold text-emerald-600">Earned</div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-extrabold text-xs text-amber-600">
                              ৳{profit.toLocaleString()}
                            </span>
                            <div className="text-[10px] font-semibold text-amber-600">Pending Delivery/Paid</div>
                          </div>
                        )}
                      </td>
                      <td>
                        {order.isAdvanceCourierPaid ? (
                          <span className="badge badge-success text-white badge-xs py-2 px-2 gap-1 font-semibold">
                            <CheckCircle2 size={10} /> Paid
                          </span>
                        ) : (
                          <span className="badge badge-ghost badge-xs py-2 px-2 font-semibold">
                            Not Paid
                          </span>
                        )}
                      </td>
                      <td>{getStatusBadge(order.processingStatus)}</td>
                      <td>
                        <button
                          className="btn btn-ghost btn-xs gap-1 text-primary"
                          onClick={() => openOrderDetails(order)}
                        >
                          <Eye size={14} /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal modal-open">
          <div className="modal-box w-full max-w-2xl bg-base-100 p-4 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <div>
                <h3 className="font-bold text-lg text-base-content">
                  Order Details {selectedOrder.orderRef || `#${selectedOrder.id.substring(0, 8).toUpperCase()}`}
                </h3>
                <p className="text-xs text-base-content/60">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                className="btn btn-ghost btn-circle btn-sm"
                onClick={closeOrderDetails}
              >
                <X size={18} />
              </button>
            </div>

            {/* Steadfast Courier Tracking Box */}
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Truck size={14} /> Steadfast Courier
                </h4>
                <CourierStatusBadge
                  status={courierTrack?.deliveryStatus || selectedOrder.courierStatus}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-base-100 p-3 rounded-lg border border-base-200">
                <div>
                  <span className="text-base-content/60 font-semibold block uppercase text-[10px]">
                    Consignment ID:
                  </span>
                  <span className="font-mono font-bold text-sm text-primary mt-0.5 block">
                    {selectedOrder.courierConsignmentId
                      ? `#${selectedOrder.courierConsignmentId}`
                      : "Not assigned"}
                  </span>
                </div>

                <div>
                  <span className="text-base-content/60 font-semibold block uppercase text-[10px]">
                    Tracking Code:
                  </span>
                  {selectedOrder.courierTrackingCode ? (
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-black text-sm text-base-content">
                        {selectedOrder.courierTrackingCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyTracking(selectedOrder.courierTrackingCode!)}
                        className="btn btn-ghost btn-xs text-primary px-1.5"
                        title="Copy Code"
                      >
                        {copiedTrackingCode === selectedOrder.courierTrackingCode ? (
                          <Check size={13} className="text-success" />
                        ) : (
                          <Copy size={13} />
                        )}
                      </button>
                    </div>
                  ) : (
                    <span className="text-base-content/40 italic text-[11px] block mt-0.5">
                      Not booked yet
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="btn btn-primary btn-sm gap-2"
                  onClick={handleShowCourierStatus}
                  disabled={!selectedOrder.courierConsignmentId || courierTrackLoading}
                  title={
                    selectedOrder.courierConsignmentId
                      ? "Fetch the live status from Steadfast"
                      : "No consignment ID on this order yet"
                  }
                >
                  {courierTrackLoading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Truck size={14} />
                  )}
                  {courierTrackLoading ? "Checking..." : "Show Courier Status"}
                </button>
                {courierTrack && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm gap-1"
                    onClick={handleShowCourierStatus}
                    disabled={courierTrackLoading}
                  >
                    <RefreshCw size={13} /> Refresh
                  </button>
                )}
                {!selectedOrder.courierConsignmentId && (
                  <span className="text-[11px] text-base-content/50">
                    Status is unavailable until this order has a consignment ID.
                  </span>
                )}
              </div>

              {courierTrackError && (
                <div className="alert alert-error text-xs text-white font-semibold flex items-start gap-2">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span>{courierTrackError}</span>
                </div>
              )}

              {courierTrack && (
                <div className="bg-base-100 p-3 rounded-lg border border-base-200 space-y-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <CourierStatusBadge status={courierTrack.deliveryStatus} />
                    <span className="text-[11px] text-base-content/60">
                      Matched by {courierTrack.matchedBy.toUpperCase()} ·{" "}
                      {courierTrack.matchedIdentifier || courierTrack.identifier}
                    </span>
                  </div>

                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1">
                    <MapPin size={12} /> Journey ({courierTrack.trackingEvents?.length || 0})
                  </h5>

                  {courierTrack.trackingEvents?.length ? (
                    <ol className="space-y-2">
                      {courierTrack.trackingEvents.map((event, index) => (
                        <li
                          key={`${event.created_at}-${index}`}
                          className="bg-base-200/60 rounded-lg p-2.5"
                        >
                          <p className="font-semibold text-base-content">{event.text}</p>
                          <span className="text-[10px] text-base-content/50">
                            {new Date(event.created_at).toLocaleString()}
                          </span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="text-[11px] text-base-content/50">
                      No tracking milestones returned yet. The badge above is the
                      latest provider response.
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-base-content/60">
                {selectedOrder.courierLastSyncedAt && (
                  <span>
                    Last synced:{" "}
                    {new Date(selectedOrder.courierLastSyncedAt).toLocaleString()}
                  </span>
                )}
                {selectedOrder.courierReturnStatus && (
                  <span className="badge badge-warning text-slate-900 font-bold uppercase text-[10px]">
                    Return: {selectedOrder.courierReturnStatus}
                  </span>
                )}
                {selectedOrder.courierReturnRequestedAt && (
                  <span>
                    Return requested:{" "}
                    {new Date(
                      selectedOrder.courierReturnRequestedAt
                    ).toLocaleString()}
                  </span>
                )}
                {(courierTrack?.trackingLink || getTrackingUrl(selectedOrder)) && (
                  <a
                    href={(courierTrack?.trackingLink || getTrackingUrl(selectedOrder))!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link link-primary font-bold"
                  >
                    Open Steadfast Tracking
                  </a>
                )}
              </div>

              {selectedOrder.courierReturnReason && (
                <p className="text-[11px] text-base-content/60">
                  Return reason: {selectedOrder.courierReturnReason}
                </p>
              )}
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-200/50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-base-content/60 font-semibold block uppercase">End-Customer Name:</span>
                <span className="font-bold text-sm text-base-content">
                  {selectedOrder.customerName || selectedOrder.customer?.name || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 font-semibold block uppercase">Phone Number:</span>
                <span className="font-bold text-sm text-base-content">
                  {selectedOrder.customerPhone || selectedOrder.customer?.phone || "N/A"}
                  {selectedOrder.customerSecondaryPhone && (
                    <span className="block text-xs font-normal text-base-content/60">
                      Sec: {selectedOrder.customerSecondaryPhone}
                    </span>
                  )}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 font-semibold block uppercase">District & Thana:</span>
                <span className="font-bold text-xs text-base-content">
                  {selectedOrder.customerDistrict || "N/A"} / {selectedOrder.customerThana || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 font-semibold block uppercase">Advance Courier Received:</span>
                {selectedOrder.isAdvanceCourierPaid ? (
                  <span className="font-bold text-xs text-success flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={12} /> Yes (৳{Number(selectedOrder.advanceCourierAmount || 0).toLocaleString()} taken)
                  </span>
                ) : (
                  <span className="font-bold text-xs text-base-content/50 mt-0.5 block">
                    No Advance Received
                  </span>
                )}
              </div>
              <div className="sm:col-span-2">
                <span className="text-base-content/60 font-semibold block uppercase">Delivery Address:</span>
                <span className="font-medium text-base-content">
                  {selectedOrder.shippingAddress || "N/A"}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-base-content/70">
                Ordered Items ({selectedOrder.orderItems.length})
              </h4>
              <div className="divide-y divide-base-200 border border-base-200 rounded-xl overflow-hidden">
                {selectedOrder.orderItems.map((item) => (
                  <div key={item.id} className="p-3 bg-base-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-base-content">{item.product?.name}</p>
                      <p className="text-base-content/60">
                        Qty: {item.quantity} | Size: {item.productSize?.size?.name || "N/A"} | Color: {item.productColor?.color?.name || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base-content">
                        Sell Price: ৳{(item.resellerSellingPrice || item.snapshotPrice).toLocaleString()}
                      </p>
                      <p className="text-base-content/50">
                        Cost: ৳{(item.resellerUnitCost || item.snapshotPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profit Summary Block */}
            <div className="p-3.5 bg-base-200/60 rounded-xl flex items-center justify-between text-xs font-bold border border-base-300">
              <span className="text-base-content/70">Calculated Reseller Profit:</span>
              {selectedOrder.processingStatus === "DELIVERED" && selectedOrder.paymentStatus === "PAID" ? (
                <span className="text-emerald-600 font-extrabold text-sm">
                  +৳{Number(selectedOrder.resellerProfit || 0).toLocaleString()} (Earned)
                </span>
              ) : (
                <span className="text-amber-600 font-extrabold text-sm">
                  ৳{Number(selectedOrder.resellerProfit || 0).toLocaleString()} (Pending Delivery & Payment)
                </span>
              )}
            </div>

            {/* Optional Notes */}
            {selectedOrder.notes && (
              <div className="p-3 bg-base-200/60 rounded-xl text-xs space-y-1">
                <span className="font-bold text-base-content/70 block">Optional Reseller Notes:</span>
                <p className="text-base-content">{selectedOrder.notes}</p>
              </div>
            )}

            <div className="modal-action">
              <button className="btn btn-primary btn-sm" onClick={closeOrderDetails}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
