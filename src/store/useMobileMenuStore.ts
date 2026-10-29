import { create } from "zustand";

/**
 * Open state of the storefront's left drawer (StorefrontCategoryDrawer).
 * Shared so every trigger opens the same drawer instance.
 * - `menuOpen`: the Navbar ☰ menu — search, links, then categories.
 * - `categoriesOpen`: bottom nav / shop page — categories only.
 * Opening one closes the other.
 */
interface MobileMenuState {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  categoriesOpen: boolean;
  setCategoriesOpen: (open: boolean) => void;
}

export const useMobileMenuStore = create<MobileMenuState>((set) => ({
  menuOpen: false,
  setMenuOpen: (menuOpen) => set(menuOpen ? { menuOpen, categoriesOpen: false } : { menuOpen }),
  categoriesOpen: false,
  setCategoriesOpen: (categoriesOpen) =>
    set(categoriesOpen ? { categoriesOpen, menuOpen: false } : { categoriesOpen }),
}));
