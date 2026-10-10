import api from "./axios";

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  subcategories?: Subcategory[];
}

export const categoryApi = {
  getAll: async (): Promise<Category[]> => {
    const response = await api.get("/categories");
    return response.data;
  },
  getOne: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
};
