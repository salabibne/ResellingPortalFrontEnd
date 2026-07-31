"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShoppingBag,
  CreditCard,
  Truck,
  MapPin,
  FileText,
  AlertCircle,
  CheckCircle2,
  Building2,
  Smartphone,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/shared/Footer";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { orderApi } from "@/services/order.api";

const checkoutSchema = z.object({
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "BKASH", "NAGAD", "BANK_TRANSFER"], {
    required_error: "Please select a payment method",
  }),
  shippingAddress: z
    .string()
    .min(10, "Shipping address must be at least 10 characters long"),
  notes: z.string().optional(),
  courierCharge: z.number().default(120),
  discount: z.number().default(50),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, fetchCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      paymentMethod: "CASH_ON_DELIVERY",
      shippingAddress: "",
      notes: "",
      courierCharge: 120,
      discount: 50,
    },
  });

  const selectedPaymentMethod = watch("paymentMethod");

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
  }, [isAuthenticated, router]);

  const cartItems = cart?.cartItems || [];
  const subtotal = cartItems.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const courierCharge = 120;
  const discount = subtotal > 0 ? 50 : 0;
  const grandTotal = Math.max(0, subtotal + courierCharge - discount);

  const onSubmit = async (data: CheckoutFormData) => {
    if (cartItems.length === 0) {
      setErrorMessage("Your cart is empty. Please add items before checking out.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const createdOrder = await orderApi.createOrder({
        paymentMethod: data.paymentMethod,
        shippingAddress: data.shippingAddress,
        courierCharge,
        discount,
        notes: data.notes,
      });

      // Refresh active cart state in Zustand
      await fetchCart();

      // Redirect to order details
      router.push(`/my-orders/${createdOrder.id}`);
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        "Failed to place order. Please verify your details and try again.";
      setErrorMessage(
        Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 md:py-12">
        {/* Header Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <button
            onClick={() => router.push("/shop")}
            className="hover:text-primary flex items-center gap-1 font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Back to Shop
          </button>
          <ChevronRight size={14} />
          <span className="text-slate-900 font-semibold">Checkout</span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
          Complete Your Order
        </h1>

        {errorMessage && (
          <div className="alert alert-error shadow-md text-white mb-6 flex items-start gap-3 rounded-2xl p-4">
            <AlertCircle size={24} className="shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Checkout Error</h3>
              <p className="text-sm font-medium mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto my-12">
            <ShoppingBag size={56} className="mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
            <p className="text-slate-500 text-sm mt-2 mb-6">
              You don't have any items in your shopping cart to check out.
            </p>
            <button
              onClick={() => router.push("/shop")}
              className="btn btn-primary rounded-full px-8 font-bold"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Shipping Address</h2>
                    <p className="text-xs text-slate-500">Provide complete delivery details</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register("shippingAddress")}
                    rows={3}
                    placeholder="House / Flat No, Road Name, Area, Police Station, City & Postal Code..."
                    className={`textarea textarea-bordered w-full text-slate-900 focus:outline-none focus:border-primary rounded-xl text-sm ${
                      errors.shippingAddress ? "textarea-error" : ""
                    }`}
                  />
                  {errors.shippingAddress && (
                    <p className="text-xs text-error font-medium mt-1">
                      {errors.shippingAddress.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Special Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    {...register("notes")}
                    placeholder="e.g. Please call 30 minutes prior to delivery"
                    className="input input-bordered w-full text-slate-900 focus:outline-none focus:border-primary rounded-xl text-sm"
                  />
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Payment Method</h2>
                    <p className="text-xs text-slate-500">Choose how you'd like to pay for your order</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {/* CASH ON DELIVERY */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === "CASH_ON_DELIVERY"
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      value="CASH_ON_DELIVERY"
                      {...register("paymentMethod")}
                      className="radio radio-primary radio-sm mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <Truck size={18} className="text-indigo-600" /> Cash on Delivery
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Pay cash directly to courier agent upon receiving order
                      </p>
                    </div>
                  </label>

                  {/* BKASH */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === "BKASH"
                        ? "border-pink-500 bg-pink-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      value="BKASH"
                      {...register("paymentMethod")}
                      className="radio radio-secondary radio-sm mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <Smartphone size={18} className="text-pink-600" /> bKash Wallet
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Fast and secure payment via bKash mobile banking
                      </p>
                    </div>
                  </label>

                  {/* NAGAD */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === "NAGAD"
                        ? "border-orange-500 bg-orange-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      value="NAGAD"
                      {...register("paymentMethod")}
                      className="radio radio-accent radio-sm mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <Smartphone size={18} className="text-orange-600" /> Nagad Wallet
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Instant payment transfer via Nagad mobile banking
                      </p>
                    </div>
                  </label>

                  {/* BANK TRANSFER */}
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      selectedPaymentMethod === "BANK_TRANSFER"
                        ? "border-blue-600 bg-blue-50/50 shadow-xs"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      value="BANK_TRANSFER"
                      {...register("paymentMethod")}
                      className="radio radio-info radio-sm mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                        <Building2 size={18} className="text-blue-600" /> Bank Transfer
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Direct bank account transfer or online banking
                      </p>
                    </div>
                  </label>
                </div>

                {errors.paymentMethod && (
                  <p className="text-xs text-error font-medium">
                    {errors.paymentMethod.message}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column: Summary Breakdown */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 sticky top-24">
                <h2 className="text-xl font-extrabold text-slate-900 border-b border-slate-100 pb-4">
                  Order Summary
                </h2>

                {/* Items List */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-3 items-center py-2 border-b border-slate-100 last:border-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <img
                          src={item.product?.images?.[0]?.imageUrl || "/placeholder.png"}
                          alt={item.product?.name || "Product"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {item.product?.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          {item.productSize?.size?.name && <span>Size: {item.productSize.size.name}</span>}
                          {item.productColor?.color?.name && (
                            <span className="flex items-center gap-1">
                              Color: <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.productColor.color.colorCode }} />
                              {item.productColor.color.name}
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-semibold text-slate-600 mt-1">
                          Qty: {item.quantity} × ৳{Number(item.unitPrice).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-xs font-extrabold text-slate-900">
                        ৳{Number(item.subtotal).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Costs Breakdown */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">৳ {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Courier Charge</span>
                    <span className="font-bold text-slate-900">+৳ {courierCharge.toLocaleString()}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount</span>
                      <span>-৳ {discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span className="text-primary text-xl">৳ {grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary w-full text-white font-bold rounded-2xl py-3 text-base shadow-lg shadow-primary/20 gap-2 mt-4"
                >
                  {submitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span> Processing Order...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={20} /> Place Order Now
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-slate-400 font-medium">
                  🔒 By placing order, you agree to our terms & return policy.
                </p>
              </div>
            </div>
          </form>
        )}
      </main>

      <Footer />
    </div>
  );
}
