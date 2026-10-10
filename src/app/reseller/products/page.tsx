"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Check,
  Package,
  ArrowRight,
  Sparkles,
  Tag,
  Layers,
  Filter,
} from "lucide-react";
import { productApi, Product } from "@/services/product.api";
import { useResellerCartStore } from "@/store/useResellerCartStore";

export default function ResellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // Selected variant state per product (productId -> { sizeId, colorId, qty })
  const [productSelections, setProductSelections] = useState<
    Record<
      string,
      {
        sizeId?: string;
        sizeName?: string;
        colorId?: string;
        colorName?: string;
        quantity: number;
        sellingPrice?: number;
      }
    >
  >({});

  const [addedSuccessId, setAddedSuccessId] = useState<string | null>(null);

  const addItem = useResellerCartStore((state) => state.addItem);
  const cartItems = useResellerCartStore((state) => state.items);
  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalWholesaleCost = cartItems.reduce(
    (acc, i) => acc + i.resellerPrice * i.quantity,
    0
  );

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productApi.getAll();
      const activeProducts = (res || []).filter(
        (p: Product) => p.status === "ACTIVE"
      );
      setProducts(activeProducts);

      // Initialize default selection state
      const initialMap: Record<string, any> = {};
      activeProducts.forEach((p: Product) => {
        const defaultSize = p.sizes?.[0];
        const defaultColor = p.colors?.[0];
        initialMap[p.id] = {
          sizeId: defaultSize?.id || undefined,
          sizeName: defaultSize?.size?.name || undefined,
          colorId: defaultColor?.id || undefined,
          colorName: defaultColor?.color?.name || undefined,
          quantity: 1,
          sellingPrice: Number(p.newPrice || p.resellerPrice),
        };
      });
      setProductSelections((prev) => ({ ...initialMap, ...prev }));
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Extract unique categories
  const categories = Array.from(
    new Set(products.map((p) => p.category?.name).filter(Boolean))
  );

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "ALL" && p.category?.name !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleAddToCart = (product: Product) => {
    const sel = productSelections[product.id] || { quantity: 1 };
    const primaryImg =
      product.images?.find((img) => img.isPrimary)?.imageUrl ||
      product.images?.[0]?.imageUrl;

    const wholesaleCost = Number(product.resellerPrice || product.newPrice);
    const retailPrice = Number(product.newPrice);
    const purchasePrice = Number(product.purchasePrice || 0);

    addItem({
      productId: product.id,
      productName: product.name,
      imageUrl: primaryImg,
      productSizeId: sel.sizeId || null,
      sizeName: sel.sizeName,
      productColorId: sel.colorId || null,
      colorName: sel.colorName,
      purchasePrice: purchasePrice,
      resellerPrice: wholesaleCost,
      retailPrice: retailPrice,
      resellerSellingPrice: sel.sellingPrice || wholesaleCost,
      quantity: sel.quantity || 1,
      stock: 99,
    });

    setAddedSuccessId(product.id);
    setTimeout(() => setAddedSuccessId(null), 1800);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-100 p-6 rounded-2xl border border-base-200 shadow-sm">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">
            <Tag size={14} /> Wholesale Reseller Catalog
          </span>
          <h1 className="text-2xl font-extrabold text-base-content">
            Reseller Products Section
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            Compare retail market prices with wholesale reseller costs (`resellerPrice`) and add items to your reseller cart.
          </p>
        </div>

        <Link
          href="/reseller/cart"
          className="btn btn-primary flex items-center gap-2 shadow-md"
        >
          <ShoppingCart size={18} />
          <span>Reseller Cart ({totalCartCount})</span>
        </Link>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-100 p-4 rounded-xl border border-base-200">
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products..."
            className="input input-bordered pl-10 w-full input-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          <Filter size={16} className="text-base-content/40" />
          <button
            className={`btn btn-xs ${
              selectedCategory === "ALL" ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setSelectedCategory("ALL")}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`btn btn-xs ${
                selectedCategory === cat ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setSelectedCategory(cat!)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-base-100 rounded-xl border border-base-200">
          <Package className="mx-auto text-base-content/30 mb-3" size={48} />
          <h3 className="font-bold text-lg">No products found</h3>
          <p className="text-sm text-base-content/60">
            Try searching for something else or reset your filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const primaryImg =
              product.images?.find((i) => i.isPrimary)?.imageUrl ||
              product.images?.[0]?.imageUrl ||
              "https://via.placeholder.com/300";

            const retailPrice = Number(product.newPrice);
            const resellerPrice = Number(
              product.resellerPrice || product.newPrice
            );
            const discountPct =
              retailPrice > resellerPrice
                ? Math.round(
                    ((retailPrice - resellerPrice) / retailPrice) * 100
                  )
                : 0;

            const selection = productSelections[product.id] || { quantity: 1 };

            return (
              <div
                key={product.id}
                className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Product Image & Badges */}
                  <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-base-200">
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discountPct > 0 && (
                      <span className="absolute top-2 left-2 bg-error text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-sm">
                        Reseller Discount {discountPct}% OFF
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 bg-base-100/90 backdrop-blur-md text-base-content text-[11px] font-semibold px-2.5 py-1 rounded-md border border-base-200">
                      {product.category?.name || "General"}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-base line-clamp-1 text-base-content">
                        {product.name}
                      </h3>
                      <p className="text-xs text-base-content/60 line-clamp-2 mt-0.5">
                        {product.description || "High quality product"}
                      </p>
                    </div>

                    {/* Pricing Comparison */}
                    <div className="p-3 bg-base-200/60 rounded-xl border border-base-300/40 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-base-content/60 font-medium">
                          Retail Market Price:
                        </span>
                        <span className="line-through text-base-content/50 font-semibold">
                          ৳{retailPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">
                          Reseller Wholesale Rate:
                        </span>
                        <span className="text-lg font-black text-primary">
                          ৳{resellerPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Variants Selection */}
                    <div className="space-y-2">
                      {/* Sizes */}
                      {product.sizes && product.sizes.length > 0 && (
                        <div>
                          <label className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block mb-1">
                            Size:
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {product.sizes.map((s) => (
                              <button
                                key={s.id}
                                className={`btn btn-xs ${
                                  selection.sizeId === s.id
                                    ? "btn-primary"
                                    : "btn-outline border-base-300"
                                }`}
                                onClick={() =>
                                  setProductSelections((prev) => ({
                                    ...prev,
                                    [product.id]: {
                                      ...prev[product.id],
                                      sizeId: s.id,
                                      sizeName: s.size.name,
                                    },
                                  }))
                                }
                              >
                                {s.size.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Colors */}
                      {product.colors && product.colors.length > 0 && (
                        <div>
                          <label className="text-[11px] font-semibold text-base-content/60 uppercase tracking-wider block mb-1">
                            Color:
                          </label>
                          <div className="flex flex-wrap gap-1">
                            {product.colors.map((c) => (
                              <button
                                key={c.id}
                                className={`btn btn-xs gap-1 ${
                                  selection.colorId === c.id
                                    ? "btn-primary"
                                    : "btn-outline border-base-300"
                                }`}
                                onClick={() =>
                                  setProductSelections((prev) => ({
                                    ...prev,
                                    [product.id]: {
                                      ...prev[product.id],
                                      colorId: c.id,
                                      colorName: c.color.name,
                                    },
                                  }))
                                }
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full inline-block border border-white/50"
                                  style={{ backgroundColor: c.color.colorCode }}
                                />
                                {c.color.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 pt-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="join border border-base-300 rounded-lg">
                      <button
                        className="join-item btn btn-xs btn-ghost"
                        onClick={() =>
                          setProductSelections((prev) => ({
                            ...prev,
                            [product.id]: {
                              ...prev[product.id],
                              quantity: Math.max(1, (selection.quantity || 1) - 1),
                            },
                          }))
                        }
                      >
                        -
                      </button>
                      <span className="join-item px-3 py-0.5 text-xs font-bold flex items-center">
                        {selection.quantity || 1}
                      </span>
                      <button
                        className="join-item btn btn-xs btn-ghost"
                        onClick={() =>
                          setProductSelections((prev) => ({
                            ...prev,
                            [product.id]: {
                              ...prev[product.id],
                              quantity: (selection.quantity || 1) + 1,
                            },
                          }))
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className={`btn btn-sm flex-1 ${
                        addedSuccessId === product.id
                          ? "btn-success text-white"
                          : "btn-primary"
                      }`}
                      onClick={() => handleAddToCart(product)}
                    >
                      {addedSuccessId === product.id ? (
                        <>
                          <Check size={16} /> Added!
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={16} /> Add to Order
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Bottom Drawer Link if Items in Cart */}
      {totalCartCount > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-base-100 border border-primary/30 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-6 max-w-lg w-[92vw]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold">
              {totalCartCount}
            </div>
            <div>
              <p className="text-xs text-base-content/60 font-medium">
                {totalCartCount} item(s) selected
              </p>
              <p className="text-sm font-extrabold text-base-content">
                Wholesale Total: ৳{totalWholesaleCost.toLocaleString()}
              </p>
            </div>
          </div>
          <Link
            href="/reseller/cart"
            className="btn btn-primary btn-sm px-5 flex items-center gap-2 shadow-md"
          >
            Checkout Order <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
