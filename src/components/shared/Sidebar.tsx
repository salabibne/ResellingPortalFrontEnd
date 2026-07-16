import Link from "next/link";
import { LayoutDashboard, Package, RefreshCw, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="w-64 bg-base-500 h-screen flex flex-col shadow-lg">
      <div className="p-4 text-xl font-bold border-b border-base-300">
        Aarham Apparel
      </div>
      <ul className="menu p-4 flex-1 gap-2">
        <li>
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
        </li>
        <li>
          <Link href="/products" className="flex items-center gap-2">
            <Package size={20} /> Products
          </Link>
        </li>
        <li>
          <Link href="/inventory" className="flex items-center gap-2">
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
