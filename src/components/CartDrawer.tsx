"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function CartDrawer() {
  const {
    cart,
    isOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    fetchCart,
    clearCart,
    toastMessage,
    setToast,
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const cartItems = cart?.cartItems || [];
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleClose = () => {
    closeCart();
  };

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast toast-end toast-bottom z-[999]">
          <div className="alert alert-info shadow-lg text-white flex gap-2 items-center">
            <CheckCircle2 size={18} />
            <span className="text-sm font-medium">{toastMessage}</span>
            <button
              className="btn btn-ghost btn-xs btn-circle text-white ml-2"
              onClick={() => setToast(null)}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Cart Backdrop & Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-xs transition-opacity duration-300">
          {/* Backdrop Click */}
          <div
            className="fixed inset-0 cursor-pointer"
            onClick={handleClose}
            aria-label="Close cart backdrop"
          />

          <div className="relative w-full max-w-md bg-base-100 h-full shadow-2xl flex flex-col z-10 transition-transform duration-300">
            {/* Header */}
            <div className="p-4 border-b border-base-200 flex items-center justify-between bg-primary text-primary-content">
              <div className="flex items-center gap-2">
                <ShoppingBag size={22} />
                <h2 className="text-lg font-bold">Shopping Cart ({totalItemsCount})</h2>
              </div>
              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={() => clearCart()}
                    className="btn btn-ghost btn-xs text-white/80 hover:text-white hover:bg-white/10"
                    title="Clear entire cart"
                  >
                    Clear All
                  </button>
                )}
                {/* Cross Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn btn-ghost btn-sm btn-circle text-primary-content hover:bg-white/10"
                  aria-label="Close cart"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-base-content/60 py-12">
                  <ShoppingBag size={56} className="stroke-1 mb-4 opacity-40" />
                  <p className="text-lg font-medium text-base-content mb-2">Your cart is empty</p>
                  <p className="text-sm text-base-content/70 max-w-xs mb-6">
                    Looks like you haven't added anything to your cart yet.
                  </p>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn btn-primary btn-sm rounded-full px-6"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                cartItems.map((item) => {
                  const imgUrl = item.product?.images?.[0]?.imageUrl || "/placeholder.png";
                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 bg-base-200/50 p-3 rounded-xl border border-base-200 relative group"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-base-200 shrink-0 border border-base-300">
                        <img
                          src={imgUrl}
                          alt={item.product?.name || "Product Image"}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <h4 className="font-semibold text-sm truncate text-base-content">
                              {item.product?.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="text-base-content/40 hover:text-error transition-colors p-1"
                              title="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2 text-xs text-base-content/70 mt-1">
                            {item.productSize && (
                              <span className="badge badge-sm badge-ghost">
                                Size: {item.productSize.size.name}
                              </span>
                            )}
                            {item.productColor && (
                              <span className="badge badge-sm badge-ghost flex items-center gap-1">
                                Color:
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block border border-black/20"
                                  style={{ backgroundColor: item.productColor.color.colorCode }}
                                />
                                {item.productColor.color.name}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-base-200/60">
                          <div className="flex items-center border border-base-300 rounded-lg bg-base-100">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-base-200 text-base-content/80"
                            >
                              <Minus size={14} />
                            </button>
                            <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-base-200 text-base-content/80"
                            >
                              <Plus size={14} />
                            </button>
                          </div>

                          <div className="text-right">
                            <div className="text-sm font-bold text-primary">
                              ৳ {Number(item.subtotal).toLocaleString()}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-[10px] text-base-content/60">
                                (৳ {Number(item.unitPrice).toLocaleString()} each)
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-base-200 bg-base-100 space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-base-content/70">
                    <span>Subtotal</span>
                    <span className="font-semibold text-base-content">
                      ৳ {Number(cart?.total || 0).toLocaleString()}
                    </span>
                  </div>
                  {cart?.courierCharge !== undefined && (
                    <div className="flex justify-between text-base-content/70">
                      <span>Courier Charge</span>
                      <span>৳ {Number(cart.courierCharge).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-bold text-base-content pt-2 border-t border-base-200">
                    <span>Total Amount</span>
                    <span className="text-primary text-lg">
                      ৳ {Number(cart?.total || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/checkout"
                    onClick={handleClose}
                    className="btn btn-primary w-full gap-2 text-primary-content"
                  >
                    Proceed to Checkout <ArrowRight size={18} />
                  </Link>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn btn-ghost btn-sm text-base-content/70"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
