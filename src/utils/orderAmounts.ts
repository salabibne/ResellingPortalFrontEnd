import type { Order, OrderItem } from "@/services/order.api";

/**
 * Default cash-on-delivery amount for an order, mirroring the backend's
 * `calculateCodAmount` (order.service.ts). Used by the admin order drawer and
 * the printable invoice so both always show the same figure.
 */
export function calculateDefaultCod(order: Order): number {
  if (order.paymentStatus === "PAID") return 0;

  let cod = Number(order.total || 0);
  if (order.isResellerOrder && order.resellerSellPrice) {
    cod = Number(order.resellerSellPrice) + Number(order.courierCharge || 0);
  }
  if (order.isAdvanceCourierPaid && order.advanceCourierAmount) {
    cod -= Number(order.advanceCourierAmount);
  }
  return Math.max(0, Math.round(cod));
}

/**
 * Amount the courier must collect from the customer: the figure actually sent
 * to the courier when the parcel was booked, otherwise the default.
 */
export function getCodToCollect(order: Order): number {
  if (order.courierCodAmount !== null && order.courierCodAmount !== undefined) {
    return Math.max(0, Math.round(Number(order.courierCodAmount)));
  }
  return calculateDefaultCod(order);
}

/** Price the end customer pays per unit (never the wholesale cost for reseller orders). */
export function getCustomerUnitPrice(order: Order, item: OrderItem): number {
  if (order.isResellerOrder) {
    return Number(item.resellerSellingPrice ?? item.resellerUnitCost ?? item.snapshotPrice ?? 0);
  }
  return Number(item.snapshotPrice ?? 0);
}

/** Opens the printable invoice / parcel sticker for an order in a new tab. */
export function openOrderInvoice(orderId: string, autoPrint = true) {
  if (typeof window === "undefined") return;
  window.open(`/invoice/${orderId}${autoPrint ? "?print=1" : ""}`, "_blank", "noopener");
}
