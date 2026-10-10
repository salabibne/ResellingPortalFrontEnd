import { Order } from "@/services/order.api";
import { Product } from "@/services/product.api";
import {
  InventoryTransaction,
  LowStockItem,
  ProductSummaryItem,
} from "@/services/inventory.api";

function escapeCSVField(val: string | number | boolean | null | undefined): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  // Replace double quotes with escaped double quotes ("")
  const escaped = str.replace(/"/g, '""');
  // Enclose in double quotes
  return `"${escaped}"`;
}

function formatDateTimeAMPM(dateStr?: string | Date | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, "0");

  return `${year}-${month}-${day} ${strHours}:${minutes}:${seconds} ${ampm}`;
}

function downloadCSVBlob(csvContent: string, filenamePrefix: string) {
  // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel & Google Sheets correctly parse symbols (like ৳) and encoding
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().slice(0, 10);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filenamePrefix}_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ─── 1. ORDERS CSV EXPORT ───────────────────────────────────────────
export function exportOrdersToCSV(orders: Order[], filenamePrefix: string = "orders_export") {
  const headers = [
    "Order Ref",
    "Order Type",
    "Customer Name",
    "Customer Phone",
    "Customer Secondary Phone",
    "Customer District",
    "Customer Thana",
    "Shipping Address",
    "Reseller Name",
    "Reseller Phone",
    "Reseller Email",
    "Reseller Page Name",
    "Order Date",
    "Processing Status",
    "Payment Status",
    "Products (Qty)",
    "Total Quantity",
    "Subtotal",
    "Courier Charge",
    "Advance Courier Paid",
    "Discount",
    "Total Bill",
    "Reseller Profit Margin",
  ];

  const rows = orders.map((ord) => {
    const isReseller = ord.isResellerOrder || ord.customer?.role === "RESELLER";
    const orderRef = ord.orderRef || `#${ord.id.substring(0, 8).toUpperCase()}`;
    const orderType = isReseller ? "Reseller Order" : "Direct Customer";

    // End Customer Info
    const customerName = ord.customerName || ord.customer?.name || "";
    const customerPhone = ord.customerPhone || ord.customer?.phone || "";
    const customerSecondaryPhone = ord.customerSecondaryPhone || "";
    const customerDistrict = ord.customerDistrict || "";
    const customerThana = ord.customerThana || "";
    const shippingAddress = ord.shippingAddress || "";

    // Reseller Info
    const resellerName = ord.reseller?.name || (isReseller ? ord.customer?.name || "" : "");
    const resellerPhone = ord.reseller?.phone || (isReseller ? ord.customer?.phone || "" : "");
    const resellerEmail = ord.reseller?.email || (isReseller ? ord.customer?.email || "" : "");
    const resellerPageName = ord.reseller?.pageName || (isReseller ? ord.customer?.pageName || "" : "");

    // Dates & Status
    const orderDate = formatDateTimeAMPM(ord.createdAt);
    const processingStatus = ord.processingStatus || "";
    const paymentStatus = ord.paymentStatus || "";

    // Products & Quantity Info
    const productsSummary = (ord.orderItems || [])
      .map((item) => {
        const prodName = item.product?.name || "Product";
        const size = item.productSize?.size?.name ? ` [Size: ${item.productSize.size.name}]` : "";
        const color = item.productColor?.color?.name ? ` [Color: ${item.productColor.color.name}]` : "";
        return `${prodName}${size}${color} (Qty: ${item.quantity})`;
      })
      .join(" | ");
    const totalQuantity = (ord.orderItems || []).reduce((sum, i) => sum + Number(i.quantity || 0), 0);

    // Financial Breakdown
    const subtotal = isReseller ? ord.resellerSellPrice ?? ord.total ?? 0 : ord.subtotal ?? ord.total ?? 0;
    const courierCharge = ord.courierCharge ?? 0;
    const advanceCourierStatus = ord.isAdvanceCourierPaid
      ? `Yes (Adv ৳${ord.advanceCourierAmount || 0})`
      : "No";
    const discount = ord.discount ?? 0;
    const totalBill = isReseller
      ? Number(subtotal) + (ord.isAdvanceCourierPaid ? 0 : Number(courierCharge))
      : ord.total ?? 0;
    const resellerProfit = ord.resellerProfit ?? 0;

    return [
      escapeCSVField(orderRef),
      escapeCSVField(orderType),
      escapeCSVField(customerName),
      escapeCSVField(customerPhone),
      escapeCSVField(customerSecondaryPhone),
      escapeCSVField(customerDistrict),
      escapeCSVField(customerThana),
      escapeCSVField(shippingAddress),
      escapeCSVField(resellerName),
      escapeCSVField(resellerPhone),
      escapeCSVField(resellerEmail),
      escapeCSVField(resellerPageName),
      escapeCSVField(orderDate),
      escapeCSVField(processingStatus),
      escapeCSVField(paymentStatus),
      escapeCSVField(productsSummary),
      escapeCSVField(totalQuantity),
      escapeCSVField(subtotal),
      escapeCSVField(courierCharge),
      escapeCSVField(advanceCourierStatus),
      escapeCSVField(discount),
      escapeCSVField(totalBill),
      escapeCSVField(resellerProfit),
    ].join(",");
  });

  const csvContent = [headers.map(escapeCSVField).join(","), ...rows].join("\n");
  downloadCSVBlob(csvContent, filenamePrefix);
}

