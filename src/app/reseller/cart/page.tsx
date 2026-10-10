"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  User,
  Phone,
  Truck,
  FileText,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Package,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useResellerCartStore } from "@/store/useResellerCartStore";
import { orderApi, CourierPolicy, PaymentMethod } from "@/services/order.api";

export default function ResellerCartPage() {
  const router = useRouter();
  const {
    items,
    updateQuantity,
    updateSellingPrice,
    removeItem,
    clearCart,
  } = useResellerCartStore();

  const [courierPolicy, setCourierPolicy] = useState<CourierPolicy | null>(null);
  const [isAdvancePaid, setIsAdvancePaid] = useState<boolean>(false);
  const [advanceCourierAmount, setAdvanceCourierAmount] = useState<number>(120);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH_ON_DELIVERY");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Customer Form Fields
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerSecondaryPhone, setCustomerSecondaryPhone] = useState<string>("");
  const [customerDistrict, setCustomerDistrict] = useState<string>("");
  const [customerThana, setCustomerThana] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  useEffect(() => {
    async function loadPolicy() {
      try {
        const policy = await orderApi.getCourierPolicy();
        if (policy) {
          setCourierPolicy(policy);
          setAdvanceCourierAmount(Number(policy.defaultCharge || 120));
        }
      } catch (err) {
        console.error("Failed to load courier policy:", err);
      }
    }
    loadPolicy();
  }, []);

  const defaultCourierCharge = Number(courierPolicy?.defaultCharge || 120);

  // Validate item prices
  const invalidPriceItems = items.filter(
    (i) => Number(i.resellerSellingPrice || 0) < Number(i.resellerPrice || 0)
  );

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg("Your reseller cart is empty. Please add products first.");
      return;
    }

    if (invalidPriceItems.length > 0) {
      setErrorMsg(
        `Custom selling price for item(s) cannot be less than the Admin wholesale reseller price.`
      );
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg("Please enter the customer name.");
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg("Please enter the customer phone number.");
      return;
    }
    if (!customerDistrict.trim() || !customerThana.trim() || !shippingAddress.trim()) {
      setErrorMsg("Please provide full delivery address (District, Thana, Address).");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          productSizeId: i.productSizeId || undefined,
          productColorId: i.productColorId || undefined,
          quantity: i.quantity,
          resellerSellingPrice:
            i.customSellingPrice && Number(i.customSellingPrice) !== Number(i.resellerPrice)
              ? Number(i.customSellingPrice)
              : undefined,
        })),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerSecondaryPhone: customerSecondaryPhone.trim() || undefined,
        customerDistrict: customerDistrict.trim(),
        customerThana: customerThana.trim(),
        shippingAddress: shippingAddress.trim(),
        courierCharge: defaultCourierCharge,
        isAdvanceCourierPaid: isAdvancePaid,
        advanceCourierAmount: isAdvancePaid ? Number(advanceCourierAmount || 0) : 0,
        paymentMethod: paymentMethod,
        notes: notes.trim() || undefined,
      };

      await orderApi.createResellerOrder(payload);
      clearCart();
      router.push("/reseller/orders?success=1");
    } catch (err: any) {
      console.error("Reseller checkout error:", err);
      setErrorMsg(
        err?.response?.data?.message ||
          "Failed to place reseller order. Please verify your details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-base-200 text-base-content/40 flex items-center justify-center mx-auto">
          <ShoppingBag size={32} />
        </div>
        <h2 className="text-2xl font-bold text-base-content">
          Your Reseller Cart is Empty
        </h2>
        <p className="text-sm text-base-content/60 max-w-md mx-auto">
          Browse the wholesale catalog to add products and place orders on behalf of your customers.
        </p>
        <Link href="/reseller/products" className="btn btn-primary font-bold">
          Browse Wholesale Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/reseller/products" className="btn btn-ghost btn-circle btn-sm shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-base-content">
              Reseller Order Checkout
            </h1>
            <p className="text-xs text-base-content/60">
              Enter customer details & set your custom selling price for each item.
            </p>
          </div>
        </div>
        <button
          onClick={clearCart}
          className="btn btn-ghost btn-xs text-error gap-1 hover:bg-error/10 self-end sm:self-auto"
        >
          <Trash2 size={14} /> Clear Cart
        </button>
      </div>

      {errorMsg && (
        <div className="alert alert-error text-xs shadow-sm">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Selected Products & Customer Form (2 Columns wide) */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Selected Products List */}
          <div className="card bg-base-100 border border-base-200 shadow-sm p-4 sm:p-5 space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2 text-base-content border-b border-base-200 pb-3">
              <Package size={18} className="text-primary" />
              <span>Selected Products ({items.length})</span>
            </h2>

            <div className="divide-y divide-base-200">
              {items.map((item) => {
                const currentSellingPrice = item.customSellingPrice ?? item.resellerPrice;
                const isPriceBelowReseller =
                  item.customSellingPrice !== undefined &&
                  Number(item.customSellingPrice) < Number(item.resellerPrice);

                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                    <div className="flex items-start gap-4">
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/80"}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded-lg bg-base-200 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-bold text-sm truncate text-base-content">
                          {item.productName}
                        </h4>
                        <div className="flex flex-wrap gap-2 text-xs text-base-content/60">
                          {item.sizeName && (
                            <span className="bg-base-200 px-2 py-0.5 rounded">
                              Size: {item.sizeName}
                            </span>
                          )}
                          {item.colorName && (
                            <span className="bg-base-200 px-2 py-0.5 rounded">
                              Color: {item.colorName}
                            </span>
                          )}
                          <span className="text-primary font-bold">
                            Reseller Base Price: ৳{item.resellerPrice}
                          </span>
                          {item.purchasePrice !== undefined && (
                            <span className="text-slate-500 font-medium">
                              (Purchase Price: ৳{item.purchasePrice})
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-1">
                          Item Subtotal (Customer Sell):{" "}
                          <strong className="text-sm font-black text-indigo-900">
                            ৳{(currentSellingPrice * item.quantity).toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="btn btn-ghost btn-xs text-base-content/40 hover:text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Quantity, Custom Selling Price Inputs & Profit Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-base-200/50 p-3 rounded-xl border border-base-200">
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="text-xs font-semibold text-base-content/70">Qty:</span>
                        <div className="join border border-base-300 rounded-lg bg-base-100">
                          <button
                            type="button"
                            className="join-item btn btn-xs btn-ghost"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="join-item px-3 py-0.5 text-xs font-bold flex items-center">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="join-item btn btn-xs btn-ghost"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-base-content/70 whitespace-nowrap">
                            Selling Price (৳):
                          </span>
                          <input
                            type="number"
                            min={item.resellerPrice}
                            className={`input input-sm input-bordered w-full text-xs font-bold ${
                              isPriceBelowReseller ? "input-error" : ""
                            }`}
                            value={
                              item.customSellingPrice !== undefined
                                ? item.customSellingPrice === 0
                                  ? ""
                                  : item.customSellingPrice
                                : item.resellerPrice
                            }
                            onChange={(e) => {
                              const val = e.target.value === "" ? 0 : Number(e.target.value);
                              updateSellingPrice(item.id, val);
                            }}
                            onBlur={(e) => {
                              const val = Number(e.target.value);
                              if (isNaN(val) || val <= 0 || val === item.resellerPrice) {
                                updateSellingPrice(item.id, undefined);
                              } else if (val < item.resellerPrice) {
                                updateSellingPrice(item.id, undefined);
                              }
                            }}
                          />
                        </div>
                        {isPriceBelowReseller ? (
                          <span className="text-[10px] text-error font-bold flex items-center gap-1">
                            <AlertTriangle size={12} /> Selling price cannot be less than reseller base price (৳{item.resellerPrice})
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            Profit: ৳
                            {(
                              (currentSellingPrice - Number(item.purchasePrice || 0)) *
                              item.quantity
                            ).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Customer Information Form */}
          <div className="card bg-base-100 border border-base-200 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2 text-base-content border-b border-base-200 pb-3">
              <User size={18} className="text-primary" />
              <span>Customer Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label text-xs font-bold text-base-content">
                  Customer Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahat Ahmed"
                  className="input input-bordered w-full input-sm"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-base-content">
                  Primary Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 01700000000"
                  className="input input-bordered w-full input-sm"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-base-content">
                  Secondary Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 01800000000"
                  className="input input-bordered w-full input-sm"
                  value={customerSecondaryPhone}
                  onChange={(e) => setCustomerSecondaryPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-base-content">
                  District *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dhaka / Gazipur / Chittagong"
                  className="input input-bordered w-full input-sm"
                  required
                  value={customerDistrict}
                  onChange={(e) => setCustomerDistrict(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-base-content">
                  Thana / Upazila *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mirpur / Dhanmondi / Sadar"
                  className="input input-bordered w-full input-sm"
                  required
                  value={customerThana}
                  onChange={(e) => setCustomerThana(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label text-xs font-bold text-base-content">
                  Full Delivery Address *
                </label>
                <textarea
                  rows={2}
                  placeholder="House no, Road no, Area details..."
                  className="textarea textarea-bordered w-full text-xs"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Courier Policy Info & Advance Charge Section */}
        <div className="space-y-6">
          {/* 3. Delivery & Courier Charge Info (Text Format) */}
          <div className="card bg-base-100 border border-base-200 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2 text-base-content border-b border-base-200 pb-3">
              <Truck size={18} className="text-primary" />
              <span>Courier Charge Info</span>
            </h2>

            {/* Display Admin configured courier charge in text format */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-primary">
                <Info size={16} />
                <span>{courierPolicy?.title || "Courier Policy"}</span>
              </div>
              <p className="text-xs text-base-content/80 leading-relaxed font-medium">
                {courierPolicy?.chargeText ||
                  "Inside Dhaka City: ৳70 | Sub-Urban Dhaka: ৳100 | Outside Dhaka: ৳130. Advance courier fee is collected by reseller if applicable."}
              </p>
            </div>

            {/* Advance Courier Charge Received (Yes / No) */}
            <div className="space-y-3 pt-2 border-t border-base-200">
              <label className="text-xs font-bold text-base-content block">
                Advance Courier Charge Received from Customer?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${
                    isAdvancePaid ? "btn-success text-white" : "btn-outline border-base-300"
                  }`}
                  onClick={() => setIsAdvancePaid(true)}
                >
                  <CheckCircle2 size={16} /> Yes
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${
                    !isAdvancePaid ? "btn-neutral" : "btn-outline border-base-300"
                  }`}
                  onClick={() => setIsAdvancePaid(false)}
                >
                  No
                </button>
              </div>

              {/* If Yes, How much did they take? */}
              {isAdvancePaid && (
                <div className="pt-2 space-y-1">
                  <label className="text-xs font-bold text-base-content block">
                    How much advance courier charge did you receive? (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 120"
                    className="input input-bordered input-sm w-full font-bold text-xs"
                    value={advanceCourierAmount}
                    onChange={(e) => setAdvanceCourierAmount(Number(e.target.value))}
                  />
                </div>
              )}
            </div>

            {/* Optional Reseller Notes Field */}
            <div className="space-y-1 pt-2 border-t border-base-200">
              <label className="text-xs font-bold text-base-content flex items-center gap-1">
                <FileText size={14} className="text-base-content/60" />
                <span>Optional Order Notes</span>
              </label>
              <textarea
                rows={3}
                placeholder="Write any special delivery instructions or notes..."
                className="textarea textarea-bordered w-full text-xs"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* 4. Payment Method & Submit Action */}
          <div className="card bg-base-100 border border-base-200 shadow-sm p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-base-content block mb-2">
                Payment Method:
              </label>
              <select
                className="select select-bordered select-sm w-full font-semibold"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value="CASH_ON_DELIVERY">Cash On Delivery (COD)</option>
                <option value="BKASH">bKash</option>
                <option value="NAGAD">Nagad</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>

            {/* Reseller Order Store Billing Preview */}
            <div className="p-4 bg-base-200/80 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-medium text-base-content/80">
                <span>Reseller Subtotal:</span>
                <span className="font-extrabold text-base-content">
                  ৳
                  {items
                    .reduce(
                      (sum, i) =>
                        sum + Number(i.customSellingPrice || i.resellerPrice) * i.quantity,
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-medium text-base-content/80">
                <span>Courier Charge:</span>
                <span className="font-bold text-base-content">
                  {isAdvancePaid ? (
                    <span className="text-success">
                      ৳0 (Advance fee collected by you)
                    </span>
                  ) : (
                    `+৳${defaultCourierCharge}`
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600 border-t border-dashed border-base-300 pt-1">
                <span>Estimated Reseller Profit:</span>
                <span>
                  +৳
                  {items
                    .reduce(
                      (sum, i) =>
                        sum +
                        (Number(i.customSellingPrice || i.resellerPrice) -
                          Number(i.purchasePrice || 0)) *
                          i.quantity,
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-black text-sm text-base-content border-t border-base-300 pt-2">
                <span>Total Bill:</span>
                <span className="text-primary font-black text-base">
                  ৳
                  {(
                    items.reduce(
                      (sum, i) =>
                        sum + Number(i.customSellingPrice || i.resellerPrice) * i.quantity,
                      0
                    ) + (isAdvancePaid ? 0 : defaultCourierCharge)
                  ).toLocaleString()}
                </span>
              </div>
              {isAdvancePaid && (
                <p className="text-[10px] text-base-content/60 font-medium italic pt-1">
                  * Note: Courier charge of ৳{defaultCourierCharge} was collected in advance by you from your customer, so ৳0 is added to your total store bill.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting || invalidPriceItems.length > 0}
              className="btn btn-primary w-full shadow-lg font-extrabold text-base"
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Placing Order...
                </>
              ) : (
                "Place Reseller Order"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
