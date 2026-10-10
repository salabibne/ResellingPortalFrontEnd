"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, FileText, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-2 ${
      isActive
        ? "bg-primary text-white hover:!bg-primary focus:!bg-primary focus:text-white"
        : "text-white/80 hover:!bg-white/10 hover:text-white"
    }`;
  };

  const handleLinkClick = () => {
    if (onClose) {
      onClose();
    }
  };

  const adminSectionPaths = [
    "/admin/",
    "/inventory",
    "/inventory-monitor",
    "/orders",
    "/reseller",
    "/cms",
  ];
  const isAdminSection = adminSectionPaths.some((path) =>
    pathname.startsWith(path)
  );

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-black text-white border-r border-white/10 flex flex-col justify-between transition-transform duration-300 ease-in-out
        lg:static lg:translate-x-0
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Top Brand Header with Mobile Close Button */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white tracking-wide">Aarham Apparel</h2>
        <button
          onClick={onClose}
          className="btn btn-ghost btn-circle btn-sm lg:hidden text-white/70 hover:text-white hover:bg-white/10"
          aria-label="Close sidebar menu"
        >
          ✕
        </button>
      </div>

      <ul className="menu flex-nowrap p-4 w-full gap-1 overflow-y-auto overflow-x-hidden flex-1 min-h-0 font-medium text-sm">
        <li>
          <Link href="/dashboard" className={getLinkClass("/dashboard")} onClick={handleLinkClick}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
        </li>
        <li>
          <details open={pathname.includes("/dashboard/products") || pathname.includes("/product-attributes")}>
            <summary className={`flex items-center gap-2 ${pathname.includes("/products") || pathname.includes("/product-attributes") ? "text-white font-semibold !bg-white/10" : "text-white/80 hover:!bg-white/10 hover:text-white"}`}>
              <Package size={20} /> Products & Attributes
            </summary>
            <ul>
              <li><Link href="/dashboard/products" className={getLinkClass("/dashboard/products")} onClick={handleLinkClick}>Products Catalog</Link></li>
              <li><Link href="/product-attributes/categories" className={getLinkClass("/product-attributes/categories")} onClick={handleLinkClick}>Categories</Link></li>
              <li><Link href="/product-attributes/subcategories" className={getLinkClass("/product-attributes/subcategories")} onClick={handleLinkClick}>Subcategories</Link></li>
              <li><Link href="/product-attributes/child-categories" className={getLinkClass("/product-attributes/child-categories")} onClick={handleLinkClick}>Child Categories</Link></li>
              <li><Link href="/product-attributes/brands" className={getLinkClass("/product-attributes/brands")} onClick={handleLinkClick}>Brands</Link></li>
              <li><Link href="/product-attributes/colors" className={getLinkClass("/product-attributes/colors")} onClick={handleLinkClick}>Colors</Link></li>
              <li><Link href="/product-attributes/sizes" className={getLinkClass("/product-attributes/sizes")} onClick={handleLinkClick}>Sizes</Link></li>
              <li><Link href="/product-attributes/age-variants" className={getLinkClass("/product-attributes/age-variants")} onClick={handleLinkClick}>Age Variants</Link></li>
            </ul>
          </details>
        </li>
        <li>
          <details open={isAdminSection}>
            <summary className={`flex items-center gap-2 ${isAdminSection ? "text-white font-semibold !bg-white/10" : "text-white/80 hover:!bg-white/10 hover:text-white"}`}>
              <FileText size={20} /> Advanced Admin & CMS
            </summary>
            <ul>
              <li><Link href="/inventory" className={getLinkClass("/inventory")} onClick={handleLinkClick}>Inventory Adjust</Link></li>
              <li><Link href="/inventory-monitor" className={getLinkClass("/inventory-monitor")} onClick={handleLinkClick}>Inventory Monitor</Link></li>
              <li><Link href="/orders" className={getLinkClass("/orders")} onClick={handleLinkClick}>Orders & Sales</Link></li>
              <li><Link href="/reseller" className={getLinkClass("/reseller")} onClick={handleLinkClick}>Reseller Portal</Link></li>
              <li><Link href="/cms" className={getLinkClass("/cms")} onClick={handleLinkClick}>Base CMS Management</Link></li>
              <li><Link href="/admin/homepage" className={getLinkClass("/admin/homepage")} onClick={handleLinkClick}>Homepage Customizer</Link></li>
              <li><Link href="/admin/users" className={getLinkClass("/admin/users")} onClick={handleLinkClick}>User Management</Link></li>
              <li><Link href="/admin/withdrawals" className={getLinkClass("/admin/withdrawals")} onClick={handleLinkClick}>Reseller Withdrawals</Link></li>
              <li><Link href="/admin/courier" className={getLinkClass("/admin/courier")} onClick={handleLinkClick}>Courier Policy Settings</Link></li>
              <li><Link href="/admin/custom-pages" className={getLinkClass("/admin/custom-pages")} onClick={handleLinkClick}>Custom Pages Builder</Link></li>
              <li><Link href="/admin/product-pages" className={getLinkClass("/admin/product-pages")} onClick={handleLinkClick}>Product Landing CMS</Link></li>
              <li><Link href="/admin/external-apis" className={getLinkClass("/admin/external-apis")} onClick={handleLinkClick}>External API Integrations</Link></li>
              <li><Link href="/admin/legal-documents" className={getLinkClass("/admin/legal-documents")} onClick={handleLinkClick}>Legal Documents</Link></li>
            </ul>
          </details>
        </li>
      </ul>
      <div className="p-4 border-t border-white/10">
        <button className="btn btn-outline btn-error w-full flex items-center gap-2" onClick={logout}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}