// ─── 2. MASTER INVENTORY STOCK CSV EXPORT (22 COLUMNS) ───────────────
export function exportInventoryStockToCSV(
  products: Product[],
  filenamePrefix: string = "master_inventory_stock"
) {
  const headers = [
    "Product ID / Code",
    "Product Name",
    "Category",
    "Subcategory",
    "Brand",
    "Size Variant",
    "Current Stock (Units)",
    "Unit Type",
    "Stock Status",
    "Stock Alert Threshold",
    "Reorder Deficit (Units)",
    "Purchase Cost (৳)",
    "Wholesale / Reseller Price (৳)",
    "Retail Selling Price (৳)",
    "Profit Margin per Unit (৳)",
    "Profit Margin %",
    "Total Stock Valuation at Cost (৳)",
    "Total Potential Retail Value (৳)",
    "Total Potential Gross Profit (৳)",
    "Supplier Name",
    "Supplier Phone",
    "Product Status",
  ];

  const rows: string[] = [];

  for (const prod of products) {
    const prodCode = `#${prod.id.substring(0, 8).toUpperCase()}`;
    const prodName = prod.name || "";
    const category = prod.category?.name || "Uncategorized";
    const subcategory = prod.subcategory?.name || "—";
    const brand = prod.brand?.name || "—";
    const unitType = prod.unit || "piece";
    const purchaseCost = Number(prod.purchasePrice || 0);
    const resellerPrice = Number(prod.resellerPrice || 0);
    const retailPrice = Number(prod.newPrice || 0);
    const unitMargin = Math.max(0, retailPrice - purchaseCost);
    const marginPercent = retailPrice > 0 ? ((unitMargin / retailPrice) * 100).toFixed(1) + "%" : "0.0%";
    const productStatus = prod.status || "ACTIVE";

    const inventories = prod.inventories || [];

    if (inventories.length === 0) {
      // Single row if no specific size inventory rows exists
      const currentStock = 0;
      const alertLimit = 10;
      const stockStatus = "OUT OF STOCK";
      const deficit = alertLimit;
      const totalCostValuation = (currentStock * purchaseCost).toFixed(2);
      const totalRetailValuation = (currentStock * retailPrice).toFixed(2);
      const totalGrossProfit = (currentStock * unitMargin).toFixed(2);

      rows.push(
        [
          escapeCSVField(prodCode),
          escapeCSVField(prodName),
          escapeCSVField(category),
          escapeCSVField(subcategory),
          escapeCSVField(brand),
          escapeCSVField("Standard / All Sizes"),
          escapeCSVField(currentStock),
          escapeCSVField(unitType),
          escapeCSVField(stockStatus),
          escapeCSVField(alertLimit),
          escapeCSVField(deficit),
          escapeCSVField(purchaseCost.toFixed(2)),
          escapeCSVField(resellerPrice.toFixed(2)),
          escapeCSVField(retailPrice.toFixed(2)),
          escapeCSVField(unitMargin.toFixed(2)),
          escapeCSVField(marginPercent),
          escapeCSVField(totalCostValuation),
          escapeCSVField(totalRetailValuation),
          escapeCSVField(totalGrossProfit),
          escapeCSVField("—"),
          escapeCSVField("—"),
          escapeCSVField(productStatus),
        ].join(",")
      );
    } else {
      // Row per variant inventory record
      for (const inv of inventories) {
        const matchingSizeRel = prod.sizes?.find((s) => s.id === inv.productSizeId || s.sizeId === inv.productSizeId);
        const sizeName = matchingSizeRel?.size?.name || (inv.productSizeId ? "Size Variant" : "All Sizes");
        const currentStock = Number(inv.currentStock || 0);
        const alertLimit = Number(inv.stockLimitAlert || 10);
        const unitCost = Number(inv.costPerUnit || purchaseCost);
        const invUnitMargin = Math.max(0, retailPrice - unitCost);
        const invMarginPercent = retailPrice > 0 ? ((invUnitMargin / retailPrice) * 100).toFixed(1) + "%" : "0.0%";

        let stockStatus = "IN STOCK";
        let deficit = 0;
        if (currentStock === 0) {
          stockStatus = "OUT OF STOCK";
          deficit = alertLimit;
        } else if (currentStock <= alertLimit) {
          stockStatus = "LOW STOCK";
          deficit = alertLimit - currentStock;
        }

        const totalCostValuation = (currentStock * unitCost).toFixed(2);
        const totalRetailValuation = (currentStock * retailPrice).toFixed(2);
        const totalGrossProfit = (currentStock * invUnitMargin).toFixed(2);
        const supplierName = inv.supplierName || "—";
        const supplierMobile = inv.supplierMobile || "—";

        rows.push(
          [
            escapeCSVField(prodCode),
            escapeCSVField(prodName),
            escapeCSVField(category),
            escapeCSVField(subcategory),
            escapeCSVField(brand),
            escapeCSVField(sizeName),
            escapeCSVField(currentStock),
            escapeCSVField(unitType),
            escapeCSVField(stockStatus),
            escapeCSVField(alertLimit),
            escapeCSVField(deficit),
            escapeCSVField(unitCost.toFixed(2)),
            escapeCSVField(resellerPrice.toFixed(2)),
            escapeCSVField(retailPrice.toFixed(2)),
            escapeCSVField(invUnitMargin.toFixed(2)),
            escapeCSVField(invMarginPercent),
            escapeCSVField(totalCostValuation),
            escapeCSVField(totalRetailValuation),
            escapeCSVField(totalGrossProfit),
            escapeCSVField(supplierName),
            escapeCSVField(supplierMobile),
            escapeCSVField(productStatus),
          ].join(",")
        );
      }
    }
  }

  const csvContent = [headers.map(escapeCSVField).join(","), ...rows].join("\n");
  downloadCSVBlob(csvContent, filenamePrefix);
}

