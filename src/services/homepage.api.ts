import api from "./axios";
import type {
  HomepageConfig,
  HomepageSection,
  HomepageSectionType,
} from "@/components/homepage/types";

export interface CreateSectionPayload {
  type: HomepageSectionType;
  variant?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  imageDescription?: string;
  buttonText?: string;
  buttonLink?: string;
  settings?: Record<string, unknown>;
  isEnabled?: boolean;
}

export type UpdateSectionPayload = Partial<Omit<CreateSectionPayload, "type">> & {
  settings?: Record<string, unknown>;
};

export const homepageApi = {
  getPublic: async (): Promise<HomepageConfig> => {
    const res = await api.get("/homepage");
    return res.data;
  },

  getAdmin: async (): Promise<HomepageConfig> => {
    const res = await api.get("/homepage/admin");
    return res.data;
  },

  createSection: async (payload: CreateSectionPayload): Promise<HomepageSection> => {
    const res = await api.post("/homepage/sections", payload);
    return res.data;
  },

  updateSection: async (
    id: string,
    payload: UpdateSectionPayload,
  ): Promise<HomepageSection> => {
    const res = await api.patch(`/homepage/sections/${id}`, payload);
    return res.data;
  },

  deleteSection: async (id: string): Promise<void> => {
    await api.delete(`/homepage/sections/${id}`);
  },

  duplicateSection: async (id: string): Promise<HomepageSection> => {
    const res = await api.post(`/homepage/sections/${id}/duplicate`);
    return res.data;
  },

  reorder: async (sectionOrders: { id: string; sortOrder: number }[]) => {
    const res = await api.post("/homepage/sections/reorder", { sectionOrders });
    return res.data;
  },

  publish: async () => {
    const res = await api.post("/homepage/publish");
    return res.data;
  },

  discard: async () => {
    const res = await api.post("/homepage/discard");
    return res.data;
  },

  reset: async (): Promise<HomepageConfig> => {
    const res = await api.post("/homepage/reset");
    return res.data;
  },
};

export default homepageApi;
