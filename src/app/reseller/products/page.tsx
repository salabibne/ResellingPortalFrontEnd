"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Check,
  Package,
  ArrowRight,
  LayoutGrid,
  Clock,
} from "lucide-react";
import PanelPage from "@/components/panel/PanelPage";
import PanelPageHeader from "@/components/panel/PanelPageHeader";
import PanelEmpty from "@/components/panel/PanelEmpty";
import PanelSkeleton from "@/components/panel/PanelSkeleton";
import CategoryDrawer from "@/components/shared/CategoryDrawer";
import { productApi, Product } from "@/services/product.api";
import { useResellerCartStore } from "@/store/useResellerCartStore";
import { useCanOrder } from "@/store/useResellerProfileStore";

export default function ResellerProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [categoryDrawerOpen, setCategoryDrawerOpen] = useState<boolean>(false);
  const [categoryDrawerShown, setCategoryDrawerShown] = useState<boolean>(false);

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

  // Category-first catalog: open the category drawer once products load.
  useEffect(() => {
    if (loading || categoryDrawerShown) return;
    setCategoryDrawerShown(true);
    if (selectedCategory === "ALL" && products.length > 0) setCategoryDrawerOpen(true);
  }, [loading, categoryDrawerShown, selectedCategory, products.length]);

  // Extract unique categories
  const categories = Array.from(
    new Set(
      products
        .map((p) => p.category?.name)
        .filter((name): name is string => Boolean(name))
    )
  );

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== "ALL" && p.category?.name !== selectedCategory) {
      return false;
    }
    return true;
  });

  const { canOrder, pending, verification, loaded: profileLoaded } = useCanOrder();

  const handleAddToCart = (product: Product) => {
    // Pending (not yet approved) resellers may browse but not add to cart.
    if (pending) return;
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
    <PanelPage className="pb-24">
      <PanelPageHeader
        title="উদ্যোক্তা প্রোডাক্ট"
        subtitle="খুচরা দামের সাথে উদ্যোক্তা পাইকারি দাম মিলিয়ে দেখুন এবং প্রোডাক্ট কার্টে যোগ করুন।"
        icon={Package}
        actions={
          <Link
            href="/reseller/cart"
            className="btn btn-primary btn-sm rounded-xl gap-2"
          >
            <ShoppingCart size={16} />
            <span>আমার কার্ট ({totalCartCount})</span>
          </Link>
        }
      />

      {profileLoaded && !canOrder && !verification?.isVerified && (
        <Link
          href="/reseller/profile"
          className="flex items-center justify-between gap-2 rounded-2xl bg-amber-50 px-4 py-2.5 text-xs font-semibold text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100"
        >
          <span>⚠️ অর্ডার করতে প্রোফাইল ভেরিফাই করুন — কার্টে পণ্য যোগ করা যাবে, কিন্তু ভেরিফাই ছাড়া অর্ডার কনফার্ম হবে না।</span>
          <span className="shrink-0 rounded-full bg-rose-600 px-2.5 py-1 text-[11px] font-bold text-white">ভেরিফাই করুন</span>
        </Link>
      )}

      {/* Search & Category Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-80">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
            size={18}
          />
          <input
            type="text"
            placeholder="প্রোডাক্ট খুঁজুন..."
            className="input input-bordered input-sm rounded-xl pl-10 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={() => setCategoryDrawerOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={categoryDrawerOpen}
          className="btn btn-outline btn-sm rounded-xl gap-2 w-full sm:w-auto max-w-full"
        >
          <LayoutGrid size={16} className="shrink-0" />
          <span className="truncate">
            {selectedCategory === "ALL" ? "সব ক্যাটাগরি" : selectedCategory}
          </span>
        </button>
      </div>

      <CategoryDrawer
        open={categoryDrawerOpen}
        onClose={() => setCategoryDrawerOpen(false)}
        categories={categories.map((name) => ({ id: name, name }))}
        activeId={selectedCategory === "ALL" ? null : selectedCategory}
        onSelect={(name) => {
          setSelectedCategory(name);
          setCategoryDrawerOpen(false);
        }}
        loading={loading}
        title="ক্যাটাগরি"
        emptyText="এখনো কোনো ক্যাটাগরি নেই"
        closeLabel="ক্যাটাগরি বন্ধ করুন"
      />

      {/* Product Grid */}
      {loading ? (
        <PanelSkeleton variant="cards" rows={8} />
      ) : filteredProducts.length === 0 ? (
        <PanelEmpty
          icon={Package}
          title="কোনো প্রোডাক্ট পাওয়া যায়নি"
          text="অন্য কিছু লিখে খুঁজুন অথবা ফিল্টার রিসেট করুন।"
        />
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
                className="bg-base-100 border border-base-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden"
              >
                <div>
                  {/* Product Image & Badges */}
                  <div className="relative aspect-square w-full overflow-hidden bg-base-200">
                    <img
                      src={primaryImg}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {discountPct > 0 && (
                      <span className="absolute top-2 left-2 bg-error text-white text-[10px] font-extrabold px-2 py-1 rounded-md shadow-sm">
                        উদ্যোক্তা ছাড় {discountPct}%
                      </span>
                    )}
                    <span className="absolute bottom-2 right-2 bg-base-100/90 backdrop-blur-md text-base-content text-[11px] font-semibold px-2.5 py-1 rounded-md border border-base-200">
                      {product.category?.name || "সাধারণ"}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-base line-clamp-1 text-base-content">
                        {product.name}
                      </h3>
                      <p className="text-xs text-base-content/60 line-clamp-2 mt-0.5">
                        {product.description || "উন্নত মানের প্রোডাক্ট"}
                      </p>
                    </div>

                    {/* Pricing Comparison */}
                    <div className="p-3 bg-base-200/60 rounded-xl border border-base-300/40 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-base-content/60 font-medium">
                          খুচরা বাজার মূল্য:
                        </span>
                        <span className="line-through text-base-content/50 font-semibold">
                          ৳{retailPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary">
                          উদ্যোক্তা পাইকারি মূল্য:
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
                            সাইজ:
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
                            কালার:
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
                <div className="p-4 pt-0 space-y-2 mt-auto">
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
                      className={`btn btn-sm rounded-xl gap-2 flex-1 ${
                        addedSuccessId === product.id
                          ? "btn-success text-white"
                          : "btn-primary"
                      }`}
                      onClick={() => handleAddToCart(product)}
                      disabled={pending}
                      title={pending ? "অ্যাকাউন্ট অনুমোদনের পর অর্ডার করতে পারবেন" : undefined}
                    >
                      {pending ? (
                        <>
                          <Clock size={16} /> অনুমোদনের অপেক্ষায়
                        </>
                      ) : addedSuccessId === product.id ? (
                        <>
                          <Check size={16} /> যোগ হয়েছে!
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={16} /> অর্ডারে যোগ করুন
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
      {totalCartCount > 0 && !pending && (
        <div className="fixed bottom-28 lg:bottom-4 left-1/2 -translate-x-1/2 z-40 bg-base-100 border border-primary/30 shadow-2xl rounded-2xl p-4 flex items-center justify-between gap-6 max-w-lg w-[92vw]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-primary-content flex items-center justify-center font-bold">
              {totalCartCount}
            </div>
            <div>
              <p className="text-xs text-base-content/60 font-medium">
                {totalCartCount}টি আইটেম নির্বাচিত
              </p>
              <p className="text-sm font-extrabold text-base-content">
                পাইকারি মোট: ৳{totalWholesaleCost.toLocaleString()}
              </p>
            </div>
          </div>
          <Link
            href="/reseller/cart"
            className="btn btn-primary btn-sm rounded-xl gap-2"
          >
            চেকআউট করুন <ArrowRight size={16} />
          </Link>
        </div>
      )}

      <div className="h-16" aria-hidden="true" />
    </PanelPage>
  );
}
