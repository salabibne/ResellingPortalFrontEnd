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
  Package,
  AlertTriangle,
  Info,
  ShieldAlert,
  Clock,
} from "lucide-react";
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelEmpty from "@/components/panel/PanelEmpty";
import { useResellerCartStore } from "@/store/useResellerCartStore";
import { orderApi, CourierPolicy, PaymentMethod } from "@/services/order.api";
import { isProfileNotVerifiedError } from "@/services/profile.api";
import {
  ACCOUNT_PENDING_MESSAGE,
  isAccountPendingError,
  useCanOrder,
  useResellerProfileStore,
} from "@/store/useResellerProfileStore";

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
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerDistrict, setCustomerDistrict] = useState<string>("");
  const [customerThana, setCustomerThana] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const { canOrder, pending, verification } = useCanOrder();

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

  // Validate item prices. The effective selling price falls back to the
  // wholesale price when the reseller has not set a custom one.
  const invalidPriceItems = items.filter(
    (i) =>
      Number(i.customSellingPrice || i.resellerSellingPrice || i.resellerPrice || 0) <
      Number(i.resellerPrice || 0)
  );

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setErrorMsg("আপনার কার্ট খালি। আগে প্রোডাক্ট যোগ করুন।");
      return;
    }

    if (pending) {
      setErrorMsg(ACCOUNT_PENDING_MESSAGE);
      return;
    }

    if (!canOrder) {
      setErrorMsg("অর্ডার করতে প্রথমে প্রোফাইল ভেরিফাই করুন।");
      return;
    }

    if (invalidPriceItems.length > 0) {
      setErrorMsg(
        `কোনো আইটেমের বিক্রয় মূল্য অ্যাডমিন নির্ধারিত উদ্যোক্তা পাইকারি মূল্যের চেয়ে কম হতে পারবে না।`
      );
      return;
    }

    if (!customerName.trim()) {
      setErrorMsg("কাস্টমারের নাম লিখুন।");
      return;
    }
    if (!customerPhone.trim()) {
      setErrorMsg("কাস্টমারের ফোন নম্বর লিখুন।");
      return;
    }
    if (!customerDistrict.trim() || !customerThana.trim() || !shippingAddress.trim()) {
      setErrorMsg("সম্পূর্ণ ডেলিভারি ঠিকানা দিন (জেলা, থানা, ঠিকানা)।");
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
        // Left out entirely when blank so the courier never receives an empty email.
        customerEmail: customerEmail.trim() || undefined,
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
      if (isAccountPendingError(err)) {
        // Server says the account is not approved yet: refresh the status.
        useResellerProfileStore.getState().refresh().catch(() => undefined);
      } else if (isProfileNotVerifiedError(err)) {
        // Server says the profile is incomplete: refresh the badge everywhere.
        useResellerProfileStore.getState().refresh().catch(() => undefined);
      }
      setErrorMsg(
        err?.response?.data?.message ||
          "অর্ডার সম্পন্ন করা যায়নি। আপনার দেওয়া তথ্যগুলো যাচাই করে আবার চেষ্টা করুন।"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <PanelPage width="narrow">
        <PanelEmpty
          icon={ShoppingBag}
          title="আপনার কার্ট খালি"
          text="প্রোডাক্ট ক্যাটালগ থেকে প্রোডাক্ট যোগ করুন এবং আপনার কাস্টমারের পক্ষে অর্ডার করুন।"
          action={
            <Link href="/reseller/products" className="btn btn-primary btn-sm rounded-xl">
              প্রোডাক্ট ক্যাটালগ দেখুন
            </Link>
          }
        />
      </PanelPage>
    );
  }

  return (
    <PanelPage width="narrow">
      <PanelPageHeader
        title="উদ্যোক্তা অর্ডার চেকআউট"
        subtitle="কাস্টমারের তথ্য দিন এবং প্রতিটি আইটেমের বিক্রয় মূল্য নির্ধারণ করুন।"
        icon={ShoppingBag}
        backHref="/reseller/products"
        actions={
          <button
            type="button"
            onClick={clearCart}
            className="btn btn-ghost btn-sm rounded-xl gap-2 text-error hover:bg-error/10"
          >
            <Trash2 size={16} /> কার্ট খালি করুন
          </button>
        }
      />

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
          <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-4 sm:p-5 space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2 text-base-content border-b border-base-200 pb-3">
              <Package size={18} className="text-primary" />
              <span>নির্বাচিত প্রোডাক্ট ({items.length})</span>
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
                              সাইজ: {item.sizeName}
                            </span>
                          )}
                          {item.colorName && (
                            <span className="bg-base-200 px-2 py-0.5 rounded">
                              কালার: {item.colorName}
                            </span>
                          )}
                          <span className="text-primary font-bold">
                            উদ্যোক্তা মূল মূল্য: ৳{item.resellerPrice}
                          </span>
                          {item.purchasePrice !== undefined && (
                            <span className="text-slate-500 font-medium">
                              (ক্রয় মূল্য: ৳{item.purchasePrice})
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-700 mt-1">
                          আইটেম সাবটোটাল (কাস্টমারের কাছে বিক্রি):{" "}
                          <strong className="text-sm font-black text-indigo-900">
                            ৳{(currentSellingPrice * item.quantity).toLocaleString()}
                          </strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="btn btn-ghost btn-xs text-base-content/40 hover:text-error"
                        aria-label="আইটেম মুছুন"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {/* Quantity, Custom Selling Price Inputs & Profit Preview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-base-200/50 p-3 rounded-xl border border-base-200">
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <span className="text-xs font-semibold text-base-content/70">পরিমাণ:</span>
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
                            বিক্রয় মূল্য (৳):
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            autoComplete="off"
                            placeholder={String(item.resellerPrice)}
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
                              // Typed directly (no spinner); keep digits only.
                              const digits = e.target.value.replace(/[^0-9]/g, "");
                              const val = digits === "" ? 0 : Number(digits);
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
                            <AlertTriangle size={12} /> বিক্রয় মূল্য উদ্যোক্তা মূল মূল্যের (৳{item.resellerPrice}) চেয়ে কম হতে পারবে না
                          </span>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                            লাভ: ৳
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
          <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2 text-base-content border-b border-base-200 pb-3">
              <User size={18} className="text-primary" />
              <span>কাস্টমারের তথ্য</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label text-xs font-bold text-base-content">
                  কাস্টমারের নাম *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: রাহাত আহমেদ"
                  className="input input-bordered w-full input-sm"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-base-content">
                  প্রধান ফোন নম্বর *
                </label>
                <input
                  type="tel"
                  placeholder="যেমন: 01700000000"
                  className="input input-bordered w-full input-sm"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-base-content">
                  বিকল্প ফোন নম্বর (ঐচ্ছিক)
                </label>
                <input
                  type="tel"
                  placeholder="যেমন: 01800000000"
                  className="input input-bordered w-full input-sm"
                  value={customerSecondaryPhone}
                  onChange={(e) => setCustomerSecondaryPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-base-content">
                  কাস্টমারের ইমেইল (ঐচ্ছিক)
                </label>
                <input
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  maxLength={255}
                  placeholder="যেমন: customer@example.com"
                  className="input input-bordered w-full input-sm"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-base-content">
                  জেলা *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: ঢাকা / গাজীপুর / চট্টগ্রাম"
                  className="input input-bordered w-full input-sm"
                  required
                  value={customerDistrict}
                  onChange={(e) => setCustomerDistrict(e.target.value)}
                />
              </div>

              <div>
                <label className="label text-xs font-bold text-base-content">
                  থানা / উপজেলা *
                </label>
                <input
                  type="text"
                  placeholder="যেমন: মিরপুর / ধানমন্ডি / সদর"
                  className="input input-bordered w-full input-sm"
                  required
                  value={customerThana}
                  onChange={(e) => setCustomerThana(e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="label text-xs font-bold text-base-content">
                  সম্পূর্ণ ডেলিভারি ঠিকানা *
                </label>
                <textarea
                  rows={2}
                  placeholder="বাসা নং, রোড নং, এলাকার বিবরণ..."
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
        <div className="space-y-6 self-start lg:sticky lg:top-4">
          {/* 3. Delivery & Courier Charge Info (Text Format) */}
          <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-5 space-y-4">
            <h2 className="font-bold text-base flex items-center gap-2 text-base-content border-b border-base-200 pb-3">
              <Truck size={18} className="text-primary" />
              <span>কুরিয়ার চার্জের তথ্য</span>
            </h2>

            {/* Display Admin configured courier charge in text format */}
            <div className="p-4 bg-primary/5 rounded-xl border border-primary/20 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-primary">
                <Info size={16} />
                <span>{courierPolicy?.title || "কুরিয়ার পলিসি"}</span>
              </div>
              <p className="text-xs text-base-content/80 leading-relaxed font-medium">
                {courierPolicy?.chargeText ||
                  "ঢাকা সিটির ভেতরে: ৳৭০ | ঢাকার আশেপাশে: ৳১০০ | ঢাকার বাইরে: ৳১৩০। প্রযোজ্য ক্ষেত্রে অগ্রিম কুরিয়ার চার্জ উদ্যোক্তা সংগ্রহ করবেন।"}
              </p>
            </div>

            {/* Advance Courier Charge Received (Yes / No) */}
            <div className="space-y-3 pt-2 border-t border-base-200">
              <label className="text-xs font-bold text-base-content block">
                কাস্টমারের কাছ থেকে অগ্রিম কুরিয়ার চার্জ নিয়েছেন?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`btn btn-sm ${
                    isAdvancePaid ? "btn-success text-white" : "btn-outline border-base-300"
                  }`}
                  onClick={() => setIsAdvancePaid(true)}
                >
                  <CheckCircle2 size={16} /> হ্যাঁ
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${
                    !isAdvancePaid ? "btn-neutral" : "btn-outline border-base-300"
                  }`}
                  onClick={() => setIsAdvancePaid(false)}
                >
                  না
                </button>
              </div>

              {/* If Yes, How much did they take? */}
              {isAdvancePaid && (
                <div className="pt-2 space-y-1">
                  <label className="text-xs font-bold text-base-content block">
                    কত টাকা অগ্রিম কুরিয়ার চার্জ নিয়েছেন? (৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="যেমন: 120"
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
                <span>অর্ডার নোট (ঐচ্ছিক)</span>
              </label>
              <textarea
                rows={3}
                placeholder="ডেলিভারির বিশেষ নির্দেশনা বা নোট লিখুন..."
                className="textarea textarea-bordered w-full text-xs"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* 4. Payment Method & Submit Action */}
          <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-base-content block mb-2">
                পেমেন্ট পদ্ধতি:
              </label>
              <select
                className="select select-bordered select-sm w-full font-semibold"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value="CASH_ON_DELIVERY">ক্যাশ অন ডেলিভারি (COD)</option>
                <option value="BKASH">বিকাশ</option>
                <option value="NAGAD">নগদ</option>
                <option value="BANK_TRANSFER">ব্যাংক ট্রান্সফার</option>
              </select>
            </div>

            {/* Reseller Order Store Billing Preview */}
            <div className="p-4 bg-base-200/80 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between font-medium text-base-content/80">
                <span>উদ্যোক্তা সাবটোটাল:</span>
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
                <span>কুরিয়ার চার্জ:</span>
                <span className="font-bold text-base-content">
                  {isAdvancePaid ? (
                    <span className="text-success">
                      ৳0 (অগ্রিম চার্জ আপনি নিয়েছেন)
                    </span>
                  ) : (
                    `+৳${defaultCourierCharge}`
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600 border-t border-dashed border-base-300 pt-1">
                <span>আনুমানিক উদ্যোক্তা লাভ:</span>
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
                <span>মোট বিল:</span>
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
                  * নোট: ৳{defaultCourierCharge} কুরিয়ার চার্জ আপনি কাস্টমারের কাছ থেকে অগ্রিম নিয়েছেন, তাই আপনার মোট বিলে ৳0 যোগ হয়েছে।
                </p>
              )}
            </div>

            {pending && (
              <div className="rounded-xl bg-amber-50 p-3 text-[11px] text-amber-900 ring-1 ring-amber-200">
                <p className="flex items-center gap-1.5 font-bold">
                  <Clock size={14} /> অ্যাকাউন্ট অনুমোদনের অপেক্ষায়
                </p>
                <p className="mt-1 leading-relaxed">{ACCOUNT_PENDING_MESSAGE}</p>
              </div>
            )}
            {!canOrder ? (
              verification?.isVerified ? null : (
              <div className="space-y-2">
                <div className="rounded-xl bg-rose-50 p-3 text-[11px] text-rose-700 ring-1 ring-rose-200">
                  <p className="flex items-center gap-1.5 font-bold">
                    <ShieldAlert size={14} /> অর্ডার করতে প্রোফাইল ভেরিফাই করুন
                  </p>
                  {verification && verification.missing.length > 0 && (
                    <p className="mt-1 leading-relaxed">
                      বাকি তথ্য: {verification.missing.map((m) => m.label).join(", ")}
                    </p>
                  )}
                </div>
                <Link
                  href="/reseller/profile"
                  className="btn btn-sm w-full rounded-xl border-none bg-rose-600 font-bold text-white hover:bg-rose-700"
                >
                  <ShieldAlert size={14} /> ভেরিফাই করুন
                </Link>
              </div>
              )
            ) : (
            <button
              type="submit"
              disabled={submitting || invalidPriceItems.length > 0}
              className="btn btn-primary btn-sm rounded-xl w-full text-white font-semibold"
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  অর্ডার হচ্ছে...
                </>
              ) : (
                "উদ্যোক্তা অর্ডার কনফার্ম করুন"
              )}
            </button>
            )}
          </div>
        </div>
      </form>
    </PanelPage>
  );
}
