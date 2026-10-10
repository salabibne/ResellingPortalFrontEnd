"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  RefreshCw,
  Truck,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/shared/Footer";
import { orderApi, Order, OrderProcessingStatus, PaymentStatus } from "@/services/order.api";
import { useAuthStore } from "@/store/useAuthStore";

export default function MyOrdersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1 });
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("ALL");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/my-orders");
    }
  }, [isAuthenticated, router]);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderApi.getOrders(
        page,
        limit,
        undefined,
        selectedStatusFilter !== "ALL" ? (selectedStatusFilter as OrderProcessingStatus) : undefined
      );
      setOrders(res.data || []);
      setMeta({
        total: res.meta?.total || 0,
        totalPages: res.meta?.totalPages || 1,
      });
    } catch (err) {
      console.error("Failed to fetch customer orders:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, selectedStatusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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

  const statusFilters = [
    { label: "All Orders", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:py-12">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 text-white shadow-xl mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShoppingBag size={16} /> Retailer Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Orders & Invoices</h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              View your order history, track shipment progress, and check invoice details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/10 text-center">
              <div className="text-xs text-slate-300 font-medium">Total Orders Placed</div>
              <div className="text-xl sm:text-2xl font-black text-white">{meta.total}</div>
            </div>
            <button
              onClick={fetchOrders}
              className="btn btn-ghost btn-circle text-white hover:bg-white/10"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 sm:mb-6 no-scrollbar">
          <Filter size={16} className="text-slate-400 shrink-0 mr-1" />
          {statusFilters.map((st) => (
            <button
              key={st.value}
              onClick={() => {
                setSelectedStatusFilter(st.value);
                setPage(1);
              }}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedStatusFilter === st.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Orders Table Container */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 sm:p-12 text-center text-slate-400">
              <ShoppingBag size={48} className="mx-auto mb-3 opacity-40 text-slate-400 sm:w-14 sm:h-14" />
              <h3 className="text-lg font-bold text-slate-800">No Orders Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto mb-6">
                {selectedStatusFilter !== "ALL"
                  ? `No orders with status "${selectedStatusFilter}" were found.`
                  : "You haven&apos;t placed any orders yet. Explore our shop catalog!"}
              </p>
              <Link href="/shop" className="btn btn-primary rounded-full px-6 btn-sm">
                Start Shopping <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-4">Order Reference</th>
                    <th>Date & Time</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Total Amount</th>
                    <th className="text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="font-mono font-bold text-primary text-xs py-4">
                        {ord.orderRef || `#${ord.id.substring(0, 8).toUpperCase()}`}
                      </td>
                      <td className="text-xs text-slate-500 font-medium">
                        {new Date(ord.createdAt).toLocaleString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="font-bold text-slate-700">
                        {ord.orderItems?.length || 0} {ord.orderItems?.length === 1 ? "item" : "items"}
                      </td>
                      <td>{renderProcessingBadge(ord.processingStatus)}</td>
                      <td>{renderPaymentBadge(ord.paymentStatus)}</td>
                      <td className="font-black text-slate-900">
                        ৳ {Number(ord.total).toLocaleString()}
                      </td>
                      <td className="text-right pr-6">
                        <Link
                          href={`/my-orders/${ord.id}`}
                          className="btn btn-xs btn-outline btn-primary rounded-lg gap-1"
                        >
                          <Eye size={14} /> View Invoice
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {meta.totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <span className="text-xs font-medium text-slate-500">
                Showing page {page} of {meta.totalPages} ({meta.total} total orders)
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
      </main>

      <Footer />
    </div>
  );
}
