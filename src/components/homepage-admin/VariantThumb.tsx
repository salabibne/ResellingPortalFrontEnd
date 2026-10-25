import type { HomepageSectionType } from "@/components/homepage/types";

interface VariantThumbProps {
  type: HomepageSectionType;
  variant: string;
  className?: string;
}

const bar = "rounded-sm bg-base-content/25";
const block = "rounded bg-base-content/15";

function Line({ width = "w-3/4" }: { width?: string }) {
  return <div className={`h-1.5 ${width} ${bar}`} />;
}

/**
 * Tiny CSS wireframe used in the variant selector and section library.
 * No image assets required and every variant looks different.
 */
export default function VariantThumb({ type, variant, className = "" }: VariantThumbProps) {
  const body = (() => {
    if (type === "hero") {
      if (variant === "split-image-right" || variant === "split-image-left") {
        const imageFirst = variant === "split-image-left";
        return (
          <div className="flex h-full items-center gap-1.5">
            <div className={`flex flex-1 flex-col gap-1 ${imageFirst ? "order-2" : ""}`}>
              <Line width="w-full" />
              <Line width="w-2/3" />
              <div className={`mt-1 h-2 w-1/2 rounded-full bg-primary/60 ${imageFirst ? "ml-auto" : ""}`} />
            </div>
            <div className={`h-full flex-1 ${block} ${imageFirst ? "order-1" : ""}`} />
          </div>
        );
      }
      if (variant === "full-width-overlay" || variant === "centered-overlay") {
        return (
          <div
            className={`flex h-full flex-col justify-center gap-1 ${
              variant === "centered-overlay" ? "items-center" : "items-start px-2"
            }`}
          >
            <Line width="w-2/3" />
            <Line width="w-1/2" />
            <div className="mt-1 h-2 w-1/3 rounded-full bg-primary/70" />
          </div>
        );
      }
      if (variant === "minimal-centered") {
        return (
          <div className="flex h-full flex-col items-center gap-1">
            <Line width="w-2/3" />
            <Line width="w-1/2" />
            <div className={`mt-1 h-1/3 w-4/5 ${block}`} />
          </div>
        );
      }
      return (
        <div className="flex h-full items-stretch gap-1.5">
          <div className="flex flex-1 flex-col justify-center gap-1">
            <Line width="w-full" />
            <Line width="w-3/4" />
            <div className="mt-1 h-2 w-1/2 rounded-full bg-primary/60" />
          </div>
          <div className={`w-1/3 ${block}`} />
        </div>
      );
    }

    if (type === "categories") {
      if (variant === "circular-cards") {
        return (
          <div className="flex h-full items-center justify-around">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="h-6 w-6 rounded-full bg-base-content/20" />
                <Line width="w-5" />
              </div>
            ))}
          </div>
        );
      }
      if (variant === "square-cards") {
        return (
          <div className="grid h-full grid-cols-4 items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square rounded bg-base-content/20" />
            ))}
          </div>
        );
      }
      if (variant === "horizontal-scroll") {
        return (
          <div className="flex h-full items-center gap-1 overflow-hidden">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-3/4 w-1/5 shrink-0 rounded bg-base-content/15" />
            ))}
          </div>
        );
      }
      return (
        <div className="grid h-full grid-cols-3 grid-rows-2 gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={`${block}`} />
          ))}
        </div>
      );
    }

    if (type === "products") {
      if (variant === "carousel") {
        return (
          <div className="flex h-full items-center gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex h-full w-1/4 shrink-0 flex-col gap-1">
                <div className="flex-1 rounded bg-base-content/15" />
                <Line width="w-full" />
              </div>
            ))}
          </div>
        );
      }
      if (variant === "featured-plus-supporting") {
        return (
          <div className="flex h-full gap-1">
            <div className="w-1/2 rounded bg-base-content/20" />
            <div className="grid flex-1 grid-cols-2 gap-1">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded bg-base-content/12" />
              ))}
            </div>
          </div>
        );
      }
      if (variant === "compact-grid") {
        return (
          <div className="grid h-full grid-cols-6 gap-0.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
              <div key={i} className="rounded-sm bg-base-content/12" />
            ))}
          </div>
        );
      }
      return (
        <div className="grid h-full grid-cols-4 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-1">
              <div className="flex-1 rounded bg-base-content/15" />
              <Line width="w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (type === "story") {
      if (variant === "full-width-bg") {
        return (
          <div className="flex h-full flex-col items-center justify-center gap-1">
            <Line width="w-2/3" />
            <Line width="w-1/2" />
            <Line width="w-2/5" />
          </div>
        );
      }
      if (variant === "centered") {
        return (
          <div className="flex h-full flex-col items-center justify-center gap-1">
            <Line width="w-2/3" />
            <Line width="w-1/2" />
            <div className="mt-1 h-1/3 w-4/5 rounded bg-base-content/15" />
          </div>
        );
      }
      const imageRight = variant === "image-right";
      return (
        <div className="flex h-full items-center gap-1.5">
          <div className={`flex flex-1 flex-col gap-1 ${imageRight ? "order-2" : ""}`}>
            <Line width="w-full" />
            <Line width="w-2/3" />
            <Line width="w-1/2" />
          </div>
          <div className={`h-full flex-1 rounded bg-base-content/20 ${imageRight ? "order-1" : ""}`} />
        </div>
      );
    }

    if (type === "promotion") {
      if (variant === "three-columns") {
        return (
          <div className="grid h-full grid-cols-3 gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded bg-base-content/15" />
            ))}
          </div>
        );
      }
      if (variant === "two-cards") {
        return (
          <div className="grid h-full grid-cols-2 gap-1">
            {[0, 1].map((i) => (
              <div key={i} className="rounded bg-base-content/15" />
            ))}
          </div>
        );
      }
      return <div className="h-full rounded bg-base-content/20" />;
    }

    if (type === "trust") {
      return (
        <div className="flex h-full items-center justify-around gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1 rounded bg-base-content/10 p-1">
              <div className="h-3 w-3 rounded-full bg-base-content/25" />
              <Line width="w-full" />
            </div>
          ))}
        </div>
      );
    }

    if (type === "testimonials") {
      return (
        <div className={`grid h-full gap-1 ${variant === "featured" ? "grid-cols-1" : "grid-cols-3"}`}>
          {(variant === "featured" ? [0] : [0, 1, 2]).map((i) => (
            <div key={i} className="flex flex-col justify-center gap-1 rounded bg-base-content/10 p-1">
              <Line width="w-full" />
              <Line width="w-3/4" />
              <div className="h-1.5 w-1/3 rounded-full bg-primary/50" />
            </div>
          ))}
        </div>
      );
    }

    if (type === "faq") {
      return (
        <div className="flex h-full flex-col justify-center gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-1/4 rounded border border-base-content/15" />
          ))}
        </div>
      );
    }

    if (type === "logos") {
      return (
        <div className="flex h-full items-center justify-around">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-1/6 rounded bg-base-content/20" />
          ))}
        </div>
      );
    }

    return <div className="h-full rounded bg-base-content/20" />;
  })();

  return (
    <div className={`h-16 w-full rounded-lg border border-base-300 bg-base-100 p-1.5 ${className}`}>
      {body}
    </div>
  );
}
