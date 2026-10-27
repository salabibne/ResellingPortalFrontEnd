type BadgeTone = {
  label: string;
  className: string;
};

/**
 * The courier (Steadfast) status is the only order status shown in the app.
 * An order not yet booked with the courier has no status and shows "Order Placed".
 */
export const ORDER_PLACED_LABEL = "Order Placed";

export const STATUS_TONES: Record<string, BadgeTone> = {
  order_placed: {
    label: ORDER_PLACED_LABEL,
    className: "badge-ghost text-slate-600 border border-slate-300",
  },
  delivered: {
    label: "Delivered",
    className: "badge-success text-white",
  },
  partial_delivered: {
    label: "Partial Delivered",
    className: "badge-warning text-base-content border border-amber-400",
  },
  partial_delivered_return_received: {
    label: "Partial Delivered · Return Received",
    className: "badge-warning text-base-content border border-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "badge-error text-white",
  },
  cancelled_return_received: {
    label: "Cancelled · Return Received",
    className: "badge-error text-white border border-red-300",
  },
  cancelled_return_proccessing: {
    label: "Cancelled · Return In Progress",
    className: "badge-error text-white",
  },
  cancelled_return_processing: {
    label: "Cancelled · Return In Progress",
    className: "badge-error text-white",
  },
  cancelled_return_rider_assigned: {
    label: "Cancelled · Return Rider Assigned",
    className: "badge-error text-white",
  },
  partial_delivered_return_proccessing: {
    label: "Partial · Return In Progress",
    className: "badge-warning text-base-content",
  },
  partial_delivered_return_processing: {
    label: "Partial · Return In Progress",
    className: "badge-warning text-base-content",
  },
  partial_delivered_return_rider_assigned: {
    label: "Partial · Return Rider Assigned",
    className: "badge-warning text-base-content",
  },
  in_review: {
    label: "In Review",
    className: "badge-warning text-base-content",
  },
  pending: {
    label: "Pending",
    className: "badge-info text-white",
  },
  in_transit: {
    label: "In Transit",
    className: "badge-info text-white",
  },
  hold: {
    label: "On Hold",
    className: "badge-warning text-white",
  },
  delivered_approval_pending: {
    label: "Delivered · Approval Pending",
    className: "badge-info text-white",
  },
  partial_delivered_approval_pending: {
    label: "Partial Delivered · Approval Pending",
    className: "badge-warning text-base-content",
  },
  cancelled_approval_pending: {
    label: "Cancelled · Approval Pending",
    className: "badge-warning text-base-content",
  },
  unknown_approval_pending: {
    label: "Unknown · Approval Pending",
    className: "badge-neutral text-white",
  },
  exceptional: {
    label: "Exceptional",
    className: "badge-error text-white",
  },
  unknown: {
    label: "Awaiting Update",
    className: "badge-neutral text-white",
  },
};

function normalizeStatus(status?: string | null): string {
  if (!status) return "order_placed";
  return status.toLowerCase().trim().replace(/\s+/g, "_");
}

/** Human label for a courier status; used by badges and CSV exports alike. */
export function courierStatusLabel(status?: string | null): string {
  const normalized = normalizeStatus(status);
  return STATUS_TONES[normalized]?.label || "Awaiting Update";
}

export type CourierStatusGroup =
  | "ORDER_PLACED"
  | "PENDING"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "PARTIAL"
  | "CANCELLED";

/** Filter options shared by the admin and reseller order lists. */
export const COURIER_STATUS_FILTERS: { value: "ALL" | CourierStatusGroup; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "ORDER_PLACED", label: ORDER_PLACED_LABEL },
  { value: "PENDING", label: "Pending" },
  { value: "IN_TRANSIT", label: "In Transit" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "PARTIAL", label: "Partial Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

/** Mirrors courierGroupOf in the backend's courier-status.util.ts. */
export function courierGroupOf(status?: string | null): CourierStatusGroup {
  const s = normalizeStatus(status);
  if (s === "order_placed") return "ORDER_PLACED";
  if (s.startsWith("cancelled") && s !== "cancelled_approval_pending") return "CANCELLED";
  if (s.startsWith("partial_delivered") && s !== "partial_delivered_approval_pending") return "PARTIAL";
  if (s === "delivered") return "DELIVERED";
  if (s === "pending" || s === "in_review") return "PENDING";
  return "IN_TRANSIT";
}

/** Reseller profit counts as earned once the parcel is delivered and paid. */
export function isProfitEarned(order: {
  courierStatus?: string | null;
  paymentStatus?: string | null;
}): boolean {
  const group = courierGroupOf(order.courierStatus);
  return (
    (group === "DELIVERED" || group === "PARTIAL") &&
    (order.paymentStatus === "PAID" || order.paymentStatus === "PARTIAL")
  );
}

interface CourierStatusBadgeProps {
  status?: string | null;
  className?: string;
}

export default function CourierStatusBadge({
  status,
  className = "",
}: CourierStatusBadgeProps) {
  const normalized = normalizeStatus(status);
  const tone = STATUS_TONES[normalized];
  const label = tone?.label || "Awaiting Update";

  return (
    <span
      title={status || ORDER_PLACED_LABEL}
      className={`badge text-[11px] font-bold uppercase whitespace-nowrap h-auto py-1 px-2 gap-1 ${
        tone?.className || "badge-neutral text-white"
      } ${className}`}
    >
      {label}
    </span>
  );
}
