import { create } from "zustand";

/**
 * Open state of the storefront's mobile menu drawer. Shared so the Navbar
 * hamburger and the bottom navigation open the same drawer.
 */
interface MobileMenuState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

export const useMobileMenuStore = create<MobileMenuState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
