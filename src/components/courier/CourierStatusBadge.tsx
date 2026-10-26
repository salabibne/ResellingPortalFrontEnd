type BadgeTone = {
  label: string;
  className: string;
};

const STATUS_TONES: Record<string, BadgeTone> = {
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

interface CourierStatusBadgeProps {
  status?: string | null;
  className?: string;
}

export default function CourierStatusBadge({
  status,
  className = "",
}: CourierStatusBadgeProps) {
  if (!status) {
    return (
      <span
        className={`badge badge-ghost text-slate-500 text-[11px] font-bold uppercase whitespace-nowrap h-auto py-1 px-2 ${className}`}
      >
        Awaiting Update
      </span>
    );
  }

  const normalized = status.toLowerCase().trim().replace(/\s+/g, "_");
  const tone = STATUS_TONES[normalized];
  const label = tone?.label || "Awaiting Update";

  return (
    <span
      title={status}
      className={`badge text-[11px] font-bold uppercase whitespace-nowrap h-auto py-1 px-2 gap-1 ${
        tone?.className || "badge-neutral text-white"
      } ${className}`}
    >
      {label}
    </span>
  );
}
