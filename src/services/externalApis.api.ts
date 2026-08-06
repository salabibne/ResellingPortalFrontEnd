import api from "./axios";

export type IntegrationStatus = "ACTIVE" | "DEACTIVATED" | "PENDING";

export interface ExternalApiIntegration {
  id: string;
  apiName: string;
  apiUrl: string;
  credentials: string; // JSON string or object
  description?: string;
  status: IntegrationStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveExternalApiDto {
  apiName: string;
  apiUrl: string;
  credentials: string;
  description?: string;
  status?: IntegrationStatus;
}

export interface TestApiResponse {
  success: boolean;
  latencyMs: number;
  status: string;
  error?: string;
}

export const externalApisApi = {
  getAll: async (): Promise<ExternalApiIntegration[]> => {
    const res = await api.get("/external-apis");
    return res.data?.data || res.data || [];
  },

  create: async (data: SaveExternalApiDto): Promise<ExternalApiIntegration> => {
    const res = await api.post("/external-apis", data);
    return res.data?.data || res.data;
  },

  update: async (id: string, data: Partial<SaveExternalApiDto>): Promise<ExternalApiIntegration> => {
    const res = await api.patch(`/external-apis/${id}`, data);
    return res.data?.data || res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/external-apis/${id}`);
  },

  testConnection: async (id: string): Promise<TestApiResponse> => {
    const res = await api.post(`/external-apis/${id}/test`);
    return res.data?.data || res.data;
  },
};

export default externalApisApi;
