import type { SectionRenderProps, StepItem } from "../types";
import SectionFrame from "../SectionFrame";
import { CtaButtons, EmptySection, SectionHeading } from "../primitives";
import DynamicIcon from "../DynamicIcon";

const STEP_GRID: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

const TIMELINE_GRID: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
};

function columnsOf(section: SectionRenderProps["section"]): number {
  return Math.min(Math.max(Number(section.settings.columns) || 4, 2), 4);
}

function stepNumber(index: number) {
  return String(index + 1).padStart(2, "0");
}

function readSteps({ section, mode = "view" }: SectionRenderProps) {
  const items = (section.settings.items as unknown as StepItem[]) || [];
  const empty =
    items.length === 0 ? (
      mode === "edit" ? (
        <SectionFrame section={section}>
          <EmptySection message="Add steps in the editor." />
        </SectionFrame>
      ) : null
    ) : undefined;
  return { items, empty };
}

/** Variant: numbered-cards */
export function NumberedSteps(props: SectionRenderProps) {
  const { section } = props;
  const { items, empty } = readSteps(props);
  if (empty !== undefined) return empty;
  const align = (section.settings.alignment as "left" | "center" | "right") || "center";

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} align={align} className="mb-6 sm:mb-10" />
      <ol className={`grid grid-cols-1 gap-4 sm:gap-5 ${STEP_GRID[columnsOf(section)]}`}>
        {items.map((item, index) => (
          <li
            key={index}
            className="relative flex flex-col items-center gap-2 rounded-2xl border border-base-200 bg-base-100 p-5 pt-6 text-center shadow-sm"
          >
            <span className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-black text-primary">
              {stepNumber(index)}
            </span>
            <span className="mb-1 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <DynamicIcon value={item.icon} fallback="CircleCheckBig" size={28} />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold break-words">{item.title}</h3>
            {item.description && (
              <p className="text-[11px] sm:text-xs leading-relaxed text-base-content/65 break-words">
                {item.description}
              </p>
            )}
          </li>
        ))}
      </ol>
      <CtaButtons section={section} className="mt-8 justify-center" />
    </SectionFrame>
  );
}

/** Variant: timeline — horizontal on large screens, vertical on phones. */
export function TimelineSteps(props: SectionRenderProps) {
  const { section } = props;
  const { items, empty } = readSteps(props);
  if (empty !== undefined) return empty;
  const align = (section.settings.alignment as "left" | "center" | "right") || "center";

  return (
    <SectionFrame section={section}>
      <SectionHeading section={section} align={align} className="mb-8 sm:mb-12" />
      <ol className={`grid grid-cols-1 gap-8 ${TIMELINE_GRID[columnsOf(section)]}`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="relative flex gap-4 lg:flex-col lg:items-center lg:text-center">
              {!isLast && (
                <>
                  <span
                    className="absolute left-7 top-14 -bottom-8 w-0.5 bg-primary/20 lg:hidden"
                    aria-hidden="true"
                  />
                  <span
                    className="absolute left-1/2 top-7 hidden h-0.5 w-full bg-primary/20 lg:block"
                    aria-hidden="true"
                  />
                </>
              )}
              <span className="relative z-10 inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-md ring-4 ring-base-100">
                <DynamicIcon value={item.icon} fallback="CircleCheckBig" size={26} />
              </span>
              <div className="min-w-0 pt-1 lg:pt-0">
                <p className="text-[10px] font-black uppercase tracking-wider text-primary">
                  Step {index + 1}
                </p>
                <h3 className="mt-0.5 text-sm sm:text-base font-extrabold break-words">{item.title}</h3>
                {item.description && (
                  <p className="mt-1 text-[11px] sm:text-xs leading-relaxed text-base-content/65 break-words">
                    {item.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <CtaButtons section={section} className="mt-10 justify-center" />
    </SectionFrame>
  );
}
