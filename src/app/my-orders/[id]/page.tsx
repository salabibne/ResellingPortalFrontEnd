"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  PackageCheck,
  Printer,
  MapPin,
  CreditCard,
  FileText,
  User,
  Phone,
  Mail,
  Ruler,
  Palette,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/shared/Footer";
import { orderApi, Order, OrderProcessingStatus, PaymentStatus } from "@/services/order.api";
import { useAuthStore } from "@/store/useAuthStore";

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const { isAuthenticated } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/my-orders/${orderId}`);
      return;
    }

    if (orderId) {
      setLoading(true);
      orderApi
        .getOrderById(orderId)
        .then((res) => {
          setOrder(res);
          setError(null);
        })
        .catch((err) => {
          console.error("Failed to fetch order details:", err);
          setError(err?.response?.data?.message || "Order not found or access denied.");
        })
        .finally(() => setLoading(false));
    }
  }, [orderId, isAuthenticated, router]);

  const steps: OrderProcessingStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ];

  const getStepIndex = (status: OrderProcessingStatus) => {
    return steps.indexOf(status);
  };

  const currentStepIndex = order ? getStepIndex(order.processingStatus) : -1;
  const isCancelledOrReturned =
    order?.processingStatus === "CANCELLED" || order?.processingStatus === "RETURNED";

  const renderPaymentBadge = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return <span className="badge badge-success text-white font-bold">PAID</span>;
      case "DUE":
        return <span className="badge badge-warning text-slate-900 font-bold">DUE</span>;
      case "PARTIAL":
        return <span className="badge badge-info text-white font-bold">PARTIAL</span>;
      default:
        return <span className="badge badge-error text-white font-bold">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8 md:py-12">
        {/* Top Back Navigation & Actions */}
        <div className="flex items-center justify-between gap-4 mb-6 print:hidden">
          <Link
            href="/my-orders"
            className="btn btn-sm btn-ghost gap-2 text-slate-600 hover:text-slate-900 font-medium"
          >
            <ArrowLeft size={16} /> Back to My Orders
          </Link>

          {order && (
            <button
              onClick={() => window.print()}
              className="btn btn-sm btn-outline btn-primary rounded-xl gap-2 font-bold"
            >
              <Printer size={16} /> Print / Save Invoice
            </button>
          )}
        </div>

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-sm font-medium text-slate-500 mt-4">Loading order invoice details...</p>
          </div>
        ) : error || !order ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-lg mx-auto">
            <XCircle size={56} className="mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-slate-900">Order Not Found</h2>
            <p className="text-sm text-slate-500 mt-2 mb-6">{error}</p>
            <Link href="/my-orders" className="btn btn-primary rounded-full px-6">
              Return to My Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Box */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Invoice & Order Reference
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mt-1">
                    #{order.id.toUpperCase()}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Placed on{" "}
                    <span className="font-semibold text-slate-700">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {renderPaymentBadge(order.paymentStatus)}
                  <span className="badge badge-lg bg-slate-900 text-white font-extrabold px-4 py-3">
                    {order.processingStatus}
                  </span>
                </div>
              </div>

              {/* Status Stepper Bar */}
              {isCancelledOrReturned ? (
                <div className="alert alert-error text-white font-bold rounded-2xl flex items-center gap-3">
                  <XCircle size={24} />
                  <div>
                    <h4 className="font-extrabold">Order {order.processingStatus}</h4>
                    <p className="text-xs opacity-90 font-normal">
                      This order has been {order.processingStatus.toLowerCase()}. Product inventory has been automatically synchronized.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Fulfillment Progress Tracker
                  </h4>
                  <div className="grid grid-cols-5 gap-2 relative">
                    {steps.map((stepName, idx) => {
                      const isCompleted = idx <= currentStepIndex;
                      const isCurrent = idx === currentStepIndex;

                      return (
                        <div key={stepName} className="flex flex-col items-center text-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                              isCompleted
                                ? "bg-primary text-white shadow-md shadow-primary/20 scale-105"
                                : "bg-slate-100 text-slate-400 border border-slate-200"
                            }`}
                          >
                            {idx + 1}
                          </div>
                          <span
                            className={`text-xs mt-2 font-bold ${
                              isCurrent
                                ? "text-primary"
                                : isCompleted
                                ? "text-slate-800"
                                : "text-slate-400"
                            }`}
                          >
                            {stepName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Main Content Grid: Itemized Invoice & Sidebar */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Items Table */}
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-sm">
                  <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-4 mb-4">
                    Ordered Variant Items ({order.orderItems?.length || 0})
                  </h3>

                  <div className="divide-y divide-slate-100">
                    {order.orderItems?.map((item) => {
                      const imgUrl = item.product?.images?.[0]?.imageUrl || "/placeholder.png";
                      return (
                        <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                              <img
                                src={imgUrl}
                                alt={item.product?.name || "Product"}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-base">
                                {item.product?.name || "Apparel Product"}
                              </h4>
                              <div className="flex flex-wrap gap-2 text-xs mt-1.5">
                                {item.productSize?.size?.name && (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700 border border-slate-200">
                                    <Ruler size={10} /> Size: {item.productSize.size.name}
                                  </span>
                                )}
                                {item.productColor?.color?.name && (
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 font-bold text-slate-700 border border-slate-200">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full border border-black/20"
                                      style={{ backgroundColor: item.productColor.color.colorCode || "#000" }}
                                    />
                                    Color: {item.productColor.color.name}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-right sm:text-right flex sm:flex-col justify-between items-center sm:items-end pt-2 sm:pt-0">
                            <div className="text-xs text-slate-500 font-medium">
                              ৳{Number(item.snapshotPrice).toLocaleString()} × {item.quantity}
                            </div>
                            <div className="text-base font-black text-slate-900">
                              ৳{Number(item.subtotal).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Right Column: Order & Customer Summary Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                {/* Cost Summary Box */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                  <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                    Invoice Breakdown
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-bold text-slate-900">৳ {Number(order.subtotal).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Courier Charge</span>
                      <span className="font-bold text-slate-900">+৳ {Number(order.courierCharge).toLocaleString()}</span>
                    </div>
                    {Number(order.discount) > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Discount</span>
                        <span>-৳ {Number(order.discount).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                      <span>Grand Total</span>
                      <span className="text-primary text-xl">৳ {Number(order.total).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery & Payment Info */}
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <MapPin size={14} className="text-primary" /> Delivery Address
                    </div>
                    <p className="text-xs font-medium text-slate-800 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {order.shippingAddress || "Standard Shipping Address"}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <CreditCard size={14} className="text-emerald-600" /> Payment Details
                    </div>
                    <div className="text-xs text-slate-700 space-y-1">
                      <div>
                        Method: <span className="font-bold text-slate-900">{order.paymentMethod}</span>
                      </div>
                      <div>
                        Payment Status: {renderPaymentBadge(order.paymentStatus)}
                      </div>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <FileText size={14} className="text-indigo-600" /> Customer Notes
                      </div>
                      <p className="text-xs italic text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                        "{order.notes}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
