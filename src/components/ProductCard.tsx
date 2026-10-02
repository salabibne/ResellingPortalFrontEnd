"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Eye, Sparkles } from "lucide-react";
import { Product } from "@/services/product.api";
import { useCartStore } from "@/store/useCartStore";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const loading = useCartStore((state) => state.loading);

  // Images handling
  const primaryImg = product.images?.find((img) => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl || "/placeholder.png";
  const secondaryImg = product.images?.find((img) => !img.isPrimary)?.imageUrl || product.images?.[1]?.imageUrl || primaryImg;

  // Stock calculation
  const totalStock = product.inventories?.reduce(
    (acc, inv) => acc + (inv.currentStock || 0),
    0
  ) ?? 0;
  const isOutOfStock = totalStock === 0;

  // Discount calculation
  const oldPrice = Number(product.oldPrice);
  const newPrice = Number(product.newPrice);
  const hasDiscount = oldPrice > newPrice;
  const discountPercent = hasDiscount
    ? Math.round(((oldPrice - newPrice) / oldPrice) * 100)
    : 0;

  // Quick Add to Cart
  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Default to first available size and color
    const firstSizeId = product.sizes?.[0]?.id;
    const firstColorId = product.colors?.[0]?.id;

    addToCart({
      productId: product.id,
      productSizeId: firstSizeId,
      productColorId: firstColorId,
      quantity: 1,
    });
  };

  return (
    <div className="group bg-base-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-base-200 flex flex-col overflow-hidden relative">
      {/* Image Container with Hover Swap & Overlay */}
      <div
        className="relative w-full aspect-[4/5] bg-base-200 overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={`/shop/${product.id}`} className="block w-full h-full">
          <img
            src={isHovered ? secondaryImg : primaryImg}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 z-10 pointer-events-none">
          {product.showAsNewArrival && (
            <span className="badge badge-primary gap-1 font-bold text-[9px] sm:text-[11px] py-1 sm:py-2 px-1.5 sm:px-2.5 shadow-md">
              <Sparkles size={10} className="sm:w-3 sm:h-3" /> New
            </span>
          )}
          {hasDiscount && (
            <span className="badge badge-secondary font-extrabold text-[9px] sm:text-[11px] py-1 sm:py-2 px-1.5 sm:px-2.5 shadow-md">
              {discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20">
            <span className="bg-error text-white font-bold text-[10px] sm:text-xs uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        {/* Hover / Touch Quick Actions */}
        {!isOutOfStock && (
          <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 flex gap-1.5 sm:gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={handleQuickAdd}
              disabled={loading}
              className="btn btn-primary btn-xs sm:btn-sm flex-1 gap-1 shadow-lg rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-semibold text-primary-content"
            >
              <ShoppingCart size={12} className="sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline">Add</span>
            </button>
            <Link
              href={`/shop/${product.id}`}
              className="btn btn-square btn-xs sm:btn-sm btn-outline bg-white hover:bg-base-200 border-none shadow-lg rounded-lg sm:rounded-xl text-gray-800"
              title="View Details"
            >
              <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[10px] sm:text-xs text-base-content/60 mb-1">
            <span className="font-semibold text-primary/80 uppercase tracking-wider text-[9px] sm:text-[10px] truncate max-w-[50%]">
              {product.brand?.name || "Aarham"}
            </span>
            <span className="text-[10px] sm:text-[11px] truncate max-w-[45%] text-right">
              {product.category?.name}
            </span>
          </div>

          {/* Title */}
          <Link
            href={`/shop/${product.id}`}
            className="font-bold text-xs sm:text-sm text-base-content hover:text-primary transition-colors line-clamp-2 block leading-tight sm:leading-snug"
          >
            {product.name}
          </Link>
        </div>

        {/* Color Swatches & Price */}
        <div className="space-y-2 pt-0.5">
          {/* Color Preview Swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1 sm:gap-1.5">
              {product.colors.slice(0, 4).map((pc) => (
                <span
                  key={pc.id}
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border border-black/20 shadow-2xs inline-block"
                  style={{ backgroundColor: pc.color?.colorCode || "#ccc" }}
                  title={pc.color?.name}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-[9px] sm:text-[10px] text-base-content/60 font-medium ml-0.5">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Pricing Section */}
          <div className="flex flex-wrap items-baseline justify-between pt-1 border-t border-base-200 gap-1">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-base font-extrabold text-primary">
                ৳ {newPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-[10px] sm:text-xs text-base-content/50 line-through font-medium">
                  ৳ {oldPrice.toLocaleString()}
                </span>
              )}
            </div>
            {product.unit && (
              <span className="text-[9px] sm:text-[10px] text-base-content/50 capitalize font-medium">
                /{product.unit}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
