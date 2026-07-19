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
  getDashboard: async () => {
    const response = await api.get("/inventory/monitor/dashboard");
    return response.data;
  },
  getLowStock: async (page = 1, limit = 20) => {
    const response = await api.get(`/inventory/monitor/low-stock?page=${page}&limit=${limit}`);
    return response.data;
  },
  getTransactions: async (params?: any) => {
    const response = await api.get("/inventory/monitor/transactions", { params });
    return response.data;
  },
  getProductSummary: async (params?: any) => {
    const response = await api.get("/inventory/monitor/product-summary", { params });
    return response.data;
  },
};
