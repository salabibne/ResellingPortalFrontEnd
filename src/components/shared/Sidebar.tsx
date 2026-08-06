"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, RefreshCw, Activity, ShoppingBag, LogOut, FileText } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-2 ${isActive ? "bg-primary text-white focus:bg-primary focus:text-white" : "text-black hover:bg-base-200"}`;
  };

  return (
    <aside className="w-64 bg-white text-black h-screen flex flex-col shadow-lg border-r border-base-300">
      <div className="p-4 text-xl font-bold border-b border-base-300 text-black">
        Aarham Apparel
      </div>
      <ul className="menu p-4 flex-1 gap-2 text-black">
        <li>
          <Link href="/dashboard" className={getLinkClass("/dashboard")}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
        </li>
        <li>
          <Link href="/dashboard/products" className={getLinkClass("/dashboard/products")}>
            <Package size={20} /> Products
          </Link>
        </li>
        <li>
          <details open={pathname.includes("/product-attributes")}>
            <summary className={`flex items-center gap-2 ${pathname.includes("/product-attributes") ? "text-primary font-semibold" : "text-black hover:bg-base-200"}`}>
              <Package size={20} /> Product Attributes
            </summary>
            <ul>
              <li><Link href="/product-attributes/category" className={getLinkClass("/product-attributes/category")}>Category</Link></li>
              <li><Link href="/product-attributes/sub-category" className={getLinkClass("/product-attributes/sub-category")}>Sub Category</Link></li>
              <li><Link href="/product-attributes/children-category" className={getLinkClass("/product-attributes/children-category")}>Children Category</Link></li>
              <li><Link href="/product-attributes/brands" className={getLinkClass("/product-attributes/brands")}>Brands</Link></li>
              <li><Link href="/product-attributes/colors" className={getLinkClass("/product-attributes/colors")}>Colors</Link></li>
              <li><Link href="/product-attributes/sizes" className={getLinkClass("/product-attributes/sizes")}>Sizes</Link></li>
              <li><Link href="/product-attributes/age-variants" className={getLinkClass("/product-attributes/age-variants")}>Age Variants</Link></li>
            </ul>
          </details>
        </li>
        <li>
          <Link href="/inventory" className={getLinkClass("/inventory")}>
            <RefreshCw size={20} /> Inventory Adjust
          </Link>
        </li>
        <li>
          <Link href="/inventory-monitor" className={getLinkClass("/inventory-monitor")}>
            <Activity size={20} /> Inventory Monitor
          </Link>
        </li>
        <li>
          <Link href="/orders" className={getLinkClass("/orders")}>
            <ShoppingBag size={20} /> Orders & Sales
          </Link>
        </li>
        <li>
          <Link href="/cms" className={getLinkClass("/cms")}>
            <FileText size={20} /> Base CMS Management
          </Link>
        </li>
        <li>
          <details open={pathname.includes("/admin/")}>
            <summary className={`flex items-center gap-2 ${pathname.includes("/admin/") ? "text-primary font-semibold" : "text-black hover:bg-base-200"}`}>
              <FileText size={20} /> Advanced Admin & CMS
            </summary>
            <ul>
              <li><Link href="/admin/custom-pages" className={getLinkClass("/admin/custom-pages")}>Custom Pages Builder</Link></li>
              <li><Link href="/admin/product-pages" className={getLinkClass("/admin/product-pages")}>Product Landing CMS</Link></li>
              <li><Link href="/admin/external-apis" className={getLinkClass("/admin/external-apis")}>External API Integrations</Link></li>
              <li><Link href="/admin/legal-documents" className={getLinkClass("/admin/legal-documents")}>Legal Documents</Link></li>
            </ul>
          </details>
        </li>
      </ul>
      <div className="p-4 border-t border-base-300">
        <button className="btn btn-outline btn-error w-full flex items-center gap-2" onClick={logout}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}
