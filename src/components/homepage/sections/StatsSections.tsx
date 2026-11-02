import type { SectionRenderProps, StatItem } from "../types";
import SectionFrame from "../SectionFrame";
import { EmptySection, SectionHeading } from "../primitives";
import DynamicIcon from "../DynamicIcon";

const STAT_GRID: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

function statGrid(columns: unknown): string {
  return STAT_GRID[Math.min(Math.max(Number(columns) || 4, 2), 4)];
}

function hasHeading(section: SectionRenderProps["section"]) {
  return Boolean(section.title || section.subtitle || section.description);
}

/** Variant: inline-row */
export function InlineStats({ section, mode = "view" }: SectionRenderProps) {
  const items = (section.settings.items as unknown as StatItem[]) || [];

  if (items.length === 0) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <EmptySection message="Add figures in the editor." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      {hasHeading(section) && (
        <SectionHeading
          section={section}
          align={(section.settings.alignment as "left" | "center" | "right") || "center"}
          className="mb-6 sm:mb-8"
        />
      )}
      <div className={`grid gap-4 sm:gap-6 ${statGrid(section.settings.columns)}`}>
        {items.map((item, index) => (
          <div key={index} className="flex flex-col items-center gap-1.5 text-center">
            <span className="mb-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <DynamicIcon value={item.icon} fallback="TrendingUp" size={22} />
            </span>
            <span className="text-2xl sm:text-3xl font-black tracking-tight break-words">
              {item.value}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-base-content/60 break-words">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}

/** Variant: cards */
export function StatCards({ section, mode = "view" }: SectionRenderProps) {
  const items = (section.settings.items as unknown as StatItem[]) || [];

  if (items.length === 0) {
    if (mode !== "edit") return null;
    return (
      <SectionFrame section={section}>
        <EmptySection message="Add figures in the editor." />
      </SectionFrame>
    );
  }

  return (
    <SectionFrame section={section}>
      {hasHeading(section) && <SectionHeading section={section} className="mb-6 sm:mb-8" />}
      <div className={`grid gap-3 sm:gap-5 ${statGrid(section.settings.columns)}`}>
        {items.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-2xl border border-base-200 bg-base-100 p-4 shadow-sm"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <DynamicIcon value={item.icon} fallback="TrendingUp" size={22} />
            </span>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-black leading-tight break-words">{item.value}</p>
              <p className="text-[11px] font-semibold text-base-content/60 break-words">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </SectionFrame>
  );
}
