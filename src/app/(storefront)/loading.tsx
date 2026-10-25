import { BlockSkeleton, CardGridSkeleton } from "@/components/ui/Skeleton";

export default function StorefrontLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <div className="space-y-3">
        <BlockSkeleton className="h-4 w-24" />
        <BlockSkeleton className="h-10 w-2/3" />
        <BlockSkeleton className="h-4 w-1/2" />
      </div>
      <BlockSkeleton className="h-56 w-full rounded-3xl sm:h-80" />
      <CardGridSkeleton />
    </div>
  );
}
