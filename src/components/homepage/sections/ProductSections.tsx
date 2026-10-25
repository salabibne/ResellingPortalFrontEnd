import ProductCard from "@/components/ProductCard";
import type { SectionRenderProps } from "../types";
import SectionFrame from "../SectionFrame";
import { EmptySection, SectionHeading } from "../primitives";
import { gridClass } from "../layout";

function getSectionProducts({ section, resources }: SectionRenderProps) {
  return resources.products?.[section.id] ?? [];
}

/** Variant: grid */
export function ProductGrid(props: SectionRenderProps) {
  const products = getSectionProducts(props);

  return (
    <SectionFrame section={props.section}>
      <SectionHeading section={props.section} className="mb-6 sm:mb-8" />
      {products.length === 0 ? (
        <EmptySection message="No products match this collection source yet." />
      ) : (
        <div className={`grid gap-3 sm:gap-4 md:gap-6 ${gridClass(props.section.settings.columns)}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </SectionFrame>
  );
}

/** Variant: carousel */
export function ProductCarousel(props: SectionRenderProps) {
  const products = getSectionProducts(props);

  return (
    <SectionFrame section={props.section}>
      <SectionHeading section={props.section} className="mb-6 sm:mb-8" />
      {products.length === 0 ? (
        <EmptySection message="No products match this collection source yet." />
      ) : (
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 sm:gap-4 overflow-x-auto pb-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="w-40 sm:w-56 md:w-64 shrink-0 snap-start"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </SectionFrame>
  );
}

/** Variant: featured-plus-supporting */
export function FeaturedPlusSupporting(props: SectionRenderProps) {
  const products = getSectionProducts(props);
  const [featured, ...supporting] = products;

  return (
    <SectionFrame section={props.section}>
      <SectionHeading section={props.section} className="mb-6 sm:mb-8" />
      {!featured ? (
        <EmptySection message="No products match this collection source yet." />
      ) : (
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
    </SectionFrame>
  );
}

/** Variant: compact-grid */
export function CompactProductGrid(props: SectionRenderProps) {
  const products = getSectionProducts(props);
  const columns = Math.min(Number(props.section.settings.columns ?? 6) + 1, 6);

  return (
    <SectionFrame section={props.section}>
      <SectionHeading section={props.section} className="mb-4 sm:mb-6" />
      {products.length === 0 ? (
        <EmptySection message="No products match this collection source yet." />
      ) : (
        <div className={`grid gap-2 sm:gap-3 md:gap-4 ${gridClass(columns)}`}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </SectionFrame>
  );
}
