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
import { orderApi, Order, OrderProcessingStatus } from "@/services/order.api";
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
  const [isSyncingCourier, setIsSyncingCourier] = useState<boolean>(false);
  const [copiedTrackingCode, setCopiedTrackingCode] = useState<string | null>(null);
  const [courierSyncMsg, setCourierSyncMsg] = useState<string | null>(null);

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTrackingCode(code);
    setTimeout(() => setCopiedTrackingCode(null), 2000);
  };

  const handleSyncCourierStatus = async (orderId: string) => {
    try {
      setIsSyncingCourier(true);
      setCourierSyncMsg(null);
      const res = await orderApi.syncCourierStatus(orderId);
      setSelectedOrder(res.order);
      setCourierSyncMsg(`Courier status updated: ${res.deliveryStatus.toUpperCase()}`);
      fetchOrders();
    } catch (err: any) {
      console.error("Failed to sync courier status:", err);
      alert(err?.response?.data?.message || "Failed to sync status with Steadfast.");
    } finally {
      setIsSyncingCourier(false);
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

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      console.error("Failed to load reseller orders:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, selectedStatus, startDate, endDate, customerPhone]);

  useEffect(() => {
    fetchOrders();
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
                          onClick={() => setSelectedOrder(order)}
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
                onClick={() => setSelectedOrder(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Courier Sync Banner */}
            {courierSyncMsg && (
              <div className="alert alert-success text-white text-xs font-bold rounded-xl py-2 flex items-center gap-2">
                <CheckCircle2 size={16} /> {courierSyncMsg}
              </div>
            )}

            {/* Steadfast Courier Tracking Box */}
            {selectedOrder.courierTrackingCode && (
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Truck size={14} /> Steadfast Courier Tracking
                  </h4>
                  {renderCourierBadge(selectedOrder.courierStatus)}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-base-100 p-3 rounded-lg border border-base-200">
                  <div>
                    <span className="text-base-content/60 font-semibold block uppercase text-[10px]">
                      Tracking Code:
                    </span>
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
                  </div>

                  <div>
                    <span className="text-base-content/60 font-semibold block uppercase text-[10px]">
                      Consignment ID:
                    </span>
                    <span className="font-mono font-bold text-sm text-primary mt-0.5 block">
                      #{selectedOrder.courierConsignmentId || "N/A"}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleSyncCourierStatus(selectedOrder.id)}
                  disabled={isSyncingCourier}
                  className="btn btn-xs btn-outline btn-primary rounded-lg font-bold gap-1.5 w-full"
                >
                  {isSyncingCourier ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <RefreshCw size={12} />
                  )}
                  Refresh Live Delivery Status
                </button>
              </div>
            )}

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
              <button className="btn btn-primary btn-sm" onClick={() => setSelectedOrder(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
