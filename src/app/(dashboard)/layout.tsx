"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  LogOut,
  ShoppingBag,
  Boxes,
} from "lucide-react";
import PanelShell from "@/components/panel/PanelShell";
import PanelButton from "@/components/panel/PanelButton";
import type { PanelNavEntry } from "@/components/panel/PanelSidebar";
import type { PanelBottomNav } from "@/components/panel/PanelShell";
import { useAuthStore } from "@/store/useAuthStore";

const NAV_ITEMS: PanelNavEntry[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  {
    id: "products",
    label: "Products & Attributes",
    icon: Package,
    items: [
      { href: "/dashboard/products", label: "Products Catalog" },
      { href: "/product-attributes/categories", label: "Categories" },
      { href: "/product-attributes/subcategories", label: "Subcategories" },
      { href: "/product-attributes/child-categories", label: "Child Categories" },
      { href: "/product-attributes/brands", label: "Brands" },
      { href: "/product-attributes/colors", label: "Colors" },
      { href: "/product-attributes/sizes", label: "Sizes" },
      { href: "/product-attributes/age-variants", label: "Age Variants" },
    ],
  },
  {
    id: "advanced",
    label: "Advanced Admin & CMS",
    icon: FileText,
    items: [
      { href: "/inventory", label: "Inventory Adjust" },
      { href: "/inventory-monitor", label: "Inventory Monitor" },
      { href: "/orders", label: "Orders & Sales" },
      { href: "/reseller", label: "Reseller Portal" },
      { href: "/cms", label: "Base CMS Management" },
      { href: "/admin/users", label: "User Management" },
      { href: "/admin/withdrawals", label: "Reseller Withdrawals" },
      { href: "/admin/courier/shipments", label: "Courier Management" },
      { href: "/admin/courier", label: "Courier Policy Settings" },
      { href: "/admin/product-pages", label: "Product Landing CMS" },
      { href: "/admin/external-apis", label: "External API Integrations" },
      { href: "/admin/legal-documents", label: "Legal Documents" },
      { href: "/admin/notices", label: "Pop-up Notices" },
      { href: "/admin/tickets", label: "Support Tickets" },
    ],
  },
];

const BOTTOM_NAV: PanelBottomNav = {
  homeHref: "/dashboard",
  items: [
    "menu",
    { href: "/orders", label: "Orders", icon: ShoppingBag },
    { href: "/dashboard/products", label: "Products", icon: Package },
    { href: "/inventory", label: "Inventory", icon: Boxes },
  ],
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated, hasHydrated, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!hasHydrated) return;

    if (!isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    const role = (user?.role || "").toUpperCase();
    if (role === "RESELLER") {
      router.push("/reseller");
    } else if (role === "USER") {
      router.push("/");
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  if (!mounted || !hasHydrated || !isAuthenticated) {
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const role = (user?.role || "").toUpperCase();
  if (role === "USER" || role === "RESELLER") {
    return null;
  }

  return (
    <PanelShell
      theme="dark"
      brand={
        <h2 className="text-xl font-bold text-white tracking-wide truncate">
          Aarham Apparel
        </h2>
      }
      items={NAV_ITEMS}
      bottomNav={BOTTOM_NAV}
      footer={
        <PanelButton
          variant="danger-outline"
          className="w-full"
          onClick={logout}
        >
          <LogOut size={16} /> Logout
        </PanelButton>
      }
    >
      {children}
    </PanelShell>
  );
}
