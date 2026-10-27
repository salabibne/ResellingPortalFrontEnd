import api from "./axios";

export type PaymentMethod = "CASH_ON_DELIVERY" | "BKASH" | "NAGAD" | "BANK_TRANSFER";
export type PaymentStatus = "DUE" | "PAID" | "PARTIAL" | "CANCELLED";
/** Internal status kept by the backend; never shown — the courier status is the order status. */
export type OrderProcessingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

/** Order status filter values: courier status groups (see CourierStatusBadge). */
export type OrderStatusFilter =
  | "ALL"
  | "ORDER_PLACED"
  | "PENDING"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "PARTIAL"
  | "CANCELLED";

export interface OrderStatusSummary {
  total: number;
  ORDER_PLACED: number;
  PENDING: number;
  IN_TRANSIT: number;
  DELIVERED: number;
  PARTIAL: number;
  CANCELLED: number;
}

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
  processingStatus?: OrderProcessingStatus;
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
  courierTrackingLink?: string | null;
  courierCodAmount?: number | null;
  courierBookingState?: string | null;
  courierReturnRequestId?: number | null;
  courierReturnStatus?: string | null;
  courierReturnReason?: string | null;
  courierReturnRequestedAt?: string | null;
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
  orderPlacedOrders: number;
  pendingOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
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

