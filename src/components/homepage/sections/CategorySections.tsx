import Link from "next/link";
import type { SectionRenderProps, HomepageSection, HomepageResources } from "../types";
import SectionFrame from "../SectionFrame";
import SafeImage from "../SafeImage";
import { EmptySection, SectionHeading } from "../primitives";
import { gridClass, orderByIds } from "../layout";

function listCategories(section: HomepageSection, resources: HomepageResources) {
  return orderByIds(resources.categories, section.settings.categoryIds);
}

/** Variant: circular-cards */
export function CircularCategoryCards({ section, resources }: SectionRenderProps) {
  const categories = listCategories(section, resources);

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6 sm:mb-8" />
      {categories.length === 0 ? (
        <EmptySection message="Add categories in the catalogue to populate this section." />
      ) : (
        <div className={`grid gap-4 sm:gap-6 ${gridClass(section.settings.columns)}`}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?categoryId=${category.id}`}
              className="group flex flex-col items-center gap-2 text-center focus:outline-none"
            >
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-base-200 shadow-sm group-hover:border-primary/40 transition-colors">
                <SafeImage
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-base-content/80 line-clamp-2 break-words group-hover:text-primary">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </SectionFrame>
  );
}

/** Variant: square-cards */
export function SquareCategoryCards({ section, resources }: SectionRenderProps) {
  const categories = listCategories(section, resources);

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6 sm:mb-8" />
      {categories.length === 0 ? (
        <EmptySection message="Add categories in the catalogue to populate this section." />
      ) : (
        <div className={`grid gap-3 sm:gap-5 ${gridClass(section.settings.columns)}`}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?categoryId=${category.id}`}
              className="group relative overflow-hidden rounded-2xl aspect-square bg-base-200"
            >
              <SafeImage
                src={category.imageUrl}
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                <span className="text-white font-bold text-sm sm:text-base line-clamp-2 break-words">
                  {category.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </SectionFrame>
  );
}

/** Variant: grid */
export function CategoryGrid({ section, resources }: SectionRenderProps) {
  const categories = listCategories(section, resources);

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6 sm:mb-8" />
      {categories.length === 0 ? (
        <EmptySection message="Add categories in the catalogue to populate this section." />
      ) : (
        <div className={`grid gap-3 sm:gap-5 ${gridClass(section.settings.columns)}`}>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?categoryId=${category.id}`}
              className="group block rounded-2xl border border-base-200 bg-base-100 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="aspect-[4/3] bg-base-200 overflow-hidden">
                <SafeImage
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3 sm:p-4">
                <h3 className="text-sm sm:text-base font-bold break-words group-hover:text-primary">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </SectionFrame>
  );
}

/** Variant: horizontal-scroll */
export function HorizontalCategoryScroll({ section, resources }: SectionRenderProps) {
  const categories = listCategories(section, resources);

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6 sm:mb-8" />
      {categories.length === 0 ? (
        <EmptySection message="Add categories in the catalogue to populate this section." />
      ) : (
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 sm:gap-4 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop?categoryId=${category.id}`}
              className="group w-36 sm:w-44 shrink-0 snap-start"
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-base-200">
                <SafeImage
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <span className="mt-2 block text-xs sm:text-sm font-semibold text-center line-clamp-2 break-words">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </SectionFrame>
  );
}
