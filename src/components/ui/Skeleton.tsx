export function BlockSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-base-200 ${className}`} />;
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="space-y-2">
          <BlockSkeleton className="aspect-[4/5] w-full" />
          <BlockSkeleton className="h-3 w-3/4" />
          <BlockSkeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
