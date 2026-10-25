export default function Spinner({
  label,
  size = "lg",
}: {
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-6" role="status">
      <span className={`loading loading-spinner loading-${size} text-primary`} />
      {label && <p className="text-[11px] font-semibold text-base-content/60">{label}</p>}
    </div>
  );
}
