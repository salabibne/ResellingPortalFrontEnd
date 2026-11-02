import type { ChecklistItem, SectionRenderProps } from "../types";
import SectionFrame from "../SectionFrame";
import SafeImage from "../SafeImage";
import { CtaButtons, EmptySection, SectionHeading } from "../primitives";
import DynamicIcon from "../DynamicIcon";

function Checklist({
  items,
  icon,
  className = "",
}: {
  items: ChecklistItem[];
  icon?: string;
  className?: string;
}) {
  return (
    <ul className={`grid gap-2.5 ${className}`}>
      {items.map((item, index) => (
        <li
          key={index}
          className="flex items-start gap-2.5 rounded-xl border border-base-200 bg-base-100 px-3 py-2.5"
        >
          <span className="mt-0.5 shrink-0 text-primary">
            <DynamicIcon value={icon} fallback="BadgeCheck" size={18} />
          </span>
          <span className="text-xs sm:text-sm font-semibold break-words">{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

/** Variant: two-column */
export function TwoColumnChecklist({ section, mode = "view" }: SectionRenderProps) {
  const items = (section.settings.items as unknown as ChecklistItem[]) || [];

  if (items.length === 0) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <EmptySection message="Add checklist lines in the editor." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6 sm:mb-8" />
      <Checklist
        items={items}
        icon={section.settings.itemIcon as string | undefined}
        className="sm:grid-cols-2"
      />
      <CtaButtons section={section} className="mt-6" />
    </SectionFrame>
  );
}

/** Variant: with-image */
export function ImageChecklist({ section, mode = "view" }: SectionRenderProps) {
  const items = (section.settings.items as unknown as ChecklistItem[]) || [];

  if (items.length === 0 && mode !== "edit") return null;

  return (
    <SectionFrame section={section}>
      <div className="grid items-center gap-6 md:grid-cols-2 md:gap-10">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-3xl bg-base-200">
          <SafeImage
            src={section.imageUrl}
            alt={section.imageDescription || section.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <SectionHeading section={section} className="mb-5" />
          {items.length === 0 ? (
            <EmptySection message="Add checklist lines in the editor." />
          ) : (
            <Checklist items={items} icon={section.settings.itemIcon as string | undefined} />
          )}
          <CtaButtons section={section} className="mt-6" />
        </div>
      </div>
    </SectionFrame>
  );
}
