"use client";

import { useEffect, useState } from "react";
import { inventoryApi } from "@/services/inventory.api";
import { Package, TrendingUp, AlertTriangle, XOctagon, LayoutDashboard } from "lucide-react";
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelCard from "@/components/panel/PanelCard";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await inventoryApi.getDashboard();
        setData(res);
      } catch (error) {
        console.error("Failed to load dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center p-10">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  if (!data) return <div className="text-error p-10">Failed to load dashboard data.</div>;

  const stats = [
    {
      label: "Total Products",
      value: data.totalProducts,
      icon: Package,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: "Total Stock Value",
      value: `৳${data.totalStockValue}`,
      icon: TrendingUp,
      tone: "bg-success/10 text-success",
    },
    {
      label: "Low Stock Items",
      value: data.lowStockCount,
      icon: AlertTriangle,
      tone: "bg-warning/10 text-warning",
    },
    {
      label: "Out of Stock",
      value: data.outOfStockCount,
      icon: XOctagon,
      tone: "bg-error/10 text-error",
    },
  ];

  return (
    <PanelPage>
      <PanelPageHeader title="Inventory Overview" icon={LayoutDashboard} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <PanelCard key={stat.label} className="p-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${stat.tone}`}>
                  <Icon size={24} />
                </div>
                <div>
                  <div className="text-sm text-base-content/60">{stat.label}</div>
                  <div className="text-2xl font-bold text-base-content">{stat.value}</div>
                </div>
              </div>
            </PanelCard>
          );
        })}
      </div>

      <PanelCard title="Recent Period Movement">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat bg-base-200 rounded-xl">
            <div className="stat-title">Purchased</div>
            <div className="stat-value text-primary">{data.periodMovement?.totalPurchased || 0}</div>
          </div>
          <div className="stat bg-base-200 rounded-xl">
            <div className="stat-title">Sold</div>
            <div className="stat-value text-primary">{data.periodMovement?.totalSold || 0}</div>
          </div>
          <div className="stat bg-base-200 rounded-xl">
            <div className="stat-title">Returned</div>
            <div className="stat-value text-info">{data.periodMovement?.totalReturned || 0}</div>
          </div>
          <div className="stat bg-base-200 rounded-xl">
            <div className="stat-title">Damaged</div>
            <div className="stat-value text-error">{data.periodMovement?.totalDamaged || 0}</div>
          </div>
        </div>
      </PanelCard>
    </PanelPage>
  );
}
