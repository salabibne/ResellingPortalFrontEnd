"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, RefreshCw, LogOut } from "lucide-react";
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
          <Link href="/products" className={getLinkClass("/products")}>
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
      </ul>
      <div className="p-4 border-t border-base-300">
        <button className="btn btn-outline btn-error w-full flex items-center gap-2" onClick={logout}>
          <LogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
}
