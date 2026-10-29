"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, X } from "lucide-react";

export interface CategoryDrawerItem {
  id: string;
  name: string;
}

export interface CategoryDrawerProduct {
  id: string;
  name: string;
  imageUrl?: string;
  price: number;
}

interface CategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: CategoryDrawerItem[];
  activeId?: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
  /** When passed, tapping a category expands its products instead of selecting it. */
  productsByCategory?: Record<string, CategoryDrawerProduct[]>;
  productsLoading?: boolean;
  onSelectProduct?: (id: string) => void;
}

/**
 * Minimal left drawer that lists categories. Shared by the storefront and the
 * uddokta catalog; callers own the data and navigation. With
 * `productsByCategory` each category becomes an accordion of its products.
 */
export default function CategoryDrawer({
  open,
  onClose,
  categories,
  activeId,
  onSelect,
  loading = false,
  productsByCategory,
  productsLoading = false,
  onSelectProduct,
}: CategoryDrawerProps) {
  // Callers often pass an inline onClose; a ref keeps the effect below stable.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const expandable = productsByCategory !== undefined;

  // Each time the drawer opens, start with the active category expanded.
  useEffect(() => {
    if (open) setExpandedId(activeId ?? null);
  }, [open, activeId]);

  // Escape closes the drawer and body scroll is locked while it is open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  const renderProducts = (category: CategoryDrawerItem) => {
    const products = productsByCategory?.[category.id] ?? [];
    return (
      <div id={`category-products-${category.id}`} className="mt-1 mb-2 ml-3 border-l border-base-200 pl-2">
        {productsLoading && products.length === 0 ? (
          <ul className="space-y-1" aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <li key={index} className="flex items-center gap-3 px-2 py-2">
                <span className="skeleton h-12 w-12 shrink-0 rounded-lg" />
                <span className="flex-1 space-y-2">
                  <span className="skeleton block h-3 w-3/4 rounded" />
                  <span className="skeleton block h-3 w-1/3 rounded" />
                </span>
              </li>
            ))}
          </ul>
        ) : products.length === 0 ? (
          <p className="px-2 py-3 text-xs text-base-content/60">No products in this category</p>
        ) : (
          <ul className="space-y-0.5">
            {products.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => onSelectProduct?.(product.id)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-base-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <img
                    src={product.imageUrl || "/placeholder.png"}
                    alt=""
                    loading="lazy"
                    className="h-12 w-12 shrink-0 rounded-lg bg-base-200 object-cover"
                  />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-base-content line-clamp-2">
                      {product.name}
                    </span>
                    <span className="block text-xs font-bold text-primary">
                      ৳{product.price.toLocaleString()}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => onSelect(category.id)}
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-xs font-semibold text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <span className="flex-1 min-w-0 truncate">View all {category.name}</span>
          <ChevronRight size={14} className="shrink-0" />
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] print:hidden">
      <button
        type="button"
        className="absolute inset-0 h-full w-full bg-black/60 animate-fade-in motion-reduce:animate-none"
        onClick={onClose}
        aria-label="Close categories"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Categories"
        className="absolute inset-y-0 left-0 flex w-[85vw] max-w-xs flex-col bg-base-100 shadow-2xl animate-slide-in-left motion-reduce:animate-none"
      >
        <div className="flex items-center justify-between gap-2 border-b border-base-200 px-4 py-3">
          <h2 className="text-base font-bold text-base-content">Categories</h2>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-square rounded-xl"
            aria-label="Close categories"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
          {loading && categories.length === 0 ? (
            <ul className="space-y-1" aria-hidden="true">
              {Array.from({ length: 6 }).map((_, index) => (
                <li key={index} className="h-12 px-4 flex items-center">
                  <span className="skeleton h-4 w-2/3 rounded-lg" />
                </li>
              ))}
            </ul>
          ) : categories.length === 0 ? (
            <p className="px-4 py-6 text-sm text-base-content/60">No categories yet</p>
          ) : (
            <ul className="space-y-1">
              {categories.map((category) => {
                const active = category.id === activeId;
                const expanded = expandable && category.id === expandedId;
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() =>
                        expandable
                          ? setExpandedId(expanded ? null : category.id)
                          : onSelect(category.id)
                      }
                      aria-current={active ? "true" : undefined}
                      aria-expanded={expandable ? expanded : undefined}
                      aria-controls={expanded ? `category-products-${category.id}` : undefined}
                      title={category.name}
                      className={`flex items-center gap-3 h-12 px-4 w-full rounded-xl text-sm font-medium text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                        active || expanded
                          ? "bg-primary/10 text-primary"
                          : "text-base-content/80 hover:bg-base-200"
                      }`}
                    >
                      <span className="flex-1 min-w-0 truncate">{category.name}</span>
                      <ChevronRight
                        size={16}
                        className={`shrink-0 opacity-60 transition-transform motion-reduce:transition-none ${
                          expanded ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {expanded && renderProducts(category)}
                  </li>
                );
              })}
            </ul>
          )}
        </nav>
      </div>
    </div>
  );
}
