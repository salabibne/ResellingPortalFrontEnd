import type { Product, ProductImage } from "@/services/product.api";
import type { Category } from "@/services/category.api";

export type HomepageSectionType =
  | "hero"
  | "categories"
  | "products"
  | "promotion"
  | "story"
  | "trust"
  | "testimonials"
  | "logos"
  | "faq"
  | "banner";

export type SectionAnimation =
  | "default"
  | "none"
  | "fade-up"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "zoom-out";

export interface TrustItem {
  icon?: string;
  title: string;
  description: string;
}

export interface TestimonialItem {
  name: string;
  role?: string;
  quote: string;
  rating?: number;
  imageUrl?: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface PromoCard {
  title: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  eyebrow?: string;
}

export interface SectionSettings {
  animation?: SectionAnimation;
  alignment?: "left" | "center" | "right";
  contentWidth?: "narrow" | "normal" | "wide" | "full";
  background?: string;
  textColor?: string;
  paddingTop?: number;
  paddingBottom?: number;
  imagePosition?: "left" | "right" | "top" | "background";
  mobileOrder?: "text-first" | "image-first";
  mobileImageUrl?: string;
  focalPoint?: "center" | "top" | "bottom" | "left" | "right";
  overlayOpacity?: number;
  minHeight?: number;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  secondaryButtonStyle?: "primary" | "secondary" | "outline" | "ghost";
  columns?: number;
  categoryIds?: string[];
  productIds?: string[];
  brandIds?: string[];
  productSource?: "new" | "discount" | "category" | "brand" | "manual";
  limit?: number;
  showProductCount?: boolean;
  showAddToCart?: boolean;
  grayscale?: boolean;
  items?: TrustItem[] | TestimonialItem[] | FaqItem[];
  cards?: PromoCard[];
  [key: string]: unknown;
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  variant: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  imageDescription: string;
  buttonText: string;
  buttonLink: string;
  settings: SectionSettings;
  isEnabled: boolean;
  sortOrder: number;
}

export interface BrandLogo {
  id: string;
  logoUrl: string | null;
  status?: string;
}

export interface BrandOption {
  id: string;
  name: string;
}

export interface HomepageResources {
  products: Record<string, Product[]>;
  categories: Category[];
  brands: BrandLogo[];
  productBrands?: BrandOption[];
}

export interface HomepagePage {
  id: string;
  title: string;
  slug: string;
  updatedAt?: string;
}

export interface HomepageConfig {
  page: HomepagePage;
  sections: HomepageSection[];
  resources: HomepageResources;
  hasUnpublishedChanges?: boolean;
}

export type ProductWithImages = Product & { images?: ProductImage[] };

export interface SectionRenderProps {
  section: HomepageSection;
  resources: HomepageResources;
  level?: 1 | 2;
  mode?: "view" | "edit";
  onSelect?: (id: string) => void;
  selectedId?: string | null;
  isNew?: boolean;
}
