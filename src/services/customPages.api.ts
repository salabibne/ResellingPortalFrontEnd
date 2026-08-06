import api from "./axios";

export type CustomPageStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface CustomPageSection {
  id?: string;
  customPageId?: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  buttonText?: string;
  buttonLink?: string;
  sortOrder: number;
  content?: Record<string, any> | string;
}

export interface CustomPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  status: CustomPageStatus;
  isSystem?: boolean;
  buttonTitle?: string;
  buttonLink?: string;
  createdAt?: string;
  updatedAt?: string;
  sections?: CustomPageSection[];
  _count?: {
    sections: number;
  };
}

export interface GetCustomPagesParams {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreateCustomPageDto {
  title: string;
  slug?: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  status?: CustomPageStatus;
  buttonTitle?: string;
  buttonLink?: string;
  sections?: Partial<CustomPageSection>[];
}

export const customPagesApi = {
  getAll: async (params?: GetCustomPagesParams): Promise<CustomPage[]> => {
    const res = await api.get("/custom-pages", { params });
    return res.data?.data || res.data || [];
  },

  getBySlug: async (slug: string): Promise<CustomPage> => {
    const res = await api.get(`/custom-pages/slug/${slug}`);
    return res.data?.data || res.data;
  },

  getById: async (id: string): Promise<CustomPage> => {
    const res = await api.get(`/custom-pages/${id}`);
    return res.data?.data || res.data;
  },

  create: async (data: CreateCustomPageDto): Promise<CustomPage> => {
    const res = await api.post("/custom-pages", data);
    return res.data?.data || res.data;
  },

  update: async (id: string, data: Partial<CreateCustomPageDto>): Promise<CustomPage> => {
    const res = await api.patch(`/custom-pages/${id}`, data);
    return res.data?.data || res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/custom-pages/${id}`);
  },

  // Section Endpoints
  addSection: async (pageId: string, section: Partial<CustomPageSection>): Promise<CustomPageSection> => {
    const res = await api.post(`/custom-pages/${pageId}/sections`, section);
    return res.data?.data || res.data;
  },

  updateSection: async (sectionId: string, section: Partial<CustomPageSection>): Promise<CustomPageSection> => {
    const res = await api.patch(`/custom-pages/sections/${sectionId}`, section);
    return res.data?.data || res.data;
  },

  deleteSection: async (sectionId: string): Promise<void> => {
    await api.delete(`/custom-pages/sections/${sectionId}`);
  },

  reorderSections: async (pageId: string, sectionOrders: { id: string; sortOrder: number }[]): Promise<any> => {
    const res = await api.post(`/custom-pages/${pageId}/sections/reorder`, { sectionOrders });
    return res.data?.data || res.data;
  },
};

export default customPagesApi;
