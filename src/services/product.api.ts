import api from "./axios";

export interface ProductImageDto {
  imageUrl: string;
  isPrimary?: boolean;
}

export interface CreateProductDto {
  name: string;
  categoryId: string;
  subcategoryId?: string;
  childCategoryId?: string;
  brandId: string;
  purchasePrice: number;
  oldPrice: number;
  newPrice: number;
  resellerPrice: number;
  videoUrl?: string;
  unit?: string;
  description: string;
  status?: "ACTIVE" | "PENDING" | "DEACTIVATED";
  showAsNewArrival?: boolean;
  images?: ProductImageDto[];
  colorIds?: string[];
  sizeIds?: string[];
  ageVariantIds?: string[];
  supplierName?: string;
  supplierMobile?: string;
  stockLimitAlert?: number;
}

export type UpdateProductDto = Partial<CreateProductDto>;

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  isPrimary: boolean;
}

export interface ProductColorRelation {
  id: string;
  productId: string;
  colorId: string;
  color: {
    id: string;
    name: string;
    colorCode: string;
  };
}

export interface ProductSizeRelation {
  id: string;
  productId: string;
  sizeId: string;
  size: {
    id: string;
    name: string;
  };
}

export interface ProductAgeRelation {
  id: string;
  productId: string;
  ageVariantId: string;
  ageVariant: {
    id: string;
    ageRange: string;
  };
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  subcategoryId?: string | null;
  childCategoryId?: string | null;
  brandId: string;
  purchasePrice: number;
  oldPrice: number;
  newPrice: number;
  resellerPrice: number;
  videoUrl?: string | null;
  unit?: string | null;
  description: string;
  status: "ACTIVE" | "PENDING" | "DEACTIVATED";
  showAsNewArrival: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  category?: { id: string; name: string };
  subcategory?: { id: string; name: string } | null;
  childCategory?: { id: string; name: string } | null;
  brand?: { id: string; name: string };
  images?: ProductImage[];
  colors?: ProductColorRelation[];
  sizes?: ProductSizeRelation[];
  ages?: ProductAgeRelation[];
}

export const productApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get("/products");
    return response.data;
  },
  getOne: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await api.post("/products", data);
    return response.data;
  },
  update: async (id: string, data: UpdateProductDto): Promise<Product> => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<any> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },
};
