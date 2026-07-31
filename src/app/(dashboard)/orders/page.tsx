"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ShoppingBag,
  Package,
  RefreshCw,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  CreditCard,
  User,
  MapPin,
  Calendar,
  DollarSign,
  Ruler,
  AlertTriangle,
  FileText,
  SlidersHorizontal,
  Phone,
  Mail,
  ShieldAlert,
  Save,
  X,
} from "lucide-react";
import {
  orderApi,
  Order,
  OrderProcessingStatus,
  PaymentStatus,
} from "@/services/order.api";
import { useAuthStore } from "@/store/useAuthStore";

export default function OrdersPage() {
  const { user } = useAuthStore();
  const isStaff = ["SUPER_ADMIN", "ADMIN", "MANAGER", "SALES_EXECUTIVE"].includes(
    user?.role || ""
  );

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  // Filters State
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedProcessingStatus, setSelectedProcessingStatus] = useState<string>("ALL");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("ALL");

  // Selected Order Drawer State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [pendingProcessingStatus, setPendingProcessingStatus] = useState<OrderProcessingStatus>("PENDING");
  const [pendingPaymentStatus, setPendingPaymentStatus] = useState<PaymentStatus>("DUE");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrders(
        page,
        limit,
        searchQuery || undefined,
        selectedProcessingStatus !== "ALL"
          ? (selectedProcessingStatus as OrderProcessingStatus)
          : undefined,
        selectedPaymentStatus !== "ALL"
          ? (selectedPaymentStatus as PaymentStatus)
          : undefined
      );
      setOrders(res.data || []);
      setMeta({
        total: res.meta?.total || 0,
        totalPages: res.meta?.totalPages || 1,
      });
    } catch (err) {
      console.error("Failed to fetch admin orders:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, selectedProcessingStatus, selectedPaymentStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Sync state when drawer opens
  useEffect(() => {
    if (selectedOrder) {
      setPendingProcessingStatus(selectedOrder.processingStatus);
      setPendingPaymentStatus(selectedOrder.paymentStatus);
      setUpdateSuccessMsg(null);
    }
  }, [selectedOrder]);

  // Compute KPI Header Metrics
  const kpiMetrics = useMemo(() => {
    const totalOrdersCount = meta.total || orders.length;
    const pendingOrdersCount = orders.filter(
      (o) => o.processingStatus === "PENDING"
    ).length;

    const totalRevenue = orders.reduce((sum, o) => {
      return o.paymentStatus === "PAID" ? sum + Number(o.total) : sum;
    }, 0);

    const outstandingDue = orders.reduce((sum, o) => {
      return o.paymentStatus === "DUE" ? sum + Number(o.total) : sum;
    }, 0);

    return {
      totalOrdersCount,
      pendingOrdersCount,
      totalRevenue,
      outstandingDue,
    };
  }, [orders, meta.total]);

  // Save Status Handler
  const handleSaveStatusUpdate = async () => {
    if (!selectedOrder) return;
    try {
      setIsUpdatingStatus(true);
      const updated = await orderApi.updateOrderStatus(selectedOrder.id, {
        processingStatus: pendingProcessingStatus,
        paymentStatus: pendingPaymentStatus,
      });
      setSelectedOrder(updated);
      setUpdateSuccessMsg("Order status & inventory successfully synchronized!");
      fetchOrders();
    } catch (err: any) {
      console.error("Failed to update order status:", err);
      alert(err?.response?.data?.message || "Failed to update order status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isRestockSelection =
    pendingProcessingStatus === "CANCELLED" || pendingProcessingStatus === "RETURNED";

  const renderProcessingBadge = (status: OrderProcessingStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="badge badge-warning text-slate-900 font-bold text-xs gap-1 py-2 px-3">
            <Clock size={12} /> Pending
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="badge badge-info text-white font-bold text-xs gap-1 py-2 px-3">
            <CheckCircle2 size={12} /> Confirmed
          </span>
        );
      case "PROCESSING":
        return (
          <span className="badge badge-primary text-white font-bold text-xs gap-1 py-2 px-3">
            <RefreshCw size={12} className="animate-spin" /> Processing
          </span>
        );
      case "SHIPPED":
        return (
          <span className="badge badge-accent text-white font-bold text-xs gap-1 py-2 px-3">
            <Truck size={12} /> Shipped
          </span>
        );
      case "DELIVERED":
        return (
          <span className="badge badge-success text-white font-bold text-xs gap-1 py-2 px-3">
            <CheckCircle2 size={12} /> Delivered
          </span>
        );
      case "CANCELLED":
      case "RETURNED":
        return (
          <span className="badge badge-error text-white font-bold text-xs gap-1 py-2 px-3">
            <XCircle size={12} /> {status}
          </span>
        );
      default:
        return <span className="badge text-xs">{status}</span>;
    }
  };

  const renderPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return (
          <span className="badge badge-success text-white font-bold text-xs py-1.5 px-2.5">
            PAID
          </span>
        );
      case "DUE":
        return (
          <span className="badge badge-warning text-slate-900 font-bold text-xs py-1.5 px-2.5">
            DUE
          </span>
        );
      case "PARTIAL":
        return (
          <span className="badge badge-info text-white font-bold text-xs py-1.5 px-2.5">
            PARTIAL
          </span>
        );
      default:
        return (
          <span className="badge badge-error text-white font-bold text-xs py-1.5 px-2.5">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-wider uppercase mb-1">
            <SlidersHorizontal size={16} /> Admin & Fulfillment Panel
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Global Orders Management</h1>
          <p className="text-slate-300 text-sm mt-1">
            Manage system orders, update fulfillment statuses, and auto-sync warehouse inventory.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="btn btn-sm btn-ghost text-white border border-slate-700 hover:bg-slate-800 gap-2 rounded-xl"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> Refresh Data
        </button>
      </div>

      {/* KPI Cards Header */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Orders
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {kpiMetrics.totalOrdersCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Orders
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {kpiMetrics.pendingOrdersCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
        </div>

        {/* Total Paid Revenue */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Collected Revenue
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              ৳ {kpiMetrics.totalRevenue.toLocaleString()}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <DollarSign size={22} />
          </div>
        </div>

        {/* Outstanding Due */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Outstanding Due
            </div>
            <div className="text-2xl font-black text-rose-600 mt-1">
              ৳ {kpiMetrics.outstandingDue.toLocaleString()}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <CreditCard size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by Order ID, Customer, Phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="input input-sm input-bordered w-full rounded-2xl pl-9 text-slate-900 text-xs"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Processing Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Filter size={14} /> Processing:
            <select
              value={selectedProcessingStatus}
              onChange={(e) => {
                setSelectedProcessingStatus(e.target.value);
                setPage(1);
              }}
              className="select select-xs select-bordered bg-white text-slate-900 font-bold rounded-xl"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">PENDING</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="RETURNED">RETURNED</option>
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <CreditCard size={14} /> Payment:
            <select
              value={selectedPaymentStatus}
              onChange={(e) => {
                setSelectedPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="select select-xs select-bordered bg-white text-slate-900 font-bold rounded-xl"
            >
              <option value="ALL">All Payments</option>
              <option value="DUE">DUE</option>
              <option value="PAID">PAID</option>
              <option value="PARTIAL">PARTIAL</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShoppingBag size={48} className="mx-auto mb-3 opacity-60" />
            <p className="text-lg font-bold text-slate-700">No Orders Found</p>
            <p className="text-xs text-slate-500 mt-1">No orders matching your search & filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4">Order ID</th>
                  <th>Customer Info</th>
                  <th>Order Date</th>
                  <th>Items</th>
                  <th>Processing Status</th>
                  <th>Payment Status</th>
                  <th>Total Amount</th>
                  <th>Processor</th>
                  <th className="text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="font-mono font-bold text-indigo-600 text-xs py-4">
                      #{ord.id.substring(0, 8).toUpperCase()}
                    </td>
                    <td>
                      <div className="font-bold text-slate-900 text-sm">
                        {ord.customer?.name || "Customer"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {ord.customer?.phone || ord.customer?.email}
                      </div>
                    </td>
                    <td className="text-xs text-slate-500 font-medium">
                      {new Date(ord.createdAt).toLocaleDateString()}
                    </td>
                    <td className="font-bold text-slate-700 text-center">
                      {ord.orderItems?.length || 0}
                    </td>
                    <td>{renderProcessingBadge(ord.processingStatus)}</td>
                    <td>{renderPaymentBadge(ord.paymentStatus)}</td>
                    <td className="font-black text-slate-900">
                      ৳ {Number(ord.total).toLocaleString()}
                    </td>
                    <td className="text-xs font-mono text-slate-500">
                      {ord.orderProcessedBy ? `#${ord.orderProcessedBy.substring(0, 6)}` : "—"}
                    </td>
                    <td className="text-right pr-6">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="btn btn-xs btn-primary gap-1 rounded-lg font-bold"
                      >
                        <Eye size={14} /> Manage Order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-medium text-slate-500">
              Page {page} of {meta.totalPages} ({meta.total} total orders)
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

      {/* ─── SLIDE-OVER ORDER FULFILLMENT DRAWER / MODAL ──────────────── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          {/* Backdrop Click */}
          <div
            className="fixed inset-0 cursor-pointer"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden text-slate-800">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <ShoppingBag size={16} /> Fulfillment Drawer
                </div>
                <h3 className="text-xl font-extrabold tracking-tight mt-0.5">
                  Order #{selectedOrder.id.substring(0, 8).toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {updateSuccessMsg && (
                <div className="alert alert-success text-white text-xs font-bold rounded-2xl flex items-center gap-2">
                  <CheckCircle2 size={16} /> {updateSuccessMsg}
                </div>
              )}

              {/* Customer Details Box */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-primary" /> Customer Profile & Shipping
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {selectedOrder.customer?.name || "Customer"}
                    </div>
                    <div className="text-slate-500 mt-0.5 flex items-center gap-1">
                      <Mail size={12} /> {selectedOrder.customer?.email || "N/A"}
                    </div>
                    <div className="text-slate-500 mt-0.5 flex items-center gap-1">
                      <Phone size={12} /> {selectedOrder.customer?.phone || "N/A"}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-slate-700 flex items-center gap-1">
                      <MapPin size={12} className="text-rose-500" /> Delivery Address:
                    </div>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {selectedOrder.shippingAddress || "Standard Address"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive Status Management */}
              <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 space-y-4">
                <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal size={14} className="text-indigo-600" /> Status Management & Controls
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Processing Status Select */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Processing Status
                    </label>
                    <select
                      value={pendingProcessingStatus}
                      onChange={(e) =>
                        setPendingProcessingStatus(e.target.value as OrderProcessingStatus)
                      }
                      className="select select-sm select-bordered w-full bg-white text-slate-900 font-bold rounded-xl"
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="RETURNED">RETURNED</option>
                    </select>
                  </div>

                  {/* Payment Status Select */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Payment Status
                    </label>
                    <select
                      value={pendingPaymentStatus}
                      onChange={(e) =>
                        setPendingPaymentStatus(e.target.value as PaymentStatus)
                      }
                      className="select select-sm select-bordered w-full bg-white text-slate-900 font-bold rounded-xl"
                    >
                      <option value="DUE">DUE</option>
                      <option value="PAID">PAID</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Automatic Inventory Sync Warning */}
                {isRestockSelection && (
                  <div className="alert alert-warning text-slate-900 text-xs font-bold rounded-xl p-3 flex items-start gap-2.5 border border-amber-300">
                    <ShieldAlert size={18} className="shrink-0 text-amber-700 mt-0.5" />
                    <div>
                      <span className="font-extrabold uppercase tracking-wide text-[11px] text-amber-900 block">
                        Automatic Inventory Sync Warning
                      </span>
                      Warning: Updating status to {pendingProcessingStatus} will automatically restore product quantities back to warehouse inventory.
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSaveStatusUpdate}
                  disabled={isUpdatingStatus}
                  className="btn btn-primary btn-sm w-full text-white font-bold rounded-xl gap-2 mt-2"
                >
                  {isUpdatingStatus ? (
                    <>
                      <span className="loading loading-spinner loading-xs"></span> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Status & Sync Inventory
                    </>
                  )}
                </button>
              </div>

              {/* Order Items Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Order Items ({selectedOrder.orderItems?.length || 0})
                </h4>
                <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {selectedOrder.orderItems?.map((item) => (
                    <div key={item.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          <img
                            src={item.product?.images?.[0]?.imageUrl || "/placeholder.png"}
                            alt={item.product?.name || "Product"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">
                            {item.product?.name || "Product"}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {item.productSize?.size?.name && <span>Size: {item.productSize.size.name}</span>}
                            {item.productColor?.color?.name && (
                              <span className="flex items-center gap-1">
                                Color: <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.productColor.color.colorCode }} />
                                {item.productColor.color.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-semibold text-slate-600">
                          Qty: {item.quantity} × ৳{Number(item.snapshotPrice).toLocaleString()}
                        </div>
                        <div className="text-xs font-extrabold text-slate-900">
                          ৳{Number(item.subtotal).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Audit Trail */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-right text-xs">
                <div className="text-slate-600">
                  Subtotal: <span className="font-bold text-slate-900">৳ {Number(selectedOrder.subtotal).toLocaleString()}</span>
                </div>
                <div className="text-slate-600">
                  Courier Charge: <span className="font-bold text-slate-900">+৳ {Number(selectedOrder.courierCharge).toLocaleString()}</span>
                </div>
                {Number(selectedOrder.discount) > 0 && (
                  <div className="text-emerald-600 font-semibold">
                    Discount: <span>-৳ {Number(selectedOrder.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  Grand Total: <span className="text-primary">৳ {Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>

              {/* Audit Log Box */}
              <div className="text-[11px] text-slate-400 bg-slate-100 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>
                  Audit Processor: <strong className="text-slate-700 font-mono">{selectedOrder.orderProcessedBy || "System Auto-Created"}</strong>
                </span>
                <span>Created: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
