"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Filter,
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  ChevronDown,
  Layers,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/shared/Footer";
import ProductCard from "@/components/ProductCard";
import { productApi, Product } from "@/services/product.api";
import { useCategoryStore } from "@/store/useCategoryStore";

type SortOption = "newest" | "price-asc" | "price-desc" | "name-asc";

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const categoryIdParam = searchParams.get("categoryId");
  const subcategoryIdParam = searchParams.get("subcategoryId");
  const searchQueryParam = searchParams.get("search") || "";

  const { categories, fetchCategories } = useCategoryStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Local Filter States
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(subcategoryIdParam);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 10000 });
  const [maxPriceLimit, setMaxPriceLimit] = useState(10000);
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Sync state with URL search params
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    setSelectedSubcategoryId(subcategoryIdParam);
  }, [subcategoryIdParam]);

  // Fetch all products
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    productApi
      .getAll()
      .then((data) => {
        if (isMounted) {
          setProducts(data);
          // Calculate max price from products for slider
          const maxP = Math.max(...data.map((p) => Number(p.newPrice) || 0), 1000);
          setMaxPriceLimit(Math.ceil(maxP / 100) * 100);
          setPriceRange((prev) => ({ ...prev, max: Math.ceil(maxP / 100) * 100 }));
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Active Category details
  const activeCategory = useMemo(() => {
    if (!categoryIdParam) return null;
    return categories.find((c) => c.id === categoryIdParam) || null;
  }, [categories, categoryIdParam]);

  // Unique Colors & Sizes extracted from all products for filter UI
  const availableColors = useMemo(() => {
    const colorMap = new Map<string, { id: string; name: string; code: string }>();
    products.forEach((p) => {
      p.colors?.forEach((c) => {
        if (c.color && !colorMap.has(c.color.id)) {
          colorMap.set(c.color.id, {
            id: c.color.id,
            name: c.color.name,
            code: c.color.colorCode,
          });
        }
      });
    });
    return Array.from(colorMap.values());
  }, [products]);

  const availableSizes = useMemo(() => {
    const sizeMap = new Map<string, { id: string; name: string }>();
    products.forEach((p) => {
      p.sizes?.forEach((s) => {
        if (s.size && !sizeMap.has(s.size.id)) {
          sizeMap.set(s.size.id, { id: s.size.id, name: s.size.name });
        }
      });
    });
    return Array.from(sizeMap.values());
  }, [products]);

  // Filtering & Sorting Logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Category Filter
      if (categoryIdParam && p.categoryId !== categoryIdParam) {
        return false;
      }

      // 2. Subcategory Filter
      if (selectedSubcategoryId && p.subcategoryId !== selectedSubcategoryId) {
        return false;
      }

      // 3. Search Query Filter
      if (searchQueryParam) {
        const query = searchQueryParam.toLowerCase();
        const matchName = p.name.toLowerCase().includes(query);
        const matchBrand = p.brand?.name?.toLowerCase().includes(query);
        const matchCategory = p.category?.name?.toLowerCase().includes(query);
        if (!matchName && !matchBrand && !matchCategory) return false;
      }

      // 4. Price Filter
      const price = Number(p.newPrice);
      if (price < priceRange.min || price > priceRange.max) {
        return false;
      }

      // 5. In-Stock Filter
      if (inStockOnly) {
        const totalStock = p.inventories?.reduce((acc, i) => acc + (i.currentStock || 0), 0) || 0;
        if (totalStock === 0) return false;
      }

      // 6. Colors Filter
      if (selectedColors.length > 0) {
        const hasColor = p.colors?.some((pc) => selectedColors.includes(pc.colorId));
        if (!hasColor) return false;
      }

      // 7. Sizes Filter
      if (selectedSizes.length > 0) {
        const hasSize = p.sizes?.some((ps) => selectedSizes.includes(ps.sizeId));
        if (!hasSize) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") {
        return Number(a.newPrice) - Number(b.newPrice);
      }
      if (sortBy === "price-desc") {
        return Number(b.newPrice) - Number(a.newPrice);
      }
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "newest") {
        if (a.showAsNewArrival && !b.showAsNewArrival) return -1;
        if (!a.showAsNewArrival && b.showAsNewArrival) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [
    products,
    categoryIdParam,
    selectedSubcategoryId,
    searchQueryParam,
    priceRange,
    inStockOnly,
    selectedColors,
    selectedSizes,
    sortBy,
  ]);

  const handleSubcategorySelect = (subId: string | null) => {
    setSelectedSubcategoryId(subId);
    const params = new URLSearchParams(searchParams.toString());
    if (subId) {
      params.set("subcategoryId", subId);
    } else {
      params.delete("subcategoryId");
    }
    router.push(`/products?${params.toString()}`);
  };

  const handleColorToggle = (colorId: string) => {
    setSelectedColors((prev) =>
      prev.includes(colorId) ? prev.filter((id) => id !== colorId) : [...prev, colorId]
    );
  };

  const handleSizeToggle = (sizeId: string) => {
    setSelectedSizes((prev) =>
      prev.includes(sizeId) ? prev.filter((id) => id !== sizeId) : [...prev, sizeId]
    );
  };

  const resetAllFilters = () => {
    setSelectedSubcategoryId(null);
    setSelectedColors([]);
    setSelectedSizes([]);
    setInStockOnly(false);
    setPriceRange({ min: 0, max: maxPriceLimit });
    setSortBy("newest");
    router.push("/products");
  };

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar />

      {/* Category Banner Header */}
      <div className="bg-gradient-to-r from-primary to-[#001777] text-primary-content py-6 sm:py-10 px-4 sm:px-6 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="space-y-1.5 sm:space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-[11px] sm:text-xs font-semibold text-white/80 uppercase tracking-widest">
              <Layers size={14} /> E-Commerce Collection
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              {activeCategory ? activeCategory.name : searchQueryParam ? `Search: "${searchQueryParam}"` : "All Products"}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-xl">
              {activeCategory
                ? `Explore our high quality ${activeCategory.name} collection tailored for modern comfort and style.`
                : "Browse our entire apparel line up. Filter by subcategory, price, colors, and sizes."}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl border border-white/20 text-center shrink-0">
            <span className="block text-xl sm:text-2xl font-bold text-white">
              {filteredProducts.length}
            </span>
            <span className="text-[10px] sm:text-xs text-white/80 uppercase font-medium tracking-wider">
              Items Available
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 flex-1">
        {/* Quick Subcategory Pills Header (if active category has subcategories) */}
        {activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 && (
          <div className="mb-6 overflow-x-auto pb-2 flex items-center gap-2 no-scrollbar">
            <button
              onClick={() => handleSubcategorySelect(null)}
              className={`btn btn-sm rounded-full px-5 text-xs font-semibold shrink-0 transition-all ${
                !selectedSubcategoryId ? "btn-primary shadow-md" : "btn-outline text-base-content/80"
              }`}
            >
              All {activeCategory.name}
            </button>
            {activeCategory.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubcategorySelect(sub.id)}
                className={`btn btn-sm rounded-full px-5 text-xs font-semibold shrink-0 transition-all ${
                  selectedSubcategoryId === sub.id ? "btn-primary shadow-md" : "btn-outline text-base-content/80"
                }`}
              >
                {sub.name}
              </button>
            ))}
          </div>
        )}

        {/* Action Controls Header: Mobile Filter Button & Sorting Dropdown */}
        <div className="flex items-center justify-between gap-4 mb-6 bg-base-200/50 p-3 rounded-xl border border-base-200">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="btn btn-sm btn-outline gap-2 lg:hidden rounded-lg text-xs"
          >
            <Filter size={16} /> Filters
            {(selectedColors.length > 0 || selectedSizes.length > 0 || inStockOnly || selectedSubcategoryId) && (
              <span className="badge badge-primary badge-xs">Active</span>
            )}
          </button>

          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-base-content/70">
            <SlidersHorizontal size={14} /> Showing {filteredProducts.length} results
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-xs text-base-content/70 font-medium hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="select select-sm select-bordered rounded-lg text-xs font-medium focus:outline-none focus:border-primary"
            >
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Sidebar + Product Grid Layout */}
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6">
            <div className="bg-base-100 p-5 rounded-2xl border border-base-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-base-200">
                <h3 className="font-bold text-base flex items-center gap-2 text-base-content">
                  <Filter size={18} className="text-primary" /> Filter Products
                </h3>
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              </div>

              {/* Subcategories Sidebar Filter */}
              {activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-base-content/70 uppercase tracking-wider">
                    Subcategories
                  </h4>
                  <div className="space-y-1 text-sm">
                    <button
                      onClick={() => handleSubcategorySelect(null)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        !selectedSubcategoryId ? "bg-primary/10 text-primary font-bold" : "text-base-content/80 hover:bg-base-200"
                      }`}
                    >
                      All Subcategories
                    </button>
                    {activeCategory.subcategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubcategorySelect(sub.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          selectedSubcategoryId === sub.id
                            ? "bg-primary/10 text-primary font-bold"
                            : "text-base-content/80 hover:bg-base-200"
                        }`}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range Filter */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-base-content/70 uppercase tracking-wider">
                  Max Price Range
                </h4>
                <input
                  type="range"
                  min="0"
                  max={maxPriceLimit}
                  step="50"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                  }
                  className="range range-xs range-primary"
                />
                <div className="flex items-center justify-between text-xs text-base-content/80 font-semibold">
                  <span>৳ 0</span>
                  <span className="text-primary font-bold">৳ {priceRange.max.toLocaleString()}</span>
                </div>
              </div>

              {/* In Stock Toggle */}
              <div className="form-control pt-2 border-t border-base-200">
                <label className="label cursor-pointer justify-start gap-3 py-1">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="checkbox checkbox-xs checkbox-primary rounded"
                  />
                  <span className="label-text text-xs font-medium text-base-content">
                    In Stock Only
                  </span>
                </label>
              </div>

              {/* Color Filter Swatches */}
              {availableColors.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-base-200">
                  <h4 className="text-xs font-bold text-base-content/70 uppercase tracking-wider">
                    Colors
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {availableColors.map((color) => {
                      const isSelected = selectedColors.includes(color.id);
                      return (
                        <button
                          key={color.id}
                          onClick={() => handleColorToggle(color.id)}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? "ring-2 ring-primary ring-offset-1 scale-110" : "border-black/20"
                          }`}
                          style={{ backgroundColor: color.code }}
                          title={color.name}
                        >
                          {isSelected && <Check size={12} className="text-white drop-shadow-md" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Filter Buttons */}
              {availableSizes.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-base-200">
                  <h4 className="text-xs font-bold text-base-content/70 uppercase tracking-wider">
                    Sizes
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {availableSizes.map((size) => {
                      const isSelected = selectedSizes.includes(size.id);
                      return (
                        <button
                          key={size.id}
                          onClick={() => handleSizeToggle(size.id)}
                          className={`btn btn-xs rounded-lg text-xs font-semibold ${
                            isSelected ? "btn-primary" : "btn-outline border-base-300"
                          }`}
                        >
                          {size.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            {loading ? (
              /* Skeleton Loader Grid */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="flex flex-col gap-3 sm:gap-4 bg-base-100 p-3 sm:p-4 rounded-2xl border border-base-200 shadow-xs">
                    <div className="skeleton w-full aspect-[4/5] rounded-xl" />
                    <div className="skeleton h-3 sm:h-4 w-20 sm:w-28 rounded" />
                    <div className="skeleton h-4 sm:h-5 w-full rounded" />
                    <div className="flex justify-between items-center pt-2">
                      <div className="skeleton h-5 sm:h-6 w-14 sm:w-20 rounded" />
                      <div className="skeleton h-7 sm:h-8 w-16 sm:w-24 rounded-xl" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              /* Empty State */
              <div className="bg-base-200/40 border border-dashed border-base-300 rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-base-200 flex items-center justify-center text-base-content/50">
                  <Filter size={28} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-base-content">No products match your criteria</h3>
                <p className="text-xs sm:text-sm text-base-content/60 max-w-md">
                  Try adjusting your filter preferences, changing your price range, or searching for another term.
                </p>
                <button onClick={resetAllFilters} className="btn btn-primary rounded-full px-6 btn-sm">
                  Clear All Filters
                </button>
              </div>
            ) : (
              /* Product Cards Grid */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filters Slide-over Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-xs lg:hidden">
          <div className="w-full max-w-xs bg-base-100 h-full shadow-2xl flex flex-col p-5 overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-base-200">
              <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                <Filter size={18} className="text-primary" /> Filters
              </h3>
              <button onClick={() => setMobileFilterOpen(false)} className="btn btn-ghost btn-sm btn-circle">
                <X size={18} />
              </button>
            </div>

            {/* Subcategories in Mobile Filter */}
            {activeCategory && activeCategory.subcategories && activeCategory.subcategories.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-base-content/70 uppercase">Subcategories</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => handleSubcategorySelect(null)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      !selectedSubcategoryId ? "bg-primary text-white font-bold" : "bg-base-200 hover:bg-base-300"
                    }`}
                  >
                    All {activeCategory.name}
                  </button>
                  {activeCategory.subcategories.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => handleSubcategorySelect(sub.id)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        selectedSubcategoryId === sub.id ? "bg-primary text-white font-bold" : "bg-base-200 hover:bg-base-300"
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price Filter Mobile */}
            <div className="space-y-3 pt-2 border-t border-base-200">
              <h4 className="text-xs font-bold text-base-content/70 uppercase">Max Price</h4>
              <input
                type="range"
                min="0"
                max={maxPriceLimit}
                step="50"
                value={priceRange.max}
                onChange={(e) => setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))}
                className="range range-xs range-primary"
              />
              <div className="flex justify-between text-xs font-semibold">
                <span>৳ 0</span>
                <span className="text-primary font-bold">৳ {priceRange.max.toLocaleString()}</span>
              </div>
            </div>

            {/* In-Stock Only Mobile */}
            <div className="form-control pt-2 border-t border-base-200">
              <label className="label cursor-pointer justify-start gap-3 py-1">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="checkbox checkbox-xs checkbox-primary rounded"
                />
                <span className="label-text text-xs font-medium text-base-content">
                  In Stock Only
                </span>
              </label>
            </div>

            {/* Colors Mobile */}
            {availableColors.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-base-200">
                <h4 className="text-xs font-bold text-base-content/70 uppercase">Colors</h4>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color) => {
                    const isSelected = selectedColors.includes(color.id);
                    return (
                      <button
                        key={color.id}
                        onClick={() => handleColorToggle(color.id)}
                        className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                          isSelected ? "ring-2 ring-primary ring-offset-1" : "border-black/20"
                        }`}
                        style={{ backgroundColor: color.code }}
                      >
                        {isSelected && <Check size={12} className="text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes Mobile */}
            {availableSizes.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-base-200">
                <h4 className="text-xs font-bold text-base-content/70 uppercase">Sizes</h4>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const isSelected = selectedSizes.includes(size.id);
                    return (
                      <button
                        key={size.id}
                        onClick={() => handleSizeToggle(size.id)}
                        className={`btn btn-xs rounded-lg ${isSelected ? "btn-primary" : "btn-outline"}`}
                      >
                        {size.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-base-200 flex flex-col gap-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="btn btn-primary w-full rounded-xl btn-sm"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                onClick={resetAllFilters}
                className="btn btn-ghost btn-xs text-xs"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
