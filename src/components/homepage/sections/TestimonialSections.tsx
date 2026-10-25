import { Star } from "lucide-react";
import type { SectionRenderProps, TestimonialItem } from "../types";
import SectionFrame from "../SectionFrame";
import SafeImage from "../SafeImage";
import { EmptySection, SectionHeading } from "../primitives";
import { gridClass } from "../layout";

function Stars({ rating }: { rating?: number }) {
  if (!rating) return null;
  return (
    <div className="flex items-center gap-0.5 text-amber-500" aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          size={12}
          fill={index < rating ? "currentColor" : "none"}
          className={index < rating ? "" : "opacity-30"}
        />
      ))}
    </div>
  );
}

function Author({ item }: { item: TestimonialItem }) {
  return (
    <div className="flex items-center gap-2">
      {item.imageUrl ? (
        <div className="h-8 w-8 overflow-hidden rounded-full bg-base-200">
          <SafeImage src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-black text-primary">
          {item.name?.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-bold">{item.name}</p>
        {item.role && (
          <p className="truncate text-[10px] text-base-content/50">{item.role}</p>
        )}
      </div>
    </div>
  );
}

/** Variant: cards */
export function TestimonialCards({ section, mode = "view" }: SectionRenderProps) {
  const items = (section.settings.items as unknown as TestimonialItem[]) || [];
  const columns = Number(section.settings.columns ?? 3);

  if (items.length === 0) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <EmptySection message="Add real customer quotes in the editor." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6 sm:mb-8" />
      <div className={`grid gap-3 sm:gap-5 ${gridClass(columns)}`}>
        {items.map((item, index) => (
          <figure
            key={index}
            className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm"
          >
            <blockquote className="text-[12px] leading-relaxed text-base-content/80 break-words">
              “{item.quote}”
            </blockquote>
            <figcaption className="flex items-center justify-between gap-2 border-t border-base-200 pt-3">
              <Author item={item} />
              <Stars rating={item.rating} />
            </figcaption>
          </figure>
        ))}
      </div>
    </SectionFrame>
  );
}

/** Variant: featured */
export function FeaturedTestimonial({ section, mode = "view" }: SectionRenderProps) {
  const items = (section.settings.items as unknown as TestimonialItem[]) || [];
  const [featured, ...rest] = items;

  if (!featured) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <EmptySection message="Add a real customer quote in the editor." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6 sm:mb-8" />
      <figure className="mx-auto max-w-3xl rounded-3xl border border-base-200 bg-base-100 p-6 text-center shadow-sm sm:p-10">
        <Stars rating={featured.rating} />
        <blockquote className="mt-3 text-sm sm:text-lg leading-relaxed text-base-content/85 break-words">
          “{featured.quote}”
        </blockquote>
        <figcaption className="mt-4 flex flex-col items-center gap-1">
          <span className="text-sm font-extrabold">{featured.name}</span>
          {featured.role && <span className="text-[11px] text-base-content/50">{featured.role}</span>}
        </figcaption>
      </figure>

      {rest.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {rest.slice(0, 3).map((item, index) => (
            <figure key={index} className="rounded-2xl border border-base-200 bg-base-100 p-3">
              <blockquote className="text-[11px] leading-relaxed text-base-content/70 line-clamp-4">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-2">
                <Author item={item} />
              </figcaption>
            </figure>
          ))}
        </div>
      )}
    </SectionFrame>
  );
}