export interface CourierPickup {
  id: string;
  provider: string;
  addressId?: number | null;
  policeStationId?: number | null;
  address: string;
  contactNumber: string;
  note?: string | null;
  estimQty?: number | null;
  status?: string | null;
  providerResponse?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CourierReturnRequest {
  id: number | string;
  consignment_id?: number | string | null;
  invoice?: string | null;
  reason?: string | null;
  status: string;
  created_at?: string | null;
  updated_at?: string | null;
  [key: string]: any;
}

export interface CourierPayment {
  id: number | string;
  amount: number | string;
  created_at?: string | null;
  updated_at?: string | null;
  consignments?: any[];
  [key: string]: any;
}

export interface PoliceStation {
  id: number | string;
  name: string;
  district?: string;
  [key: string]: any;
}

export interface CourierTrackingEvent {
  text: string;
  created_at: string;
  tracking_type?: number;
}

export interface CourierTrackResult {
  identifier: string;
  matchedBy: "cid" | "tracking" | "invoice" | string;
  matchedIdentifier?: string;
  orderId?: string;
  orderRef?: string | null;
  customerName?: string | null;
  customerPhone?: string | null;
  consignmentId?: string | null;
  trackingCode?: string | null;
  trackingLink?: string | null;
  deliveryStatus: string;
  persistedCourierStatus?: string | null;
  lastSyncedAt?: string | null;
  returnStatus?: string | null;
  returnReason?: string | null;
  returnRequestedAt?: string | null;
  trackingEvents: CourierTrackingEvent[];
}

export interface CourierAuthStatus {
  preferredSource: "env" | "database" | null;
  envConfigured: boolean;
  databaseConfigured: boolean;
  pingOk?: boolean;
  pingError?: string;
  balanceOk: boolean;
  balanceError?: string;
}

export interface PublicTrackingResult {
  orderRef: string | null;
  /** Courier status, or "order_placed" when not yet booked. */
  status: string;
  paymentStatus: PaymentStatus;
  courierStatus: string | null;
  courierTrackingLink: string | null;
  courierSubmittedAt: string | null;
  courierLastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  trackOrder: async (code: string): Promise<PublicTrackingResult> => {
    const response = await api.get(`/orders/track/${encodeURIComponent(code)}`);
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
    courierStatus?: OrderStatusFilter,
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
    if (courierStatus && courierStatus !== "ALL") {
      params.set("courierStatus", courierStatus);
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
  getCourierShipments: async (
    params: {
      page?: number;
      limit?: number;
      search?: string;
      courierStatus?: string;
      consignmentId?: string;
      shipmentState?: string;
      startDate?: string;
      endDate?: string;
      customerPhone?: string;
    } = {}
  ): Promise<OrderListResponse> => {
    const query = new URLSearchParams();
    query.set("page", (params.page ?? 1).toString());
    query.set("limit", (params.limit ?? 20).toString());
    if (params.search) query.set("search", params.search);
    if (params.courierStatus && params.courierStatus !== "ALL") {
      query.set("courierStatus", params.courierStatus);
    }
    if (params.consignmentId) query.set("consignmentId", params.consignmentId);
    if (params.shipmentState) query.set("shipmentState", params.shipmentState);
    if (params.startDate) query.set("startDate", params.startDate);
    if (params.endDate) query.set("endDate", params.endDate);
    if (params.customerPhone) query.set("customerPhone", params.customerPhone);
    const response = await api.get(`/orders/courier/shipments?${query.toString()}`);
    return response.data;
  },
  createCourierPickup: async (data: {
    address: string;
    contactNumber: string;
    policeStationId?: number;
    addressId?: number;
    estimQty?: number;
    note?: string;
  }): Promise<{
    message: string;
    pickup: CourierPickup;
    providerResponse: any;
  }> => {
    const response = await api.post("/orders/courier/pickups", data);
    return response.data;
  },
  getCourierPickups: async (
    page = 1,
    limit = 20
  ): Promise<{
    data: CourierPickup[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> => {
    const response = await api.get(
      `/orders/courier/pickups?page=${page}&limit=${limit}`
    );
    return response.data;
  },
  getPoliceStations: async (): Promise<{
    data: PoliceStation[];
    meta?: any;
    raw?: any;
  }> => {
    const response = await api.get("/orders/courier/police-stations");
    return response.data;
  },
  createCourierReturn: async (data: {
    orderId: string;
    reason?: string;
  }): Promise<{ message: string; returnRequest: any; order: Order }> => {
    const response = await api.post("/orders/courier/returns", data);
    return response.data;
  },
  getCourierReturns: async (
    page = 1
  ): Promise<{
    data: CourierReturnRequest[];
    meta?: any;
    raw?: any;
  }> => {
    const response = await api.get(`/orders/courier/returns?page=${page}`);
    return response.data;
  },
  getCourierReturn: async (id: string | number): Promise<any> => {
    const response = await api.get(`/orders/courier/returns/${id}`);
    return response.data;
  },
  getCourierPayments: async (
    page = 1
  ): Promise<{
    data: CourierPayment[];
    meta?: any;
    raw?: any;
  }> => {
    const response = await api.get(`/orders/courier/payments?page=${page}`);
    return response.data;
  },
  getCourierPayment: async (id: string | number): Promise<any> => {
    const response = await api.get(`/orders/courier/payments/${id}`);
    return response.data;
  },
  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
  exportOrders: async (
    search?: string,
    courierStatus?: OrderStatusFilter,
    paymentStatus?: PaymentStatus,
    isResellerOnly?: boolean,
    startDate?: string,
    endDate?: string,
    customerPhone?: string
  ): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (courierStatus && courierStatus !== "ALL") {
      params.set("courierStatus", courierStatus);
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
  updatePaymentStatus: async (
    orderId: string,
    data: { paymentStatus: PaymentStatus }
  ): Promise<Order> => {
    const response = await api.patch(`/orders/${orderId}/status`, data);
    return response.data;
  },
  /** Cancel an order not yet booked with the courier. Stock is restored manually. */
  cancelOrder: async (orderId: string): Promise<Order> => {
    const response = await api.patch(`/orders/${orderId}/cancel`, {});
    return response.data;
  },
  getStatusSummary: async (isResellerOnly?: boolean): Promise<OrderStatusSummary> => {
    const response = await api.get(
      `/orders/status-summary${isResellerOnly ? "?isResellerOnly=true" : ""}`
    );
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
  syncAllCourierOrders: async (): Promise<{
    message: string;
    totalChecked: number;
    syncedCount: number;
    failedCount: number;
  }> => {
    const response = await api.post("/orders/sync-all-courier", {});
    return response.data;
  },
  getOrderTrackingHistory: async (
    orderId: string
  ): Promise<{
    orderId: string;
    orderRef?: string;
    courierStatus?: string;
    courierTrackingCode?: string;
    courierConsignmentId?: string;
    courierSubmittedAt?: string;
    courierLastSyncedAt?: string;
    trackingEvents: Array<{
      consignment_id: number;
      tracking_type: number;
      text: string;
      created_at: string;
    }>;
  }> => {
    const response = await api.get(`/orders/${orderId}/courier-tracking`);
    return response.data;
  },
  checkCustomerFraud: async (
    phone: string
  ): Promise<{
    status: number;
    phone: string;
    delivery_ratio?: number | null;
    cancellation_ratio?: number | null;
    volume_band?: string | null;
    volume_range?: string | null;
    delivered_count?: number | null;
    cancelled_count?: number | null;
    total_reports?: number;
    fraud_categories?: Record<string, number>;
  }> => {
    const response = await api.get(`/orders/fraud-check/${encodeURIComponent(phone)}`);
    return response.data;
  },
  trackCourierParcel: async (identifier: string): Promise<CourierTrackResult> => {
    const response = await api.get(
      `/orders/courier/track?identifier=${encodeURIComponent(identifier)}`
    );
    return response.data;
  },
  getCourierAuthStatus: async (): Promise<CourierAuthStatus> => {
    const response = await api.get("/orders/courier/auth-status");
    return response.data;
  },
  getCourierBalance: async (): Promise<{
    status: number;
    current_balance: number;
    error?: string;
  }> => {
    const response = await api.get("/orders/courier/balance");
    return response.data;
  },
};



