import type { ComponentType } from "react";
import type { HomepageSectionType, SectionRenderProps } from "./types";
import {
  CenteredOverlayHero,
  FullWidthOverlayHero,
  MinimalCenteredHero,
  PromoCategoryHero,
  SplitHero,
} from "./sections/HeroSections";
import {
  CategoryGrid,
  CircularCategoryCards,
  HorizontalCategoryScroll,
  SquareCategoryCards,
} from "./sections/CategorySections";
import {
  CompactProductGrid,
  FeaturedPlusSupporting,
  ProductCarousel,
  ProductGrid,
} from "./sections/ProductSections";
import { BackgroundStory, CenteredStory, SplitStory } from "./sections/StorySections";
import { BannerSection } from "./sections/BannerSection";
import { PromotionBanner, PromotionCards } from "./sections/PromotionSections";
import { BenefitsRow, TrustBadges, TrustIconCards } from "./sections/TrustSections";
import {
  FeaturedTestimonial,
  TestimonialCards,
} from "./sections/TestimonialSections";
import { LogoCarousel } from "./sections/LogoSection";
import { FaqAccordion } from "./sections/FaqSection";

export interface VariantDefinition {
  id: string;
  label: string;
  description: string;
  Component: ComponentType<SectionRenderProps>;
}

export interface SectionDefinition {
  type: HomepageSectionType;
  label: string;
  category: string;
  description: string;
  defaultTitle: string;
  defaultSubtitle?: string;
  defaultDescription?: string;
  variants: VariantDefinition[];
}

