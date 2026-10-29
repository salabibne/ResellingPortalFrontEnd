"use client";

import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelSkeleton from "@/components/panel/PanelSkeleton";
import CourierStatusBadge, {
  COURIER_STATUS_FILTERS,
  ORDER_PLACED_LABEL,
  courierGroupOf,
} from "@/components/courier/CourierStatusBadge";

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
  OrderStatusFilter,
  OrderStatusSummary,
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
  // Order status = courier status group
  const [selectedCourierStatus, setSelectedCourierStatus] = useState<OrderStatusFilter>("ALL");
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>("ALL");
  const [selectedOrderType, setSelectedOrderType] = useState<string>("ALL");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [customerPhoneFilter, setCustomerPhoneFilter] = useState<string>("");
  const [exporting, setExporting] = useState<boolean>(false);

  // Preselect search from ?search= (used by "Manage Order" links)
  useEffect(() => {
    const initialSearch = new URLSearchParams(window.location.search).get("search");
    if (initialSearch) {
      setSearchQuery(initialSearch);
      setPage(1);
    }
  }, []);

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
        selectedCourierStatus,
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

  // Bulk Sync All Active Courier Parcels
  const [syncingAllCourier, setSyncingAllCourier] = useState<boolean>(false);
  const [courierSyncBannerMsg, setCourierSyncBannerMsg] = useState<string | null>(null);

  const handleSyncAllCourier = async () => {
    try {
      setSyncingAllCourier(true);
      const res = await orderApi.syncAllCourierOrders();
      setCourierSyncBannerMsg(res.message);
      fetchOrders();
      setTimeout(() => setCourierSyncBannerMsg(null), 6000);
    } catch (err: any) {
      console.error("Failed to sync all courier orders:", err);
      alert(err?.response?.data?.message || "Failed to sync all courier orders");
    } finally {
      setSyncingAllCourier(false);
    }
  };

  // Steadfast Merchant Balance State
  const [steadfastBalance, setSteadfastBalance] = useState<number | null>(null);
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false);

  const fetchSteadfastBalance = async () => {
    try {
      setLoadingBalance(true);
      const res = await orderApi.getCourierBalance();
      if (res && res.status === 200) {
        setSteadfastBalance(res.current_balance);
      }
    } catch (err) {
      console.error("Failed to load Steadfast balance:", err);
    } finally {
      setLoadingBalance(false);
    }
  };

  // Live Tracking Timeline Modal State
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState<boolean>(false);
  const [trackingTimelineData, setTrackingTimelineData] = useState<any>(null);
  const [loadingTrackingHistory, setLoadingTrackingHistory] = useState<boolean>(false);

  const handleOpenTrackingTimeline = async (orderId: string) => {
    try {
      setLoadingTrackingHistory(true);
      setIsTrackingModalOpen(true);
      setTrackingTimelineData(null);
      const res = await orderApi.getOrderTrackingHistory(orderId);
      setTrackingTimelineData(res);
    } catch (err: any) {
      console.error("Failed to fetch tracking history:", err);
      alert("Could not load tracking history from Steadfast.");
      setIsTrackingModalOpen(false);
    } finally {
      setLoadingTrackingHistory(false);
    }
  };

  // Customer Fraud / Delivery Reputation Modal State
  const [isFraudModalOpen, setIsFraudModalOpen] = useState<boolean>(false);
  const [fraudCheckData, setFraudCheckData] = useState<any>(null);
  const [loadingFraudCheck, setLoadingFraudCheck] = useState<boolean>(false);

  const handleCheckFraudScore = async (phone: string) => {
    if (!phone) {
      alert("No phone number available for this customer.");
      return;
    }
    try {
      setLoadingFraudCheck(true);
      setIsFraudModalOpen(true);
      setFraudCheckData(null);
      const res = await orderApi.checkCustomerFraud(phone);
      setFraudCheckData(res);
    } catch (err: any) {
      console.error("Failed to check customer fraud score:", err);
      alert(err?.response?.data?.message || "Failed to check customer delivery reputation");
      setIsFraudModalOpen(false);
    } finally {
      setLoadingFraudCheck(false);
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
  const [pendingPaymentStatus, setPendingPaymentStatus] = useState<PaymentStatus>("DUE");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [isCancellingOrder, setIsCancellingOrder] = useState<boolean>(false);
  const [updateSuccessMsg, setUpdateSuccessMsg] = useState<string | null>(null);
  const [statusSummary, setStatusSummary] = useState<OrderStatusSummary | null>(null);

  const fetchStatusSummary = useCallback(async () => {
    try {
      setStatusSummary(await orderApi.getStatusSummary(selectedOrderType === "RESELLER"));
    } catch (err) {
      console.error("Failed to load order status summary:", err);
    }
  }, [selectedOrderType]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrders(
        page,
        limit,
        searchQuery || undefined,
        selectedCourierStatus,
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
    fetchStatusSummary();
  }, [page, limit, searchQuery, selectedCourierStatus, selectedPaymentStatus, selectedOrderType, startDate, endDate, customerPhoneFilter, fetchStatusSummary]);

  useEffect(() => {
    fetchOrders();
    fetchSteadfastBalance();
  }, [fetchOrders]);

  // Automatically refresh orders so status updates from Steadfast webhooks reflect immediately
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchOrders();
      }
    }, 45000);

    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        fetchOrders();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [fetchOrders]);

  // The status filter is applied by the backend, so the list is shown as-is.
  const displayedOrders = orders;

  // Sync state when drawer opens
  useEffect(() => {
    if (selectedOrder) {
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
    // Orders that reached admin but are not yet booked with the courier
    const orderPlacedCount = statusSummary?.ORDER_PLACED ?? 0;

    const totalRevenue = orders.reduce((sum, o) => {
      return o.paymentStatus === "PAID" ? sum + Number(o.total) : sum;
    }, 0);

    const outstandingDue = orders.reduce((sum, o) => {
      return o.paymentStatus === "DUE" ? sum + Number(o.total) : sum;
    }, 0);

    return {
      totalOrdersCount,
      orderPlacedCount,
      totalRevenue,
      outstandingDue,
    };
  }, [orders, meta.total, statusSummary]);

  // Save Payment Status Handler (order status itself comes from the courier)
  const handleSavePaymentStatus = async () => {
    if (!selectedOrder) return;
    try {
      setIsUpdatingStatus(true);
      const updated = await orderApi.updatePaymentStatus(selectedOrder.id, {
        paymentStatus: pendingPaymentStatus,
      });
      setSelectedOrder({ ...selectedOrder, paymentStatus: updated.paymentStatus });
      setUpdateSuccessMsg("Payment status updated.");
      fetchOrders();
    } catch (err: any) {
      console.error("Failed to update payment status:", err);
      alert(err?.response?.data?.message || "Failed to update payment status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Cancel an order that has not been booked with the courier yet
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    const confirmed = window.confirm(
      "Cancel this order?\n\nStock is NOT restored automatically — restock the items manually from the Inventory page."
    );
    if (!confirmed) return;
    try {
      setIsCancellingOrder(true);
      const updated = await orderApi.cancelOrder(selectedOrder.id);
      setSelectedOrder({
        ...selectedOrder,
        courierStatus: updated.courierStatus,
        paymentStatus: updated.paymentStatus,
      });
      setUpdateSuccessMsg("Order cancelled. Remember to restock the items from Inventory.");
      fetchOrders();
    } catch (err: any) {
      console.error("Failed to cancel order:", err);
      alert(err?.response?.data?.message || "Failed to cancel order");
    } finally {
      setIsCancellingOrder(false);
    }
  };

  const renderPaymentBadge = (status: PaymentStatus) => {
    const base =
      "badge text-[11px] font-bold whitespace-nowrap h-auto py-1 px-2";
    switch (status) {
      case "PAID":
        return (
          <span className={`${base} badge-success text-white`}>
            PAID
          </span>
        );
      case "PARTIAL":
        return (
          <span className={`${base} badge-warning text-base-content`}>
            PARTIAL
          </span>
        );
      case "CANCELLED":
        return (
          <span className={`${base} badge-error text-white`}>
            CANCELLED
          </span>
        );
      default:
        return (
          <span className={`${base} badge-ghost`}>
            DUE
          </span>
        );
    }
  };

  const renderCourierBadge = (status?: string | null) => (
    <CourierStatusBadge status={status} />
  );

  return (
    <div className="space-y-6">
      <PanelPageHeader
        title="Order & Fulfillment Management"
        subtitle="Manage customer & uddokta orders, track payments, and follow live courier status."
        icon={ShoppingBag}
      />

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleSyncAllCourier}
            disabled={syncingAllCourier}
            title="Poll and synchronize all active in-flight parcels from Steadfast"
            className="btn btn-sm btn-info text-white rounded-xl font-bold gap-2 shadow-sm"
          >
            <Truck size={14} className={syncingAllCourier ? "animate-bounce" : ""} />
            {syncingAllCourier ? "Syncing Steadfast..." : "Sync All Courier"}
          </button>
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

      {courierSyncBannerMsg && (
        <div className="alert alert-info shadow-sm rounded-2xl text-white text-xs font-bold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck size={16} />
            <span>{courierSyncBannerMsg}</span>
          </div>
          <button
            onClick={() => setCourierSyncBannerMsg(null)}
            className="btn btn-ghost btn-xs text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Orders */}
        <div className="bg-base-100 p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Orders
            </div>
            <div className="text-2xl font-black text-base-content mt-1">
              {kpiMetrics.totalOrdersCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShoppingBag size={22} />
          </div>
        </div>

        {/* Order Placed: reached admin, not yet booked with the courier */}
        <div className="bg-base-100 p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {ORDER_PLACED_LABEL}
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {kpiMetrics.orderPlacedCount}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={22} />
          </div>
        </div>

        {/* Total Paid Revenue */}
        <div className="bg-base-100 p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
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
        <div className="bg-base-100 p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center justify-between">
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

        {/* Steadfast Courier Wallet Balance */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 p-5 rounded-3xl text-white shadow-sm flex items-center justify-between border border-indigo-800/80">
          <div>
            <div className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>Steadfast Balance</span>
              <button
                type="button"
                onClick={fetchSteadfastBalance}
                className="btn btn-ghost btn-xs text-indigo-300 hover:text-white p-0 h-auto"
                title="Refresh Courier Wallet Balance"
              >
                <RefreshCw size={11} className={loadingBalance ? "animate-spin" : ""} />
              </button>
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {steadfastBalance !== null ? `৳ ${steadfastBalance.toLocaleString()}` : "৳ ---"}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">Live Courier Wallet</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/10 text-emerald-400 flex items-center justify-center font-bold">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-base-100 p-4 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
          {/* Search Input */}
          <div className="relative w-full md:w-auto md:flex-1 md:min-w-[160px]">
            <input
              type="text"
              placeholder="Search by Order Ref, Name, Address..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="input input-sm input-bordered w-full rounded-2xl pl-9 text-base-content text-xs"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
          </div>

          {/* Date Range Filter: one row per date on phones, one line from md up */}
          <div className="flex flex-col gap-3 w-full md:flex-row md:items-center md:gap-1.5 md:w-auto text-xs font-bold text-slate-600 whitespace-nowrap">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-primary shrink-0" /> From:
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="input input-xs input-bordered bg-base-100 text-base-content font-bold rounded-xl flex-1 min-w-0 md:flex-none"
              />
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar size={14} className="text-primary shrink-0 md:hidden" />
              <span>To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="input input-xs input-bordered bg-base-100 text-base-content font-bold rounded-xl flex-1 min-w-0 md:flex-none"
              />
            </div>
          </div>

          {/* Customer Mobile Filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 whitespace-nowrap w-full md:w-auto">
            <Phone size={14} className="text-primary shrink-0" /> Mobile:
            <input
              type="text"
              placeholder="Customer Phone..."
              value={customerPhoneFilter}
              onChange={(e) => {
                setCustomerPhoneFilter(e.target.value);
                setPage(1);
              }}
              className="input input-xs input-bordered bg-base-100 text-base-content font-bold rounded-xl flex-1 min-w-0 md:flex-none md:w-36"
            />
          </div>

          {/* Toolbar Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {(searchQuery || selectedPaymentStatus !== "ALL" || selectedOrderType !== "ALL" || selectedCourierStatus !== "ALL" || startDate || endDate || customerPhoneFilter) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCourierStatus("ALL");
                  setSelectedPaymentStatus("ALL");
                  setSelectedOrderType("ALL");
                  setStartDate("");
                  setEndDate("");
                  setCustomerPhoneFilter("");
                  setPage(1);
                }}
                className="btn btn-xs btn-ghost text-rose-600 font-bold whitespace-nowrap"
              >
                Reset Filters
              </button>
            )}

            {/* Edit Courier Policy Button */}
            <button
              type="button"
              className="btn btn-xs btn-outline btn-primary rounded-xl font-bold gap-1 whitespace-nowrap"
              onClick={() => {
                fetchCourierPolicy();
                setIsCourierModalOpen(true);
              }}
            >
              <SlidersHorizontal size={12} /> Edit Courier Policy
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
          {/* Order Type Filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 min-w-0 whitespace-nowrap">
            <Package size={14} className="shrink-0" /> Type:
            <select
              value={selectedOrderType}
              onChange={(e) => {
                setSelectedOrderType(e.target.value);
                setPage(1);
              }}
              className="select select-xs select-bordered bg-base-100 text-base-content font-bold rounded-xl flex-1 min-w-0"
            >
              <option value="ALL">All Order Types</option>
              <option value="RESELLER">Uddokta Orders</option>
              <option value="CUSTOMER">Direct Customer</option>
            </select>
          </div>

          {/* Order Status Filter (courier status) */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 min-w-0 whitespace-nowrap">
            <Filter size={14} className="shrink-0" /> Status:
            <select
              value={selectedCourierStatus}
              onChange={(e) => {
                setSelectedCourierStatus(e.target.value as OrderStatusFilter);
                setPage(1);
              }}
              className="select select-xs select-bordered bg-base-100 text-base-content font-bold rounded-xl flex-1 min-w-0"
            >
              {COURIER_STATUS_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value === "ALL" ? "All Statuses" : opt.label}
                  {statusSummary && opt.value !== "ALL" ? ` (${statusSummary[opt.value]})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 min-w-0 whitespace-nowrap">
            <CreditCard size={14} className="shrink-0" /> Payment:
            <select
              value={selectedPaymentStatus}
              onChange={(e) => {
                setSelectedPaymentStatus(e.target.value);
                setPage(1);
              }}
              className="select select-xs select-bordered bg-base-100 text-base-content font-bold rounded-xl flex-1 min-w-0"
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
      <div className="bg-base-100 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4">
            <PanelSkeleton variant="table" rows={8} />
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShoppingBag size={48} className="mx-auto mb-3 opacity-60" />
            <p className="text-lg font-bold text-slate-700">No Orders Found</p>
            <p className="text-xs text-slate-500 mt-1">No orders matching your search & filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full min-w-[920px] [&_th]:px-3 [&_td]:px-3">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-4 !pl-5 w-10 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-primary rounded-md"
                      checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="whitespace-nowrap">Order Ref / Type</th>
                  <th className="whitespace-nowrap">Customer Info</th>
                  <th className="whitespace-nowrap">Tracking</th>
                  <th className="whitespace-nowrap">Order Date</th>
                  <th className="whitespace-nowrap">Status</th>
                  <th className="whitespace-nowrap">Total Bill</th>
                  <th className="text-right !pr-5 whitespace-nowrap sticky right-0 bg-slate-50 z-10 shadow-[-6px_0_8px_-6px_rgba(15,23,42,0.12)]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {displayedOrders.map((ord) => {
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
                      className={`hover:bg-slate-50/80 transition-colors align-middle ${
                        isSelected ? "bg-indigo-50/40" : ""
                      }`}
                    >
                      <td className="!pl-5 py-3 align-middle">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm checkbox-primary rounded-md"
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(ord.id)}
                        />
                      </td>
                      <td className="align-middle py-3 whitespace-nowrap">
                        <div className="font-mono font-bold text-indigo-600 text-xs mb-1">{displayRef}</div>
                        {isReseller ? (
                          <span className="badge badge-primary text-white font-extrabold text-[11px] uppercase whitespace-nowrap h-auto py-1 px-2">
                            Uddokta
                          </span>
                        ) : (
                          <span className="badge badge-ghost text-slate-600 font-semibold text-[11px] uppercase whitespace-nowrap h-auto py-1 px-2">
                            Direct
                          </span>
                        )}
                      </td>
                      <td className="min-w-[160px] max-w-[220px] align-middle py-3">
                        <div className="font-bold text-base-content text-sm whitespace-nowrap">
                          {customerName}
                        </div>
                        <div className="text-xs text-slate-500 whitespace-nowrap">
                          {customerPhone}
                        </div>
                        {isReseller && ord.reseller && (
                          <div className="text-[10px] text-primary font-semibold mt-0.5 leading-tight">
                            Via Uddokta: {ord.reseller.name} ({ord.reseller.phone})
                          </div>
                        )}
                      </td>
                      <td className="align-middle py-3 whitespace-nowrap">
                        {ord.courierTrackingCode ? (
                          <div className="space-y-1 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleOpenTrackingTimeline(ord.id)}
                              className="flex items-center gap-1.5 font-mono text-xs font-black text-indigo-700 hover:text-indigo-950 transition-colors group cursor-pointer"
                              title="Click to view live parcel tracking journey from Steadfast"
                            >
                              <Truck size={12} className="text-primary" />
                              <span className="underline decoration-dotted">{ord.courierTrackingCode}</span>
                              <ExternalLink size={10} className="opacity-40 group-hover:opacity-100" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic whitespace-nowrap">
                            Not dispatched
                          </span>
                        )}
                      </td>
                      <td className="text-xs text-slate-500 font-medium align-middle py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-700">{new Date(ord.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400 font-sans">
                          {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                        </div>
                      </td>

                      <td className="align-middle py-3 whitespace-nowrap">
                        <div className="flex flex-col items-start gap-1">
                          {renderCourierBadge(ord.courierStatus)}
                          {renderPaymentBadge(ord.paymentStatus)}
                        </div>
                      </td>
                      <td className="font-black text-indigo-950 text-sm align-middle py-3 whitespace-nowrap">
                        ৳{totalBillVal.toLocaleString()}
                      </td>
                      <td className="text-right !pr-5 align-middle py-3 whitespace-nowrap sticky right-0 bg-base-100 z-10 shadow-[-6px_0_8px_-6px_rgba(15,23,42,0.12)]">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="btn btn-xs btn-primary gap-1 rounded-lg font-bold flex-nowrap whitespace-nowrap"
                          title="Manage Order"
                        >
                          <Eye size={14} className="shrink-0" /> Manage
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
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div
            className="fixed inset-0 cursor-pointer"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-2xl bg-base-100 h-full shadow-2xl flex flex-col z-10 overflow-hidden text-slate-800">
            {/* Drawer Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div>
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  <ShoppingBag size={16} /> Fulfillment Drawer
                  {selectedOrder.isResellerOrder && (
                    <span className="badge badge-primary text-white text-[10px] ml-2">UDDOKTA ORDER</span>
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
                    <User size={14} /> Uddokta Profile
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Name:</span>{" "}
                      <strong className="text-base-content">{selectedOrder.reseller?.name || selectedOrder.customer?.name || "Uddokta"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Phone:</span>{" "}
                      <strong className="text-base-content">{selectedOrder.reseller?.phone || selectedOrder.customer?.phone || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Email:</span>{" "}
                      <strong className="text-base-content">{selectedOrder.reseller?.email || selectedOrder.customer?.email || "N/A"}</strong>
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
                    <div className="font-extrabold text-base-content text-sm">
                      {selectedOrder.customerName || selectedOrder.customer?.name || "Customer"}
                    </div>
                    <div className="text-slate-500 mt-0.5 flex items-center gap-1">
                      <Phone size={12} /> {selectedOrder.customerPhone || selectedOrder.customer?.phone || "N/A"}
                    </div>
                    {(selectedOrder.customerPhone || selectedOrder.customer?.phone) && (
                      <button
                        type="button"
                        onClick={() => handleCheckFraudScore(selectedOrder.customerPhone || selectedOrder.customer?.phone || "")}
                        disabled={loadingFraudCheck}
                        className="btn btn-xs btn-outline btn-info rounded-xl gap-1 mt-1 text-[10px] font-bold shadow-2xs"
                        title="Check customer delivery & cancellation history on Steadfast"
                      >
                        <ShieldAlert size={12} />
                        {loadingFraudCheck ? "Checking History..." : "Check Delivery History"}
                      </button>
                    )}
                    {selectedOrder.customerSecondaryPhone && (
                      <div className="text-slate-500 mt-1 flex items-center gap-1">
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
                      <FileText size={12} /> Optional Uddokta Notes:
                    </span>
                    <p className="text-slate-700 font-medium mt-1 bg-base-100 p-2 rounded-lg border border-slate-200">
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
                  <div>{renderCourierBadge(selectedOrder.courierStatus)}</div>
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-base-100 p-4 rounded-xl border border-indigo-100/80 shadow-sm">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                          Tracking Code
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-sm font-black text-base-content">
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

                      {selectedOrder.courierReturnStatus && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                            Return Status
                          </span>
                          <span className="badge badge-warning text-base-content font-bold text-[10px] uppercase mt-0.5">
                            {selectedOrder.courierReturnStatus}
                          </span>
                          {selectedOrder.courierReturnReason && (
                            <span className="block text-[10px] text-slate-500 mt-1">
                              {selectedOrder.courierReturnReason}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        onClick={handleSyncCourierStatus}
                        disabled={isSyncingCourier}
                        className="btn btn-sm btn-outline btn-primary rounded-xl font-bold gap-2 flex-1 w-full shadow-sm"
                      >
                        {isSyncingCourier ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <RefreshCw size={14} />
                        )}
                        Sync Live Courier Status
                      </button>
                      <button
                        onClick={() => handleOpenTrackingTimeline(selectedOrder.id)}
                        disabled={loadingTrackingHistory}
                        className="btn btn-sm btn-primary text-white rounded-xl font-bold gap-2 flex-1 w-full shadow-sm"
                      >
                        {loadingTrackingHistory ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Truck size={14} />
                        )}
                        View Live Tracking Journey
                      </button>
                    </div>
                  </div>
                ) : courierGroupOf(selectedOrder.courierStatus) === "CANCELLED" ? (
                  /* Cancelled before it was placed with the courier */
                  <p className="text-xs text-slate-500 font-medium">
                    This order was cancelled before it was placed with Steadfast.
                  </p>
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
                          className="select select-sm select-bordered w-full bg-base-100 text-base-content font-bold rounded-xl"
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
                          className="input input-sm input-bordered w-full bg-base-100 text-base-content font-bold rounded-xl"
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
                        className="input input-sm input-bordered w-full bg-base-100 text-base-content rounded-xl"
                      />
                    </div>

                    <div className="flex items-center justify-between py-1 px-1 bg-amber-50/80 rounded-xl border border-amber-200/60 p-2">
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-950">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-xs checkbox-warning rounded"
                          checked={courierNote.includes("Partial delivery allowed")}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCourierNote((prev) =>
                                prev ? `${prev}, Partial delivery allowed` : "Partial delivery allowed"
                              );
                            } else {
                              setCourierNote((prev) =>
                                prev
                                  .replace(/,?\s*Partial delivery allowed/gi, "")
                                  .trim()
                              );
                            }
                          }}
                        />
                        <span>Allow Partial Delivery (আংশিক ডেলিভারি গ্রহণযোগ্য)</span>
                      </label>
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

              {/* Payment & Cancellation — the order status itself comes from the courier */}
              <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-100 space-y-4">
                <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Package size={14} className="text-indigo-600" /> Payment & Cancellation
                </h4>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700">Payment Status</label>
                  <select
                    value={pendingPaymentStatus}
                    onChange={(e) => setPendingPaymentStatus(e.target.value as PaymentStatus)}
                    className="select select-sm select-bordered w-full bg-base-100 text-base-content font-bold rounded-xl"
                  >
                    <option value="DUE">DUE</option>
                    <option value="PAID">PAID</option>
                    <option value="PARTIAL">PARTIAL</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <button
                  onClick={handleSavePaymentStatus}
                  disabled={isUpdatingStatus || pendingPaymentStatus === selectedOrder.paymentStatus}
                  className="btn btn-primary btn-sm w-full text-white font-bold rounded-xl gap-2"
                >
                  {isUpdatingStatus ? (
                    <><span className="loading loading-spinner loading-xs"></span> Saving...</>
                  ) : (
                    <><Save size={16} /> Save Payment Status</>
                  )}
                </button>

                {!selectedOrder.courierTrackingCode &&
                  !selectedOrder.courierConsignmentId &&
                  courierGroupOf(selectedOrder.courierStatus) !== "CANCELLED" && (
                    <div className="pt-2 border-t border-indigo-100 space-y-2">
                      <div className="flex items-start gap-2 text-[11px] text-slate-600 font-medium">
                        <ShieldAlert size={14} className="shrink-0 text-amber-600 mt-0.5" />
                        <span>
                          Cancelling does not restore stock. Restock the items manually from the Inventory page.
                        </span>
                      </div>
                      <button
                        onClick={handleCancelOrder}
                        disabled={isCancellingOrder}
                        className="btn btn-outline btn-error btn-sm w-full font-bold rounded-xl gap-2"
                      >
                        {isCancellingOrder ? (
                          <><span className="loading loading-spinner loading-xs"></span> Cancelling...</>
                        ) : (
                          <><XCircle size={16} /> Cancel Order</>
                        )}
                      </button>
                    </div>
                  )}
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
                          <div className="font-bold text-base-content text-xs">{item.product?.name || "Product"}</div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                            {item.productSize?.size?.name && <span>Size: {item.productSize.size.name}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-xs font-bold text-slate-700">
                          Qty: <span className="font-extrabold text-base-content">{item.quantity}</span>
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
                            Sell Price: <span className="font-extrabold text-base-content">৳{Number(item.snapshotPrice).toLocaleString()}</span>
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
                      Uddokta Subtotal:{" "}
                      <span className="font-bold text-base-content">
                        ৳ {Number(selectedOrder.resellerSellPrice || selectedOrder.total).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Courier Charge:{" "}
                      <span className="font-bold text-base-content">
                        {selectedOrder.isAdvanceCourierPaid ? (
                          <span className="text-emerald-600">
                            ৳ 0 (Advance courier fee was collected directly by uddokta)
                          </span>
                        ) : (
                          `+৳ ${Number(selectedOrder.courierCharge).toLocaleString()}`
                        )}
                      </span>
                    </div>
                    <div className="text-emerald-600 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 text-right space-y-0.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">Uddokta Profit Margin:</span>
                        <span className="font-black text-sm text-emerald-700">
                          +৳ {Number(selectedOrder.resellerProfit || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-normal">
                        * Note: Uddokta profit is earned by uddokta.
                      </div>
                    </div>
                    <div className="text-sm font-black text-base-content pt-2 border-t border-slate-200 flex justify-between items-center">
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
                      <span className="font-bold text-base-content">
                        ৳ {Number(selectedOrder.subtotal).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-slate-600">
                      Courier Charge:{" "}
                      <span className="font-bold text-base-content">
                        +৳ {Number(selectedOrder.courierCharge).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm font-black text-base-content pt-2 border-t border-slate-200">
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
          <div className="modal-box max-w-lg bg-base-100 p-6 space-y-4 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
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
                  className="input input-sm input-bordered w-full rounded-xl text-base-content font-bold"
                  value={courierPolicyTitle}
                  onChange={(e) => setCourierPolicyTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Courier Charge Text (Displayed to Uddoktas)
                </label>
                <textarea
                  rows={4}
                  placeholder="e.g. Inside Dhaka City: ৳70 | Sub-Urban Dhaka: ৳100 | Outside Dhaka: ৳130. Advance courier fee is collected by uddokta if applicable."
                  className="textarea textarea-bordered w-full rounded-xl text-base-content text-xs"
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
                  className="input input-sm input-bordered w-full rounded-xl text-base-content font-bold"
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
          <div className="modal-box max-w-md bg-base-100 p-6 space-y-4 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-base-content flex items-center gap-2">
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
                <div className="font-extrabold text-base-content text-sm">
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
                  className="select select-sm select-bordered w-full bg-base-100 text-base-content font-bold rounded-xl"
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

      {/* Live Steadfast Parcel Tracking Timeline Modal */}
      {isTrackingModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-lg bg-base-100 p-6 space-y-5 rounded-3xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                  Steadfast Courier Logistics
                </span>
                <h3 className="font-extrabold text-base text-base-content flex items-center gap-2 mt-0.5">
                  <Truck size={18} className="text-primary" />
                  <span>Parcel Journey Timeline</span>
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-circle btn-sm text-slate-400"
                onClick={() => setIsTrackingModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {loadingTrackingHistory ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <span className="loading loading-spinner loading-md text-primary"></span>
                <span className="text-xs font-semibold text-slate-500">Fetching live journey milestones from Steadfast...</span>
              </div>
            ) : trackingTimelineData ? (
              <div className="space-y-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Invoice / Ref</span>
                    <strong className="text-base-content font-mono text-sm">{trackingTimelineData.orderRef || trackingTimelineData.orderId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Tracking Code</span>
                    <strong className="text-indigo-700 font-mono text-sm">{trackingTimelineData.courierTrackingCode || "N/A"}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold text-[10px] uppercase">Current Status</span>
                    {renderCourierBadge(trackingTimelineData.courierStatus)}
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Milestone Events ({trackingTimelineData.trackingEvents?.length || 0})
                  </h4>

                  {(!trackingTimelineData.trackingEvents || trackingTimelineData.trackingEvents.length === 0) ? (
                    <div className="bg-amber-50 text-amber-900 p-4 rounded-2xl border border-amber-200/60 text-xs font-medium">
                      No milestone events recorded yet by Steadfast Courier. The parcel is booked and will show steps once received at the hub.
                    </div>
                  ) : (
                    <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
                      {trackingTimelineData.trackingEvents.map((event: any, idx: number) => (
                        <div key={idx} className="relative group">
                          <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center text-[8px] text-white font-bold">
                            {idx + 1}
                          </div>
                          <div className="bg-base-100 p-3 rounded-xl border border-slate-100 shadow-2xs">
                            <p className="text-xs font-bold text-base-content">{event.text}</p>
                            <span className="text-[10px] text-slate-400 block mt-1">
                              {new Date(event.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                No tracking data available.
              </div>
            )}

            <div className="modal-action border-t border-slate-100 pt-3">
              <button
                type="button"
                className="btn btn-sm btn-ghost font-bold rounded-xl w-full"
                onClick={() => setIsTrackingModalOpen(false)}
              >
                Close Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Steadfast Delivery Reputation & Fraud Check Modal */}
      {isFraudModalOpen && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md bg-base-100 p-6 space-y-4 rounded-3xl border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-info uppercase tracking-wider block">
                  Steadfast Courier Intelligence
                </span>
                <h3 className="font-extrabold text-base text-base-content flex items-center gap-2 mt-0.5">
                  <ShieldAlert size={18} className="text-info" />
                  <span>Customer Delivery Record</span>
                </h3>
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-circle btn-sm text-slate-400"
                onClick={() => setIsFraudModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {loadingFraudCheck ? (
              <div className="py-10 flex flex-col items-center justify-center gap-2">
                <span className="loading loading-spinner loading-md text-info"></span>
                <span className="text-xs font-semibold text-slate-500">Checking customer reputation across Steadfast...</span>
              </div>
            ) : fraudCheckData ? (
              <div className="space-y-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Checked Mobile:</span>
                  <strong className="text-base-content font-mono text-sm">{fraudCheckData.phone}</strong>
                </div>

                {/* Delivery & Cancellation Ratios */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-100 space-y-1">
                    <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">Delivery Success</span>
                    <div className="text-2xl font-black text-emerald-700">
                      {fraudCheckData.delivery_ratio !== null ? `${fraudCheckData.delivery_ratio}%` : "No Record"}
                    </div>
                    {fraudCheckData.delivered_count !== null && (
                      <span className="text-[10px] text-emerald-600 block">
                        {fraudCheckData.delivered_count} parcels completed
                      </span>
                    )}
                  </div>

                  <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-100 space-y-1">
                    <span className="text-[10px] font-extrabold text-rose-800 uppercase block">Cancellation Rate</span>
                    <div className="text-2xl font-black text-rose-700">
                      {fraudCheckData.cancellation_ratio !== null ? `${fraudCheckData.cancellation_ratio}%` : "No Record"}
                    </div>
                    {fraudCheckData.cancelled_count !== null && (
                      <span className="text-[10px] text-rose-600 block">
                        {fraudCheckData.cancelled_count} parcels cancelled
                      </span>
                    )}
                  </div>
                </div>

                {/* Volume Tier */}
                <div className="bg-indigo-50/70 p-3.5 rounded-2xl border border-indigo-100 flex items-center justify-between">
                  <span className="font-bold text-indigo-950">Customer Parcel Volume:</span>
                  <span className="badge badge-primary font-bold text-xs uppercase">
                    {fraudCheckData.volume_range || fraudCheckData.volume_band || "Low Activity"}
                  </span>
                </div>

                {/* Reported Disputes by Other Merchants */}
                <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700">Merchant Dispute Reports:</span>
                    <span className={`badge font-bold text-xs ${Number(fraudCheckData.total_reports || 0) > 0 ? "badge-error text-white" : "badge-ghost text-slate-500"}`}>
                      {fraudCheckData.total_reports || 0} Reports
                    </span>
                  </div>
                  {fraudCheckData.fraud_categories && Object.keys(fraudCheckData.fraud_categories).length > 0 && (
                    <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1 mt-1">
                      {Object.entries(fraudCheckData.fraud_categories).map(([cat, count]) => (
                        <span key={cat} className="badge badge-warning text-base-content font-bold text-[10px]">
                          {cat}: {String(count)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                Could not retrieve fraud stats.
              </div>
            )}

            <div className="modal-action border-t border-slate-100 pt-3">
              <button
                type="button"
                className="btn btn-sm btn-ghost font-bold rounded-xl w-full"
                onClick={() => setIsFraudModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

