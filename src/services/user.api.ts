import api from "./axios";

export const userApi = {
  getUsers: async (params?: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await api.get("/users", { params });
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/users/${id}/status`, { status });
    return response.data;
  },
  updateRole: async (id: string, role: string) => {
    const response = await api.patch(`/users/${id}/role`, { role });
    return response.data;
  },
};