export const SECTION_REGISTRY: Partial<Record<HomepageSectionType, SectionDefinition>> = {
  hero: {
    type: "hero",
    label: "Hero banner",
    category: "Hero & banners",
    description: "Headline, supporting copy and up to two call-to-action buttons.",
    defaultTitle: "Style Meets Substance",
    defaultSubtitle: "New season",
    defaultDescription: "Thoughtfully made apparel for everyday wear.",
    variants: [
      {
        id: "split-image-right",
        label: "Split · image right",
        description: "Text left, image right.",
        Component: SplitHero,
      },
      {
        id: "split-image-left",
        label: "Split · image left",
        description: "Mirrored split layout.",
        Component: SplitHero,
      },
      {
        id: "full-width-overlay",
        label: "Full-width overlay",
        description: "Edge-to-edge image with text over it.",
        Component: FullWidthOverlayHero,
      },
      {
        id: "centered-overlay",
        label: "Centered overlay",
        description: "Centered text over a background image.",
        Component: CenteredOverlayHero,
      },
      {
        id: "minimal-centered",
        label: "Minimal centered",
        description: "Quiet centered copy with a supporting image.",
        Component: MinimalCenteredHero,
      },
      {
        id: "promo-category",
        label: "Promo category",
        description: "Category-focused promotional hero.",
        Component: PromoCategoryHero,
      },
    ],
  },

  categories: {
    type: "categories",
    label: "Shop by category",
    category: "Categories",
    description: "Real categories in a card grid or scroller.",
    defaultTitle: "Shop by category",
    defaultSubtitle: "Browse",
    variants: [
      { id: "circular-cards", label: "Circular cards", description: "Round thumbnails.", Component: CircularCategoryCards },
      { id: "square-cards", label: "Square cards", description: "Square image cards.", Component: SquareCategoryCards },
      { id: "grid", label: "Standard grid", description: "Rectangular cards.", Component: CategoryGrid },
      { id: "horizontal-scroll", label: "Horizontal scroll", description: "Touch-friendly scroller.", Component: HorizontalCategoryScroll },
    ],
  },

  products: {
    type: "products",
    label: "Product collection",
    category: "Product collections",
    description: "Grid or carousel sourced from real products.",
    defaultTitle: "New arrivals",
    defaultSubtitle: "Just in",
    variants: [
      { id: "grid", label: "Product grid", description: "Responsive product cards.", Component: ProductGrid },
      { id: "carousel", label: "Product carousel", description: "Horizontal scroller.", Component: ProductCarousel },
      { id: "featured-plus-supporting", label: "Featured + supporting", description: "One lead product with a supporting row.", Component: FeaturedPlusSupporting },
      { id: "compact-grid", label: "Compact cards", description: "Denser grid for larger collections.", Component: CompactProductGrid },
    ],
  },

  story: {
    type: "story",
    label: "About / brand story",
    category: "Brand storytelling",
    description: "Image and text composition.",
    defaultTitle: "Our story",
    defaultSubtitle: "About us",
    variants: [
      { id: "image-left", label: "Image left", description: "Image left, text right.", Component: SplitStory },
      { id: "image-right", label: "Image right", description: "Text left, image right.", Component: SplitStory },
      { id: "full-width-bg", label: "Full-width background", description: "Text over a background image.", Component: BackgroundStory },
      { id: "centered", label: "Centered story", description: "Centered copy with an image below.", Component: CenteredStory },
    ],
  },

  banner: {
    type: "banner",
    label: "Custom banner",
    category: "Hero & banners",
    description: "Simple promotional banner.",
    defaultTitle: "Custom banner",
    defaultDescription: "",
    variants: [
      { id: "default", label: "Banner", description: "Centered copy on a dark gradient.", Component: BannerSection },
      { id: "image-overlay", label: "Image overlay", description: "Copy over your own image.", Component: BannerSection },
    ],
  },

  promotion: {
    type: "promotion",
    label: "Promotion",
    category: "Promotions",
    description: "Campaign cards or a full-width banner. No discounts are invented.",
    defaultTitle: "Featured offer",
    defaultSubtitle: "Limited time",
    variants: [
      { id: "full-width-banner", label: "Full-width banner", description: "Single wide campaign banner.", Component: PromotionBanner },
      { id: "two-cards", label: "Two cards", description: "Two side-by-side offer cards.", Component: PromotionCards },
      { id: "three-columns", label: "Three columns", description: "Three offer cards.", Component: PromotionCards },
      { id: "image-overlay", label: "Image overlay", description: "Text over a background image.", Component: PromotionBanner },
    ],
  },

  trust: {
    type: "trust",
    label: "Trust & benefits",
    category: "Trust & social proof",
    description: "Delivery, payment, returns and support promises you write.",
    defaultTitle: "Why shop with us",
    variants: [
      { id: "benefits-row", label: "Benefits row", description: "Compact horizontal row.", Component: BenefitsRow },
      { id: "icon-cards", label: "Icon cards", description: "A card per benefit.", Component: TrustIconCards },
      { id: "compact-badges", label: "Compact badges", description: "Small inline badges.", Component: TrustBadges },
    ],
  },

  testimonials: {
    type: "testimonials",
    label: "Testimonials",
    category: "Trust & social proof",
    description: "Customer quotes you enter. Nothing is fabricated.",
    defaultTitle: "What customers say",
    variants: [
      { id: "cards", label: "Review cards", description: "Grid of quote cards.", Component: TestimonialCards },
      { id: "featured", label: "Featured quote", description: "One highlighted quote.", Component: FeaturedTestimonial },
    ],
  },

  logos: {
    type: "logos",
    label: "Brand logos",
    category: "Trust & social proof",
    description: "Uses the existing CMS brand logos.",
    defaultTitle: "Brands we carry",
    variants: [
      { id: "carousel", label: "Logo row", description: "Scrolling row of brand logos.", Component: LogoCarousel },
    ],
  },

  faq: {
    type: "faq",
    label: "FAQ",
    category: "Informational content",
    description: "Question and answer accordion.",
    defaultTitle: "Frequently asked questions",
    variants: [
      { id: "accordion", label: "Accordion", description: "Collapsible question list.", Component: FaqAccordion },
    ],
  },
};

export const SECTION_DEFINITIONS = Object.values(SECTION_REGISTRY).filter(
  (definition): definition is SectionDefinition => Boolean(definition),
);

export function getSectionDefinition(
  type: HomepageSectionType,
): SectionDefinition | undefined {
  return SECTION_REGISTRY[type];
}

export function resolveSectionComponent(
  type: HomepageSectionType,
  variant: string,
): { Component: ComponentType<SectionRenderProps>; label: string } | null {
  const definition = SECTION_REGISTRY[type];
  if (!definition) return null;
  const match =
    definition.variants.find((entry) => entry.id === variant) || definition.variants[0];
  return { Component: match.Component, label: match.label };
}
