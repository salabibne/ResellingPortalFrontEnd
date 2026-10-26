type PanelSkeletonVariant = "table" | "cards" | "form";

interface PanelSkeletonProps {
  rows?: number;
  variant?: PanelSkeletonVariant;
  className?: string;
}

export default function PanelSkeleton({
  rows = 5,
  variant = "table",
  className = "",
}: PanelSkeletonProps) {
  if (variant === "form") {
    return (
      <div className={`bg-base-100 rounded-2xl border border-base-200 shadow-sm p-4 sm:p-6 ${className}`}>
        <div className="flex flex-col gap-4">
          {Array.from({ length: rows }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="skeleton h-3 w-28 rounded-lg" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
          ))}
          <div className="skeleton h-10 w-32 rounded-xl self-end" />
        </div>
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-4 sm:p-6"
          >
            <div className="skeleton h-28 w-full rounded-xl" />
            <div className="skeleton h-4 w-3/4 rounded-lg mt-4" />
            <div className="skeleton h-4 w-1/2 rounded-lg mt-2" />
            <div className="skeleton h-9 w-full rounded-xl mt-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`overflow-hidden rounded-2xl border border-base-200 bg-base-100 p-4 ${className}`}
    >
      <div className="flex flex-col gap-3">
        <div className="skeleton h-8 w-full rounded-lg" />
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="skeleton h-11 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