// ─── 3. STOCK MOVEMENT AUDIT LOG (TRANSACTIONS CSV) ──────────────────
export function exportInventoryTransactionsToCSV(
  transactions: InventoryTransaction[],
  filenamePrefix: string = "inventory_movement_audit"
) {
  const headers = [
    "Transaction Ref",
    "Date & Time",
    "Product Name",
    "Size Variant",
    "Movement Type",
    "Movement Purpose",
    "Quantity Changed",
    "Stock Before",
    "Stock After",
    "Performed By",
    "Reference / Invoice",
    "Notes",
  ];

  const rows = transactions.map((tx) => {
    const txRef = `#TX-${tx.id.substring(0, 8).toUpperCase()}`;
    const dateStr = formatDateTimeAMPM(tx.createdAt);
    const prodName = tx.inventory?.product?.name || "Product";
    const sizeName = tx.inventory?.productSize?.size?.name || "All Sizes";
    const stockType = tx.stockType === "STOCK_IN" ? "STOCK IN (+)" : "STOCK OUT (-)";
    const purpose = tx.purpose || "";
    const qty = tx.transactionQuantity || 0;
    const before = tx.stockBefore ?? "—";
    const after = tx.stockAfter ?? "—";
    const performedBy = tx.performedBy || "System / Admin";
    const ref = tx.reference || "—";
    const notes = tx.notes || "—";

    return [
      escapeCSVField(txRef),
      escapeCSVField(dateStr),
      escapeCSVField(prodName),
      escapeCSVField(sizeName),
      escapeCSVField(stockType),
      escapeCSVField(purpose),
      escapeCSVField(qty),
      escapeCSVField(before),
      escapeCSVField(after),
      escapeCSVField(performedBy),
      escapeCSVField(ref),
      escapeCSVField(notes),
    ].join(",");
  });

  const csvContent = [headers.map(escapeCSVField).join(","), ...rows].join("\n");
  downloadCSVBlob(csvContent, filenamePrefix);
}

