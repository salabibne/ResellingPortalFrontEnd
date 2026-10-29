"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ShoppingCart,
  LogOut,
  ArrowLeft,
  UserCheck,
  Wallet,
  LifeBuoy,
  Truck,
} from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import PanelButton from "@/components/panel/PanelButton";
import type { PanelNavEntry } from "@/components/panel/PanelSidebar";
import NoticePopupModal from "@/components/shared/NoticePopupModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useResellerCartStore } from "@/store/useResellerCartStore";
import api from "@/services/axios";

export default function ResellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const cartItems = useResellerCartStore((state) => state.items);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setMounted(true);
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    const role = (user?.role || "").toUpperCase();
    const allowedRoles = ["RESELLER", "ADMIN", "SUPER_ADMIN", "MANAGER", "SALES_EXECUTIVE"];
    if (!allowedRoles.includes(role)) {
      router.push("/");
      return;
    }

    // The persisted role/status can be stale (e.g. a reseller suspended after
    // login). Re-validate against the server before rendering the portal.
    if (role === "RESELLER") {
      let alive = true;
      setCheckingStatus(true);

      api
        .get("/auth/me")
        .then((response) => {
          if (!alive) return;
          if (response.data?.status !== "ACTIVE") {
            logout();
            router.push("/login");
          }
        })
        .catch((err: any) => {
          if (!alive) return;
          if (err?.response?.status === 403 || err?.response?.status === 401) {
            logout();
            router.push("/login");
          }
        })
        .finally(() => {
          if (alive) setCheckingStatus(false);
        });

      return () => {
        alive = false;
      };
    }
  }, [hasHydrated, isAuthenticated, user, router, logout]);

  if (!mounted || !hasHydrated || !isAuthenticated || checkingStatus) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const role = (user?.role || "").toUpperCase();
  const allowedRoles = ["RESELLER", "ADMIN", "SUPER_ADMIN", "MANAGER", "SALES_EXECUTIVE"];
  if (!allowedRoles.includes(role)) {
    return null;
  }

  const navItems: PanelNavEntry[] = [
    { href: "/reseller", label: "Dashboard", icon: LayoutDashboard },
    { href: "/reseller/products", label: "Product Catalog", icon: Package },
    { href: "/reseller/cart", label: "My Cart", icon: ShoppingCart, badge: totalCartCount },
    { href: "/reseller/orders", label: "My Orders", icon: ShoppingBag },
    { href: "/reseller/track", label: "Track", icon: Truck },
    { href: "/reseller/payouts", label: "Payouts & Wallet", icon: Wallet },
    { href: "/reseller/support", label: "Support Tickets", icon: LifeBuoy },
  ];

  const canAccessAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(role);

  return (
    <PanelShell
      theme="light"
      brand={
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-lg shadow-sm">
            R
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base leading-tight text-base-content truncate">
              Reseller Portal
            </p>
            <p className="text-[11px] text-base-content/60 font-medium truncate">
              Aarham Apparel
            </p>
          </div>
        </div>
      }
      topSlot={
        <div className="mx-4 mt-3 rounded-xl bg-base-200/70 border border-base-300/50 px-3 py-2 flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs">
            {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold truncate text-base-content">
              {user?.name || "Reseller"}
            </p>
            <p className="text-[10px] text-success font-semibold flex items-center gap-1">
              <UserCheck size={12} /> Verified Reseller
            </p>
          </div>
        </div>
      }
      items={navItems}
      bottomNav={{
        homeHref: "/reseller",
        items: [
          "menu",
          { href: "/reseller/products", label: "Catalog", icon: Package },
          { href: "/reseller/cart", label: "Cart", icon: ShoppingCart, badge: totalCartCount },
          { href: "/reseller/orders", label: "Orders", icon: ShoppingBag },
        ],
      }}
      footer={
        <div className="space-y-2">
          {canAccessAdmin && (
            <Link
              href="/dashboard"
              className="btn btn-outline btn-sm w-full rounded-xl gap-2"
            >
              <ArrowLeft size={16} /> Admin Panel
            </Link>
          )}
          <PanelButton
            variant="ghost"
            className="w-full text-error hover:bg-error/10"
            onClick={logout}
          >
            <LogOut size={16} /> Logout
          </PanelButton>
        </div>
      }
      extra={<NoticePopupModal audience="RESELLER" />}
    >
      {children}
    </PanelShell>
  );
}
