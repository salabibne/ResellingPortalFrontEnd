"use client";

import { useEffect, useRef } from "react";
import { ChevronRight, X } from "lucide-react";

export interface CategoryDrawerItem {
  id: string;
  name: string;
}

interface CategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  categories: CategoryDrawerItem[];
  activeId?: string | null;
  onSelect: (id: string) => void;
  loading?: boolean;
}

/**
 * Minimal left drawer that lists category names only. Shared by the
 * storefront and the uddokta catalog; callers own the data and navigation.
 */
export default function CategoryDrawer({
  open,
  onClose,
  categories,
  activeId,
  onSelect,
  loading = false,
}: CategoryDrawerProps) {
  // Callers often pass an inline onClose; a ref keeps the effect below stable.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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
                return (
                  <li key={category.id}>
                    <button
                      type="button"
                      onClick={() => onSelect(category.id)}
                      aria-current={active ? "true" : undefined}
                      title={category.name}
                      className={`flex items-center gap-3 h-12 px-4 w-full rounded-xl text-sm font-medium text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-base-content/80 hover:bg-base-200"
                      }`}
                    >
                      <span className="flex-1 min-w-0 truncate">{category.name}</span>
                      <ChevronRight size={16} className="shrink-0 opacity-60" />
                    </button>
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
