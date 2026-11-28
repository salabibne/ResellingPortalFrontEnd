"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  CheckCircle2,
  Truck,
  Eye,
  Search,
  MapPin,
  FileSpreadsheet,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  Printer,
} from "lucide-react";
import {
  orderApi,
  Order,
  OrderStatusFilter,
  CourierTrackResult,
} from "@/services/order.api";
import CourierStatusBadge, {
  COURIER_STATUS_FILTERS,
  isProfitEarned,
} from "@/components/courier/CourierStatusBadge";
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelTabs from "@/components/panel/PanelTabs";
import PanelTable from "@/components/panel/PanelTable";
import PanelEmpty from "@/components/panel/PanelEmpty";
import PanelSkeleton from "@/components/panel/PanelSkeleton";
import PanelModal from "@/components/panel/PanelModal";
import { exportOrdersToCSV } from "@/utils/csvExporter";
import { openOrderInvoice } from "@/utils/orderAmounts";

// Bangla labels for the status filter tabs (raw values stay unchanged for logic/API).
const STATUS_TAB_LABELS_BN: Record<string, string> = {
  ALL: "সব",
  ORDER_PLACED: "অর্ডার প্লেসড",
  PENDING: "পেন্ডিং",
  IN_TRANSIT: "ডেলিভারির পথে",
  DELIVERED: "ডেলিভারড",
  PARTIAL: "আংশিক ডেলিভারড",
  CANCELLED: "বাতিল",
};

