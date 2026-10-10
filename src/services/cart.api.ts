import api from "./axios";

export interface AddToCartDto {
  productId: string;
  productSizeId?: string;
  productColorId?: string;
  quantity: number;
}

export interface BatchAddToCartPayload {
  items: AddToCartDto[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  productSizeId?: string | null;
  productColorId?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
    newPrice: number;
    resellerPrice: number;
    unit: string;
    images?: Array<{ imageUrl: string }>;
  };
  productSize?: {
    id: string;
    size: { id: string; name: string };
  } | null;
  productColor?: {
    id: string;
    color: { id: string; name: string; colorCode: string };
  } | null;
}

export interface Cart {
  id: string;
  customerId: string;
  promoCode?: string | null;
  courierCharge: number;
  total: number;
  notes?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  cartItems: CartItem[];
}

export const cartApi = {
  getActiveCart: async (): Promise<Cart> => {
    const response = await api.get("/cart");
    return response.data;
  },
  addToCart: async (data: AddToCartDto): Promise<Cart> => {
    const response = await api.post("/cart/items", data);
    return response.data;
  },
  batchAddToCart: async (data: BatchAddToCartPayload): Promise<Cart> => {
    const response = await api.post("/cart/items/batch", data);
    return response.data;
  },
  updateCartItem: async (cartItemId: string, quantity: number): Promise<Cart> => {
    const response = await api.patch(`/cart/items/${cartItemId}`, { quantity });
    return response.data;
  },
  removeCartItem: async (cartItemId: string): Promise<Cart> => {
    const response = await api.delete(`/cart/items/${cartItemId}`);
    return response.data;
  },
  clearCart: async (): Promise<Cart> => {
    const response = await api.delete("/cart/clear");
    return response.data;
  },
};
