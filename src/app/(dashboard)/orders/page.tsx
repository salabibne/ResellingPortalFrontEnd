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
  FileSpreadsheet,
  Send,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  orderApi,
  Order,
  OrderProcessingStatus,
  PaymentStatus,
} from "@/services/order.api";
import { useAuthStore } from "@/store/useAuthStore";
import { exportOrdersToCSV } from "@/utils/csvExporter";


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
  const [selectedOrderType, setSelectedOrderType] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [customerPhoneFilter, setCustomerPhoneFilter] = useState<string>("");
  const [exporting, setExporting] = useState<boolean>(false);

  // Bulk Selection & Courier State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [isBulkCourierModalOpen, setIsBulkCourierModalOpen] = useState<boolean>(false);
  const [bulkCourierDeliveryType, setBulkCourierDeliveryType] = useState<number>(0);
  const [isBulkSendingCourier, setIsBulkSendingCourier] = useState<boolean>(false);

  // Single Order Courier State inside Drawer
  const [courierDeliveryType, setCourierDeliveryType] = useState<number>(0);
  const [courierCustomCod, setCourierCustomCod] = useState<string>("");
  const [courierNote, setCourierNote] = useState<string>("");
  const [isSendingCourier, setIsSendingCourier] = useState<boolean>(false);
  const [isSyncingCourier, setIsSyncingCourier] = useState<boolean>(false);
  const [courierActionMsg, setCourierActionMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copiedTrackingCode, setCopiedTrackingCode] = useState<string | null>(null);

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const data = await orderApi.exportOrders(
        searchQuery || undefined,
        selectedProcessingStatus !== "ALL"
          ? (selectedProcessingStatus as OrderProcessingStatus)
          : undefined,
        selectedPaymentStatus !== "ALL"
          ? (selectedPaymentStatus as PaymentStatus)
          : undefined,
        selectedOrderType === "RESELLER",
        startDate || undefined,
        endDate || undefined,
        customerPhoneFilter || undefined
      );
      exportOrdersToCSV(data, "admin_orders_export");
    } catch (err) {
      console.error("Failed to export orders CSV:", err);
      alert("Failed to export CSV. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // Courier Policy Modal State
  const [isCourierModalOpen, setIsCourierModalOpen] = useState<boolean>(false);
  const [courierPolicyTitle, setCourierPolicyTitle] = useState<string>("Courier Charge Policy");
  const [courierPolicyText, setCourierPolicyText] = useState<string>("");
  const [courierDefaultCharge, setCourierDefaultCharge] = useState<number>(120);
  const [savingCourierPolicy, setSavingCourierPolicy] = useState<boolean>(false);

  const fetchCourierPolicy = async () => {
    try {
      const res = await orderApi.getCourierPolicy();
      if (res) {
        setCourierPolicyTitle(res.title || "Courier Charge Policy");
        setCourierPolicyText(res.chargeText || "");
        setCourierDefaultCharge(res.defaultCharge || 120);
      }
    } catch (err) {
      console.error("Failed to load courier policy:", err);
    }
  };

  const handleSaveCourierPolicy = async () => {
    try {
      setSavingCourierPolicy(true);
      await orderApi.updateCourierPolicy({
        title: courierPolicyTitle,
        chargeText: courierPolicyText,
        defaultCharge: Number(courierDefaultCharge || 120),
      });
      setIsCourierModalOpen(false);
    } catch (err) {
      console.error("Failed to save courier policy:", err);
    } finally {
      setSavingCourierPolicy(false);
    }
  };

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
          : undefined,
        selectedOrderType === "RESELLER",
        startDate || undefined,
        endDate || undefined,
        customerPhoneFilter || undefined
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
  }, [page, limit, searchQuery, selectedProcessingStatus, selectedPaymentStatus, selectedOrderType, startDate, endDate, customerPhoneFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Sync state when drawer opens
  useEffect(() => {
    if (selectedOrder) {
      setPendingProcessingStatus(selectedOrder.processingStatus);
      setPendingPaymentStatus(selectedOrder.paymentStatus);
      setUpdateSuccessMsg(null);
      setCourierActionMsg(null);
      setCourierDeliveryType(selectedOrder.courierDeliveryType || 0);
      setCourierNote(selectedOrder.courierNotes || "");

      // Precalculate default COD
      let defaultCod = Number(selectedOrder.total || 0);
      if (selectedOrder.isResellerOrder && selectedOrder.resellerSellPrice) {
        defaultCod = Number(selectedOrder.resellerSellPrice) + Number(selectedOrder.courierCharge || 0);
      }
      if (selectedOrder.isAdvanceCourierPaid && selectedOrder.advanceCourierAmount) {
        defaultCod -= Number(selectedOrder.advanceCourierAmount);
      }
      if (selectedOrder.paymentStatus === "PAID") {
        defaultCod = 0;
      }
      setCourierCustomCod(Math.max(0, Math.round(defaultCod)).toString());
    }
  }, [selectedOrder]);

  const handleCopyTracking = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTrackingCode(code);
    setTimeout(() => setCopiedTrackingCode(null), 2000);
  };

  const handleSendOrderToCourier = async () => {
    if (!selectedOrder) return;
    try {
      setIsSendingCourier(true);
      setCourierActionMsg(null);
      const res = await orderApi.sendToCourier(selectedOrder.id, {
        deliveryType: Number(courierDeliveryType),
        note: courierNote || undefined,
        codAmount: courierCustomCod !== "" ? Number(courierCustomCod) : undefined,
      });
      setSelectedOrder(res.order);
      setCourierActionMsg({
        type: "success",
        text: `Placed with Steadfast! Consignment #${res.consignment?.consignment_id || res.order.courierConsignmentId}, Tracking Code: ${res.consignment?.tracking_code || res.order.courierTrackingCode}`,
      });
      fetchOrders();
    } catch (err: any) {
      console.error("Failed to send order to Steadfast:", err);
      setCourierActionMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to place order with Steadfast Courier.",
      });
    } finally {
      setIsSendingCourier(false);
    }
  };

  const handleSyncCourierStatus = async () => {
    if (!selectedOrder) return;
    try {
      setIsSyncingCourier(true);
      setCourierActionMsg(null);
      const res = await orderApi.syncCourierStatus(selectedOrder.id);
      setSelectedOrder(res.order);
      setCourierActionMsg({
        type: "success",
        text: `Live status synced from Steadfast: ${res.deliveryStatus.toUpperCase()}`,
      });
      fetchOrders();
    } catch (err: any) {
      console.error("Failed to sync courier status:", err);
      setCourierActionMsg({
        type: "error",
        text: err?.response?.data?.message || "Failed to sync status from Steadfast Courier.",
      });
    } finally {
      setIsSyncingCourier(false);
    }
  };

  const handleBulkSendToCourier = async () => {
    if (selectedOrderIds.length === 0) return;
    try {
      setIsBulkSendingCourier(true);
      const res = await orderApi.bulkSendToCourier({
        orderIds: selectedOrderIds,
        deliveryType: bulkCourierDeliveryType,
      });
      alert(res.message);
      setIsBulkCourierModalOpen(false);
      setSelectedOrderIds([]);
      fetchOrders();
    } catch (err: any) {
      console.error("Bulk courier failed:", err);
      alert(err?.response?.data?.message || "Bulk courier submission failed.");
    } finally {
      setIsBulkSendingCourier(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrderIds.length === orders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(orders.map((o) => o.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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
      case "PARTIAL":
        return (
          <span className="badge badge-warning text-slate-900 font-bold text-xs py-1.5 px-2.5">
            PARTIAL
          </span>
        );
      case "CANCELLED":
        return (
          <span className="badge badge-error text-white font-bold text-xs py-1.5 px-2.5">
            CANCELLED
          </span>
        );
      default:
        return (
          <span className="badge badge-ghost font-bold text-xs py-1.5 px-2.5">
            DUE
          </span>
        );
    }
  };

  const renderCourierBadge = (status?: string | null) => {
    if (!status) return null;
    const s = status.toLowerCase();
    switch (s) {
      case "delivered":
        return (
          <span className="badge badge-success text-white font-extrabold text-[10px] uppercase py-1.5 px-2 gap-1">
            <Check size={10} /> Delivered
          </span>
        );
      case "in_review":
        return (
          <span className="badge badge-warning text-slate-900 font-bold text-[10px] uppercase py-1.5 px-2 gap-1">
            <Clock size={10} /> In Review
          </span>
        );
      case "pending":
      case "in_transit":
        return (
          <span className="badge badge-info text-white font-bold text-[10px] uppercase py-1.5 px-2 gap-1">
            <Truck size={10} /> In Transit
          </span>
        );
      case "cancelled":
        return (
          <span className="badge badge-error text-white font-bold text-[10px] uppercase py-1.5 px-2 gap-1">
            <X size={10} /> Courier Cancelled
          </span>
        );
      case "hold":
        return (
          <span className="badge badge-warning text-white font-bold text-[10px] uppercase py-1.5 px-2 gap-1">
            <AlertTriangle size={10} /> On Hold
          </span>
        );
      case "delivered_approval_pending":
        return (
          <span className="badge badge-accent text-white font-bold text-[10px] uppercase py-1.5 px-2 gap-1">
            <CheckCircle2 size={10} /> Deliv. Pending Appr.
          </span>
        );
      default:
        return (
          <span className="badge badge-neutral text-white font-semibold text-[10px] uppercase py-1.5 px-2">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="text-primary" /> Order & Fulfillment Management
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage customer & reseller orders, track payments, update delivery status, and trigger stock restocks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportCSV}
            disabled={exporting}
            className="btn btn-sm btn-success text-white rounded-xl font-bold gap-2"
          >
            {exporting ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={14} />
            )}
            Export CSV
          </button>
          <button
            onClick={fetchOrders}
            className="btn btn-sm btn-outline rounded-xl font-bold gap-2"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

      </div>

      {/* KPI Cards */}
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
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search by Order Ref, Name, Address..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="input input-sm input-bordered w-full rounded-2xl pl-9 text-slate-900 text-xs"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Date Range Filter */}
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

          {/* Customer Mobile Filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Phone size={14} className="text-primary" /> Mobile:
            <input
              type="text"
              placeholder="Customer Phone..."
              value={customerPhoneFilter}
              onChange={(e) => {
                setCustomerPhoneFilter(e.target.value);
                setPage(1);
              }}
              className="input input-xs input-bordered bg-white text-slate-900 font-bold rounded-xl w-36"
            />
          </div>

          {/* Order Type Filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
            <Package size={14} /> Type:
            <select
              value={selectedOrderType}
              onChange={(e) => {
                setSelectedOrderType(e.target.value);
                setPage(1);
              }}
              className="select select-xs select-bordered bg-white text-slate-900 font-bold rounded-xl"
            >
              <option value="ALL">All Order Types</option>
              <option value="RESELLER">Reseller Orders</option>
              <option value="CUSTOMER">Direct Customer</option>
            </select>
          </div>

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

          {/* Edit Courier Policy Button */}
          <button
            type="button"
            className="btn btn-xs btn-outline btn-primary rounded-xl font-bold gap-1"
            onClick={() => {
              fetchCourierPolicy();
              setIsCourierModalOpen(true);
            }}
          >
            <SlidersHorizontal size={12} /> Edit Courier Policy
          </button>

          {(searchQuery || selectedProcessingStatus !== "ALL" || selectedPaymentStatus !== "ALL" || selectedOrderType !== "ALL" || startDate || endDate || customerPhoneFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedProcessingStatus("ALL");
                setSelectedPaymentStatus("ALL");
                setSelectedOrderType("ALL");
                setStartDate("");
                setEndDate("");
                setCustomerPhoneFilter("");
                setPage(1);
              }}
              className="btn btn-xs btn-ghost text-rose-600 font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>


      {/* Bulk Courier Dispatch Floating Bar */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white px-6 py-3.5 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-xl border border-indigo-500/30">
          <div className="flex items-center gap-3 text-sm font-bold">
            <span className="badge badge-primary text-white font-black px-2.5 py-1 text-xs">
              {selectedOrderIds.length}
            </span>
            <span>Orders selected for batch processing</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkCourierModalOpen(true)}
              className="btn btn-sm btn-primary text-white font-extrabold rounded-xl gap-2 shadow-md hover:shadow-indigo-500/20"
            >
              <Send size={14} /> Send to Steadfast Courier ({selectedOrderIds.length})
            </button>
            <button
              onClick={() => setSelectedOrderIds([])}
              className="btn btn-sm btn-ghost text-white/70 hover:text-white rounded-xl text-xs"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

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
                  <th className="py-4 pl-6 w-10">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary rounded-md"
                      checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Order Ref</th>
                  <th>Order Type</th>
                  <th>Customer Info</th>
                  <th>Steadfast Courier</th>
                  <th>Order Date</th>
                  <th>Processing Status</th>
                  <th>Payment Status</th>
                  <th>Total Bill</th>
                  <th className="text-right pr-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {orders.map((ord) => {
                  const isReseller = ord.isResellerOrder || ord.customer?.role === "RESELLER";
                  const customerName = ord.customerName || ord.customer?.name || "Customer";
                  const customerPhone = ord.customerPhone || ord.customer?.phone || "N/A";
                  const displayRef = ord.orderRef || `#${ord.id.substring(0, 8).toUpperCase()}`;

                  const sellSubtotalVal = Number(
                    isReseller ? ord.resellerSellPrice || ord.total || 0 : ord.subtotal || ord.total || 0
                  );
                  const courierVal = Number(ord.courierCharge || 0);
                  const totalBillVal = isReseller
                    ? sellSubtotalVal + (ord.isAdvanceCourierPaid ? 0 : courierVal)
                    : Number(ord.total || 0);

                  const isSelected = selectedOrderIds.includes(ord.id);

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isSelected ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <td className="pl-6 py-4">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm checkbox-primary rounded-md"
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(ord.id)}
                        />
                      </td>
                      <td className="font-mono font-bold text-indigo-600 text-xs">
                        {displayRef}
                      </td>
                      <td>
                        {isReseller ? (
                          <span className="badge badge-primary text-white font-extrabold text-[10px] uppercase py-2 px-2.5">
                            Reseller Order
                          </span>
                        ) : (
                          <span className="badge badge-ghost text-slate-600 font-semibold text-[10px] uppercase py-2 px-2.5">
                            Direct Customer
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="font-bold text-slate-900 text-sm">
                          {customerName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {customerPhone}
                        </div>
                        {isReseller && ord.reseller && (
                          <div className="text-[10px] text-primary font-semibold mt-0.5">
                            Via Reseller: {ord.reseller.name} ({ord.reseller.phone})
                          </div>
                        )}
                      </td>
                      <td>
                        {ord.courierTrackingCode ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-mono text-xs font-black text-slate-900">
                              <Truck size={12} className="text-primary" />
                              <span>{ord.courierTrackingCode}</span>
                            </div>
                            <div>{renderCourierBadge(ord.courierStatus)}</div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">
                            Not dispatched
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-slate-500 font-medium">
                        <div className="font-semibold text-slate-700">{new Date(ord.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                      </td>

                      <td>{renderProcessingBadge(ord.processingStatus)}</td>
                      <td>{renderPaymentBadge(ord.paymentStatus)}</td>
                      <td className="font-black text-indigo-950 text-sm">
                        ৳{totalBillVal.toLocaleString()}
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
                  {selectedOrder.isResellerOrder && (
                    <span className="badge badge-primary text-white text-[10px] ml-2">RESELLER ORDER</span>
                  )}
                </div>
                <h3 className="text-xl font-extrabold tracking-tight mt-0.5">
                  Order {selectedOrder.orderRef || `#${selectedOrder.id.substring(0, 8).toUpperCase()}`}
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

              {/* Reseller Info Box (If Reseller Order) */}
              {selectedOrder.isResellerOrder && (
                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/20 space-y-2">
                  <h4 className="text-xs font-extrabold text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <User size={14} /> Reseller Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Name:</span>{" "}
                      <strong className="text-slate-900">{selectedOrder.reseller?.name || selectedOrder.customer?.name || "Reseller"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Phone:</span>{" "}
                      <strong className="text-slate-900">{selectedOrder.reseller?.phone || selectedOrder.customer?.phone || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Email:</span>{" "}
                      <strong className="text-slate-900">{selectedOrder.reseller?.email || selectedOrder.customer?.email || "N/A"}</strong>
                    </div>
                    {selectedOrder.reseller?.pageName && (
                      <div>
                        <span className="text-slate-500 font-medium">Page Name:</span>{" "}
                        <strong className="text-primary">{selectedOrder.reseller.pageName}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* End Customer Profile & Shipping Details */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-primary" /> End-Customer Profile & Shipping
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="font-extrabold text-slate-900 text-sm">
                      {selectedOrder.customerName || selectedOrder.customer?.name || "Customer"}
                    </div>
                    <div className="text-slate-500 mt-0.5 flex items-center gap-1">
                      <Phone size={12} /> {selectedOrder.customerPhone || selectedOrder.customer?.phone || "N/A"}
                    </div>
                    {selectedOrder.customerSecondaryPhone && (
                      <div className="text-slate-500 mt-0.5 flex items-center gap-1">
                        <Phone size={12} /> Sec: {selectedOrder.customerSecondaryPhone}
                      </div>
                    )}
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

                {/* Advance Courier Status */}
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-600">Advance Courier Charge Received:</span>
                  {selectedOrder.isAdvanceCourierPaid ? (
                    <span className="badge badge-success text-white font-bold text-[11px] gap-1">
                      <CheckCircle2 size={12} /> Yes (Received)
                    </span>
                  ) : (
                    <span className="badge badge-ghost text-slate-500 font-bold text-[11px]">
                      No (Not Received)
                    </span>
                  )}
                </div>

                {/* Optional Reseller Notes */}
                {selectedOrder.notes && (
                  <div className="pt-2 border-t border-slate-200 text-xs">
                    <span className="font-bold text-slate-500 flex items-center gap-1">
                      <FileText size={12} /> Optional Reseller Notes:
                    </span>
                    <p className="text-slate-700 font-medium mt-1 bg-white p-2 rounded-lg border border-slate-200">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Steadfast Courier Logistics Integration */}
              <div className="bg-gradient-to-br from-indigo-900/5 via-blue-900/5 to-slate-50 p-5 rounded-2xl border border-indigo-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck size={15} className="text-primary" /> Steadfast Courier Service
                  </h4>
                  {selectedOrder.courierStatus && (
                    <div>{renderCourierBadge(selectedOrder.courierStatus)}</div>
                  )}
                </div>

                {courierActionMsg && (
                  <div
                    className={`alert text-xs font-bold rounded-xl p-3 flex items-center gap-2 ${
                      courierActionMsg.type === "success"
                        ? "alert-success text-white"
                        : "alert-error text-white"
                    }`}
                  >
                    {courierActionMsg.type === "success" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                    <span>{courierActionMsg.text}</span>
                  </div>
                )}

                {selectedOrder.courierTrackingCode || selectedOrder.courierConsignmentId ? (
                  /* Already Dispatched to Courier */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-indigo-100/80 shadow-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          Tracking Code
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-sm font-black text-slate-900">
                            {selectedOrder.courierTrackingCode || "N/A"}
                          </span>
                          {selectedOrder.courierTrackingCode && (
                            <button
                              type="button"
                              onClick={() => handleCopyTracking(selectedOrder.courierTrackingCode!)}
                              className="btn btn-ghost btn-xs text-primary px-1.5 rounded-lg"
                              title="Copy Tracking Code"
                            >
                              {copiedTrackingCode === selectedOrder.courierTrackingCode ? (
                                <Check size={13} className="text-success" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          Consignment ID
                        </span>
                        <div className="font-mono text-sm font-black text-indigo-700 mt-0.5">
                          #{selectedOrder.courierConsignmentId || "N/A"}
                        </div>
                      </div>

                      {selectedOrder.courierSubmittedAt && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                            Dispatched At
                          </span>
                          <span className="text-xs text-slate-700 font-medium">
                            {new Date(selectedOrder.courierSubmittedAt).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {selectedOrder.courierLastSyncedAt && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                            Last Synced
                          </span>
                          <span className="text-xs text-slate-700 font-medium">
                            {new Date(selectedOrder.courierLastSyncedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={handleSyncCourierStatus}
                        disabled={isSyncingCourier}
                        className="btn btn-sm btn-outline btn-primary rounded-xl font-bold gap-2 flex-1 shadow-xs"
                      >
                        {isSyncingCourier ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        Sync Live Courier Status
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Not yet placed with Courier */
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Delivery Option
                        </label>
                        <select
                          value={courierDeliveryType}
                          onChange={(e) => setCourierDeliveryType(Number(e.target.value))}
                          className="select select-sm select-bordered w-full bg-white text-slate-900 font-bold rounded-xl"
                        >
                          <option value={0}>Home Delivery (0)</option>
                          <option value={1}>Point Delivery / Hub Pick Up (1)</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-slate-700">
                          Collect COD Amount (৳)
                        </label>
                        <input
                          type="number"
                          value={courierCustomCod}
                          onChange={(e) => setCourierCustomCod(e.target.value)}
                          placeholder="COD Amount"
                          className="input input-sm input-bordered w-full bg-white text-slate-900 font-bold rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700">
                        Delivery Instructions / Note (Optional)
                      </label>
                      <input
                        type="text"
                        value={courierNote}
                        onChange={(e) => setCourierNote(e.target.value)}
                        placeholder="e.g. Deliver before 4 PM, call on arrival"
                        className="input input-sm input-bordered w-full bg-white text-slate-900 rounded-xl"
                      />
                    </div>

                    <button
                      onClick={handleSendOrderToCourier}
                      disabled={isSendingCourier}
                      className="btn btn-sm btn-primary w-full text-white font-extrabold rounded-xl gap-2 shadow-md hover:shadow-indigo-500/20 mt-1"
                    >
                      {isSendingCourier ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Placing with Steadfast...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Place Order to Steadfast Courier
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {/* Interactive Status Management */}
              <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 space-y-4">
                <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={14} className="text-indigo-600" /> Status Management
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Processing Status</label>
                    <select
                      value={pendingProcessingStatus}
                      onChange={(e) => setPendingProcessingStatus(e.target.value as OrderProcessingStatus)}
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

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">Payment Status</label>
                    <select
                      value={pendingPaymentStatus}
                      onChange={(e) => setPendingPaymentStatus(e.target.value as PaymentStatus)}
                      className="select select-sm select-bordered w-full bg-white text-slate-900 font-bold rounded-xl"
                    >
                      <option value="DUE">DUE</option>
                      <option value="PAID">PAID</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {isRestockSelection && (
                  <div className="alert alert-warning text-slate-900 text-xs font-bold rounded-xl p-3 flex items-start gap-2.5 border border-amber-300">
                    <ShieldAlert size={18} className="shrink-0 text-amber-700 mt-0.5" />
                    <div>
                      <span className="font-extrabold uppercase tracking-wide text-[11px] text-amber-900 block">Automatic Inventory Sync Warning</span>
                      Updating to {pendingProcessingStatus} will restore item quantities back to warehouse inventory.
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSaveStatusUpdate}
                  disabled={isUpdatingStatus}
                  className="btn btn-primary btn-sm w-full text-white font-bold rounded-xl gap-2 mt-2"
                >
                  {isUpdatingStatus ? (
                    <><span className="loading loading-spinner loading-xs"></span> Saving...</>
                  ) : (
                    <><Save size={16} /> Save Status & Sync Inventory</>
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
                          <div className="font-bold text-slate-900 text-xs">{item.product?.name || "Product"}</div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {item.productSize?.size?.name && <span>Size: {item.productSize.size.name}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-xs font-bold text-slate-700">
                          Qty: <span className="font-extrabold text-slate-900">{item.quantity}</span>
                        </div>
                        {selectedOrder.isResellerOrder ? (
                          <>
                            <div className="text-xs font-medium text-slate-600">
                              Wholesale Price: <span className="font-bold text-slate-800">৳{Number(item.resellerUnitCost || item.snapshotPrice).toLocaleString()}</span>
                            </div>
                            <div className="text-xs font-semibold text-indigo-700">
                              Sell Price: <span className="font-extrabold text-indigo-900">৳{Number(item.resellerSellingPrice || item.resellerUnitCost || item.snapshotPrice).toLocaleString()}</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-xs font-semibold text-slate-800">
                            Sell Price: <span className="font-extrabold text-slate-900">৳{Number(item.snapshotPrice).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals & Financial Breakdown */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5 text-right text-xs">
                {selectedOrder.isResellerOrder ? (
                  <>
                    <div className="text-slate-600">
                      Reseller Subtotal:{" "}
                      <span className="font-bold text-slate-900">
                        ৳ {Number(selectedOrder.resellerSellPrice || selectedOrder.total).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Courier Charge:{" "}
                      <span className="font-bold text-slate-900">
                        {selectedOrder.isAdvanceCourierPaid ? (
                          <span className="text-emerald-600">
                            ৳ 0 (Advance courier fee was collected directly by reseller)
                          </span>
                        ) : (
                          `+৳ ${Number(selectedOrder.courierCharge).toLocaleString()}`
                        )}
                      </span>
                    </div>
                    <div className="text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-right space-y-0.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">Reseller Profit Margin:</span>
                        <span className="font-black text-sm text-emerald-700">
                          +৳ {Number(selectedOrder.resellerProfit || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        * Note: Reseller profit is earned by reseller.
                      </div>
                    </div>
                    <div className="text-sm font-black text-slate-900 pt-2 border-t border-slate-200 flex justify-between items-center">
                      <span>Total Bill:</span>
                      <span className="text-primary font-black text-base">
                        ৳ {(
                          Number(selectedOrder.resellerSellPrice || selectedOrder.total) +
                          (selectedOrder.isAdvanceCourierPaid ? 0 : Number(selectedOrder.courierCharge || 0))
                        ).toLocaleString()}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-slate-600">
                      Subtotal:{" "}
                      <span className="font-bold text-slate-900">
                        ৳ {Number(selectedOrder.subtotal).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Courier Charge:{" "}
                      <span className="font-bold text-slate-900">
                        +৳ {Number(selectedOrder.courierCharge).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                      Grand Total:{" "}
                      <span className="text-primary">
                        ৳ {Number(selectedOrder.total).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Audit Log Box */}
              <div className="text-[11px] text-slate-400 bg-slate-100 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <span>
                  Audit Processor: <strong className="text-slate-700 font-mono">{selectedOrder.orderProcessedBy || "System"}</strong>
                </span>
                <span>Created: {new Date(selectedOrder.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Courier Charge Policy Settings Modal */}
      {isCourierModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg bg-white p-6 space-y-4 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <SlidersHorizontal size={18} className="text-primary" />
                <span>Courier Charge Text & Policy Settings</span>
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-circle btn-sm text-slate-400"
                onClick={() => setIsCourierModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Policy Title
                </label>
                <input
                  type="text"
                  className="input input-sm input-bordered w-full rounded-xl text-slate-900 font-bold"
                  value={courierPolicyTitle}
                  onChange={(e) => setCourierPolicyTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Courier Charge Text (Displayed to Resellers)
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Inside Dhaka City: ৳70 | Sub-Urban Dhaka: ৳100 | Outside Dhaka: ৳130. Advance courier fee is collected by reseller if applicable."
                  className="textarea textarea-bordered w-full rounded-xl text-slate-900 text-xs"
                  value={courierPolicyText}
                  onChange={(e) => setCourierPolicyText(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Default Base Courier Charge (৳)
                </label>
                <input
                  type="number"
                  className="input input-sm input-bordered w-full rounded-xl text-slate-900 font-bold"
                  value={courierDefaultCharge}
                  onChange={(e) => setCourierDefaultCharge(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="modal-action border-t border-slate-100 pt-4">
              <button
                type="button"
                className="btn btn-ghost btn-sm font-bold rounded-xl"
                onClick={() => setIsCourierModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm font-bold rounded-xl gap-1"
                disabled={savingCourierPolicy}
                onClick={handleSaveCourierPolicy}
              >
                {savingCourierPolicy ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span> Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Policy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Send to Steadfast Courier Modal */}
      {isBulkCourierModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-white p-6 space-y-4 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Truck size={18} className="text-primary" />
                <span>Bulk Steadfast Dispatch</span>
              </h3>
              <button
                type="button"
                className="btn btn-ghost btn-circle btn-sm text-slate-400"
                onClick={() => setIsBulkCourierModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 space-y-1">
                <div className="font-extrabold text-slate-900 text-sm">
                  {selectedOrderIds.length} Orders Selected
                </div>
                <p className="text-slate-600">
                  These orders will be formatted and transmitted in batch to the Steadfast Courier API. Each valid order will receive an individual Tracking Code & Consignment ID.
                </p>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block font-bold text-slate-700">
                  Bulk Delivery Option
                </label>
                <select
                  value={bulkCourierDeliveryType}
                  onChange={(e) => setBulkCourierDeliveryType(Number(e.target.value))}
                  className="select select-sm select-bordered w-full bg-white text-slate-900 font-bold rounded-xl"
                >
                  <option value={0}>Home Delivery (0)</option>
                  <option value={1}>Point Delivery / Hub Pick Up (1)</option>
                </select>
              </div>
            </div>

            <div className="modal-action border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm font-bold rounded-xl"
                onClick={() => setIsBulkCourierModalOpen(false)}
                disabled={isBulkSendingCourier}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm font-extrabold rounded-xl gap-2 text-white shadow-md hover:shadow-indigo-500/20"
                disabled={isBulkSendingCourier}
                onClick={handleBulkSendToCourier}
              >
                {isBulkSendingCourier ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    Transmitting...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Confirm & Dispatch ({selectedOrderIds.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
