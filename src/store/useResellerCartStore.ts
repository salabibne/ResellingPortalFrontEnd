import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ResellerCartItem {
  id: string; // unique cart item key: productId-sizeId-colorId
  productId: string;
  productName: string;
  imageUrl?: string;
  productSizeId?: string | null;
  sizeName?: string;
  productColorId?: string | null;
  colorName?: string;
  purchasePrice?: number; // purchase cost of product
  resellerPrice: number; // wholesale cost / base price
  retailPrice: number; // market retail price
  customSellingPrice?: number; // optional custom price if reseller edits it
  resellerSellingPrice?: number; // legacy alias
  quantity: number;
  stock: number;
}

interface ResellerCartStore {
  items: ResellerCartItem[];
  addItem: (item: Omit<ResellerCartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateSellingPrice: (id: string, price?: number) => void;
  clearCart: () => void;
  getTotalWholesaleCost: () => number;
  getTotalSellingPrice: () => number;
  getTotalProfit: () => number;
}

export const useResellerCartStore = create<ResellerCartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        const id = `${newItem.productId}-${newItem.productSizeId || "none"}-${newItem.productColorId || "none"}`;
        const existing = get().items.find((i) => i.id === id);

        if (existing) {
          set({
            items: get().items.map((i) =>
              i.id === id
                ? {
                    ...i,
                    quantity: Math.min(i.quantity + newItem.quantity, i.stock || 999),
                  }
                : i
            ),
          });
        } else {
          set({
            items: [
              ...get().items,
              {
                ...newItem,
                id,
                customSellingPrice:
                  newItem.customSellingPrice && newItem.customSellingPrice !== newItem.resellerPrice
                    ? newItem.customSellingPrice
                    : undefined,
              },
            ],
          });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.id === id ? { ...i, quantity: Math.min(quantity, i.stock || 999) } : i
          ),
        });
      },

      updateSellingPrice: (id, price) => {
        set({
          items: get().items.map((i) => {
            if (i.id !== id) return i;
            if (price === undefined || price === null || Number.isNaN(price) || price === 0 || price === i.resellerPrice) {
              return {
                ...i,
                customSellingPrice: undefined,
                resellerSellingPrice: undefined,
              };
            }
            return {
              ...i,
              customSellingPrice: Number(price),
              resellerSellingPrice: Number(price),
            };
          }),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalWholesaleCost: () => {
        return get().items.reduce((sum, item) => sum + item.resellerPrice * item.quantity, 0);
      },

      getTotalSellingPrice: () => {
        return get().items.reduce(
          (sum, item) => sum + (item.customSellingPrice || item.resellerPrice) * item.quantity,
          0
        );
      },

      getTotalProfit: () => {
        return get().items.reduce((sum, item) => {
          const sellingPrice = item.customSellingPrice || item.resellerPrice;
          const cost = item.purchasePrice ?? 0;
          return sum + (sellingPrice - cost) * item.quantity;
        }, 0);
      },
    }),
    {
      name: "aarham_reseller_cart",
    }
  )
);
