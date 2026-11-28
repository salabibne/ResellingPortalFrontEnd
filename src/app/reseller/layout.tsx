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
  ClipboardList,
  Clock,
} from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import PanelButton from "@/components/panel/PanelButton";
import type { PanelNavEntry } from "@/components/panel/PanelSidebar";
import NoticePopupModal from "@/components/shared/NoticePopupModal";
import { useAuthStore } from "@/store/useAuthStore";
import { useResellerCartStore } from "@/store/useResellerCartStore";
import {
  useResellerProfileStore,
  usePendingReseller,
} from "@/store/useResellerProfileStore";
import VerifyBadge from "@/components/reseller/VerifyBadge";
import { resolveImageUrl } from "@/components/homepage/SafeImage";

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
  const profile = useResellerProfileStore((state) => state.profile);
  const refreshProfile = useResellerProfileStore((state) => state.refresh);
  const resetProfile = useResellerProfileStore((state) => state.reset);
  const isPending = usePendingReseller();

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
    // login). Re-validate against the server before rendering the portal, and
    // load the profile + verification status used across the portal.
    let alive = true;
    if (role === "RESELLER") setCheckingStatus(true);

    refreshProfile()
      .then((fresh) => {
        if (!alive) return;
        // Pending resellers may browse (cart/order stay blocked); only a
        // deactivated or otherwise inactive reseller is signed out.
        if (
          role === "RESELLER" &&
          fresh?.status !== "ACTIVE" &&
          fresh?.status !== "PENDING"
        ) {
          resetProfile();
          logout();
          router.push("/login");
        }
      })
      .catch((err: any) => {
        if (!alive) return;
        if (err?.response?.status === 403 || err?.response?.status === 401) {
          resetProfile();
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
  }, [hasHydrated, isAuthenticated, user, router, logout, refreshProfile, resetProfile]);

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
    { href: "/reseller", label: "ড্যাশবোর্ড", icon: LayoutDashboard },
    { href: "/reseller/products", label: "প্রোডাক্ট", icon: Package },
    { href: "/reseller/cart", label: "কার্ট / চেকআউট", icon: ShoppingCart, badge: totalCartCount },
    { href: "/reseller/orders", label: "আমার অর্ডার", icon: ShoppingBag },
    { href: "/reseller/track", label: "ট্র্যাক", icon: Truck },
    { href: "/reseller/payouts", label: "প্রফিট ক্যাশ / ওয়ালেট", icon: Wallet },
    { href: "/reseller/profile", label: "প্রোফাইল ও ভেরিফাই", icon: UserCheck },
    { href: "/reseller/support", label: "সাপোর্ট", icon: LifeBuoy },
  ];
  const displayName = profile?.name || user?.name || "উদ্যোক্তা";
  const avatarUrl = resolveImageUrl(profile?.imageUrl);

  const canAccessAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(role);

  return (
    <PanelShell
      theme="light"
      brand={
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            R
          </div>
          <div className="min-w-0">
            <p className="font-bold text-base leading-tight text-base-content truncate">
              উদ্যোক্তা পোর্টাল
            </p>
            <p className="text-[11px] text-base-content/60 font-medium truncate">
              অনলাইন উদ্যোক্তা প্ল্যাটফর্ম
            </p>
          </div>
        </div>
      }
      topSlot={
        <div className="mx-4 mt-3 rounded-xl bg-base-200/70 border border-base-300/50 px-3 py-2 flex items-center gap-3">
          <div className="w-9 h-9 shrink-0 overflow-hidden rounded-full bg-teal-600/10 text-teal-700 flex items-center justify-center font-semibold text-xs">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-bold truncate text-base-content">{displayName}</p>
            <VerifyBadge variant="inline" />
          </div>
        </div>
      }
      items={navItems}
      bottomNav={{
        homeHref: "/reseller",
        homeLabel: "হোম",
        showHomeLabel: true,
        accent: "teal",
        menuLabel: "মেনু",
        // অর্ডার · কার্ট · [হোম] · প্রফিট ক্যাশ · মেনু
        items: [
          { href: "/reseller/orders", label: "অর্ডার", icon: ClipboardList },
          { href: "/reseller/cart", label: "কার্ট", icon: ShoppingCart, badge: totalCartCount },
          { href: "/reseller/payouts", label: "প্রফিট ক্যাশ", icon: Wallet },
          "menu",
        ],
      }}
      footer={
        <div className="space-y-2">
          {canAccessAdmin && (
            <Link
              href="/dashboard"
              className="btn btn-outline btn-sm w-full rounded-xl gap-2"
            >
              <ArrowLeft size={16} /> অ্যাডমিন প্যানেল
            </Link>
          )}
          <PanelButton
            variant="ghost"
            className="w-full text-error hover:bg-error/10"
            onClick={() => {
              resetProfile();
              logout();
            }}
          >
            <LogOut size={16} /> লগআউট
          </PanelButton>
        </div>
      }
      extra={<NoticePopupModal audience="RESELLER" />}
    >
      {isPending && (
        <div
          role="status"
          className="mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900"
        >
          <Clock size={20} className="mt-0.5 shrink-0" />
          <div className="text-sm leading-relaxed">
            <p className="font-bold">আপনার উদ্যোক্তা অ্যাকাউন্ট এখনো অনুমোদিত হয়নি</p>
            <p>
              আপনি প্রোডাক্ট দেখতে পারবেন, কিন্তু অ্যাডমিন অনুমোদন না দেওয়া পর্যন্ত কার্টে যোগ বা
              অর্ডার করতে পারবেন না। খুব শীঘ্রই আমাদের টিম আপনার সাথে যোগাযোগ করবে।
            </p>
          </div>
        </div>
      )}
      {children}
    </PanelShell>
  );
}
