interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

/** One status -> one colour, shared by admin and reseller. */
const STATUS_STYLES: Record<string, string> = {
  PENDING: "badge-warning",
  PROCESSING: "badge-info",
  IN_REVIEW: "badge-info",
  APPROVED: "badge-success",
  PAID: "badge-success",
  COMPLETED: "badge-success",
  DELIVERED: "badge-success",
  ACTIVE: "badge-success",
  RESOLVED: "badge-success",
  CONFIRMED: "badge-success",
  SHIPPED: "badge-info",
  IN_TRANSIT: "badge-info",
  OUT_FOR_DELIVERY: "badge-info",
  OPEN: "badge-warning",
  ANSWERED: "badge-info",
  PARTIALLY_SHIPPED: "badge-warning",
  REJECTED: "badge-error",
  CANCELLED: "badge-error",
  FAILED: "badge-error",
  CLOSED: "badge-neutral",
  DRAFT: "badge-ghost",
  DISABLED: "badge-ghost",
  INACTIVE: "badge-ghost",
};

function humanise(status: string): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default function StatusBadge({ status, label, className = "" }: StatusBadgeProps) {
  const key = (status || "").toUpperCase().replace(/\s+/g, "_");
  const colour = STATUS_STYLES[key] ?? "badge-ghost";
  return (
    <span className={`badge badge-sm font-semibold ${colour} ${className}`}>
      {label ?? humanise(key || "unknown")}
    </span>
  );
}
