"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Zap,
  Check,
  ChevronRight,
  Minus,
  Plus,
  ArrowLeft,
  Share2,
  Heart,
  Video,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Star,
  CheckCircle2,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/shared/Footer";
import { productApi, Product } from "@/services/product.api";
import productPageConfigsApi, { ProductPageConfig } from "@/services/productPageConfigs.api";
import { useCartStore } from "@/store/useCartStore";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [pageConfig, setPageConfig] = useState<ProductPageConfig | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "shipping" | "video">("description");

  // Selection states
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedAgeId, setSelectedAgeId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { addToCart, loading: cartLoading } = useCartStore();

  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    Promise.allSettled([
      productApi.getOne(productId),
      productPageConfigsApi.getByProductId(productId),
      productApi.getAll(),
    ])
      .then(([prodRes, configRes, allProdsRes]) => {
        if (prodRes.status === "fulfilled") {
          const data = prodRes.value;
          setProduct(data);

          if (data.colors && data.colors.length > 0) {
            setSelectedColorId(data.colors[0].id);
          }
          if (data.sizes && data.sizes.length > 0) {
            const inStockSize = data.sizes.find((s) => {
              const stock = getStockForSize(data, s.id);
              return stock > 0;
            });
            setSelectedSizeId(inStockSize ? inStockSize.id : data.sizes[0].id);
          }
          if (data.ages && data.ages.length > 0) {
            setSelectedAgeId(data.ages[0].id);
          }
        } else {
          setError("Product not found or failed to load details.");
        }

        if (configRes.status === "fulfilled") {
          setPageConfig(configRes.value);
        }

        if (allProdsRes.status === "fulfilled") {
          setRelatedProducts(allProdsRes.value.filter((p: any) => p.id !== productId).slice(0, 4));
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load product details:", err);
        setError("Product not found.");
        setLoading(false);
      });
  }, [productId]);

  useEffect(() => {
    if (pageConfig || product) {
      const title = pageConfig?.metaTitle || pageConfig?.customTitle || product?.name;
      if (title) {
        document.title = `${title} - Aarham Apparel`;
      }
    }
  }, [pageConfig, product]);

  // Helper for YouTube embed
  const youtubeEmbedUrl = useMemo(() => {
    const url = pageConfig?.videoUrl || product?.videoUrl;
    if (!url) return null;
    if (url.includes("embed/")) return url;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
    );
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url;
  }, [product?.videoUrl, pageConfig?.videoUrl]);

  // Calculate stock for a given size relation id
  function getStockForSize(prod: Product, sizeRelationId?: string | null): number {
    if (!prod.inventories || prod.inventories.length === 0) return 0;
    if (!sizeRelationId) {
      return prod.inventories.reduce((acc, inv) => acc + (inv.currentStock || 0), 0);
    }
    const invRecord = prod.inventories.find(
      (inv) => inv.productSizeId === sizeRelationId || inv.productSize?.id === sizeRelationId
    );
    return invRecord ? invRecord.currentStock : 0;
  }

  // Stock for current size selection
  const maxStockAvailable = useMemo(() => {
    if (!product) return 0;
    if (product.sizes && product.sizes.length > 0 && selectedSizeId) {
      return getStockForSize(product, selectedSizeId);
    }
    return product.inventories?.reduce((acc, inv) => acc + (inv.currentStock || 0), 0) || 0;
  }, [product, selectedSizeId]);

  const isOutOfStock = maxStockAvailable === 0;

  // Handle Add to Cart
  const handleAddToCart = async () => {
    if (!product || isOutOfStock) return;
    const success = await addToCart({
      productId: product.id,
      productSizeId: selectedSizeId || undefined,
      productColorId: selectedColorId || undefined,
      quantity,
    });
    return success;
  };

  // Handle Buy Now
  const handleBuyNow = async () => {
    const success = await handleAddToCart();
    if (success) {
      router.push("/checkout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-base-100">
        <Navbar />
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 py-12 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="skeleton w-full aspect-square rounded-3xl" />
              <div className="flex gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton w-20 h-20 rounded-xl" />
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <div className="skeleton h-6 w-36 rounded" />
              <div className="skeleton h-10 w-3/4 rounded" />
              <div className="skeleton h-8 w-48 rounded" />
              <div className="skeleton h-24 w-full rounded-2xl" />
              <div className="skeleton h-12 w-full rounded-xl" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex flex-col bg-base-100">
        <Navbar />
        <div className="max-w-xl mx-auto my-auto px-4 py-20 text-center space-y-4">
          <div className="text-error font-bold text-lg">{error || "Product not found"}</div>
          <Link href="/products" className="btn btn-primary rounded-full px-8 gap-2">
            <ArrowLeft size={16} /> Back to Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const oldPrice = Number(product.oldPrice);
  const newPrice = Number(product.newPrice);
  const hasDiscount = oldPrice > newPrice;
  const savingsAmount = hasDiscount ? oldPrice - newPrice : 0;
  const discountPercent = hasDiscount ? Math.round((savingsAmount / oldPrice) * 100) : 0;

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: "fallback", productId: product.id, imageUrl: "/placeholder.png", isPrimary: true }];

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Navbar />

      {/* Category Breadcrumbs Header */}
      <div className="bg-base-200/60 border-b border-base-200 py-3 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-medium text-base-content/70 overflow-x-auto">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight size={14} className="text-base-content/40 shrink-0" />
          <Link href="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          {product.category && (
            <>
              <ChevronRight size={14} className="text-base-content/40 shrink-0" />
              <Link
                href={`/products?categoryId=${product.categoryId}`}
                className="hover:text-primary transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          {product.subcategory && (
            <>
              <ChevronRight size={14} className="text-base-content/40 shrink-0" />
              <Link
                href={`/products?categoryId=${product.categoryId}&subcategoryId=${product.subcategoryId}`}
                className="hover:text-primary transition-colors"
              >
                {product.subcategory.name}
              </Link>
            </>
          )}
          {product.childCategory && (
            <>
              <ChevronRight size={14} className="text-base-content/40 shrink-0" />
              <span className="text-base-content/50">{product.childCategory.name}</span>
            </>
          )}
          <ChevronRight size={14} className="text-base-content/40 shrink-0" />
          <span className="font-semibold text-base-content truncate max-w-[200px]">
            {product.name}
          </span>
        </div>
      </div>

      {/* Main Detail Section */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 py-8 flex-1">
        {/* Landing Page Hero Banner */}
        {pageConfig?.isLandingPage && pageConfig?.bannerImageUrl && (
          <div className="relative w-full h-[350px] md:h-[480px] rounded-3xl overflow-hidden mb-12 shadow-xl border border-base-200">
            <img
              src={pageConfig.bannerImageUrl}
              alt={pageConfig.customTitle || product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-12 text-white">
              <span className="text-primary font-bold text-xs uppercase tracking-widest bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full w-max mb-3">
                Reseller Exclusive Special
              </span>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                {pageConfig.customTitle || product.name}
              </h1>
              {pageConfig.customDescription && (
                <p className="text-sm md:text-base text-gray-200 mt-2 max-w-2xl line-clamp-2 md:line-clamp-none">
                  {pageConfig.customDescription}
                </p>
              )}
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    document.getElementById("purchase-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="btn bg-blue-600 hover:bg-blue-700 text-white px-8 rounded-xl shadow-lg border-none animate-bounce"
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        )}

        <div id="purchase-section" className="grid grid-cols-1 lg:grid-cols-12 gap-10 scroll-mt-24">
          {/* Left Column: Image Gallery & Video Player */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Preview Container */}
            <div className="relative w-full aspect-[4/5] sm:aspect-square bg-base-200 rounded-3xl overflow-hidden border border-base-200 shadow-sm group">
              <img
                src={images[activeImageIndex]?.imageUrl || "/placeholder.png"}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />

              {/* Badges Overlay */}
              <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                {product.showAsNewArrival && (
                  <span className="badge badge-primary gap-1 font-bold text-xs py-2.5 px-3 shadow-lg">
                    <Sparkles size={14} /> New Arrival
                  </span>
                )}
                {hasDiscount && (
                  <span className="badge badge-secondary font-extrabold text-xs py-2.5 px-3 shadow-lg">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>

              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20">
                  <span className="bg-error text-white font-bold text-sm uppercase tracking-widest px-6 py-2 rounded-full shadow-2xl">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 pt-1 no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIndex === idx
                        ? "border-primary ring-2 ring-primary/30 scale-105"
                        : "border-base-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img.imageUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* YouTube Video Player Embed Section */}
            {youtubeEmbedUrl && (
              <div className="pt-6 border-t border-base-200 space-y-3">
                <h3 className="text-sm font-bold text-base-content flex items-center gap-2">
                  <Video size={18} className="text-error" /> Product Video Showcase
                </h3>
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg border border-base-200 bg-black">
                  <iframe
                    src={youtubeEmbedUrl}
                    title={`${product.name} Video`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Product Details & Variant Selectors */}
          <div className="lg:col-span-5 space-y-6">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between gap-2 text-xs text-base-content/60 mb-2">
                <span className="badge badge-outline text-primary font-bold uppercase tracking-wider text-[11px] px-3 py-2">
                  {product.brand?.name || "Aarham Apparel"}
                </span>
                {product.unit && (
                  <span className="font-semibold capitalize text-base-content/70">
                    Unit: {product.unit}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight leading-tight">
                {pageConfig?.customTitle || product.name}
              </h1>

              {/* Price Breakdown */}
              <div className="mt-4 p-4 bg-base-200/50 rounded-2xl border border-base-200 flex flex-wrap items-baseline justify-between gap-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-primary">
                    ৳ {newPrice.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-base text-base-content/50 line-through font-semibold">
                      ৳ {oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {hasDiscount && (
                  <span className="badge badge-success text-white font-bold text-xs py-2 px-3">
                    Save ৳ {savingsAmount.toLocaleString()} ({discountPercent}% OFF)
                  </span>
                )}
              </div>
            </div>

            {/* Colors Variant Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold text-base-content uppercase tracking-wider flex items-center justify-between">
                  <span>Color Option</span>
                  <span className="text-primary font-semibold text-xs">
                    {product.colors.find((c) => c.id === selectedColorId)?.color?.name}
                  </span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((pc) => {
                    const isSelected = selectedColorId === pc.id;
                    return (
                      <button
                        key={pc.id}
                        onClick={() => setSelectedColorId(pc.id)}
                        className={`group relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? "border-primary ring-4 ring-primary/20 scale-110 shadow-md"
                            : "border-gray-300 hover:scale-105"
                        }`}
                        style={{ backgroundColor: pc.color?.colorCode || "#000" }}
                        title={pc.color?.name}
                      >
                        {isSelected && <Check size={18} className="text-white drop-shadow-md" />}
                        {/* Tooltip */}
                        <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-30">
                          {pc.color?.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes Variant Selector & Stock availability */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-base-200">
                <div className="flex items-center justify-between text-xs font-bold text-base-content uppercase tracking-wider">
                  <span>Select Size</span>
                  <span className="text-base-content/60 text-xs font-normal">
                    {selectedSizeId
                      ? `Stock: ${maxStockAvailable} left`
                      : "Choose a size"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((ps) => {
                    const sizeStock = getStockForSize(product, ps.id);
                    const isDisabled = sizeStock === 0;
                    const isSelected = selectedSizeId === ps.id;

                    return (
                      <button
                        key={ps.id}
                        disabled={isDisabled}
                        onClick={() => {
                          setSelectedSizeId(ps.id);
                          setQuantity(1);
                        }}
                        className={`btn min-w-[56px] h-11 rounded-xl text-sm font-semibold transition-all ${
                          isSelected
                            ? "btn-primary shadow-md"
                            : isDisabled
                            ? "btn-disabled opacity-40 bg-base-200 line-through"
                            : "btn-outline border-base-300 hover:border-primary"
                        }`}
                      >
                        {ps.size?.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Age Range Variant Display */}
            {product.ages && product.ages.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-base-200">
                <label className="text-xs font-bold text-base-content uppercase tracking-wider">
                  Age Range Variant
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.ages.map((pa) => {
                    const isSelected = selectedAgeId === pa.id;
                    return (
                      <button
                        key={pa.id}
                        onClick={() => setSelectedAgeId(pa.id)}
                        className={`btn btn-sm rounded-xl text-xs font-semibold ${
                          isSelected ? "btn-secondary" : "btn-outline"
                        }`}
                      >
                        {pa.ageVariant?.ageRange}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Add to Cart Actions */}
            <div className="space-y-4 pt-4 border-t border-base-200">
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-base-content uppercase tracking-wider">
                  Quantity
                </span>
                <div className="flex items-center border border-base-300 rounded-xl bg-base-100">
                  <button
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="p-2.5 hover:bg-base-200 disabled:opacity-30 rounded-l-xl transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 font-bold text-sm">{quantity}</span>
                  <button
                    disabled={quantity >= maxStockAvailable || isOutOfStock}
                    onClick={() => setQuantity((prev) => Math.min(maxStockAvailable, prev + 1))}
                    className="p-2.5 hover:bg-base-200 disabled:opacity-30 rounded-r-xl transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                {maxStockAvailable > 0 && (
                  <span className="text-xs text-base-content/60">
                    (Max: {maxStockAvailable})
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 pt-2">
                <button
                  disabled={isOutOfStock || cartLoading}
                  onClick={handleAddToCart}
                  className="btn btn-primary flex-1 btn-md sm:btn-lg rounded-xl sm:rounded-2xl gap-2 text-primary-content shadow-lg shadow-primary/20 text-sm sm:text-base"
                >
                  <ShoppingCart size={18} className="sm:w-5 sm:h-5" /> Add to Cart
                </button>
                <button
                  disabled={isOutOfStock || cartLoading}
                  onClick={handleBuyNow}
                  className="btn btn-secondary flex-1 btn-md sm:btn-lg rounded-xl sm:rounded-2xl gap-2 shadow-md text-sm sm:text-base"
                >
                  <Zap size={18} className="sm:w-5 sm:h-5" /> Buy Now
                </button>
              </div>
            </div>

            {/* Value Guarantees / Shipping info */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-base-200 text-center text-[11px] text-base-content/70">
              <div className="p-3 bg-base-200/50 rounded-xl space-y-1">
                <ShieldCheck size={18} className="mx-auto text-primary" />
                <span className="block font-semibold text-base-content">100% Authentic</span>
              </div>
              <div className="p-3 bg-base-200/50 rounded-xl space-y-1">
                <Truck size={18} className="mx-auto text-primary" />
                <span className="block font-semibold text-base-content">Fast Delivery</span>
              </div>
              <div className="p-3 bg-base-200/50 rounded-xl space-y-1">
                <RotateCcw size={18} className="mx-auto text-primary" />
                <span className="block font-semibold text-base-content">Easy Returns</span>
              </div>
            </div>

            {/* Description Tab & Accordion */}
            <div className="pt-6 border-t border-base-200 space-y-4">
              <div className="flex border-b border-base-200">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
                    activeTab === "description"
                      ? "border-primary text-primary"
                      : "border-transparent text-base-content/60"
                  }`}
                >
                  Description
                </button>
                <button
                  onClick={() => setActiveTab("shipping")}
                  className={`py-2 px-4 text-xs font-bold border-b-2 transition-colors ${
                    activeTab === "shipping"
                      ? "border-primary text-primary"
                      : "border-transparent text-base-content/60"
                  }`}
                >
                  Delivery & Returns
                </button>
              </div>

              {activeTab === "description" && (
                <div
                  className="prose prose-sm text-base-content/80 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: pageConfig?.customDescription || product.description || "No description available for this item." }}
                />
              )}

              {activeTab === "shipping" && (
                <div className="text-xs text-base-content/80 space-y-2 leading-relaxed">
                  <p>• Standard Home Delivery: 2-4 Business Days across Bangladesh.</p>
                  <p>• Shipping Charges calculated at checkout based on region.</p>
                  <p>• 7 Days Exchange policy for unwashed, intact items with tags.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Landing Page Showcase Sections */}
        {pageConfig?.isLandingPage && pageConfig.sections && pageConfig.sections.length > 0 && (
          <div className="space-y-16 py-12 border-t border-base-200 mt-16">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
                Premium Features & Craftsmanship
              </h2>
              <p className="text-sm text-base-content/70">
                Explore what makes the {product.name} stand out in style, quality, and design.
              </p>
            </div>

            <div className="space-y-16">
              {[...pageConfig.sections]
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((sec, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <div
                      key={sec.id || idx}
                      className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-8 md:gap-12 items-center bg-base-100 rounded-3xl p-6 sm:p-8 border border-base-200 shadow-xs hover:shadow-md transition-shadow`}
                    >
                      {sec.imageUrl && (
                        <div className="w-full md:w-1/2 overflow-hidden rounded-2xl aspect-[4/3] border border-base-200 shadow-sm group">
                          <img
                            src={sec.imageUrl}
                            alt={sec.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                      <div className={`w-full ${sec.imageUrl ? "md:w-1/2" : "w-full"} space-y-4`}>
                        {sec.subtitle && (
                          <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold text-xs rounded-full uppercase tracking-wider">
                            {sec.subtitle}
                          </span>
                        )}
                        <h3 className="text-2xl sm:text-3xl font-bold text-base-content leading-tight">
                          {sec.title}
                        </h3>
                        {sec.description && (
                          <p className="text-sm sm:text-base text-base-content/80 leading-relaxed">
                            {sec.description}
                          </p>
                        )}
                        {sec.buttonText && (
                          <div className="pt-2">
                            <a
                              href={sec.buttonLink || "#purchase-section"}
                              className="btn bg-blue-600 hover:bg-blue-700 text-white border-none shadow-md inline-flex items-center gap-2"
                              onClick={(e) => {
                                if (!sec.buttonLink || sec.buttonLink.startsWith("#")) {
                                  e.preventDefault();
                                  document.getElementById("purchase-section")?.scrollIntoView({ behavior: "smooth" });
                                }
                              }}
                            >
                              {sec.buttonText}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Testimonials/Reviews Section */}
        {pageConfig?.isLandingPage && pageConfig.showReviews && (
          <div className="space-y-6 py-12 border-t border-base-200 mt-16">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
                What Verified Buyers Say
              </h2>
              <p className="text-sm text-base-content/70">
                Resellers and retail customers share their experience with our products.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                {
                  name: "Tanvir Ahmed",
                  rating: 5,
                  comment: "Aarham Apparel has the best premium fabrics. Sizing matches the chart exactly, and shipping was completed within 2 days.",
                  date: "3 days ago"
                },
                {
                  name: "Rezaul Karim",
                  rating: 5,
                  comment: "The markup I get as a reseller is amazing, and the quality keeps my customers coming back. High quality finishing and stitching.",
                  date: "1 week ago"
                },
                {
                  name: "Nusrat Jahan",
                  rating: 5,
                  comment: "Excellent stitching and premium design. Gifted it to my brother and he absolutely loved it. Highly recommended!",
                  date: "2 weeks ago"
                }
              ].map((rev, idx) => (
                <div key={idx} className="bg-base-200/30 border border-base-200 p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-3">
                    <div className="flex text-amber-400 gap-0.5">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} size={16} fill="currentColor" />
                      ))}
                    </div>
                    <p className="text-sm text-base-content/95 italic leading-relaxed">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-base-200 pt-3">
                    <div>
                      <span className="block text-xs font-bold text-base-content">{rev.name}</span>
                      <span className="text-[10px] text-success font-medium flex items-center gap-0.5 mt-0.5">
                        <CheckCircle2 size={12} /> Verified Buyer
                      </span>
                    </div>
                    <span className="text-[10px] text-base-content/50">{rev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {pageConfig?.isLandingPage && pageConfig.showFaq && (
          <div className="space-y-6 py-12 border-t border-base-200 mt-16">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-sm text-base-content/70">
                Find quick answers to common queries regarding ordering, shipping, and sizing.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  q: "What makes Aarham Apparel products premium?",
                  a: "Our products undergo strict quality checks. We select top-grade fabrics, execute precision stitching, and use durable color dyes that prevent fading after washes."
                },
                {
                  q: "Can I exchange a product if it does not fit?",
                  a: "Yes! We offer a hassle-free 7-day exchange window. Keep tags intact and the product unworn to qualify for replacement."
                },
                {
                  q: "Is Cash on Delivery available nationwide?",
                  a: "Absolutely. We ship with trustworthy logistics partners that deliver with Cash on Delivery options available in Dhaka and all outer districts."
                },
                {
                  q: "How can I join as a reseller?",
                  a: "Create an account on our platform and register under user settings or contact support to get special wholesale pricing configs."
                }
              ].map((faq, idx) => (
                <div key={idx} className="collapse collapse-plus bg-base-200/50 border border-base-200 rounded-2xl">
                  <input type="radio" name="faq-accordion" defaultChecked={idx === 0} />
                  <div className="collapse-title text-base font-bold text-base-content">
                    {faq.q}
                  </div>
                  <div className="collapse-content text-sm text-base-content/80 leading-relaxed">
                    <p>{faq.a}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Items Section */}
        {pageConfig?.isLandingPage && pageConfig.showRelatedItems && relatedProducts.length > 0 && (
          <div className="space-y-6 py-12 border-t border-base-200 mt-16">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2 className="text-3xl font-extrabold text-base-content tracking-tight">
                Explore More Collections
              </h2>
              <p className="text-sm text-base-content/70">
                Customers also bought these top trending catalog arrivals.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {relatedProducts.map((p) => {
                const pPrice = Number(p.newPrice || p.price || 0);
                const pOldPrice = Number(p.oldPrice || 0);
                return (
                  <Link
                    key={p.id}
                    href={`/products/${p.id}`}
                    className="group block bg-base-100 border border-base-200 rounded-2xl overflow-hidden hover:shadow-md transition-all"
                  >
                    <div className="aspect-[4/5] bg-base-200 relative overflow-hidden">
                      <img
                        src={p.images?.[0]?.imageUrl || p.imageUrl || "/placeholder.png"}
                        alt={p.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 space-y-1">
                      <h3 className="font-bold text-xs text-base-content truncate group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-primary">৳{pPrice.toLocaleString()}</span>
                        {pOldPrice > pPrice && (
                          <span className="text-xs text-base-content/50 line-through">৳{pOldPrice.toLocaleString()}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
