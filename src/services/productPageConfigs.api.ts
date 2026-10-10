import api from "./axios";

export interface ProductPageSection {
  id?: string;
  productPageConfigId?: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  images?: string[];
  imageDescription?: string;
  buttonText?: string;
  buttonLink?: string;
  productIds?: string[];
  sortOrder: number;
  content?: Record<string, any>;
}

export interface ProductPageConfig {
  id: string;
  productId: string;
  customTitle?: string;
  customDescription?: string;
  bannerImageUrl?: string;
  videoUrl?: string;
  showReviews: boolean;
  showFaq: boolean;
  showRelatedItems: boolean;
  isLandingPage: boolean;
  metaTitle?: string;
  metaDescription?: string;
  sections?: ProductPageSection[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveProductPageConfigDto {
  productId: string;
  customTitle?: string;
  customDescription?: string;
  bannerImageUrl?: string;
  videoUrl?: string;
  showReviews?: boolean;
  showFaq?: boolean;
  showRelatedItems?: boolean;
  isLandingPage?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  sections?: Partial<ProductPageSection>[];
}

export const productPageConfigsApi = {
  getByProductId: async (productId: string): Promise<ProductPageConfig | null> => {
    try {
      const res = await api.get(`/product-page-configs/product/${productId}`);
      return res.data?.data || res.data || null;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw err;
    }
  },

  create: async (data: SaveProductPageConfigDto): Promise<ProductPageConfig> => {
    const res = await api.post("/product-page-configs", data);
    return res.data?.data || res.data;
  },

  update: async (id: string, data: Partial<SaveProductPageConfigDto>): Promise<ProductPageConfig> => {
    const res = await api.patch(`/product-page-configs/${id}`, data);
    return res.data?.data || res.data;
  },
};

export default productPageConfigsApi;
