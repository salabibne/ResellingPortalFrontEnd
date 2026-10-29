"use client";

import { Suspense, useCallback, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CategoryDrawer from "@/components/shared/CategoryDrawer";
import { useCategoryStore } from "@/store/useCategoryStore";
import { useMobileMenuStore } from "@/store/useMobileMenuStore";

function StorefrontCategoryDrawerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { categories, loading, fetchCategories, setSelectedCategory, setSelectedSubcategory } =
    useCategoryStore();
  const open = useMobileMenuStore((state) => state.categoriesOpen);
  const setOpen = useMobileMenuStore((state) => state.setCategoriesOpen);

  // Load lazily the first time the drawer opens; the store skips duplicate requests.
  useEffect(() => {
    if (open && categories.length === 0) fetchCategories();
  }, [open, categories.length, fetchCategories]);

  const close = useCallback(() => setOpen(false), [setOpen]);

  const handleSelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
    router.push(`/shop?categoryId=${encodeURIComponent(categoryId)}`);
    setOpen(false);
  };

  return (
    <CategoryDrawer
      open={open}
      onClose={close}
      categories={categories}
      activeId={pathname === "/shop" ? searchParams.get("categoryId") : null}
      onSelect={handleSelect}
      loading={loading}
    />
  );
}

/** The single storefront category drawer, opened from the bottom nav and /shop. */
export default function StorefrontCategoryDrawer() {
  return (
    <Suspense fallback={null}>
      <StorefrontCategoryDrawerContent />
    </Suspense>
  );
}
