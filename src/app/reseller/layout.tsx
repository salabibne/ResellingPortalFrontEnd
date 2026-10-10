"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ResellerSidebar from "@/components/reseller/ResellerSidebar";
import Header from "@/components/shared/Header";
import { useAuthStore } from "@/store/useAuthStore";

export default function ResellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    const role = (user?.role || "").toUpperCase();
    const allowedRoles = ["RESELLER", "ADMIN", "SUPER_ADMIN", "MANAGER", "SALES_EXECUTIVE"];
    if (!allowedRoles.includes(role)) {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated) {
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

  return (
    <div className="flex h-screen overflow-hidden bg-base-200/50">
      {/* Mobile Drawer Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <ResellerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
