import api from "./axios";

export const authApi = {
  login: async (credentials: any) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },
  register: async (userData: any) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },
  refresh: async (refreshToken: string) => {
    const response = await api.post("/auth/refresh", { refreshToken });
    return response.data;
  }
};
