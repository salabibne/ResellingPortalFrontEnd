import api from "./axios";

export type LegalDocumentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface LegalDocument {
  id: string;
  title: string;
  slug: string;
  content: string;
  version: string;
  isSystem: boolean;
  status: LegalDocumentStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveLegalDocumentDto {
  title: string;
  slug?: string;
  content: string;
  version: string;
  isSystem?: boolean;
  status?: LegalDocumentStatus;
}

export const legalDocumentsApi = {
  getAll: async (): Promise<LegalDocument[]> => {
    const res = await api.get("/legal-documents");
    return res.data?.data || res.data || [];
  },

  getBySlug: async (slug: string): Promise<LegalDocument> => {
    const res = await api.get(`/legal-documents/slug/${slug}`);
    return res.data?.data || res.data;
  },

  getById: async (id: string): Promise<LegalDocument> => {
    const res = await api.get(`/legal-documents/${id}`);
    return res.data?.data || res.data;
  },

  create: async (data: SaveLegalDocumentDto): Promise<LegalDocument> => {
    const res = await api.post("/legal-documents", data);
    return res.data?.data || res.data;
  },

  update: async (id: string, data: Partial<SaveLegalDocumentDto>): Promise<LegalDocument> => {
    const res = await api.patch(`/legal-documents/${id}`, data);
    return res.data?.data || res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/legal-documents/${id}`);
  },
};

export default legalDocumentsApi;
