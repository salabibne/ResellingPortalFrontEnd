"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CategoryDrawer, { CategoryDrawerProduct } from "@/components/shared/CategoryDrawer";
import StorefrontMenuLinks from "@/components/shared/StorefrontMenuLinks";
import { productApi, Product } from "@/services/product.api";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useMobileMenuStore } from "@/store/useMobileMenuStore";

function StorefrontCategoryDrawerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { categories, loading, fetchCategories, setSelectedCategory, setSelectedSubcategory } =
    useCategoryStore();
  const menuOpen = useMobileMenuStore((state) => state.menuOpen);
  const categoriesOpen = useMobileMenuStore((state) => state.categoriesOpen);
  const setMenuOpen = useMobileMenuStore((state) => state.setMenuOpen);
  const setCategoriesOpen = useMobileMenuStore((state) => state.setCategoriesOpen);
  const open = menuOpen || categoriesOpen;

  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const productsRequested = useRef(false);

  // Load lazily the first time the drawer opens; the store skips duplicate requests.
  useEffect(() => {
    if (open && categories.length === 0) fetchCategories();
  }, [open, categories.length, fetchCategories]);

  // Products are fetched once, also on first open, so categories can list them.
  useEffect(() => {
    if (!open || productsRequested.current) return;
    productsRequested.current = true;
    setProductsLoading(true);
    productApi
      .getAll()
      .then(setProducts)
      .catch((err) => {
        console.error("Failed to load products:", err);
        productsRequested.current = false;
      })
      .finally(() => setProductsLoading(false));
  }, [open]);

  // Grouped by category, ordered like the shop's default "New Arrivals" sort.
  const productsByCategory = useMemo(() => {
    const sorted = [...products].sort((a, b) => {
      if (a.showAsNewArrival !== b.showAsNewArrival) return a.showAsNewArrival ? -1 : 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    const grouped: Record<string, CategoryDrawerProduct[]> = {};
    sorted.forEach((product) => {
      (grouped[product.categoryId] ??= []).push({
        id: product.id,
        name: product.name,
        imageUrl:
          product.images?.find((img) => img.isPrimary)?.imageUrl || product.images?.[0]?.imageUrl,
        price: Number(product.newPrice) || 0,
      });
    });
    return grouped;
  }, [products]);

  const close = useCallback(() => {
    setMenuOpen(false);
    setCategoriesOpen(false);
  }, [setMenuOpen, setCategoriesOpen]);

  const handleSelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    router.push(`/shop?categoryId=${encodeURIComponent(categoryId)}`);
    close();
  };

  const handleSelectProduct = (productId: string) => {
    router.push(`/shop/${productId}`);
    close();
  };

  return (
    <CategoryDrawer
      open={open}
      onClose={close}
      categories={categories}
      activeId={pathname === "/shop" ? searchParams.get("categoryId") : null}
      onSelect={handleSelect}
      loading={loading}
      productsByCategory={productsByCategory}
      productsLoading={productsLoading}
      onSelectProduct={handleSelectProduct}
      title={menuOpen ? "Menu" : "Categories"}
      header={menuOpen ? <StorefrontMenuLinks onNavigate={close} /> : undefined}
    />
  );
}

/**
 * The single storefront left drawer: the Navbar ☰ menu (with search and links)
 * and the categories-only drawer from the bottom nav and /shop.
 */
export default function StorefrontCategoryDrawer() {
  return (
    <Suspense fallback={null}>
      <StorefrontCategoryDrawerContent />
    </Suspense>
  );
}
