import { create } from "zustand";
import { categoryApi, Category } from "@/services/category.api";

interface CategoryState {
  categories: Category[];
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (id: string | null) => void;
  setSelectedSubcategory: (id: string | null) => void;
  resetFilters: () => void;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  selectedCategoryId: null,
  selectedSubcategoryId: null,
  loading: false,
  error: null,

  fetchCategories: async () => {
    if (get().loading) return;
    set({ loading: true, error: null });
    try {
      const data = await categoryApi.getAll();
      set({ categories: data, loading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message || "Failed to load categories",
        loading: false,
      });
    }
  },

  setSelectedCategory: (id: string | null) => {
    set({ selectedCategoryId: id, selectedSubcategoryId: null });
  },

  setSelectedSubcategory: (id: string | null) => {
    set({ selectedSubcategoryId: id });
  },

  resetFilters: () => {
    set({ selectedCategoryId: null, selectedSubcategoryId: null });
  },
}));
