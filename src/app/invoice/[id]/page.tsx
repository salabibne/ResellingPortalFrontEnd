"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, ShoppingBag, Phone, AlertTriangle, Loader2 } from "lucide-react";
import { orderApi, Order } from "@/services/order.api";
import { useAuthStore } from "@/store/useAuthStore";
import BrandLogo from "@/components/shared/BrandLogo";
import { getCodToCollect, getCustomerUnitPrice } from "@/utils/orderAmounts";

const BRAND_NAME = "Online Uddokta Platform";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH_ON_DELIVERY: "Cash on Delivery",
  BKASH: "bKash",
  NAGAD: "Nagad",
  BANK_TRANSFER: "Bank Transfer",
};

const money = (value: number) => `৳${Math.round(Number(value) || 0).toLocaleString("en-US")}`;

const formatDate = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Printable invoice / parcel sticker for an order.
 * Lives outside the dashboard layout so only the invoice itself is printed.
 * Access control is enforced by GET /orders/:id (staff, or the owning uddokta).
 */
export default function OrderInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const { isAuthenticated, hasHydrated } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoPrinted = useRef(false);

  useEffect(() => {
    if (!hasHydrated || !orderId) return;
    if (!isAuthenticated) {
      router.push(`/login?redirect=/invoice/${orderId}`);
      return;
    }
    setLoading(true);
    orderApi
      .getOrderById(orderId)
      .then((res) => {
        setOrder(res);
        setError(null);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Order not found or access denied.");
      })
      .finally(() => setLoading(false));
  }, [orderId, hasHydrated, isAuthenticated, router]);

  // Open the print dialog automatically when opened with ?print=1
  useEffect(() => {
    if (!order || autoPrinted.current) return;
    if (new URLSearchParams(window.location.search).get("print") !== "1") return;
    autoPrinted.current = true;
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, [order]);

  useEffect(() => {
    if (order) document.title = `Invoice ${order.orderRef || order.id} - ${BRAND_NAME}`;
  }, [order]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 text-slate-500 gap-2">
        <Loader2 className="animate-spin" size={20} /> Loading invoice...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 gap-4 p-6 text-center">
        <AlertTriangle className="text-error" size={36} />
        <p className="font-semibold text-slate-700">{error || "Order not found."}</p>
        <button className="btn btn-sm btn-outline" onClick={() => router.back()}>
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    );
  }

  const isReseller = !!order.isResellerOrder;
  const seller = isReseller
    ? {
        name: order.reseller?.name || order.customer?.name || "Uddokta",
        pageName: order.reseller?.pageName || order.customer?.pageName,
        phone: order.reseller?.phone || order.customer?.phone,
        secondaryPhone: order.reseller?.secondaryPhone,
      }
    : null;

  const customerName = order.customerName || order.customer?.name || "Customer";
  const customerPhone = order.customerPhone || order.customer?.phone || "";
  const items = order.orderItems || [];

  const productsTotal = isReseller
    ? Number(order.resellerSellPrice || 0) ||
      items.reduce((sum, item) => sum + getCustomerUnitPrice(order, item) * item.quantity, 0)
    : Number(order.subtotal || 0);
  const advancePaid = order.isAdvanceCourierPaid ? Number(order.advanceCourierAmount || 0) : 0;
  const deliveryCharge = order.isAdvanceCourierPaid ? advancePaid : Number(order.courierCharge || 0);
  const discount = !isReseller ? Number(order.discount || 0) : 0;
  const codAmount = getCodToCollect(order);
  const ref = order.orderRef || order.id;

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 print:bg-white print:p-0 print:min-h-0">
      <style>{`@page { size: A4; margin: 8mm; }`}</style>

      {/* Toolbar (screen only) */}
      <div className="max-w-[760px] mx-auto mb-4 flex items-center justify-between gap-2 print:hidden">
        <button className="btn btn-sm btn-ghost" onClick={() => (window.history.length > 1 ? router.back() : window.close())}>
          <ArrowLeft size={16} /> Back
        </button>
        <button className="btn btn-sm btn-primary text-white" onClick={() => window.print()}>
          <Printer size={16} /> Print Invoice
        </button>
      </div>

      {/* Printable invoice */}
      <div className="max-w-[760px] mx-auto bg-white text-black border-2 border-black rounded-lg p-5 sm:p-6 shadow-sm print:shadow-none print:rounded-none print:max-w-none text-[13px] leading-snug">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
          <div className="flex items-center gap-2 min-w-0">
            <BrandLogo className="h-10 w-auto max-w-[200px] object-contain" alt={BRAND_NAME}>
              <ShoppingBag size={26} className="text-[#001C94] shrink-0" />
              <span className="font-extrabold text-lg text-[#001C94] leading-tight">{BRAND_NAME}</span>
            </BrandLogo>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xl font-extrabold tracking-wide">INVOICE</div>
            <div className="font-mono font-bold">#{ref}</div>
            <div className="text-[11px] text-slate-600">{formatDate(order.createdAt)}</div>
          </div>
        </div>

        {/* Seller + customer */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {seller ? (
            <div className="border-2 border-black rounded-md p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Seller (Uddokta)</div>
              <div className="font-bold text-base mt-0.5">{seller.name}</div>
              {seller.pageName && <div className="text-xs text-slate-700">Page: {seller.pageName}</div>}
              {seller.phone && (
                <div className="mt-2">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Business Number</div>
                  <div className="flex items-center gap-1.5 font-extrabold text-xl font-mono">
                    <Phone size={16} className="shrink-0" /> {seller.phone}
                  </div>
                  {seller.secondaryPhone && (
                    <div className="font-mono font-semibold text-sm">Alt: {seller.secondaryPhone}</div>
                  )}
                </div>
              )}
              <div className="mt-2 text-[11px] font-semibold bg-slate-100 print:bg-transparent border border-dashed border-black rounded px-2 py-1">
                ডেলিভারি সংক্রান্ত যেকোনো প্রয়োজনে সেলারকে কল করুন।
              </div>
            </div>
          ) : (
            <div className="border-2 border-black rounded-md p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Sold By</div>
              <div className="font-bold text-base mt-0.5">{BRAND_NAME}</div>
            </div>
          )}

          <div className="border-2 border-black rounded-md p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-600">Deliver To</div>
            <div className="font-bold text-base mt-0.5">{customerName}</div>
            {customerPhone && (
              <div className="flex items-center gap-1.5 font-bold font-mono text-base">
                <Phone size={14} className="shrink-0" /> {customerPhone}
              </div>
            )}
            {order.customerSecondaryPhone && (
              <div className="font-mono text-sm">Alt: {order.customerSecondaryPhone}</div>
            )}
            {order.shippingAddress && <div className="mt-1 text-sm">{order.shippingAddress}</div>}
          </div>
        </div>

        {/* Courier info */}
        {(order.courierConsignmentId || order.courierTrackingCode) && (
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-xs border border-black rounded-md px-3 py-2">
            {order.courierProvider && (
              <span>
                Courier: <strong className="capitalize">{order.courierProvider}</strong>
              </span>
            )}
            {order.courierConsignmentId && (
              <span>
                Consignment ID: <strong className="font-mono">{order.courierConsignmentId}</strong>
              </span>
            )}
            {order.courierTrackingCode && (
              <span>
                Tracking: <strong className="font-mono">{order.courierTrackingCode}</strong>
              </span>
            )}
          </div>
        )}

        {/* Items */}
        <table className="w-full mt-3 border-collapse text-xs">
          <thead>
            <tr className="border-y-2 border-black text-left">
              <th className="py-1.5 pr-2 w-8">#</th>
              <th className="py-1.5 pr-2">Product</th>
              <th className="py-1.5 px-2 text-center w-12">Qty</th>
              <th className="py-1.5 px-2 text-right w-20">Price</th>
              <th className="py-1.5 pl-2 text-right w-24">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const unit = getCustomerUnitPrice(order, item);
              const variant = [
                item.productSize?.size?.name && `Size: ${item.productSize.size.name}`,
                item.productColor?.color?.name && `Color: ${item.productColor.color.name}`,
              ]
                .filter(Boolean)
                .join(" · ");
              return (
                <tr key={item.id} className="border-b border-slate-300 align-top">
                  <td className="py-1.5 pr-2">{idx + 1}</td>
                  <td className="py-1.5 pr-2">
                    <div className="font-semibold">{item.product?.name || "Product"}</div>
                    {variant && <div className="text-[11px] text-slate-600">{variant}</div>}
                  </td>
                  <td className="py-1.5 px-2 text-center">{item.quantity}</td>
                  <td className="py-1.5 px-2 text-right">{money(unit)}</td>
                  <td className="py-1.5 pl-2 text-right font-semibold">{money(unit * item.quantity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Totals + notes */}
        <div className="mt-3 grid grid-cols-2 gap-3 items-start">
          <div className="text-xs space-y-1">
            <div>
              Payment: <strong>{PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}</strong>
              {order.paymentStatus === "PAID" && <strong> (PAID)</strong>}
            </div>
            {order.notes && (
              <div className="border border-dashed border-black rounded px-2 py-1">
                <span className="font-bold">Note:</span> {order.notes}
              </div>
            )}
          </div>

          <div className="text-sm">
            <div className="flex justify-between py-0.5">
              <span>Products Total</span>
              <span className="font-semibold">{money(productsTotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-0.5">
                <span>Discount</span>
                <span className="font-semibold">-{money(discount)}</span>
              </div>
            )}
            <div className="flex justify-between py-0.5">
              <span>Delivery Charge</span>
              <span className="font-semibold">{money(deliveryCharge)}</span>
            </div>
            {advancePaid > 0 && (
              <div className="flex justify-between py-0.5">
                <span>Advance Paid</span>
                <span className="font-semibold">-{money(advancePaid)}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-1 border-2 border-black rounded-md px-2 py-1.5">
              <span className="font-bold uppercase text-xs tracking-wide">Collect (COD)</span>
              <span className="font-extrabold text-xl">{money(codAmount)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-slate-300 text-center text-[10px] text-slate-500">
          Thank you for your order · {BRAND_NAME}
        </div>
      </div>
    </div>
  );
}
