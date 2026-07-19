"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  RefreshCw,
  Plus,
  Search,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  History,
  CheckCircle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  Tag,
  Boxes,
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
  Image as ImageIcon,
  SlidersHorizontal,
  Filter,
} from "lucide-react";
import api from "@/services/axios";
import { productApi, Product } from "@/services/product.api";
import {
  inventoryApi,
  AdjustStockDto,
  InventoryTxType,
  InventoryTxPurpose,
  InventoryRecord,
  InventoryTransaction,
} from "@/services/inventory.api";
import { useAuthStore } from "@/store/useAuthStore";

export default function InventoryPage() {
  const { user } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [activeTab, setActiveTab] = useState<"overview" | "history" | "low-stock">("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockStatusFilter, setStockStatusFilter] = useState("");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Adjustment Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [productInventories, setProductInventories] = useState<InventoryRecord[]>([]);
  const [isLoadingInventories, setIsLoadingInventories] = useState(false);

  const [formData, setFormData] = useState<{
    productSizeId: string;
    transactionQuantity: number;
    stockType: InventoryTxType;
    purpose: InventoryTxPurpose;
    reference: string;
    notes: string;
    incomingCostPerUnit: string;
  }>({
    productSizeId: "",
    transactionQuantity: 1,
    stockType: "STOCK_IN",
    purpose: "PURCHASE",
    reference: "",
    notes: "",
    incomingCostPerUnit: "",
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load initial data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadingProgress(25);

      const [prodsData, catsData, txsData, lowStockData] = await Promise.all([
        productApi.getAll().catch(() => []),
        api.get("/categories").then((r) => r.data).catch(() => []),
        inventoryApi.getTransactions().catch(() => []),
        inventoryApi.getLowStock(1, 50).catch(() => []),
      ]);

      setLoadingProgress(75);

      setProducts(Array.isArray(prodsData) ? prodsData : prodsData?.data || []);
      setCategories(Array.isArray(catsData) ? catsData : catsData?.data || []);
      setTransactions(Array.isArray(txsData) ? txsData : txsData?.data || []);
      setLowStockItems(
        Array.isArray(lowStockData?.items)
          ? lowStockData.items
          : Array.isArray(lowStockData)
          ? lowStockData
          : []
      );

      setLoadingProgress(100);
    } catch (err) {
      console.error("Failed to load inventory data", err);
    } finally {
      setTimeout(() => setIsLoading(false), 200);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate Metrics
  const totalStoreStock = products.reduce((acc, p) => {
    const pStock = p.inventories?.reduce((sum, inv) => sum + (inv.currentStock || 0), 0) ?? 0;
    return acc + pStock;
  }, 0);

  const totalStoreValue = products.reduce((acc, p) => {
    const pValue =
      p.inventories?.reduce(
        (sum, inv) => sum + (inv.currentStock || 0) * Number(inv.costPerUnit || p.purchasePrice || 0),
        0
      ) ?? 0;
    return acc + pValue;
  }, 0);

  // Load size inventories when selected product changes in modal
  useEffect(() => {
    if (!selectedProductId) {
      setProductInventories([]);
      setFormData((prev) => ({ ...prev, productSizeId: "" }));
      return;
    }

    const loadInventories = async () => {
      try {
        setIsLoadingInventories(true);
        const invs = await inventoryApi.findByProductId(selectedProductId);
        setProductInventories(invs);

        if (invs.length > 0) {
          setFormData((prev) => ({
            ...prev,
            productSizeId: invs[0].productSizeId || "",
          }));
        }
      } catch (err) {
        console.error("Failed to fetch product inventory sizes", err);
        setProductInventories([]);
      } finally {
        setIsLoadingInventories(false);
      }
    };

    loadInventories();
  }, [selectedProductId]);

  const handleOpenModal = (productId: string = "", sizeId: string = "") => {
    const defaultProdId = productId || (products[0]?.id || "");
    setSelectedProductId(defaultProdId);
    setFormData({
      productSizeId: sizeId,
      transactionQuantity: 1,
      stockType: "STOCK_IN",
      purpose: "PURCHASE",
      reference: "",
      notes: "",
      incomingCostPerUnit: "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId("");
    setProductInventories([]);
  };

  const handleStockTypeChange = (type: InventoryTxType) => {
    setFormData((prev) => ({
      ...prev,
      stockType: type,
      purpose: type === "STOCK_IN" ? "PURCHASE" : "SELL",
    }));
  };

  // Submit Stock Adjustment
  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProductId) {
      alert("Please select a product.");
      return;
    }

    if (!user?.id) {
      alert("Authenticated user ID not found. Please re-login.");
      return;
    }

    if (
      formData.stockType === "STOCK_IN" &&
      formData.purpose === "PURCHASE" &&
      (!formData.incomingCostPerUnit || Number(formData.incomingCostPerUnit) < 0)
    ) {
      alert("Incoming Cost Per Unit (৳) is required for Purchase operations.");
      return;
    }

    try {
      setIsSubmitting(true);

      const dto: AdjustStockDto = {
        productId: selectedProductId,
        productSizeId: formData.productSizeId || undefined,
        transactionQuantity: Number(formData.transactionQuantity),
        stockType: formData.stockType,
        purpose: formData.purpose,
        performedBy: user.id,
        reference: formData.reference?.trim() || undefined,
        notes: formData.notes?.trim() || undefined,
        incomingCostPerUnit:
          formData.stockType === "STOCK_IN" && formData.purpose === "PURCHASE"
            ? Number(formData.incomingCostPerUnit)
            : undefined,
      };

      await inventoryApi.adjustStock(dto);
      await fetchData();

      setToastMessage("Stock adjustment recorded successfully!");
      setTimeout(() => setToastMessage(null), 3000);

      handleCloseModal();
    } catch (err: any) {
      console.error("Failed to adjust stock", err);
      alert(err.response?.data?.message || "Failed to execute stock adjustment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedInventory = productInventories.find((inv) =>
    formData.productSizeId ? inv.productSizeId === formData.productSizeId : !inv.productSizeId
  );

  // Filtered Products for Overview Table
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? p.categoryId === categoryFilter : true;

    const invs = p.inventories || [];
    const totalStock = invs.reduce((sum, inv) => sum + (inv.currentStock || 0), 0);
    const isOutOfStock = totalStock === 0;
    const isLowStock = !isOutOfStock && invs.some((inv) => inv.currentStock <= inv.stockLimitAlert);

    let matchesStatus = true;
    if (stockStatusFilter === "in-stock") matchesStatus = !isOutOfStock && !isLowStock;
    if (stockStatusFilter === "low-stock") matchesStatus = isLowStock;
    if (stockStatusFilter === "out-of-stock") matchesStatus = isOutOfStock;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="p-6 w-full flex flex-col h-full bg-base-200 text-black relative space-y-6">
      {/* Top Global Progress Bar */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div
            className="h-1 bg-gradient-to-r from-indigo-500 via-primary to-emerald-500 transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast toast-top toast-end z-50 animate-in fade-in slide-in-from-top-4">
          <div className="alert alert-success text-white shadow-xl flex items-center gap-2 rounded-xl">
            <CheckCircle size={20} />
            <span className="font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-black flex items-center gap-3 tracking-tight">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-sm">
              <RefreshCw size={28} />
            </div>
            Inventory & Stock Control
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time stock monitoring per size variant, purchase additions, and audit logging
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn btn-primary text-white shadow-lg hover:shadow-primary/30 transition-all gap-2 rounded-xl"
          disabled={isLoading}
        >
          <Plus size={20} /> Adjust Stock
        </button>
      </div>

      {/* RICH METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock */}
        <div className="bg-white p-5 rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <Boxes size={26} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Store Stock
            </div>
            <div className="text-2xl font-extrabold text-black mt-0.5">
              {totalStoreStock.toLocaleString()}{" "}
              <span className="text-xs font-normal text-gray-500">Units</span>
            </div>
          </div>
        </div>

        {/* Active Products */}
        <div className="bg-white p-5 rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
            <Package size={26} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Active Products
            </div>
            <div className="text-2xl font-extrabold text-black mt-0.5">
              {products.length} <span className="text-xs font-normal text-gray-500">Items</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-2xl border border-amber-100">
            <AlertTriangle size={26} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Low Stock Alerts
            </div>
            <div className="text-2xl font-extrabold text-amber-600 mt-0.5">
              {lowStockItems.length} <span className="text-xs font-normal text-gray-500">Alerts</span>
            </div>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white p-5 rounded-2xl border border-base-300 shadow-sm hover:shadow-md transition-all flex items-center gap-4">
          <div className="p-3.5 bg-violet-50 text-violet-600 rounded-2xl border border-violet-100">
            <TrendingUp size={26} />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Stock Value
            </div>
            <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              ৳{totalStoreValue.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="bg-white rounded-2xl shadow-sm border border-base-300 overflow-hidden flex flex-col">
        {/* Navigation Tabs */}
        <div className="bg-base-100 p-3 border-b border-base-300 flex flex-wrap justify-between items-center gap-3">
          <div className="flex gap-2">
            <button
              className={`btn btn-sm rounded-xl font-semibold gap-2 ${
                activeTab === "overview" ? "btn-primary text-white shadow" : "btn-ghost text-black"
              }`}
              onClick={() => setActiveTab("overview")}
            >
              <Package size={16} /> Products & Size Stock
            </button>
            <button
              className={`btn btn-sm rounded-xl font-semibold gap-2 ${
                activeTab === "history" ? "btn-primary text-white shadow" : "btn-ghost text-black"
              }`}
              onClick={() => setActiveTab("history")}
            >
              <History size={16} /> Audit Log ({transactions.length})
            </button>
            <button
              className={`btn btn-sm rounded-xl font-semibold gap-2 ${
                activeTab === "low-stock" ? "btn-primary text-white shadow" : "btn-ghost text-black"
              }`}
              onClick={() => setActiveTab("low-stock")}
            >
              <AlertTriangle size={16} /> Low Stock Alerts ({lowStockItems.length})
            </button>
          </div>
        </div>

        {/* TAB 1: PRODUCTS & SIZE STOCK OVERVIEW TABLE */}
        {activeTab === "overview" && (
          <div className="flex flex-col">
            {/* Search & Filter Bar */}
            <div className="p-4 border-b border-base-200 bg-base-100/50 flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products by name..."
                  className="input input-bordered input-sm w-full pl-10 bg-white text-black rounded-xl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-500" />
                <select
                  className="select select-bordered select-sm bg-white text-black rounded-xl"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  className="select select-bordered select-sm bg-white text-black rounded-xl"
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                >
                  <option value="">All Stock Statuses</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="table w-full border-collapse">
                <thead>
                  <tr className="bg-base-200/70 text-black text-xs uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Product Item</th>
                    <th className="py-3 px-4 font-bold">Category / Brand</th>
                    <th className="py-3 px-4 font-bold text-center">Stock Breakdown Per Size</th>
                    <th className="py-3 px-4 font-bold text-center">Total Product Stock</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16">
                        <Loader2 className="animate-spin mx-auto text-primary" size={32} />
                        <p className="mt-2 text-sm text-gray-500 font-medium">
                          Loading inventory details...
                        </p>
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-500">
                        No products match your search or filter settings.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const isExpanded = expandedProductId === p.id;
                      const productInventoriesList = p.inventories || [];
                      const totalProductStock = productInventoriesList.reduce(
                        (sum, inv) => sum + (inv.currentStock || 0),
                        0
                      );

                      const isOutOfStock = totalProductStock === 0;
                      const isLowStock =
                        !isOutOfStock &&
                        productInventoriesList.some((inv) => inv.currentStock <= inv.stockLimitAlert);

                      const primaryImg =
                        p.images?.find((img) => img.isPrimary)?.imageUrl ||
                        p.images?.[0]?.imageUrl;

                      return (
                        <React.Fragment key={p.id}>
                          <tr className="hover:bg-base-100/80 transition-colors">
                            {/* Product Info */}
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-base-200 overflow-hidden border border-base-300 flex-shrink-0 flex items-center justify-center">
                                  {primaryImg ? (
                                    <img
                                      src={primaryImg}
                                      alt={p.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        (e.target as HTMLElement).style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <ImageIcon size={20} className="text-gray-400" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-black text-sm hover:text-primary transition-colors">
                                    {p.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    Price: ৳{Number(p.newPrice).toLocaleString()} &bull; Unit:{" "}
                                    {p.unit || "Pcs"}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Category & Brand */}
                            <td className="py-4 px-4">
                              <div className="text-sm font-semibold text-black">
                                {p.category?.name || "Uncategorized"}
                              </div>
                              <div className="text-xs text-gray-500">
                                Brand: {p.brand?.name || "N/A"}
                              </div>
                            </td>

                            {/* Stock Breakdown Per Size */}
                            <td className="py-4 px-4 text-center">
                              <div className="flex flex-wrap justify-center gap-1.5 max-w-xs mx-auto">
                                {productInventoriesList.length > 0 ? (
                                  productInventoriesList.map((inv) => {
                                    const sizeLabel = inv.productSize?.size?.name || "Free Size";
                                    const isInvLow = inv.currentStock <= inv.stockLimitAlert;
                                    const isInvEmpty = inv.currentStock <= 0;

                                    return (
                                      <span
                                        key={inv.id}
                                        className={`badge badge-sm font-medium px-2 py-1.5 rounded-lg border ${
                                          isInvEmpty
                                            ? "bg-rose-50 text-rose-700 border-rose-200"
                                            : isInvLow
                                            ? "bg-amber-50 text-amber-700 border-amber-200"
                                            : "bg-base-200 text-black border-base-300"
                                        }`}
                                      >
                                        {sizeLabel}: <strong>{inv.currentStock}</strong>
                                      </span>
                                    );
                                  })
                                ) : (
                                  <span className="text-xs text-gray-400 italic">
                                    No sizes assigned
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Total Product Stock */}
                            <td className="py-4 px-4 text-center">
                              <div
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-extrabold text-sm border ${
                                  isOutOfStock
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : isLowStock
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                }`}
                              >
                                {isOutOfStock ? (
                                  <XCircle size={15} />
                                ) : isLowStock ? (
                                  <AlertCircle size={15} />
                                ) : (
                                  <CheckCircle2 size={15} />
                                )}
                                {totalProductStock} Units
                              </div>
                            </td>

                            {/* Status */}
                            <td className="py-4 px-4 text-center">
                              {isOutOfStock ? (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white shadow-sm">
                                  Out of Stock
                                </span>
                              ) : isLowStock ? (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500 text-white shadow-sm">
                                  Low Stock
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white shadow-sm">
                                  In Stock
                                </span>
                              )}
                            </td>

                            {/* Action Buttons */}
                            <td className="py-4 px-4 text-right">
                              <div className="flex justify-end items-center gap-2">
                                <button
                                  className="btn btn-ghost btn-xs text-gray-600 flex items-center gap-1 rounded-lg"
                                  onClick={() =>
                                    setExpandedProductId(isExpanded ? null : p.id)
                                  }
                                >
                                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                  {isExpanded ? "Hide" : "Sizes"}
                                </button>

                                <button
                                  className="btn btn-primary btn-xs text-white rounded-lg px-3 flex items-center gap-1 shadow-sm"
                                  onClick={() => handleOpenModal(p.id)}
                                >
                                  <RefreshCw size={12} /> Adjust
                                </button>
                              </div>
                            </td>
                          </tr>

                          {/* EXPANDABLE SIZE INVENTORY CARDS */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="bg-base-200/50 p-5 border-t border-b border-base-300">
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-black flex items-center gap-2">
                                      <Layers size={16} className="text-primary" /> Size-wise Inventory Breakdown & Costs
                                    </h4>
                                    <span className="text-xs text-gray-600 font-medium">
                                      Product Stock Valuation:{" "}
                                      <strong className="text-emerald-600 font-bold">
                                        ৳
                                        {(
                                          productInventoriesList.reduce(
                                            (sum, inv) =>
                                              sum +
                                              (inv.currentStock || 0) *
                                                Number(inv.costPerUnit || p.purchasePrice || 0),
                                            0
                                          )
                                        ).toLocaleString()}
                                      </strong>
                                    </span>
                                  </div>

                                  {productInventoriesList.length === 0 ? (
                                    <div className="text-xs text-gray-500 italic py-2">
                                      No size inventories created. Standard inventory applies.
                                    </div>
                                  ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                      {productInventoriesList.map((inv) => {
                                        const sizeName =
                                          inv.productSize?.size?.name || "Free Size / Standard";
                                        const totalVal =
                                          inv.currentStock *
                                          Number(inv.costPerUnit || p.purchasePrice || 0);

                                        return (
                                          <div
                                            key={inv.id}
                                            className="bg-white p-4 rounded-xl border border-base-300 shadow-sm flex flex-col justify-between space-y-3"
                                          >
                                            <div className="flex justify-between items-center border-b pb-2">
                                              <span className="font-extrabold text-black text-sm">
                                                Size: {sizeName}
                                              </span>
                                              <span
                                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                                  inv.currentStock <= 0
                                                    ? "bg-rose-100 text-rose-700"
                                                    : inv.currentStock <= inv.stockLimitAlert
                                                    ? "bg-amber-100 text-amber-800"
                                                    : "bg-emerald-100 text-emerald-800"
                                                }`}
                                              >
                                                {inv.currentStock} Units
                                              </span>
                                            </div>

                                            <div className="text-xs text-gray-600 space-y-1.5">
                                              <div className="flex justify-between">
                                                <span>Unit Cost:</span>
                                                <strong className="text-black">
                                                  ৳{Number(inv.costPerUnit || 0).toFixed(2)}
                                                </strong>
                                              </div>
                                              <div className="flex justify-between">
                                                <span>Subtotal Value:</span>
                                                <strong className="text-emerald-600">
                                                  ৳{totalVal.toLocaleString()}
                                                </strong>
                                              </div>
                                              <div className="flex justify-between">
                                                <span>Alert Threshold:</span>
                                                <span className="font-mono text-gray-600">
                                                  &lt;= {inv.stockLimitAlert} units
                                                </span>
                                              </div>
                                              {inv.supplierName && (
                                                <div className="flex justify-between text-gray-500 pt-1 border-t border-dashed">
                                                  <span>Supplier:</span>
                                                  <span className="font-medium">{inv.supplierName}</span>
                                                </div>
                                              )}
                                            </div>

                                            <button
                                              type="button"
                                              className="btn btn-xs btn-outline btn-primary w-full rounded-lg mt-1"
                                              onClick={() =>
                                                handleOpenModal(p.id, inv.productSizeId || "")
                                              }
                                            >
                                              Adjust {sizeName} Stock
                                            </button>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT LOG / TRANSACTIONS TABLE */}
        {activeTab === "history" && (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200/70 text-black text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Date & Time</th>
                  <th className="py-3 px-4 font-bold">Type & Purpose</th>
                  <th className="py-3 px-4 font-bold">Product / Size</th>
                  <th className="py-3 px-4 font-bold text-center">Quantity Delta</th>
                  <th className="py-3 px-4 font-bold text-center">Stock Change</th>
                  <th className="py-3 px-4 font-bold">Reference & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-gray-500">
                      No stock transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => {
                    const isStockIn = tx.stockType === "STOCK_IN";
                    const sizeName = tx.inventory?.productSize?.size?.name;

                    return (
                      <tr key={tx.id} className="hover:bg-base-100/80 transition-colors">
                        <td className="py-3.5 px-4 text-xs text-gray-600 font-mono">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {isStockIn ? (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                                <ArrowUpRight size={14} /> STOCK IN
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white flex items-center gap-1 shadow-sm">
                                <ArrowDownLeft size={14} /> STOCK OUT
                              </span>
                            )}
                            <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-base-200 text-black border uppercase">
                              {tx.purpose}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-black text-sm">
                            {tx.inventory?.product?.name || "Product"}
                          </div>
                          {sizeName && (
                            <span className="text-xs text-gray-500">Size: {sizeName}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center font-extrabold text-sm">
                          <span className={isStockIn ? "text-emerald-600" : "text-rose-600"}>
                            {isStockIn ? `+${tx.transactionQuantity}` : `-${tx.transactionQuantity}`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-sm font-mono">
                          <span className="text-gray-500">{tx.stockBefore}</span> &rarr;{" "}
                          <strong className="text-black font-bold">{tx.stockAfter}</strong>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-xs text-gray-700">
                            {tx.reference ? (
                              <span className="font-bold text-black">Ref: {tx.reference}</span>
                            ) : (
                              <span className="text-gray-400 italic">No Reference</span>
                            )}
                          </div>
                          {tx.notes && (
                            <div className="text-xs text-gray-500 italic mt-0.5">{tx.notes}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: LOW STOCK ALERTS TABLE */}
        {activeTab === "low-stock" && (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-base-200/70 text-black text-xs uppercase tracking-wider">
                  <th className="py-3 px-4 font-bold">Product Item</th>
                  <th className="py-3 px-4 font-bold">Size</th>
                  <th className="py-3 px-4 font-bold text-center">Current Stock</th>
                  <th className="py-3 px-4 font-bold text-center">Alert Limit</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-base-200">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-500">
                      No low stock alerts! All inventory levels are healthy.
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item: any, idx) => (
                    <tr key={idx} className="hover:bg-base-100/80">
                      <td className="py-3.5 px-4 font-bold text-black">
                        {item.product?.name || item.productName || "N/A"}
                      </td>
                      <td className="py-3.5 px-4 text-sm">
                        {item.productSize?.size?.name || "Free Size"}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="px-3 py-1 text-xs font-bold rounded-lg bg-rose-600 text-white">
                          {item.currentStock ?? 0} Units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-gray-600 font-mono text-xs">
                        &lt;= {item.stockLimitAlert ?? 10} Units
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          className="btn btn-primary btn-xs text-white rounded-lg px-3 shadow-sm"
                          onClick={() => handleOpenModal(item.productId)}
                        >
                          Restock Now
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* STOCK ADJUSTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-150 overflow-hidden border border-base-300">
            {/* Header */}
            <div className="p-6 border-b border-base-200 flex justify-between items-center bg-base-100">
              <div>
                <h2 className="text-xl font-bold text-black flex items-center gap-2">
                  <RefreshCw className="text-primary" size={24} /> Stock Adjustment Form
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Record Stock In (Purchase/Return) or Stock Out (Sell/Damage)
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="btn btn-ghost btn-circle btn-sm text-black"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitAdjustment} className="p-6 overflow-y-auto space-y-4">
              {isSubmitting && (
                <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-primary" size={36} />
                  <p className="font-bold text-black">Executing Serializable Transaction...</p>
                </div>
              )}

              {/* Product Selection */}
              <div className="form-control">
                <label className="label font-semibold text-black">Select Product *</label>
                <select
                  className="select select-bordered w-full bg-white text-black rounded-xl"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Choose product...
                  </option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (৳{Number(p.newPrice).toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Size Inventory Selection */}
              {selectedProductId && (
                <div className="form-control">
                  <label className="label font-semibold text-black">Product Size / Variant</label>
                  {isLoadingInventories ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
                      <Loader2 className="animate-spin" size={16} /> Loading size inventories...
                    </div>
                  ) : productInventories.length === 0 ? (
                    <div className="text-xs text-gray-500 py-2">
                      Standard size inventory will be adjusted.
                    </div>
                  ) : (
                    <select
                      className="select select-bordered w-full bg-white text-black rounded-xl"
                      value={formData.productSizeId}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, productSizeId: e.target.value }))
                      }
                    >
                      {productInventories.map((inv) => (
                        <option key={inv.id} value={inv.productSizeId || ""}>
                          {inv.productSize?.size?.name || "Standard / Free Size"} (Current Stock:{" "}
                          {inv.currentStock})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Current Stock Preview Banner */}
              {selectedInventory && (
                <div className="bg-base-100 p-3.5 rounded-xl border border-base-300 flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs font-semibold">Current Stock</span>
                    <strong className="text-lg text-black">{selectedInventory.currentStock} units</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-500 block text-xs font-semibold">Current Cost/Unit</span>
                    <strong className="text-lg text-emerald-600">
                      ৳{Number(selectedInventory.costPerUnit).toFixed(2)}
                    </strong>
                  </div>
                </div>
              )}

              {/* Stock Mutation Type Toggle Buttons */}
              <div className="form-control">
                <label className="label font-semibold text-black">Adjustment Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleStockTypeChange("STOCK_IN")}
                    className={`btn rounded-xl flex items-center justify-center gap-2 ${
                      formData.stockType === "STOCK_IN"
                        ? "btn-success text-white shadow-md"
                        : "btn-outline text-black bg-white"
                    }`}
                  >
                    <TrendingUp size={18} /> STOCK IN (+)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStockTypeChange("STOCK_OUT")}
                    className={`btn rounded-xl flex items-center justify-center gap-2 ${
                      formData.stockType === "STOCK_OUT"
                        ? "btn-error text-white shadow-md"
                        : "btn-outline text-black bg-white"
                    }`}
                  >
                    <TrendingDown size={18} /> STOCK OUT (-)
                  </button>
                </div>
              </div>

              {/* Transaction Purpose */}
              <div className="form-control">
                <label className="label font-semibold text-black">Purpose *</label>
                <select
                  className="select select-bordered w-full bg-white text-black rounded-xl"
                  value={formData.purpose}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      purpose: e.target.value as InventoryTxPurpose,
                    }))
                  }
                  required
                >
                  {formData.stockType === "STOCK_IN" ? (
                    <>
                      <option value="PURCHASE">PURCHASE (New Stock Received)</option>
                      <option value="RETURN">RETURN (Customer Return)</option>
                    </>
                  ) : (
                    <>
                      <option value="SELL">SELL (Customer Purchase / Order)</option>
                      <option value="DAMAGE">DAMAGE (Damaged / Written-off Stock)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Quantity Input */}
              <div className="form-control">
                <label className="label font-semibold text-black">Transaction Quantity *</label>
                <input
                  type="number"
                  min="1"
                  className="input input-bordered w-full bg-white text-black rounded-xl"
                  value={formData.transactionQuantity}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      transactionQuantity: Math.max(1, parseInt(e.target.value) || 1),
                    }))
                  }
                  required
                />
              </div>

              {/* Incoming Cost Per Unit */}
              {formData.stockType === "STOCK_IN" && formData.purpose === "PURCHASE" && (
                <div className="form-control">
                  <label className="label font-semibold text-black">
                    Incoming Cost Per Unit (৳) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="e.g. 450.00"
                    className="input input-bordered w-full bg-white text-black rounded-xl"
                    value={formData.incomingCostPerUnit}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, incomingCostPerUnit: e.target.value }))
                    }
                    required
                  />
                  <span className="text-xs text-gray-500 mt-1">
                    Used for weighted moving average cost calculation.
                  </span>
                </div>
              )}

              {/* Reference */}
              <div className="form-control">
                <label className="label font-semibold text-black">
                  Reference / Invoice # <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. PO-2026-0042 or INV-9912"
                  className="input input-bordered w-full bg-white text-black rounded-xl"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reference: e.target.value }))
                  }
                />
              </div>

              {/* Notes */}
              <div className="form-control">
                <label className="label font-semibold text-black">
                  Notes <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  placeholder="Additional stock notes or comments..."
                  className="textarea textarea-bordered w-full h-20 bg-white text-black rounded-xl"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-base-200 flex justify-end gap-3">
                <button
                  type="button"
                  className="btn btn-ghost text-black rounded-xl"
                  onClick={handleCloseModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary text-white px-6 rounded-xl flex items-center gap-2 shadow-md"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    "Submit Adjustment"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
