import api from "./axios";

export const productApi = {
  getAll: async () => {
    const response = await api.get("/products");
    return response.data;
  },
  getOne: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (data: any) => {
    const response = await api.post("/products", data);
    return response.data;
  },
  update: async (id: string, data: any) => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  }
};
