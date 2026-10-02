"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import productApi, { Product } from "@/services/product.api";
import ProductCard from "@/components/ProductCard";

interface HomeProductsSectionProps {
  title?: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  limit?: number;
}

export default function HomeProductsSection({
  title = "New Arrivals & Featured Collection",
  subtitle = "Curated Selection",
  description = "Explore our trending fashion collection crafted from premium materials.",
  buttonText = "View All Products",
  buttonLink = "/shop",
  limit = 8,
}: HomeProductsSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await productApi.getProducts({ page: 1, limit });
        if (isMounted) {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load homepage products:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [limit]);

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto w-full">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 border-b border-base-200 pb-6">
        <div>
          {subtitle && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles size={12} />
              <span>{subtitle}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-base-content tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs sm:text-sm text-base-content/70 mt-1 max-w-2xl">
              {description}
            </p>
          )}
        </div>

        <Link
          href={buttonLink || "/shop"}
          className="btn btn-sm sm:btn-md btn-outline btn-primary rounded-xl gap-2 font-bold self-start md:self-auto shrink-0 shadow-xs"
        >
          <span>{buttonText}</span>
          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-base-100 rounded-2xl p-4 border border-base-200 shadow-sm animate-pulse space-y-3"
            >
              <div className="aspect-3/4 bg-base-200 rounded-xl w-full" />
              <div className="h-4 bg-base-200 rounded w-3/4" />
              <div className="h-3 bg-base-200 rounded w-1/2" />
              <div className="h-8 bg-base-200 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-base-200/50 rounded-2xl p-8 sm:p-12 text-center border border-base-200">
          <p className="text-sm font-semibold text-base-content/60 mb-4">
            Products will be displayed here once added to the catalog.
          </p>
          <Link href="/shop" className="btn btn-sm btn-primary rounded-xl font-bold">
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
