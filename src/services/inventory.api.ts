import api from "./axios";

export const inventoryApi = {
  adjustStock: async (data: any) => {
    const response = await api.post("/inventory/adjust", data);
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
  getTransactions: async (params: any) => {
    const response = await api.get("/inventory/monitor/transactions", { params });
    return response.data;
  },
  getProductSummary: async (params: any) => {
    const response = await api.get("/inventory/monitor/product-summary", { params });
    return response.data;
  }
};
