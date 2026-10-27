"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ClipboardList,
  Package,
  ShoppingCart,
  ArrowRight,
  Sparkles,
  Wallet,
  LayoutDashboard,
} from "lucide-react";
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelCard from "@/components/panel/PanelCard";
import { orderApi, ResellerStats } from "@/services/order.api";
import { ORDER_PLACED_LABEL } from "@/components/courier/CourierStatusBadge";

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
    <PanelPage>
      <PanelPageHeader
        title="Reseller Dashboard"
        subtitle="Welcome back to the Reseller Hub."
        icon={LayoutDashboard}
      />

      {/* Banner / Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-secondary p-6 sm:p-8 text-primary-content border border-primary/20">
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <Sparkles size={14} /> Reseller Commerce Portal
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome to Reseller Hub
          </h2>
          <p className="text-sm opacity-90 leading-relaxed">
            Browse our wholesale catalog at reseller prices, place orders on behalf of your end-customers, set your custom sell price, and track order fulfillment smoothly.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/reseller/products"
              className="btn btn-sm rounded-xl gap-2 bg-base-100 text-primary border-none hover:bg-white/90 font-bold"
            >
              <Package size={16} /> Browse Product Catalog
            </Link>
            <Link
              href="/reseller/cart"
              className="btn btn-sm rounded-xl gap-2 btn-outline border-white text-white hover:bg-white/10 font-bold"
            >
              <ShoppingCart size={16} /> My Cart & Checkout
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <PanelCard className="p-5">
          <div className="flex items-center justify-between gap-3">
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
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 shrink-0">
              <TrendingUp size={24} />
            </div>
          </div>
        </PanelCard>

        <PanelCard className="p-5">
          <div className="flex items-center justify-between gap-3">
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
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold border border-amber-100 shrink-0">
              <Clock size={24} />
            </div>
          </div>
        </PanelCard>

        <PanelCard className="p-5">
          <div className="flex items-center justify-between gap-3">
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
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
              <ShoppingBag size={24} />
            </div>
          </div>
        </PanelCard>

        <PanelCard className="p-5">
          <div className="flex items-center justify-between gap-3">
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
            <div className="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center font-bold shrink-0">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </PanelCard>
      </div>

      {/* Order status breakdown — the courier status is the order status */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: ORDER_PLACED_LABEL, value: stats?.orderPlacedOrders, icon: ClipboardList, tone: "text-slate-600 bg-slate-100" },
          { label: "Pending", value: stats?.pendingOrders, icon: Clock, tone: "text-amber-600 bg-amber-50" },
          { label: "In Transit", value: stats?.inTransitOrders, icon: Truck, tone: "text-info bg-info/10" },
          { label: "Cancelled", value: stats?.cancelledOrders, icon: XCircle, tone: "text-error bg-error/10" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <PanelCard key={label} className="p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold text-base-content/60 uppercase tracking-wider">
                  {label}
                </p>
                <h3 className="text-2xl font-black text-base-content mt-1">
                  {loading ? "..." : value || 0}
                </h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold shrink-0 ${tone}`}>
                <Icon size={24} />
              </div>
            </div>
          </PanelCard>
        ))}
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PanelCard className="flex flex-col gap-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-emerald-600 font-bold text-lg">
            <Wallet size={24} />
            <h2>Payouts & Wallet</h2>
          </div>
          <p className="text-sm text-base-content/70 flex-1">
            Request profit disbursements directly to your bKash, Nagad, Rocket, or Bank account, track review statuses, and view proof documents.
          </p>
          <div>
            <Link
              href="/reseller/payouts"
              className="btn btn-success btn-sm rounded-xl gap-2 text-white w-fit"
            >
              Withdraw Profit <ArrowRight size={16} />
            </Link>
          </div>
        </PanelCard>

        <PanelCard className="flex flex-col gap-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-primary font-bold text-lg">
            <Package size={24} />
            <h2>Product Catalog</h2>
          </div>
          <p className="text-sm text-base-content/70 flex-1">
            Explore active products with wholesale reseller prices. Select sizes, colors, and quantities to add to your cart.
          </p>
          <div>
            <Link
              href="/reseller/products"
              className="btn btn-primary btn-sm rounded-xl gap-2 w-fit"
            >
              Browse Catalog <ArrowRight size={16} />
            </Link>
          </div>
        </PanelCard>

        <PanelCard className="flex flex-col gap-4 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3 text-primary font-bold text-lg">
            <ShoppingBag size={24} />
            <h2>My Reseller Orders</h2>
          </div>
          <p className="text-sm text-base-content/70 flex-1">
            Track all orders placed on behalf of your customers, follow live courier status (Order Placed, Pending, In Transit, Delivered), and profit.
          </p>
          <div>
            <Link
              href="/reseller/orders"
              className="btn btn-outline btn-sm rounded-xl gap-2 w-fit"
            >
              View My Orders <ArrowRight size={16} />
            </Link>
          </div>
        </PanelCard>
      </div>
    </PanelPage>
  );
}
