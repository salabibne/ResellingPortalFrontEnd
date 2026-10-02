"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  Package,
  ShoppingCart,
  DollarSign,
  ArrowRight,
  Sparkles,
  Wallet,
} from "lucide-react";
import { orderApi, ResellerStats } from "@/services/order.api";

export default function ResellerDashboardPage() {
  const [stats, setStats] = useState<ResellerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await orderApi.getResellerStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load reseller stats:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Banner / Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-8 text-primary-content shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} /> Reseller Commerce Portal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome to Reseller Hub
          </h1>
          <p className="text-sm opacity-90 leading-relaxed">
            Browse our wholesale catalog at reseller prices, place orders on behalf of your end-customers, set your custom sell price, and track order fulfillment smoothly.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/reseller/products"
              className="btn btn-sm bg-white text-primary border-none hover:bg-white/90 font-bold"
            >
              <Package size={16} /> Browse Wholesale Catalog
            </Link>
            <Link
              href="/reseller/cart"
              className="btn btn-sm btn-outline border-white text-white hover:bg-white/10 font-bold"
            >
              <ShoppingCart size={16} /> Reseller Cart & Checkout
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Earned Profit */}
        <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">
                Earned Profit (Delivered & Paid)
              </p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {loading ? "..." : `৳${(stats?.totalResellerProfit || 0).toLocaleString()}`}
              </h3>
              <p className="text-[10px] text-base-content/50 mt-0.5">
                Realized from completed orders
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        {/* Pending Profit */}
        <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                Pending Profit
              </p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {loading ? "..." : `৳${(stats?.pendingResellerProfit || 0).toLocaleString()}`}
              </h3>
              <p className="text-[10px] text-base-content/50 mt-0.5">
                Realized upon Delivery & Payment
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100">
              <Clock size={24} />
            </div>
          </div>
        </div>

        {/* Total Reseller Orders */}
        <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-base-content/60 uppercase tracking-wider">
                Total Orders Placed
              </p>
              <h3 className="text-2xl font-black text-base-content mt-1">
                {loading ? "..." : stats?.totalOrders || 0}
              </h3>
              <p className="text-[10px] text-base-content/50 mt-0.5">
                Across all statuses
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>

        {/* Delivered Orders */}
        <div className="card bg-base-100 shadow-sm border border-base-200 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-info uppercase tracking-wider">
                Delivered Orders
              </p>
              <h3 className="text-2xl font-black text-info mt-1">
                {loading ? "..." : stats?.deliveredOrders || 0}
              </h3>
              <p className="text-[10px] text-base-content/50 mt-0.5">
                Successfully delivered to customers
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center font-bold">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-base-100 border border-base-200 p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-emerald-600 font-bold text-lg">
            <Wallet size={24} />
            <h2>Payouts & Wallet</h2>
          </div>
          <p className="text-sm text-base-content/70">
            Request profit disbursements directly to your bKash, Nagad, Rocket, or Bank account, track review statuses, and view proof documents.
          </p>
          <div>
            <Link
              href="/reseller/payouts"
              className="btn btn-success bg-emerald-600 hover:bg-emerald-700 text-white btn-sm flex items-center gap-2 w-fit"
            >
              Withdraw Profit <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-primary font-bold text-lg">
            <Package size={24} />
            <h2>Wholesale Catalog</h2>
          </div>
          <p className="text-sm text-base-content/70">
            Explore active products with wholesale reseller prices. Select sizes, colors, and quantities to add to your reseller cart.
          </p>
          <div>
            <Link
              href="/reseller/products"
              className="btn btn-primary btn-sm flex items-center gap-2 w-fit"
            >
              Browse Catalog <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="card bg-base-100 border border-base-200 p-6 space-y-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-secondary font-bold text-lg">
            <ShoppingBag size={24} />
            <h2>My Reseller Orders</h2>
          </div>
          <p className="text-sm text-base-content/70">
            Track all orders placed on behalf of your customers, view processing status (Pending, Confirmed, Shipped, Delivered), and profit.
          </p>
          <div>
            <Link
              href="/reseller/orders"
              className="btn btn-secondary btn-sm flex items-center gap-2 w-fit"
            >
              View My Orders <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
