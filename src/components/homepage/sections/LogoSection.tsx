import type { SectionRenderProps } from "../types";
import SectionFrame from "../SectionFrame";
import SafeImage from "../SafeImage";
import { EmptySection, SectionHeading } from "../primitives";

/** Variant: carousel (uses CMS brand logos) */
export function LogoCarousel({ section, resources, mode = "view" }: SectionRenderProps) {
  const limit = Math.min(Math.max(Number(section.settings.limit ?? 12), 1), 24);
  const grayscale = section.settings.grayscale !== false;
  const brands = (resources.brands || []).filter((brand) => brand.logoUrl).slice(0, limit);

  if (brands.length === 0) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <EmptySection message="Add brand logos in the CMS to populate this row." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-5" />
      <div className="no-scrollbar flex items-center gap-6 overflow-x-auto pb-2 sm:justify-center sm:gap-10">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className={`h-12 w-24 shrink-0 sm:h-14 sm:w-28 ${
              grayscale ? "opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0" : ""
            }`}
          >
            <SafeImage
              src={brand.logoUrl || undefined}
              alt="Brand logo"
              className="h-full w-full object-contain"
            />
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}
