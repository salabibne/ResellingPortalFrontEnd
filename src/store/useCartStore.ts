import { create } from "zustand";
import { cartApi, Cart, AddToCartDto, BatchAddToCartPayload } from "@/services/cart.api";
import { useAuthStore } from "./useAuthStore";

interface CartState {
  cart: Cart | null;
  isOpen: boolean;
  loading: boolean;
  toastMessage: string | null;
  fetchCart: () => Promise<void>;
  addToCart: (dto: AddToCartDto) => Promise<boolean>;
  batchAddToCart: (payload: BatchAddToCartPayload) => Promise<boolean>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleCart: () => void;
  setToast: (msg: string | null) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  loading: false,
  toastMessage: null,

  fetchCart: async () => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) {
      set({ cart: null });
      return;
    }
    try {
      const data = await cartApi.getActiveCart();
      set({ cart: data });
    } catch (error) {
      set({ cart: null });
    }
  },

  addToCart: async (dto: AddToCartDto) => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) {
      get().setToast("Please login to add items to your cart.");
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;
        const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1200);
      }
      return false;
    }

    set({ loading: true });
    try {
      const updatedCart = await cartApi.addToCart(dto);
      set({ cart: updatedCart, loading: false, isOpen: true });
      get().setToast("Item added to cart successfully!");
      return true;
    } catch (error: any) {
      set({ loading: false });
      const msg =
        error?.response?.data?.message ||
        "Failed to add item to cart. Please check your login status.";
      get().setToast(msg);
      return false;
    }
  },

  batchAddToCart: async (payload: BatchAddToCartPayload) => {
    const { accessToken } = useAuthStore.getState();
    if (!accessToken) {
      get().setToast("Please login to add batch items to your cart.");
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname + window.location.search;
        const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1200);
      }
      return false;
    }

    if (!payload.items || payload.items.length === 0) {
      get().setToast("No items selected for batch add.");
      return false;
    }

    set({ loading: true });
    try {
      const updatedCart = await cartApi.batchAddToCart(payload);
      set({ cart: updatedCart, loading: false, isOpen: true });
      const totalBatchCount = payload.items.reduce((sum, item) => sum + item.quantity, 0);
      get().setToast(`Added ${totalBatchCount} batch items to cart successfully!`);
      return true;
    } catch (error: any) {
      set({ loading: false });
      const msg =
        error?.response?.data?.message ||
        "Failed to add batch items to cart.";
      get().setToast(msg);
      return false;
    }
  },

  updateQuantity: async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      await get().removeFromCart(cartItemId);
      return;
    }
    set({ loading: true });
    try {
      const updatedCart = await cartApi.updateCartItem(cartItemId, quantity);
      set({ cart: updatedCart, loading: false });
    } catch (error: any) {
      set({ loading: false });
      get().setToast(
        error?.response?.data?.message || "Failed to update item quantity."
      );
    }
  },

  removeFromCart: async (cartItemId: string) => {
    set({ loading: true });
    try {
      const updatedCart = await cartApi.removeCartItem(cartItemId);
      set({ cart: updatedCart, loading: false });
      get().setToast("Item removed from cart.");
    } catch (error: any) {
      set({ loading: false });
      get().setToast(
        error?.response?.data?.message || "Failed to remove item."
      );
    }
  },

  clearCart: async () => {
    set({ loading: true });
    try {
      const updatedCart = await cartApi.clearCart();
      set({ cart: updatedCart, loading: false });
      get().setToast("Cart cleared.");
    } catch (error: any) {
      set({ loading: false });
    }
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  openDrawer: () => set({ isOpen: true }),
  closeDrawer: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  setToast: (msg: string | null) => {
    set({ toastMessage: msg });
    if (msg) {
      setTimeout(() => {
        if (get().toastMessage === msg) {
          set({ toastMessage: null });
        }
      }, 3500);
    }
  },
}));
