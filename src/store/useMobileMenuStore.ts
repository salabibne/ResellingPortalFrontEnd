import { create } from "zustand";

/**
 * Open state of the storefront's drawers. Shared so every trigger (Navbar
 * hamburger, bottom navigation, shop page) opens the same drawer instance.
 * - `open`: the full ☰ menu (search, links, categories).
 * - `categoriesOpen`: the categories-only drawer.
 */
interface MobileMenuState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  categoriesOpen: boolean;
  setCategoriesOpen: (open: boolean) => void;
}

export const useMobileMenuStore = create<MobileMenuState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
  categoriesOpen: false,
  setCategoriesOpen: (categoriesOpen) => set({ categoriesOpen }),
}));
