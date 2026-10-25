import type { SectionRenderProps, TrustItem } from "../types";
import SectionFrame from "../SectionFrame";
import { EmptySection, SectionHeading } from "../primitives";
import { gridClass } from "../layout";
import { TrustIcon } from "../icons";

/** Variant: benefits-row */
export function BenefitsRow({ section, mode = "view" }: SectionRenderProps) {
  const items = (section.settings.items as unknown as TrustItem[]) || [];

  if (items.length === 0) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <EmptySection message="Add benefit items in the editor." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} align={(section.settings.alignment as "left" | "center" | "right") || "center"} className="mb-6" />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((item, index) => (
          <div key={index} className="flex items-start gap-2 rounded-xl bg-base-200/60 p-3">
            <span className="shrink-0 rounded-full bg-primary/10 p-1.5 text-primary">
              <TrustIcon name={item.icon} size={16} />
            </span>
            <div className="min-w-0">
              <h3 className="text-xs font-bold break-words">{item.title}</h3>
              {item.description && (
                <p className="mt-0.5 text-[10px] leading-snug text-base-content/60 break-words">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}

/** Variant: icon-cards */
export function TrustIconCards({ section, mode = "view" }: SectionRenderProps) {
  const items = (section.settings.items as unknown as TrustItem[]) || [];
  const columns = Number(section.settings.columns ?? 4);

  if (items.length === 0) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <EmptySection message="Add benefit items in the editor." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6 sm:mb-8" />
      <div className={`grid gap-3 sm:gap-5 ${gridClass(columns)}`}>
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col items-start gap-2 rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm"
          >
            <span className="rounded-xl bg-primary/10 p-2 text-primary">
              <TrustIcon name={item.icon} size={20} />
            </span>
            <h3 className="text-sm font-extrabold break-words">{item.title}</h3>
            {item.description && (
              <p className="text-[11px] leading-relaxed text-base-content/65 break-words">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}

/** Variant: compact-badges */
export function TrustBadges({ section, mode = "view" }: SectionRenderProps) {
  const items = (section.settings.items as unknown as TrustItem[]) || [];

  if (items.length === 0) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <EmptySection message="Add benefit items in the editor." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {items.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1.5 rounded-full border border-base-200 bg-base-100 px-3 py-1.5 text-[11px] font-bold"
          >
            <span className="text-primary">
              <TrustIcon name={item.icon} size={13} />
            </span>
            {item.title}
          </span>
        ))}
      </div>
    </SectionFrame>
  );
}
