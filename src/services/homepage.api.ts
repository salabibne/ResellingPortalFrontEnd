import api from "./axios";
import type {
  HomepageConfig,
  HomepageSection,
  HomepageSectionType,
} from "@/components/homepage/types";
import type { CustomPageSection } from "./customPages.api";

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

/** Draft-workspace calls shared by the Homepage Builder and the custom page builder. */
export interface BuilderApi {
  getAdmin: () => Promise<HomepageConfig>;
  createSection: (payload: CreateSectionPayload) => Promise<HomepageSection>;
  updateSection: (id: string, payload: UpdateSectionPayload) => Promise<HomepageSection>;
  deleteSection: (id: string) => Promise<void>;
  duplicateSection: (id: string) => Promise<HomepageSection>;
  reorder: (sectionOrders: { id: string; sortOrder: number }[]) => Promise<unknown>;
  publish: () => Promise<unknown>;
  discard: () => Promise<unknown>;
  /** Factory layout; the homepage only. */
  reset?: () => Promise<HomepageConfig>;
}

/** `base` is `/homepage` or `/page-builder/:pageId`; both expose the same routes. */
function createBuilderApi(base: string): BuilderApi {
  return {
    getAdmin: async () => (await api.get(`${base}/admin`)).data,
    createSection: async (payload) => (await api.post(`${base}/sections`, payload)).data,
    updateSection: async (id, payload) =>
      (await api.patch(`${base}/sections/${id}`, payload)).data,
    deleteSection: async (id) => {
      await api.delete(`${base}/sections/${id}`);
    },
    duplicateSection: async (id) => (await api.post(`${base}/sections/${id}/duplicate`)).data,
    reorder: async (sectionOrders) =>
      (await api.post(`${base}/sections/reorder`, { sectionOrders })).data,
    publish: async () => (await api.post(`${base}/publish`)).data,
    discard: async () => (await api.post(`${base}/discard`)).data,
  };
}

/** Builder API for one custom page. */
export function pageBuilderApi(pageId: string): BuilderApi {
  return createBuilderApi(`/page-builder/${pageId}`);
}

/** A published custom page as the storefront renders it at /pages/:slug. */
export interface PublicPageConfig extends HomepageConfig {
  page: HomepageConfig["page"] & {
    content?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    buttonTitle?: string | null;
    buttonLink?: string | null;
  };
  /** Rows from the old Custom Pages editor, shown until the page is re-published. */
  legacySections: CustomPageSection[];
}

export async function getPublicPage(slug: string): Promise<PublicPageConfig> {
  const res = await api.get(`/page-builder/public/${encodeURIComponent(slug)}`);
  return res.data;
}

export const homepageApi = {
  ...createBuilderApi("/homepage"),

  getPublic: async (): Promise<HomepageConfig> => {
    const res = await api.get("/homepage");
    return res.data;
  },

  reset: async (): Promise<HomepageConfig> => {
    const res = await api.post("/homepage/reset");
    return res.data;
  },
};

export default homepageApi;
