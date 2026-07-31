"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  BarChart3,
  AlertTriangle,
  FileText,
  Package,
  Boxes,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  XCircle,
  Loader2,
  DollarSign,
  Layers,
  Phone,
  User,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  inventoryApi,
  DashboardSummary,
  LowStockItem,
  InventoryTransaction,
  ProductSummaryItem,
  InventoryTxType,
  InventoryTxPurpose,
} from "@/services/inventory.api";
import { productApi, Product } from "@/services/product.api";

type TabType = "dashboard" | "low-stock" | "transactions" | "product-summary";

export default function InventoryMonitorPage() {
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Products for dropdown filter
  const [productsList, setProductsList] = useState<Product[]>([]);

  // ─── TAB 1: DASHBOARD OVERVIEW ────────────────────────────────────
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(true);
  const [dashStartDate, setDashStartDate] = useState<string>("");
  const [dashEndDate, setDashEndDate] = useState<string>("");

  const fetchDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      const res = await inventoryApi.getDashboard({
        startDate: dashStartDate || undefined,
        endDate: dashEndDate || undefined,
      });
      setDashboardData(res);
    } catch (err) {
      console.error("Failed to load monitor dashboard:", err);
    } finally {
      setDashboardLoading(false);
    }
  }, [dashStartDate, dashEndDate]);

  // ─── TAB 2: LOW STOCK ALERTS ──────────────────────────────────────
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [lowStockLoading, setLowStockLoading] = useState<boolean>(false);
  const [includeOutOfStock, setIncludeOutOfStock] = useState<boolean>(true);
  const [lowStockPage, setLowStockPage] = useState<number>(1);
  const [lowStockLimit] = useState<number>(15);
  const [lowStockMeta, setLowStockMeta] = useState({ total: 0, totalPages: 1 });

  const fetchLowStock = useCallback(async () => {
    try {
      setLowStockLoading(true);
      const res = await inventoryApi.getLowStock({
        includeOutOfStock,
        page: lowStockPage,
        limit: lowStockLimit,
      });
      setLowStockItems(res.data || []);
      setLowStockMeta({
        total: res.meta?.total || 0,
        totalPages: res.meta?.totalPages || 1,
      });
    } catch (err) {
      console.error("Failed to load low stock alerts:", err);
    } finally {
      setLowStockLoading(false);
    }
  }, [includeOutOfStock, lowStockPage, lowStockLimit]);

  // ─── TAB 3: TRANSACTION LOG ───────────────────────────────────────
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [txLoading, setTxLoading] = useState<boolean>(false);
  const [txPage, setTxPage] = useState<number>(1);
  const [txLimit] = useState<number>(15);
  const [txMeta, setTxMeta] = useState({ total: 0, totalPages: 1 });

  // Filters
  const [txProductId, setTxProductId] = useState<string>("");
  const [txStockType, setTxStockType] = useState<string>("");
  const [txPurpose, setTxPurpose] = useState<string>("");
  const [txReference, setTxReference] = useState<string>("");
  const [txStartDate, setTxStartDate] = useState<string>("");
  const [txEndDate, setTxEndDate] = useState<string>("");
  const [txSortBy, setTxSortBy] = useState<"createdAt" | "transactionQuantity">("createdAt");
  const [txSortOrder, setTxSortOrder] = useState<"asc" | "desc">("desc");

  const fetchTransactions = useCallback(async () => {
    try {
      setTxLoading(true);
      const res = await inventoryApi.getTransactions({
        productId: txProductId || undefined,
        stockType: (txStockType as InventoryTxType) || undefined,
        purpose: (txPurpose as InventoryTxPurpose) || undefined,
        reference: txReference.trim() || undefined,
        startDate: txStartDate || undefined,
        endDate: txEndDate || undefined,
        page: txPage,
        limit: txLimit,
        sortBy: txSortBy,
        sortOrder: txSortOrder,
      });
      setTransactions(res.data || []);
      setTxMeta({
        total: res.meta?.total || 0,
        totalPages: res.meta?.totalPages || 1,
      });
    } catch (err) {
      console.error("Failed to load transaction log:", err);
    } finally {
      setTxLoading(false);
    }
  }, [
    txProductId,
    txStockType,
    txPurpose,
    txReference,
    txStartDate,
    txEndDate,
    txPage,
    txLimit,
    txSortBy,
    txSortOrder,
  ]);

  // ─── TAB 4: PRODUCT SUMMARY ───────────────────────────────────────
  const [productSummaries, setProductSummaries] = useState<ProductSummaryItem[]>([]);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryPage, setSummaryPage] = useState<number>(1);
  const [summaryLimit] = useState<number>(10);
  const [summaryMeta, setSummaryMeta] = useState({ total: 0, totalPages: 1 });
  const [summaryProductId, setSummaryProductId] = useState<string>("");
  const [summaryStartDate, setSummaryStartDate] = useState<string>("");
  const [summaryEndDate, setSummaryEndDate] = useState<string>("");
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  const fetchProductSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const res = await inventoryApi.getProductSummary({
        productId: summaryProductId || undefined,
        startDate: summaryStartDate || undefined,
        endDate: summaryEndDate || undefined,
        page: summaryPage,
        limit: summaryLimit,
      });
      setProductSummaries(res.data || []);
      setSummaryMeta({
        total: res.meta?.total || 0,
        totalPages: res.meta?.totalPages || 1,
      });
    } catch (err) {
      console.error("Failed to load product summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  }, [summaryProductId, summaryStartDate, summaryEndDate, summaryPage, summaryLimit]);

  // Initial products fetch
  useEffect(() => {
    productApi.getAll().then((prods) => setProductsList(prods)).catch(() => {});
  }, []);

  // Fetch tab-specific data on activeTab change or filter updates
  useEffect(() => {
    if (activeTab === "dashboard") {
      fetchDashboard();
    } else if (activeTab === "low-stock") {
      fetchLowStock();
    } else if (activeTab === "transactions") {
      fetchTransactions();
    } else if (activeTab === "product-summary") {
      fetchProductSummary();
    }
  }, [activeTab, fetchDashboard, fetchLowStock, fetchTransactions, fetchProductSummary]);

  // Refresh handler
  const handleRefresh = () => {
    if (activeTab === "dashboard") fetchDashboard();
    else if (activeTab === "low-stock") fetchLowStock();
    else if (activeTab === "transactions") fetchTransactions();
    else if (activeTab === "product-summary") fetchProductSummary();
  };

  // ─── HELPER BADGE RENDERERS ───────────────────────────────────────
  const renderTxBadge = (type: InventoryTxType) => {
    if (type === "STOCK_IN") {
      return (
        <span className="badge badge-success text-white gap-1 font-semibold text-xs py-2 px-3">
          <ArrowDownLeft size={14} /> Stock In
        </span>
      );
    }
    return (
      <span className="badge badge-error text-white gap-1 font-semibold text-xs py-2 px-3">
        <ArrowUpRight size={14} /> Stock Out
      </span>
    );
  };

  const renderPurposeBadge = (purpose: InventoryTxPurpose) => {
    switch (purpose) {
      case "PURCHASE":
        return <span className="badge badge-info text-white text-xs px-2 py-1">PURCHASE</span>;
      case "SELL":
        return <span className="badge badge-success text-white text-xs px-2 py-1">SELL</span>;
      case "RETURN":
        return <span className="badge badge-warning text-white text-xs px-2 py-1">RETURN</span>;
      case "DAMAGE":
        return <span className="badge badge-error text-white text-xs px-2 py-1">DAMAGE</span>;
      default:
        return <span className="badge badge-neutral text-xs px-2 py-1">{purpose}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* ─── HEADER BANNER ─────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-wide uppercase mb-1">
            <Activity size={18} /> Real-Time Analytics
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Inventory Monitor</h1>
          <p className="text-slate-300 text-sm mt-1">
            Track stock levels, monitor low stock alerts, audit transaction logs & analyze movement summaries.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="btn btn-sm btn-ghost text-white border border-slate-700 hover:bg-slate-800 gap-2"
          >
            <RefreshCw size={16} className={(dashboardLoading || lowStockLoading || txLoading || summaryLoading) ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* ─── TAB NAVIGATION ────────────────────────────────────────── */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-base-200 flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "dashboard"
              ? "bg-primary text-white shadow"
              : "text-slate-600 hover:bg-base-100"
          }`}
        >
          <BarChart3 size={18} /> Dashboard Overview
        </button>

        <button
          onClick={() => setActiveTab("low-stock")}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "low-stock"
              ? "bg-primary text-white shadow"
              : "text-slate-600 hover:bg-base-100"
          }`}
        >
          <AlertTriangle size={18} /> Low Stock Alerts
          {dashboardData?.lowStockCount ? (
            <span className="badge badge-sm badge-error text-white font-bold ml-1">
              {dashboardData.lowStockCount}
            </span>
          ) : null}
        </button>

        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "transactions"
              ? "bg-primary text-white shadow"
              : "text-slate-600 hover:bg-base-100"
          }`}
        >
          <FileText size={18} /> Transaction Log
        </button>

        <button
          onClick={() => setActiveTab("product-summary")}
          className={`flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-semibold transition-all ${
            activeTab === "product-summary"
              ? "bg-primary text-white shadow"
              : "text-slate-600 hover:bg-base-100"
          }`}
        >
          <Boxes size={18} /> Product Summary
        </button>
      </div>

      {/* ─── TAB 1: DASHBOARD OVERVIEW CONTENT ─────────────────────── */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Date Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-base-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-medium text-sm text-slate-700">
              <Calendar size={18} className="text-primary" />
              <span>Period Movement Date Range:</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">From:</span>
                <input
                  type="date"
                  value={dashStartDate}
                  onChange={(e) => setDashStartDate(e.target.value)}
                  className="input input-sm input-bordered text-black bg-white focus:input-primary"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">To:</span>
                <input
                  type="date"
                  value={dashEndDate}
                  onChange={(e) => setDashEndDate(e.target.value)}
                  className="input input-sm input-bordered text-black bg-white focus:input-primary"
                />
              </div>
              {(dashStartDate || dashEndDate) && (
                <button
                  onClick={() => {
                    setDashStartDate("");
                    setDashEndDate("");
                  }}
                  className="btn btn-xs btn-ghost text-slate-500 hover:text-error"
                >
                  Clear Range
                </button>
              )}
            </div>
          </div>

          {dashboardLoading ? (
            <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-base-200">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : dashboardData ? (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-base-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Package size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-800 mt-3">{dashboardData.totalProducts}</div>
                  <p className="text-xs text-slate-500 mt-1">Unique active products</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-base-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock Units</span>
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Boxes size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-emerald-600 mt-3">
                    {dashboardData.totalStockUnits.toLocaleString()}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Across all inventory records</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-base-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stock Valuation</span>
                    <div className="p-2 bg-sky-50 text-sky-600 rounded-lg">
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-slate-800 mt-3">
                    ${Number(dashboardData.totalStockValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Total current stock value</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-base-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Low Stock Alerts</span>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                      <AlertTriangle size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-amber-600 mt-3">{dashboardData.lowStockCount}</div>
                  <p className="text-xs text-slate-500 mt-1">At or below alert limit</p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-base-200 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Out of Stock</span>
                    <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                      <XCircle size={20} />
                    </div>
                  </div>
                  <div className="text-2xl font-black text-rose-600 mt-3">{dashboardData.outOfStockCount}</div>
                  <p className="text-xs text-slate-500 mt-1">0 unit stock count</p>
                </div>
              </div>

              {/* Period Movement Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock In vs Stock Out */}
                <div className="bg-white p-6 rounded-2xl border border-base-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-base-200 pb-3">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Activity size={20} className="text-indigo-600" /> Total Period Movement
                    </h3>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                      Units
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold uppercase">
                        <TrendingUp size={16} /> Total Stock In
                      </div>
                      <div className="text-3xl font-black text-emerald-800 mt-2">
                        +{dashboardData.periodMovement.totalStockIn.toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase">
                        <TrendingDown size={16} /> Total Stock Out
                      </div>
                      <div className="text-3xl font-black text-rose-800 mt-2">
                        -{dashboardData.periodMovement.totalStockOut.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purpose Breakdown */}
                <div className="bg-white p-6 rounded-2xl border border-base-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-base-200 pb-3">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Layers size={20} className="text-primary" /> Movement by Purpose
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl border border-base-200 bg-slate-50">
                      <span className="text-xs font-bold text-slate-500 uppercase">Purchases</span>
                      <div className="text-xl font-extrabold text-indigo-600 mt-1">
                        {dashboardData.periodMovement.totalPurchased.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-base-200 bg-slate-50">
                      <span className="text-xs font-bold text-slate-500 uppercase">Sales</span>
                      <div className="text-xl font-extrabold text-emerald-600 mt-1">
                        {dashboardData.periodMovement.totalSold.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-base-200 bg-slate-50">
                      <span className="text-xs font-bold text-slate-500 uppercase">Returns</span>
                      <div className="text-xl font-extrabold text-amber-600 mt-1">
                        {dashboardData.periodMovement.totalReturned.toLocaleString()}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl border border-base-200 bg-slate-50">
                      <span className="text-xs font-bold text-slate-500 uppercase">Damaged</span>
                      <div className="text-xl font-extrabold text-rose-600 mt-1">
                        {dashboardData.periodMovement.totalDamaged.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* ─── TAB 2: LOW STOCK ALERTS CONTENT ──────────────────────── */}
      {activeTab === "low-stock" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-base-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={includeOutOfStock}
                  onChange={(e) => {
                    setIncludeOutOfStock(e.target.checked);
                    setLowStockPage(1);
                  }}
                  className="checkbox checkbox-primary checkbox-sm"
                />
                <span className="text-sm font-semibold text-slate-700">Include Out of Stock Items</span>
              </label>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Showing {lowStockItems.length} of {lowStockMeta.total} alerts
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-base-200 shadow-sm overflow-hidden">
            {lowStockLoading ? (
              <div className="h-64 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : lowStockItems.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <CheckCircle size={48} className="mx-auto mb-3 text-emerald-500 opacity-80" />
                <p className="text-lg font-bold text-slate-700">No Low Stock Alerts</p>
                <p className="text-sm text-slate-500 mt-1">All inventory items are above alert limits.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th>Status</th>
                      <th>Product</th>
                      <th>Size</th>
                      <th>Current Stock</th>
                      <th>Alert Limit</th>
                      <th>Cost / Unit</th>
                      <th>Supplier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200">
                    {lowStockItems.map((item) => {
                      const isZero = item.currentStock === 0;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td>
                            {isZero ? (
                              <span className="badge badge-error text-white font-bold text-xs gap-1">
                                <XCircle size={12} /> OUT OF STOCK
                              </span>
                            ) : (
                              <span className="badge badge-warning text-white font-bold text-xs gap-1">
                                <AlertTriangle size={12} /> LOW STOCK
                              </span>
                            )}
                          </td>
                          <td className="font-semibold text-slate-800">
                            {item.product?.name || "Unknown Product"}
                          </td>
                          <td>
                            <span className="badge badge-outline text-xs">
                              {item.productSize?.size?.name || "Standard / N/A"}
                            </span>
                          </td>
                          <td>
                            <span className={`font-black text-base ${isZero ? "text-rose-600" : "text-amber-600"}`}>
                              {item.currentStock}
                            </span>
                          </td>
                          <td className="text-slate-600 font-medium">{item.stockLimitAlert}</td>
                          <td className="text-slate-700 font-semibold">${Number(item.costPerUnit).toFixed(2)}</td>
                          <td className="text-xs text-slate-600 space-y-0.5">
                            {item.supplierName && (
                              <div className="flex items-center gap-1 font-medium text-slate-800">
                                <User size={12} className="text-slate-400" /> {item.supplierName}
                              </div>
                            )}
                            {item.supplierMobile && (
                              <div className="flex items-center gap-1 text-slate-500">
                                <Phone size={12} className="text-slate-400" /> {item.supplierMobile}
                              </div>
                            )}
                            {!item.supplierName && !item.supplierMobile && (
                              <span className="text-slate-400 italic">No supplier info</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {lowStockMeta.totalPages > 1 && (
              <div className="p-4 border-t border-base-200 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Page {lowStockPage} of {lowStockMeta.totalPages}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={lowStockPage <= 1}
                    onClick={() => setLowStockPage((p) => p - 1)}
                    className="btn btn-sm btn-outline gap-1"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button
                    disabled={lowStockPage >= lowStockMeta.totalPages}
                    onClick={() => setLowStockPage((p) => p + 1)}
                    className="btn btn-sm btn-outline gap-1"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: TRANSACTION LOG CONTENT ────────────────────────── */}
      {activeTab === "transactions" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-5 rounded-2xl border border-base-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-base-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Filter size={16} className="text-primary" /> Filter Transactions
              </h3>
              <button
                onClick={() => {
                  setTxProductId("");
                  setTxStockType("");
                  setTxPurpose("");
                  setTxReference("");
                  setTxStartDate("");
                  setTxEndDate("");
                  setTxSortBy("createdAt");
                  setTxSortOrder("desc");
                  setTxPage(1);
                }}
                className="btn btn-xs btn-ghost text-slate-500 hover:text-error"
              >
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Product Select */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Product</label>
                <select
                  value={txProductId}
                  onChange={(e) => {
                    setTxProductId(e.target.value);
                    setTxPage(1);
                  }}
                  className="select select-sm select-bordered text-black bg-white w-full"
                >
                  <option value="">All Products</option>
                  {productsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Type */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Type</label>
                <select
                  value={txStockType}
                  onChange={(e) => {
                    setTxStockType(e.target.value);
                    setTxPage(1);
                  }}
                  className="select select-sm select-bordered text-black bg-white w-full"
                >
                  <option value="">All Stock Types</option>
                  <option value="STOCK_IN">Stock In</option>
                  <option value="STOCK_OUT">Stock Out</option>
                </select>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Purpose</label>
                <select
                  value={txPurpose}
                  onChange={(e) => {
                    setTxPurpose(e.target.value);
                    setTxPage(1);
                  }}
                  className="select select-sm select-bordered text-black bg-white w-full"
                >
                  <option value="">All Purposes</option>
                  <option value="PURCHASE">Purchase</option>
                  <option value="SELL">Sell</option>
                  <option value="RETURN">Return</option>
                  <option value="DAMAGE">Damage</option>
                </select>
              </div>

              {/* Reference Search */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Reference Search</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search PO / Ref..."
                    value={txReference}
                    onChange={(e) => {
                      setTxReference(e.target.value);
                      setTxPage(1);
                    }}
                    className="input input-sm input-bordered text-black bg-white w-full pl-8"
                  />
                  <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                </div>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
                <input
                  type="date"
                  value={txStartDate}
                  onChange={(e) => {
                    setTxStartDate(e.target.value);
                    setTxPage(1);
                  }}
                  className="input input-sm input-bordered text-black bg-white w-full"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">End Date</label>
                <input
                  type="date"
                  value={txEndDate}
                  onChange={(e) => {
                    setTxEndDate(e.target.value);
                    setTxPage(1);
                  }}
                  className="input input-sm input-bordered text-black bg-white w-full"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sort Field</label>
                <select
                  value={txSortBy}
                  onChange={(e) => {
                    setTxSortBy(e.target.value as any);
                    setTxPage(1);
                  }}
                  className="select select-sm select-bordered text-black bg-white w-full"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="transactionQuantity">Quantity</option>
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sort Order</label>
                <select
                  value={txSortOrder}
                  onChange={(e) => {
                    setTxSortOrder(e.target.value as any);
                    setTxPage(1);
                  }}
                  className="select select-sm select-bordered text-black bg-white w-full"
                >
                  <option value="desc">Descending (Newest / High)</option>
                  <option value="asc">Ascending (Oldest / Low)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-2xl border border-base-200 shadow-sm overflow-hidden">
            {txLoading ? (
              <div className="h-64 flex items-center justify-center">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <FileText size={48} className="mx-auto mb-3 opacity-60" />
                <p className="text-lg font-bold text-slate-700">No Transactions Found</p>
                <p className="text-sm text-slate-500 mt-1">Try relaxing your filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th>Type</th>
                      <th>Purpose</th>
                      <th>Product & Size</th>
                      <th>Quantity</th>
                      <th>Stock Change</th>
                      <th>Reference</th>
                      <th>Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-base-200">
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td>{renderTxBadge(tx.stockType)}</td>
                        <td>{renderPurposeBadge(tx.purpose)}</td>
                        <td>
                          <div className="font-semibold text-slate-800">
                            {tx.inventory?.product?.name || "Product"}
                          </div>
                          {tx.inventory?.productSize?.size?.name && (
                            <span className="badge badge-ghost badge-xs text-slate-500 mt-0.5">
                              Size: {tx.inventory.productSize.size.name}
                            </span>
                          )}
                        </td>
                        <td>
                          <span
                            className={`font-black text-sm ${
                              tx.stockType === "STOCK_IN" ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {tx.stockType === "STOCK_IN" ? `+${tx.transactionQuantity}` : `-${tx.transactionQuantity}`}
                          </span>
                        </td>
                        <td>
                          <div className="text-xs text-slate-600 flex items-center gap-1 font-mono">
                            <span className="text-slate-400">{tx.stockBefore}</span>
                            <span>→</span>
                            <span className="font-bold text-slate-900">{tx.stockAfter}</span>
                          </div>
                        </td>
                        <td className="text-xs text-slate-600">
                          {tx.reference ? (
                            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {tx.reference}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">—</span>
                          )}
                        </td>
                        <td className="text-xs text-slate-500">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {txMeta.totalPages > 1 && (
              <div className="p-4 border-t border-base-200 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Page {txPage} of {txMeta.totalPages} ({txMeta.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={txPage <= 1}
                    onClick={() => setTxPage((p) => p - 1)}
                    className="btn btn-sm btn-outline gap-1"
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <button
                    disabled={txPage >= txMeta.totalPages}
                    onClick={() => setTxPage((p) => p + 1)}
                    className="btn btn-sm btn-outline gap-1"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 4: PRODUCT SUMMARY CONTENT ────────────────────────── */}
      {activeTab === "product-summary" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl border border-base-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={summaryProductId}
                onChange={(e) => {
                  setSummaryProductId(e.target.value);
                  setSummaryPage(1);
                }}
                className="select select-sm select-bordered text-black bg-white"
              >
                <option value="">All Products</option>
                {productsList.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">From:</span>
                <input
                  type="date"
                  value={summaryStartDate}
                  onChange={(e) => {
                    setSummaryStartDate(e.target.value);
                    setSummaryPage(1);
                  }}
                  className="input input-sm input-bordered text-black bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-semibold">To:</span>
                <input
                  type="date"
                  value={summaryEndDate}
                  onChange={(e) => {
                    setSummaryEndDate(e.target.value);
                    setSummaryPage(1);
                  }}
                  className="input input-sm input-bordered text-black bg-white"
                />
              </div>

              {(summaryProductId || summaryStartDate || summaryEndDate) && (
                <button
                  onClick={() => {
                    setSummaryProductId("");
                    setSummaryStartDate("");
                    setSummaryEndDate("");
                    setSummaryPage(1);
                  }}
                  className="btn btn-xs btn-ghost text-slate-500 hover:text-error"
                >
                  Clear Filters
                </button>
              )}
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Showing {productSummaries.length} of {summaryMeta.total} products
            </div>
          </div>

          {/* Product Cards */}
          {summaryLoading ? (
            <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-base-200">
              <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
          ) : productSummaries.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-base-200 text-slate-400">
              <Boxes size={48} className="mx-auto mb-3 opacity-60" />
              <p className="text-lg font-bold text-slate-700">No Product Summaries Found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {productSummaries.map((item) => {
                const isExpanded = expandedProduct === item.productId;
                return (
                  <div
                    key={item.productId}
                    className="bg-white rounded-2xl border border-base-200 shadow-sm overflow-hidden transition-all"
                  >
                    <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 border-b border-base-200">
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900">{item.productName}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Product ID: {item.productId}</p>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div className="bg-white px-3 py-2 rounded-xl border border-base-200">
                          <span className="text-xs text-slate-400 uppercase font-bold">Total Stock</span>
                          <div className="text-lg font-black text-emerald-600">{item.totalStockUnits}</div>
                        </div>

                        <div className="bg-white px-3 py-2 rounded-xl border border-base-200">
                          <span className="text-xs text-slate-400 uppercase font-bold">Stock Value</span>
                          <div className="text-lg font-black text-slate-800">
                            ${Number(item.totalStockValue).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </div>
                        </div>

                        <div className="bg-white px-3 py-2 rounded-xl border border-base-200">
                          <span className="text-xs text-slate-400 uppercase font-bold">Avg Cost / Unit</span>
                          <div className="text-lg font-black text-indigo-600">${item.avgCostPerUnit}</div>
                        </div>

                        <div className="bg-white px-3 py-2 rounded-xl border border-base-200 flex items-center justify-center">
                          <button
                            onClick={() => setExpandedProduct(isExpanded ? null : item.productId)}
                            className="btn btn-sm btn-ghost text-primary gap-1 font-semibold"
                          >
                            Size Breakdown {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Period Movement Bar */}
                    <div className="p-4 bg-white grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-base-200">
                      <div className="text-xs">
                        <span className="text-slate-400 font-medium">Purchased: </span>
                        <span className="font-bold text-indigo-600">+{item.periodMovement.totalPurchased}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-400 font-medium">Sold: </span>
                        <span className="font-bold text-emerald-600">-{item.periodMovement.totalSold}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-400 font-medium">Returned: </span>
                        <span className="font-bold text-amber-600">+{item.periodMovement.totalReturned}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-400 font-medium">Damaged: </span>
                        <span className="font-bold text-rose-600">-{item.periodMovement.totalDamaged}</span>
                      </div>
                    </div>

                    {/* Expandable Size Breakdown */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-50/50">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                          Size Level Stock Breakdown
                        </h4>
                        <div className="overflow-x-auto bg-white rounded-xl border border-base-200">
                          <table className="table table-compact w-full">
                            <thead>
                              <tr className="bg-slate-100 text-slate-700 text-xs">
                                <th>Size</th>
                                <th>Current Stock</th>
                                <th>Cost Per Unit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.sizeBreakdown.map((sb, idx) => (
                                <tr key={sb.productSizeId || idx}>
                                  <td className="font-semibold text-slate-800">
                                    {sb.sizeName || "Standard / Default Size"}
                                  </td>
                                  <td>
                                    <span className="font-bold text-slate-900">{sb.currentStock}</span>
                                  </td>
                                  <td className="text-slate-700">${Number(sb.costPerUnit).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Pagination */}
              {summaryMeta.totalPages > 1 && (
                <div className="p-4 bg-white rounded-xl border border-base-200 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500">
                    Page {summaryPage} of {summaryMeta.totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={summaryPage <= 1}
                      onClick={() => setSummaryPage((p) => p - 1)}
                      className="btn btn-sm btn-outline gap-1"
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <button
                      disabled={summaryPage >= summaryMeta.totalPages}
                      onClick={() => setSummaryPage((p) => p + 1)}
                      className="btn btn-sm btn-outline gap-1"
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
