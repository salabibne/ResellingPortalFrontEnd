import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import type { SectionRenderProps } from "../types";
import SectionFrame from "../SectionFrame";
import { EmptySection, SectionHeading } from "../primitives";
import { gridClass } from "../layout";

function getSectionProducts({ section, resources }: SectionRenderProps) {
  return resources.products?.[section.id] ?? [];
}

/** "See all" link under the products; uses the section's button text/link. */
function SeeAllLink({ section }: Pick<SectionRenderProps, "section">) {
  const text = section.buttonText?.trim();
  if (!text) return null;
  return (
    <div className="mt-6 sm:mt-8 flex justify-center">
      <Link
        href={section.buttonLink || "/shop"}
        className="btn btn-outline btn-primary rounded-full px-6 sm:px-8 gap-2"
      >
        <span className="break-words">{text}</span>
        <ArrowRight size={16} />
      </Link>
    </div>
  );
}

/**
 * Shared wrapper: heading + products + "see all". On the public site an
 * empty collection renders nothing; the builder shows a hint instead.
 */
function ProductSectionShell({
  props,
  isEmpty,
  headingClass = "mb-6 sm:mb-8",
  children,
}: {
  props: SectionRenderProps;
  isEmpty: boolean;
  headingClass?: string;
  children: ReactNode;
}) {
  const { section, mode = "view" } = props;

  if (isEmpty) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <SectionHeading section={section} className={headingClass} />
        <EmptySection message="No active products for this source yet. Choose “All products” to show every uploaded product automatically." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className={headingClass} />
      {children}
      <SeeAllLink section={section} />
    </SectionFrame>
  );
}

/** Variant: grid */
export function ProductGrid(props: SectionRenderProps) {
  const products = getSectionProducts(props);

  return (
    <ProductSectionShell props={props} isEmpty={products.length === 0}>
      <div className={`grid gap-3 sm:gap-4 md:gap-6 ${gridClass(props.section.settings.columns)}`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </ProductSectionShell>
  );
}

/** Variant: carousel */
export function ProductCarousel(props: SectionRenderProps) {
  const products = getSectionProducts(props);

  return (
    <ProductSectionShell props={props} isEmpty={products.length === 0}>
      <div className="no-scrollbar flex snap-x snap-mandatory gap-3 sm:gap-4 overflow-x-auto pb-2">
        {products.map((product) => (
          <div key={product.id} className="w-40 sm:w-56 md:w-64 shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </ProductSectionShell>
  );
}

/** Variant: featured-plus-supporting */
export function FeaturedPlusSupporting(props: SectionRenderProps) {
  const products = getSectionProducts(props);
  const [featured, ...supporting] = products;

  return (
    <ProductSectionShell props={props} isEmpty={!featured}>
      {featured && (
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-1">
            <ProductCard product={featured} />
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {supporting.slice(0, 5).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </ProductSectionShell>
  );
}

/** Variant: compact-grid */
export function CompactProductGrid(props: SectionRenderProps) {
  const products = getSectionProducts(props);
  const columns = Math.min(Number(props.section.settings.columns ?? 6) + 1, 6);

  return (
    <ProductSectionShell props={props} isEmpty={products.length === 0} headingClass="mb-4 sm:mb-6">
      <div className={`grid gap-2 sm:gap-3 md:gap-4 ${gridClass(columns)}`}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </ProductSectionShell>
  );
}
