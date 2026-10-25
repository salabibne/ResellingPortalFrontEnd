import { ChevronDown } from "lucide-react";
import type { FaqItem, SectionRenderProps } from "../types";
import SectionFrame from "../SectionFrame";
import { EmptySection, SectionHeading } from "../primitives";

/** Variant: accordion */
export function FaqAccordion({ section, mode = "view" }: SectionRenderProps) {
  const items = (section.settings.items as unknown as FaqItem[]) || [];

  if (items.length === 0) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <EmptySection message="Add questions and answers in the editor." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} className="mb-6" />
      <div className="mx-auto max-w-3xl divide-y divide-base-200 rounded-2xl border border-base-200 bg-base-100">
        {items.map((item, index) => (
          <details key={index} className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs sm:text-sm font-bold">
              <span className="break-words">{item.question}</span>
              <ChevronDown
                size={16}
                className="shrink-0 text-base-content/40 transition-transform group-open:rotate-180"
              />
            </summary>
            <p className="mt-2 text-[11px] sm:text-xs leading-relaxed text-base-content/70 whitespace-pre-line break-words">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </SectionFrame>
  );
}
