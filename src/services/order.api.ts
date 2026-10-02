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

export interface ResellerOrderItemInput {
  productId: string;
  productSizeId?: string;
  productColorId?: string;
  quantity: number;
  resellerSellingPrice?: number;
}

export interface CreateResellerOrderDto {
  items: ResellerOrderItemInput[];
  customerName: string;
  customerPhone: string;
  customerSecondaryPhone?: string;
  customerDistrict: string;
  customerThana: string;
  shippingAddress: string;
  courierCharge: number;
  isAdvanceCourierPaid?: boolean;
  advanceCourierAmount?: number;
  paymentMethod: PaymentMethod;
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
  resellerUnitCost?: number | null;
  resellerSellingPrice?: number | null;
  subtotal: number;
  product?: {
    id: string;
    name: string;
    resellerPrice?: number;
    newPrice?: number;
    purchasePrice?: number;
    images?: Array<{ imageUrl: string }>;
  };
  productSize?: { size: { id: string; name: string } } | null;
  productColor?: { color: { id: string; name: string; colorCode: string } } | null;
}

export interface Order {
  id: string;
  orderRef?: string | null;
  cartId?: string | null;
  customerId: string;
  isResellerOrder?: boolean;
  resellerId?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  customerSecondaryPhone?: string | null;
  customerDistrict?: string | null;
  customerThana?: string | null;
  resellerSubtotal?: number | null;
  resellerSellPrice?: number | null;
  resellerProfit?: number | null;
  isAdvanceCourierPaid?: boolean;
  advanceCourierAmount?: number | null;
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
  courierProvider?: string | null;
  courierConsignmentId?: string | null;
  courierTrackingCode?: string | null;
  courierStatus?: string | null;
  courierSubmittedAt?: string | null;
  courierLastSyncedAt?: string | null;
  courierDeliveryType?: number;
  courierNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  customer?: { id: string; name: string; email: string; phone: string; role?: string; pageName?: string };
  reseller?: { id: string; name: string; email: string; phone: string; pageName?: string };
}

export interface DeliveryOption {
  id: string;
  name: string;
  charge: number;
}

export interface CourierPolicy {
  id: string;
  title: string;
  chargeText: string;
  defaultCharge: number;
}

export interface ResellerStats {
  totalOrders: number;
  pendingOrders: number;
  deliveredOrders: number;
  totalResellerProfit: number;
  pendingResellerProfit?: number;
  totalResellerSales: number;
  totalWholesaleCost: number;
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
  createResellerOrder: async (data: CreateResellerOrderDto): Promise<Order> => {
    const response = await api.post("/orders/reseller-checkout", data);
    return response.data;
  },
  getCourierPolicy: async (): Promise<CourierPolicy> => {
    const response = await api.get("/orders/courier-policy");
    return response.data;
  },
  updateCourierPolicy: async (data: Partial<CourierPolicy>): Promise<CourierPolicy> => {
    const response = await api.patch("/orders/courier-policy", data);
    return response.data;
  },
  getDeliverySettings: async (): Promise<DeliveryOption[]> => {
    const response = await api.get("/orders/delivery-settings");
    return response.data;
  },
  getResellerStats: async (): Promise<ResellerStats> => {
    const response = await api.get("/orders/reseller-stats");
    return response.data;
  },
  getOrders: async (
    page = 1,
    limit = 20,
    search?: string,
    processingStatus?: OrderProcessingStatus,
    paymentStatus?: PaymentStatus,
    isResellerOnly?: boolean,
    startDate?: string,
    endDate?: string,
    customerPhone?: string
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
    if (isResellerOnly) {
      params.set("isResellerOnly", "true");
    }
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (customerPhone) params.set("customerPhone", customerPhone);
    const response = await api.get(`/orders?${params.toString()}`);
    return response.data;
  },
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  exportOrders: async (
    search?: string,
    processingStatus?: OrderProcessingStatus,
    paymentStatus?: PaymentStatus,
    isResellerOnly?: boolean,
    startDate?: string,
    endDate?: string,
    customerPhone?: string
  ): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (processingStatus && processingStatus !== ("ALL" as any)) {
      params.set("processingStatus", processingStatus);
    }
    if (paymentStatus && paymentStatus !== ("ALL" as any)) {
      params.set("paymentStatus", paymentStatus);
    }
    if (isResellerOnly) {
      params.set("isResellerOnly", "true");
    }
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (customerPhone) params.set("customerPhone", customerPhone);
    const response = await api.get(`/orders/export?${params.toString()}`);
    return response.data;
  },
  updateOrderStatus: async (
    orderId: string,
    data: { processingStatus?: OrderProcessingStatus; paymentStatus?: PaymentStatus }
  ): Promise<Order> => {
    const response = await api.patch(`/orders/${orderId}/status`, data);
    return response.data;
  },
  sendToCourier: async (
    orderId: string,
    data?: { deliveryType?: number; note?: string; codAmount?: number }
  ): Promise<{ message: string; order: Order; consignment: any }> => {
    const response = await api.post(`/orders/${orderId}/send-to-courier`, data || {});
    return response.data;
  },
  bulkSendToCourier: async (data: {
    orderIds: string[];
    deliveryType?: number;
  }): Promise<{
    message: string;
    succeededCount: number;
    failedCount: number;
    updatedOrders: Order[];
    failedOrders: any[];
  }> => {
    const response = await api.post("/orders/bulk-send-to-courier", data);
    return response.data;
  },
  syncCourierStatus: async (
    orderId: string
  ): Promise<{ message: string; deliveryStatus: string; order: Order }> => {
    const response = await api.post(`/orders/${orderId}/sync-courier-status`, {});
    return response.data;
  },
  getCourierBalance: async (): Promise<{ status: number; current_balance: number }> => {
    const response = await api.get("/orders/courier/balance");
    return response.data;
  },
};

