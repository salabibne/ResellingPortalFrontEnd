import api from "./axios";

export type NoticeAudience = "ALL" | "PUBLIC" | "RESELLER";
export type CommonStatus = "ACTIVE" | "DEACTIVATED" | "PENDING";

export interface NoticeModal {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  targetAudience: NoticeAudience;
  status: CommonStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveNoticeModalDto {
  title: string;
  content: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  targetAudience?: NoticeAudience;
  status?: CommonStatus;
  startDate?: string;
  endDate?: string;
}

export const noticeApi = {
  getActive: async (audience?: NoticeAudience): Promise<NoticeModal | null> => {
    try {
      const res = await api.get("/cms/notices/active", {
        params: audience ? { audience } : {},
      });
      return res.data?.data || res.data || null;
    } catch {
      return null;
    }
  },

  getAll: async (): Promise<NoticeModal[]> => {
    const res = await api.get("/cms/notices");
    return res.data?.data || res.data || [];
  },

  getById: async (id: string): Promise<NoticeModal> => {
    const res = await api.get(`/cms/notices/${id}`);
    return res.data?.data || res.data;
  },

  create: async (data: SaveNoticeModalDto): Promise<NoticeModal> => {
    const res = await api.post("/cms/notices", data);
    return res.data?.data || res.data;
  },

  update: async (id: string, data: Partial<SaveNoticeModalDto>): Promise<NoticeModal> => {
    const res = await api.patch(`/cms/notices/${id}`, data);
    return res.data?.data || res.data;
  },

  toggleStatus: async (id: string): Promise<NoticeModal> => {
    const res = await api.patch(`/cms/notices/${id}/toggle`);
    return res.data?.data || res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/cms/notices/${id}`);
  },
};

export default noticeApi;
