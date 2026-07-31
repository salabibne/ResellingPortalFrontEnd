import api from "./axios";

export type InventoryTxType = "STOCK_IN" | "STOCK_OUT";
export type InventoryTxPurpose = "SELL" | "PURCHASE" | "RETURN" | "DAMAGE";

export interface AdjustStockDto {
  productId: string;
  productSizeId?: string;
  transactionQuantity: number;
  stockType: InventoryTxType;
  purpose: InventoryTxPurpose;
  performedBy: string;
  reference?: string;
  notes?: string;
  incomingCostPerUnit?: number;
}

export interface InventoryRecord {
  id: string;
  productId: string;
  productSizeId?: string | null;
  currentStock: number;
  costPerUnit: number;
  supplierName?: string;
  supplierMobile?: string;
  stockLimitAlert: number;
  createdAt: string;
  updatedAt: string;
  product?: { id: string; name: string };
  productSize?: {
    id: string;
    size: { id: string; name: string };
  } | null;
  transactions?: InventoryTransaction[];
}

export interface InventoryTransaction {
  id: string;
  inventoryId: string;
  transactionQuantity: number;
  stockBefore: number;
  stockAfter: number;
  stockType: InventoryTxType;
  purpose: InventoryTxPurpose;
  reference?: string | null;
  performedBy: string;
  notes?: string | null;
  createdAt: string;
  inventory?: {
    productSize?: {
      size: { id: string; name: string };
    } | null;
    product?: { id: string; name: string };
  };
}

// ─── INVENTORY MONITOR INTERFACES ──────────────────────────────────

export interface DashboardQueryDto {
  startDate?: string;
  endDate?: string;
}

export interface DashboardSummary {
  totalProducts: number;
  totalInventoryRecords: number;
  totalStockUnits: number;
  totalStockValue: string;
  lowStockCount: number;
  outOfStockCount: number;
  periodMovement: {
    totalStockIn: number;
    totalStockOut: number;
    totalPurchased: number;
    totalSold: number;
    totalReturned: number;
    totalDamaged: number;
  };
}

export interface LowStockQueryDto {
  includeOutOfStock?: boolean;
  page?: number;
  limit?: number;
}

export interface LowStockItem {
  id: string;
  productId: string;
  currentStock: number;
  stockLimitAlert: number;
  costPerUnit: number;
  supplierName?: string;
  supplierMobile?: string;
  product?: { id: string; name: string };
  productSize?: { id: string; size: { id: string; name: string } } | null;
  status: "OUT_OF_STOCK" | "LOW_STOCK";
}

export interface LowStockResponse {
  data: LowStockItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface TransactionLogQueryDto {
  inventoryId?: string;
  productId?: string;
  productSizeId?: string;
  stockType?: InventoryTxType;
  purpose?: InventoryTxPurpose;
  performedBy?: string;
  reference?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "transactionQuantity";
  sortOrder?: "asc" | "desc";
}

export interface TransactionListResponse {
  data: InventoryTransaction[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductSummaryQueryDto {
  productId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ProductSummaryItem {
  productId: string;
  productName: string;
  totalStockUnits: number;
  totalStockValue: string;
  avgCostPerUnit: string;
  sizeBreakdown: Array<{
    productSizeId: string;
    sizeName: string | null;
    currentStock: number;
    costPerUnit: number;
  }>;
  periodMovement: {
    totalPurchased: number;
    totalSold: number;
    totalReturned: number;
    totalDamaged: number;
  };
}

export interface ProductSummaryResponse {
  data: ProductSummaryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const inventoryApi = {
  adjustStock: async (data: AdjustStockDto): Promise<InventoryTransaction> => {
    const response = await api.post("/inventory/adjust", data);
    return response.data;
  },
  findByProductId: async (productId: string): Promise<InventoryRecord[]> => {
    const response = await api.get(`/inventory/product/${productId}`);
    return response.data;
  },
  getTransactionHistory: async (productId: string): Promise<InventoryTransaction[]> => {
    const response = await api.get(`/inventory/product/${productId}/transactions`);
    return response.data;
  },
  getDashboard: async (params?: DashboardQueryDto): Promise<DashboardSummary> => {
    const response = await api.get("/inventory/monitor/dashboard", { params });
    return response.data;
  },
  getLowStock: async (params?: LowStockQueryDto | number, limit = 20): Promise<LowStockResponse> => {
    let queryParams: any = {};
    if (typeof params === "number") {
      queryParams = { page: params, limit };
    } else if (params) {
      queryParams = params;
    }
    const response = await api.get("/inventory/monitor/low-stock", { params: queryParams });
    return response.data;
  },
  getTransactions: async (params?: TransactionLogQueryDto): Promise<TransactionListResponse> => {
    const response = await api.get("/inventory/monitor/transactions", { params });
    return response.data;
  },
  getProductSummary: async (params?: ProductSummaryQueryDto): Promise<ProductSummaryResponse> => {
    const response = await api.get("/inventory/monitor/product-summary", { params });
    return response.data;
  },
};
