"use client";

import { useEffect, useState } from "react";
import { inventoryApi } from "@/services/inventory.api";
import { Package, TrendingUp, AlertTriangle, XOctagon } from "lucide-react";

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

  if (loading) return <div className="flex justify-center p-10"><span className="loading loading-spinner text-primary"></span></div>;
  if (!data) return <div className="text-error p-10">Failed to load dashboard data.</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Inventory Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-base-500 shadow">
          <div className="card-body flex flex-row items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg text-primary"><Package size={24} /></div>
            <div>
              <div className="text-sm text-base-content/70">Total Products</div>
              <div className="text-2xl font-bold">{data.totalProducts}</div>
            </div>
          </div>
        </div>

        <div className="card  shadow">
          <div className="card-body flex flex-row items-center gap-4">
            <div className="p-3 bg-success/10 rounded-lg text-success"><TrendingUp size={24} /></div>
            <div>
              <div className="text-sm text-base-content/70">Total Stock Value</div>
              <div className="text-2xl font-bold">${data.totalStockValue}</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-500 shadow">
          <div className="card-body flex flex-row items-center gap-4">
            <div className="p-3 bg-warning/10 rounded-lg text-warning"><AlertTriangle size={24} /></div>
            <div>
              <div className="text-sm text-base-content/70">Low Stock Items</div>
              <div className="text-2xl font-bold">{data.lowStockCount}</div>
            </div>
          </div>
        </div>

        <div className="card bg-base-500 shadow">
          <div className="card-body flex flex-row items-center gap-4">
            <div className="p-3 bg-error/10 rounded-lg text-error"><XOctagon size={24} /></div>
            <div>
              <div className="text-sm text-base-content/70">Out of Stock</div>
              <div className="text-2xl font-bold">{data.outOfStockCount}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card bg-base-500 shadow mt-6">
        <div className="card-body">
          <h3 className="card-title">Recent Period Movement</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="stat bg-base-200 rounded-box">
              <div className="stat-title">Purchased</div>
              <div className="stat-value text-primary">{data.periodMovement?.totalPurchased || 0}</div>
            </div>
            <div className="stat bg-base-200 rounded-box">
              <div className="stat-title">Sold</div>
              <div className="stat-value text-secondary">{data.periodMovement?.totalSold || 0}</div>
            </div>
            <div className="stat bg-base-200 rounded-box">
              <div className="stat-title">Returned</div>
              <div className="stat-value text-info">{data.periodMovement?.totalReturned || 0}</div>
            </div>
            <div className="stat bg-base-200 rounded-box">
              <div className="stat-title">Damaged</div>
              <div className="stat-value text-error">{data.periodMovement?.totalDamaged || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
