import PanelSkeleton from "@/components/panel/PanelSkeleton";

export default function Loading() {
  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 pb-12">
      <div className="flex flex-col gap-2">
        <div className="skeleton h-8 w-64 rounded-lg" />
        <div className="skeleton h-4 w-40 rounded-lg" />
      </div>
      <PanelSkeleton variant="table" rows={6} />
    </div>
  );
}