// ─── 4. LOW STOCK & REORDER REPORT CSV ──────────────────────────────
export function exportLowStockAlertsToCSV(
  items: LowStockItem[],
  filenamePrefix: string = "low_stock_reorder_sheet"
) {
  const headers = [
    "Product Code",
    "Product Name",
    "Size Variant",
    "Current Stock (Units)",
    "Stock Alert Threshold",
    "Shortage Deficit (Units)",
    "Unit Purchase Cost (৳)",
    "Estimated Reorder Budget (৳)",
    "Alert Severity",
    "Supplier Name",
    "Supplier Mobile",
  ];

  const rows = items.map((item) => {
    const prodCode = `#${(item.productId || item.id).substring(0, 8).toUpperCase()}`;
    const prodName = item.product?.name || "Product";
    const sizeName = item.productSize?.size?.name || "All Sizes";
    const currentStock = Number(item.currentStock || 0);
    const alertLimit = Number(item.stockLimitAlert || 10);
    const deficit = Math.max(0, alertLimit - currentStock);
    const cost = Number(item.costPerUnit || item.product?.purchasePrice || 0);
    const estimatedBudget = (deficit * cost).toFixed(2);
    const severity = currentStock === 0 ? "CRITICAL (OUT OF STOCK)" : "LOW STOCK WARNING";
    const supplierName = item.supplierName || "—";
    const supplierMobile = item.supplierMobile || "—";

    return [
      escapeCSVField(prodCode),
      escapeCSVField(prodName),
      escapeCSVField(sizeName),
      escapeCSVField(currentStock),
      escapeCSVField(alertLimit),
      escapeCSVField(deficit),
      escapeCSVField(cost.toFixed(2)),
      escapeCSVField(estimatedBudget),
      escapeCSVField(severity),
      escapeCSVField(supplierName),
      escapeCSVField(supplierMobile),
    ].join(",");
  });

  const csvContent = [headers.map(escapeCSVField).join(","), ...rows].join("\n");
  downloadCSVBlob(csvContent, filenamePrefix);
}

// ─── 5. PRODUCT INVENTORY PERIOD SUMMARY CSV ────────────────────────
export function exportProductInventorySummaryToCSV(
  summaries: ProductSummaryItem[],
  filenamePrefix: string = "product_inventory_summary"
) {
  const headers = [
    "Product Code",
    "Product Name",
    "Purchase Price (৳)",
    "Total Stock (Units)",
    "Total Stock Value (৳)",
    "Average Cost / Unit (৳)",
    "Total Purchased (Period)",
    "Total Sold (Period)",
    "Total Returned (Period)",
    "Total Damaged (Period)",
    "Size Stock Breakdown",
  ];

  const rows = summaries.map((s) => {
    const prodCode = `#${s.productId.substring(0, 8).toUpperCase()}`;
    const prodName = s.productName || "";
    const purchasePrice = Number(s.purchasePrice || 0).toFixed(2);
    const stockUnits = s.totalStockUnits || 0;
    const stockValue = Number(s.totalStockValue || 0).toFixed(2);
    const avgCost = Number(s.avgCostPerUnit || 0).toFixed(2);
    const purchased = s.periodMovement?.totalPurchased || 0;
    const sold = s.periodMovement?.totalSold || 0;
    const returned = s.periodMovement?.totalReturned || 0;
    const damaged = s.periodMovement?.totalDamaged || 0;

    const sizeBreakdownStr = (s.sizeBreakdown || [])
      .map((b) => `${b.sizeName || "Standard"}: ${b.currentStock} pcs`)
      .join(" | ");

    return [
      escapeCSVField(prodCode),
      escapeCSVField(prodName),
      escapeCSVField(purchasePrice),
      escapeCSVField(stockUnits),
      escapeCSVField(stockValue),
      escapeCSVField(avgCost),
      escapeCSVField(purchased),
      escapeCSVField(sold),
      escapeCSVField(returned),
      escapeCSVField(damaged),
      escapeCSVField(sizeBreakdownStr),
    ].join(",");
  });

  const csvContent = [headers.map(escapeCSVField).join(","), ...rows].join("\n");
  downloadCSVBlob(csvContent, filenamePrefix);
}