export default function ResellerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });

  const [search, setSearch] = useState<string>("");
  // Order status = courier status group
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusFilter>("ALL");
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
          : message || err?.message || "কুরিয়ার স্ট্যাটাস আনা যায়নি"
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
        selectedStatus,
        undefined,
        true, // isResellerOnly
        startDate || undefined,
        endDate || undefined,
        customerPhone || undefined
      );
      exportOrdersToCSV(data, "reseller_orders_export");
    } catch (err) {
      console.error("Failed to export reseller orders CSV:", err);
      alert("CSV এক্সপোর্ট করা যায়নি। আবার চেষ্টা করুন।");
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
        selectedStatus,
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

  return (
    <PanelPage>
      <PanelPageHeader
        title="আমার অর্ডারসমূহ"
        subtitle="আপনার সব অর্ডারের ডেলিভারি স্ট্যাটাস, কাস্টমারের তথ্য ও উদ্যোক্তা প্রফিট এখানে দেখুন।"
        icon={ShoppingBag}
        actions={
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={exporting}
            className="btn btn-success btn-sm rounded-xl gap-2 text-white"
          >
            {exporting ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={16} />
            )}
            CSV এক্সপোর্ট
          </button>
        }
      />


      {/* Search & Filters Toolbar */}
      <div className="bg-base-100 p-3 sm:p-4 rounded-xl border border-base-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
          {/* General Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" size={18} />
            <input
              type="text"
              placeholder="রেফ, কাস্টমারের নাম, ঠিকানা দিয়ে খুঁজুন..."
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
            <span>শুরু:</span>
            <input
              type="date"
              className="input input-bordered input-sm text-xs flex-1 sm:flex-none"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
            />
            <span>শেষ:</span>
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
            <span>মোবাইল:</span>
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
              ফিল্টার মুছুন
            </button>
          )}

        </div>

        {/* Status tabs */}
        <PanelTabs
          ariaLabel="স্ট্যাটাস অনুযায়ী অর্ডার ফিল্টার করুন"
          value={selectedStatus}
          onChange={(id) => {
            setSelectedStatus(id as OrderStatusFilter);
            setPage(1);
          }}
          tabs={COURIER_STATUS_FILTERS.map((opt) => ({
            id: opt.value,
            label: STATUS_TAB_LABELS_BN[opt.value] || opt.label,
          }))}
        />
      </div>

      {/* Orders Table */}
      {loading ? (
        <PanelSkeleton variant="table" rows={8} />
      ) : orders.length === 0 ? (
        <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm">
          <PanelEmpty
            icon={ShoppingBag}
            title="কোনো অর্ডার পাওয়া যায়নি"
            text="আপনার কাস্টমারদের জন্য করা অর্ডারগুলো এখানে দেখা যাবে।"
          />
        </div>
      ) : (
        <>
          <div className="hidden md:block">
            <PanelTable>
              <thead>
                <tr>
                  <th>অর্ডার রেফ</th>
                  <th>কাস্টমারের তথ্য</th>
                  <th>ট্র্যাকিং</th>
                  <th>লোকেশন</th>
                  <th>বিক্রয় মূল্য</th>
                  <th>উদ্যোক্তা প্রফিট</th>
                  <th>অগ্রিম কুরিয়ার চার্জ</th>
                  <th>স্ট্যাটাস</th>
                  <th>অ্যাকশন</th>
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

                  const isEarned = isProfitEarned(order);

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
                            {order.courierReturnStatus && (
                              <span className="badge badge-warning text-base-content text-[9px] font-bold uppercase py-1 px-1.5">
                                রিটার্ন: {order.courierReturnStatus}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-base-content/40 italic">
                            এখনো পাঠানো হয়নি
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
                            <div className="text-[10px] font-bold text-emerald-600">অর্জিত</div>
                          </div>
                        ) : (
                          <div>
                            <span className="font-extrabold text-xs text-amber-600">
                              ৳{profit.toLocaleString()}
                            </span>
                            <div className="text-[10px] font-semibold text-amber-600">ডেলিভারি/পেমেন্ট বাকি</div>
                          </div>
                        )}
                      </td>
                      <td>
                        {order.isAdvanceCourierPaid ? (
                          <span className="badge badge-success text-white badge-xs py-2 px-2 gap-1 font-semibold">
                            <CheckCircle2 size={10} /> পরিশোধিত
                          </span>
                        ) : (
                          <span className="badge badge-ghost badge-xs py-2 px-2 font-semibold">
                            পরিশোধ হয়নি
                          </span>
                        )}
                      </td>
                      <td><CourierStatusBadge status={order.courierStatus} /></td>
                      <td>
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <button
                            className="btn btn-ghost btn-xs gap-1 text-primary"
                            onClick={() => openOrderDetails(order)}
                          >
                            <Eye size={14} /> বিস্তারিত
                          </button>
                          <button
                            className="btn btn-ghost btn-xs gap-1 text-primary"
                            onClick={() => openOrderInvoice(order.id)}
                            title="ইনভয়েস দেখুন / প্রিন্ট করুন"
                          >
                            <Printer size={14} /> ইনভয়েস
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </PanelTable>
          </div>

          {/* Mobile stacked cards */}
          <div className="md:hidden space-y-3">
            {orders.map((order) => {
              const displayRef =
                order.orderRef || `#${order.id.substring(0, 8).toUpperCase()}`;
              const customerName =
                order.customerName || order.customer?.name || "N/A";
              return (
                <div
                  key={order.id}
                  className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-mono font-bold text-xs text-primary truncate">
                        {displayRef}
                      </p>
                      <p className="text-xs text-base-content/60 truncate">
                        {customerName} ·{" "}
                        {order.customerPhone || order.customer?.phone || "N/A"}
                      </p>
                    </div>
                    <CourierStatusBadge status={order.courierStatus} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-base-content/60">বিক্রয় মূল্য</span>
                    <span className="font-bold text-base-content">
                      ৳
                      {(
                        order.resellerSellPrice || order.subtotal
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm rounded-xl gap-2 w-full"
                      onClick={() => openOrderDetails(order)}
                    >
                      <Eye size={16} /> বিস্তারিত দেখুন
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-primary btn-sm rounded-xl gap-2 w-full"
                      onClick={() => openOrderInvoice(order.id)}
                    >
                      <Printer size={16} /> ইনভয়েস
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <PanelModal
          open={!!selectedOrder}
          onClose={closeOrderDetails}
          title={`অর্ডারের বিস্তারিত ${
            selectedOrder.orderRef ||
            `#${selectedOrder.id.substring(0, 8).toUpperCase()}`
          }`}
          size="lg"
          footer={
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-outline btn-primary btn-sm rounded-xl gap-1.5"
                onClick={() => openOrderInvoice(selectedOrder.id)}
              >
                <Printer size={14} /> ইনভয়েস প্রিন্ট
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-xl"
                onClick={closeOrderDetails}
              >
                বন্ধ করুন
              </button>
            </div>
          }
        >
          <div className="space-y-4">

            {/* Steadfast Courier Tracking Box */}
            <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Truck size={14} /> Steadfast কুরিয়ার
                </h4>
                <CourierStatusBadge
                  status={courierTrack?.deliveryStatus || selectedOrder.courierStatus}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-base-100 p-3 rounded-lg border border-base-200">
                <div>
                  <span className="text-base-content/60 font-semibold block uppercase text-[10px]">
                    কনসাইনমেন্ট আইডি:
                  </span>
                  <span className="font-mono font-bold text-sm text-primary mt-0.5 block">
                    {selectedOrder.courierConsignmentId
                      ? `#${selectedOrder.courierConsignmentId}`
                      : "এখনো দেওয়া হয়নি"}
                  </span>
                </div>

                <div>
                  <span className="text-base-content/60 font-semibold block uppercase text-[10px]">
                    ট্র্যাকিং কোড:
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
                        title="কোড কপি করুন"
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
                      এখনো বুক করা হয়নি
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
                      ? "Steadfast থেকে লাইভ স্ট্যাটাস দেখুন"
                      : "এই অর্ডারে এখনো কোনো কনসাইনমেন্ট আইডি নেই"
                  }
                >
                  {courierTrackLoading ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <Truck size={14} />
                  )}
                  {courierTrackLoading ? "চেক করা হচ্ছে..." : "কুরিয়ার স্ট্যাটাস দেখুন"}
                </button>
                {courierTrack && (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm gap-1"
                    onClick={handleShowCourierStatus}
                    disabled={courierTrackLoading}
                  >
                    <RefreshCw size={13} /> রিফ্রেশ
                  </button>
                )}
                {!selectedOrder.courierConsignmentId && (
                  <span className="text-[11px] text-base-content/50">
                    কনসাইনমেন্ট আইডি না পাওয়া পর্যন্ত স্ট্যাটাস দেখা যাবে না।
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
                      মিলেছে {courierTrack.matchedBy.toUpperCase()} দিয়ে ·{" "}
                      {courierTrack.matchedIdentifier || courierTrack.identifier}
                    </span>
                  </div>

                  <h5 className="text-[10px] font-bold uppercase tracking-wider text-base-content/70 flex items-center gap-1">
                    <MapPin size={12} /> পার্সেলের যাত্রা ({courierTrack.trackingEvents?.length || 0})
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
                      এখনো কোনো ট্র্যাকিং আপডেট আসেনি। উপরের ব্যাজটি কুরিয়ারের
                      সর্বশেষ রেসপন্স।
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 text-[11px] text-base-content/60">
                {selectedOrder.courierLastSyncedAt && (
                  <span>
                    সর্বশেষ সিঙ্ক:{" "}
                    {new Date(selectedOrder.courierLastSyncedAt).toLocaleString()}
                  </span>
                )}
                {selectedOrder.courierReturnStatus && (
                  <span className="badge badge-warning text-base-content font-bold uppercase text-[10px]">
                    রিটার্ন: {selectedOrder.courierReturnStatus}
                  </span>
                )}
                {selectedOrder.courierReturnRequestedAt && (
                  <span>
                    রিটার্ন অনুরোধ:{" "}
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
                    Steadfast ট্র্যাকিং খুলুন
                  </a>
                )}
              </div>

              {selectedOrder.courierReturnReason && (
                <p className="text-[11px] text-base-content/60">
                  রিটার্নের কারণ: {selectedOrder.courierReturnReason}
                </p>
              )}
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-base-200/50 p-4 rounded-xl text-xs">
              <div>
                <span className="text-base-content/60 font-semibold block uppercase">কাস্টমারের নাম:</span>
                <span className="font-bold text-sm text-base-content">
                  {selectedOrder.customerName || selectedOrder.customer?.name || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 font-semibold block uppercase">ফোন নম্বর:</span>
                <span className="font-bold text-sm text-base-content">
                  {selectedOrder.customerPhone || selectedOrder.customer?.phone || "N/A"}
                  {selectedOrder.customerSecondaryPhone && (
                    <span className="block text-xs font-normal text-base-content/60">
                      বিকল্প: {selectedOrder.customerSecondaryPhone}
                    </span>
                  )}
                </span>
              </div>
              {selectedOrder.customerEmail && (
                <div className="min-w-0">
                  <span className="text-base-content/60 font-semibold block uppercase">ইমেইল:</span>
                  <span className="block truncate font-bold text-sm text-base-content">
                    {selectedOrder.customerEmail}
                  </span>
                </div>
              )}
              <div>
                <span className="text-base-content/60 font-semibold block uppercase">জেলা ও থানা:</span>
                <span className="font-bold text-xs text-base-content">
                  {selectedOrder.customerDistrict || "N/A"} / {selectedOrder.customerThana || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-base-content/60 font-semibold block uppercase">অগ্রিম কুরিয়ার চার্জ নেওয়া হয়েছে:</span>
                {selectedOrder.isAdvanceCourierPaid ? (
                  <span className="font-bold text-xs text-success flex items-center gap-1 mt-0.5">
                    <CheckCircle2 size={12} /> হ্যাঁ (৳{Number(selectedOrder.advanceCourierAmount || 0).toLocaleString()} নেওয়া হয়েছে)
                  </span>
                ) : (
                  <span className="font-bold text-xs text-base-content/50 mt-0.5 block">
                    কোনো অগ্রিম নেওয়া হয়নি
                  </span>
                )}
              </div>
              <div className="sm:col-span-2">
                <span className="text-base-content/60 font-semibold block uppercase">ডেলিভারি ঠিকানা:</span>
                <span className="font-medium text-base-content">
                  {selectedOrder.shippingAddress || "N/A"}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-2">
              <h4 className="font-bold text-xs uppercase tracking-wider text-base-content/70">
                অর্ডারকৃত প্রোডাক্ট ({selectedOrder.orderItems.length})
              </h4>
              <div className="divide-y divide-base-200 border border-base-200 rounded-xl overflow-hidden">
                {selectedOrder.orderItems.map((item) => (
                  <div key={item.id} className="p-3 bg-base-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-base-content">{item.product?.name}</p>
                      <p className="text-base-content/60">
                        পরিমাণ: {item.quantity} | সাইজ: {item.productSize?.size?.name || "N/A"} | কালার: {item.productColor?.color?.name || "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-base-content">
                        বিক্রয় মূল্য: ৳{(item.resellerSellingPrice || item.snapshotPrice).toLocaleString()}
                      </p>
                      <p className="text-base-content/50">
                        খরচ: ৳{(item.resellerUnitCost || item.snapshotPrice).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Profit Summary Block */}
            <div className="p-3.5 bg-base-200/60 rounded-xl flex items-center justify-between text-xs font-bold border border-base-300">
              <span className="text-base-content/70">হিসাবকৃত উদ্যোক্তা প্রফিট:</span>
              {isProfitEarned(selectedOrder) ? (
                <span className="text-emerald-600 font-extrabold text-sm">
                  +৳{Number(selectedOrder.resellerProfit || 0).toLocaleString()} (অর্জিত)
                </span>
              ) : (
                <span className="text-amber-600 font-extrabold text-sm">
                  ৳{Number(selectedOrder.resellerProfit || 0).toLocaleString()} (ডেলিভারি ও পেমেন্ট বাকি)
                </span>
              )}
            </div>

            {/* Optional Notes */}
            {selectedOrder.notes && (
              <div className="p-3 bg-base-200/60 rounded-xl text-xs space-y-1">
                <span className="font-bold text-base-content/70 block">উদ্যোক্তার নোট:</span>
                <p className="text-base-content">{selectedOrder.notes}</p>
              </div>
            )}

          </div>
        </PanelModal>
      )}
    </PanelPage>
  );
}
