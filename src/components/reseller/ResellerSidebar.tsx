"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  ShoppingCart,
  LogOut,
  ArrowLeft,
  UserCheck,
  Wallet,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useResellerCartStore } from "@/store/useResellerCartStore";

interface ResellerSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ResellerSidebar({ isOpen = false, onClose }: ResellerSidebarProps) {
  const { user, logout } = useAuthStore();
  const pathname = usePathname();
  const cartItems = useResellerCartStore((state) => state.items);
  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
      isActive
        ? "bg-primary text-primary-content shadow-sm"
        : "text-base-content hover:bg-base-200"
    }`;
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`bg-base-100 h-screen flex flex-col border-r border-base-200 shadow-sm select-none transition-all duration-300 z-50 ${
        isOpen
          ? "fixed inset-y-0 left-0 w-64 shadow-2xl flex"
          : "hidden lg:flex lg:static lg:w-64"
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-base-200 bg-base-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold text-lg shadow-sm">
            R
          </div>
          <div>
            <h1 className="font-bold text-base sm:text-lg leading-tight text-base-content">Reseller Portal</h1>
            <p className="text-[11px] text-base-content/60 font-medium">Aarham Apparel</p>
          </div>
        </div>
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="btn btn-ghost btn-sm btn-circle lg:hidden text-base-content"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      {/* User Info Badge */}
      <div className="px-4 py-3 mx-4 my-3 rounded-xl bg-base-200/70 border border-base-300/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-secondary text-secondary-content flex items-center justify-center font-semibold text-xs">
          {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
        </div>
        <div className="overflow-hidden flex-1">
          <p className="text-xs font-bold truncate text-base-content">{user?.name || "Reseller"}</p>
          <p className="text-[10px] text-success font-semibold flex items-center gap-1">
            <UserCheck size={12} /> Verified Reseller
          </p>
        </div>
      </div>

      {/* Navigation Links */}
      <ul className="flex-1 px-3 py-2 space-y-1">
        <li>
          <Link href="/reseller" className={getLinkClass("/reseller")}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link href="/reseller/products" className={getLinkClass("/reseller/products")}>
            <Package size={18} />
            <span>Wholesale Catalog</span>
          </Link>
        </li>
        <li>
          <Link href="/reseller/cart" className={getLinkClass("/reseller/cart")}>
            <div className="relative flex items-center gap-3 w-full">
              <ShoppingCart size={18} />
              <span>Reseller Cart</span>
              {totalCartCount > 0 && (
                <span className="ml-auto bg-primary text-primary-content text-xs font-bold px-2 py-0.5 rounded-full">
                  {totalCartCount}
                </span>
              )}
            </div>
          </Link>
        </li>
        <li>
          <Link href="/reseller/orders" className={getLinkClass("/reseller/orders")}>
            <ShoppingBag size={18} />
            <span>My Orders</span>
          </Link>
        </li>
        <li>
          <Link href="/reseller/payouts" className={getLinkClass("/reseller/payouts")}>
            <Wallet size={18} />
            <span>Payouts & Wallet</span>
          </Link>
        </li>
      </ul>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-base-200 space-y-2">
        {["SUPER_ADMIN", "ADMIN", "MANAGER"].includes(user?.role || "") && (
          <Link
            href="/dashboard"
            className="btn btn-outline btn-sm w-full flex items-center justify-center gap-2"
          >
            <ArrowLeft size={16} /> Admin Panel
          </Link>
        )}
        <button
          className="btn btn-ghost btn-sm text-error hover:bg-error/10 w-full flex items-center justify-center gap-2"
          onClick={logout}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
}
