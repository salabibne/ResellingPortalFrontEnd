import api from "./axios";

export type PaymentMethod = "CASH_ON_DELIVERY" | "BKASH" | "NAGAD" | "BANK_TRANSFER";
export type PaymentStatus = "DUE" | "PAID" | "PARTIAL" | "CANCELLED";
export type OrderProcessingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export interface CreateOrderDto {
  paymentMethod: PaymentMethod;
  shippingAddress?: string;
  courierCharge?: number;
  discount?: number;
  notes?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productSizeId?: string | null;
  productColorId?: string | null;
  quantity: number;
  snapshotPrice: number;
  subtotal: number;
  product?: { id: string; name: string; images?: Array<{ imageUrl: string }> };
  productSize?: { size: { id: string; name: string } } | null;
  productColor?: { color: { id: string; name: string; colorCode: string } } | null;
}

export interface Order {
  id: string;
  cartId: string;
  customerId: string;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  processingStatus: OrderProcessingStatus;
  orderProcessedBy?: string | null;
  subtotal: number;
  courierCharge: number;
  discount: number;
  total: number;
  shippingAddress?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  customer?: { id: string; name: string; email: string; phone: string };
}

export interface OrderListResponse {
  data: Order[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const orderApi = {
  createOrder: async (data: CreateOrderDto): Promise<Order> => {
    const response = await api.post("/orders", data);
    return response.data;
  },
  getOrders: async (
    page = 1,
    limit = 20,
    search?: string,
    processingStatus?: OrderProcessingStatus,
    paymentStatus?: PaymentStatus
  ): Promise<OrderListResponse> => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("limit", limit.toString());
    if (search) params.set("search", search);
    if (processingStatus && processingStatus !== ("ALL" as any)) {
      params.set("processingStatus", processingStatus);
    }
    if (paymentStatus && paymentStatus !== ("ALL" as any)) {
      params.set("paymentStatus", paymentStatus);
    }
    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  },
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  updateOrderStatus: async (
    orderId: string,
    data: { processingStatus?: OrderProcessingStatus; paymentStatus?: PaymentStatus }
  ): Promise<Order> => {
    const response = await api.patch(`/orders/${orderId}/status`, data);
    return response.data;
  },
};
