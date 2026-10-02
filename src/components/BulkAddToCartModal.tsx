"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Layers, Plus, Minus, ShoppingCart, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { Product } from "@/services/product.api";
import { useCartStore } from "@/store/useCartStore";

interface BulkAddToCartModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

interface BatchItemRow {
  sizeId: string;
  sizeName: string;
  productSizeId: string;
  colorId: string; // selected color relation id
  stock: number;
  quantity: number;
  unitPrice: number;
}

export default function BulkAddToCartModal({ product, isOpen, onClose }: BulkAddToCartModalProps) {
  const { batchAddToCart, loading } = useCartStore();

  const [batchRows, setBatchRows] = useState<BatchItemRow[]>([]);
  const [selectedGlobalColorId, setSelectedGlobalColorId] = useState<string>("");

  // Initialize batch matrix rows from product sizes & inventories
  useEffect(() => {
    if (!product || !isOpen) return;

    const defaultColorId = product.colors && product.colors.length > 0 ? product.colors[0].id : "";
    setSelectedGlobalColorId(defaultColorId);

    const initialRows: BatchItemRow[] = (product.sizes || []).map((ps) => {
      // Calculate stock for size
      const matchingInv = product.inventories?.find(
        (inv) => inv.productSizeId === ps.id || inv.productSize?.id === ps.id
      );
      const availableStock = matchingInv ? matchingInv.currentStock : 0;

      return {
        sizeId: ps.size.id,
        sizeName: ps.size.name,
        productSizeId: ps.id,
        colorId: defaultColorId,
        stock: availableStock,
        quantity: 0,
        unitPrice: Number(product.newPrice) || 0,
      };
    });

    setBatchRows(initialRows);
  }, [product, isOpen]);

  // Bulk set color for all rows
  const handleGlobalColorChange = (colorId: string) => {
    setSelectedGlobalColorId(colorId);
    setBatchRows((prev) => prev.map((row) => ({ ...row, colorId })));
  };

  const handleQuantityChange = (productSizeId: string, qty: number) => {
    setBatchRows((prev) =>
      prev.map((row) => {
        if (row.productSizeId === productSizeId) {
          const clampedQty = Math.max(0, Math.min(row.stock, qty));
          return { ...row, quantity: clampedQty };
        }
        return row;
      })
    );
  };

  const handleRowColorChange = (productSizeId: string, colorId: string) => {
    setBatchRows((prev) =>
      prev.map((row) => {
        if (row.productSizeId === productSizeId) {
          return { ...row, colorId };
        }
        return row;
      })
    );
  };

  // Calculations
  const selectedRows = useMemo(() => batchRows.filter((r) => r.quantity > 0), [batchRows]);
  const totalUnits = useMemo(() => selectedRows.reduce((sum, r) => sum + r.quantity, 0), [selectedRows]);
  const totalSubtotal = useMemo(
    () => selectedRows.reduce((sum, r) => sum + r.quantity * r.unitPrice, 0),
    [selectedRows]
  );

  const handleSubmitBatch = async () => {
    if (selectedRows.length === 0) return;

    const payloadItems = selectedRows.map((r) => ({
      productId: product.id,
      productSizeId: r.productSizeId,
      productColorId: r.colorId || undefined,
      quantity: r.quantity,
    }));

    const success = await batchAddToCart({ items: payloadItems });
    if (success) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const primaryImg = product.images?.[0]?.imageUrl || "/placeholder.png";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-base-100 rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden border border-base-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-base-200 flex items-center justify-between bg-primary text-primary-content">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="bg-white/20 p-1.5 sm:p-2 rounded-xl shrink-0">
              <Layers size={20} className="sm:w-[22px] sm:h-[22px]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">Batch Add-to-Cart</h2>
              <p className="text-[11px] sm:text-xs text-white/80">Select quantities across multiple sizes in one order</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle text-primary-content hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 sm:space-y-6">
          {/* Product Overview Card */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 bg-base-200/60 rounded-2xl border border-base-200">
            <div className="flex items-center gap-3">
              <img
                src={primaryImg}
                alt={product.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover border border-base-300 shrink-0"
              />
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  {product.brand?.name || "Aarham Apparel"}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-base-content leading-tight">
                  {product.name}
                </h3>
                <div className="text-xs text-base-content/70 mt-1">
                  Sale Price: <span className="font-bold text-primary">৳ {Number(product.newPrice).toLocaleString()}</span>
                  {product.resellerPrice && (
                    <span className="ml-2 text-secondary font-semibold">
                      (Reseller: ৳ {Number(product.resellerPrice).toLocaleString()})
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Global Color Selector (if product has colors) */}
            {product.colors && product.colors.length > 0 && (
              <div className="w-full sm:w-auto flex flex-col items-start sm:items-end gap-1">
                <label className="text-[11px] font-bold text-base-content/70 uppercase">
                  Batch Color Option
                </label>
                <select
                  value={selectedGlobalColorId}
                  onChange={(e) => handleGlobalColorChange(e.target.value)}
                  className="select select-sm select-bordered rounded-xl text-xs font-semibold bg-base-100 w-full sm:w-auto"
                >
                  {product.colors.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.color?.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Batch Matrix Table */}
          {batchRows.length === 0 ? (
            <div className="p-8 text-center bg-base-200/40 rounded-2xl text-base-content/60">
              <AlertCircle size={28} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No sizes configured for this product.</p>
            </div>
          ) : (
            <div className="border border-base-200 rounded-2xl overflow-x-auto shadow-xs">
              <table className="table table-xs sm:table-sm w-full min-w-[500px]">
                <thead>
                  <tr className="bg-base-200 text-base-content text-xs uppercase">
                    <th>Size</th>
                    <th>Color</th>
                    <th className="text-center">Stock</th>
                    <th className="text-right">Unit Price</th>
                    <th className="text-center">Quantity</th>
                    <th className="text-right">Row Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-200 text-xs">
                  {batchRows.map((row) => {
                    const rowTotal = row.quantity * row.unitPrice;
                    const isOutOfStock = row.stock === 0;

                    return (
                      <tr key={row.productSizeId} className={row.quantity > 0 ? "bg-primary/5" : ""}>
                        <td className="font-bold text-sm text-base-content">{row.sizeName}</td>
                        <td>
                          {product.colors && product.colors.length > 0 ? (
                            <select
                              value={row.colorId}
                              onChange={(e) => handleRowColorChange(row.productSizeId, e.target.value)}
                              className="select select-xs select-bordered rounded-lg bg-base-100"
                            >
                              {product.colors.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.color?.name}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-base-content/50">Standard</span>
                          )}
                        </td>
                        <td className="text-center">
                          {isOutOfStock ? (
                            <span className="badge badge-error badge-xs font-bold">Out</span>
                          ) : (
                            <span className="font-semibold text-base-content/80">{row.stock}</span>
                          )}
                        </td>
                        <td className="text-right font-medium">
                          ৳ {row.unitPrice.toLocaleString()}
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              disabled={row.quantity <= 0 || isOutOfStock}
                              onClick={() => handleQuantityChange(row.productSizeId, row.quantity - 1)}
                              className="btn btn-ghost btn-xs btn-circle border border-base-300"
                            >
                              <Minus size={12} />
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={row.stock}
                              disabled={isOutOfStock}
                              value={row.quantity === 0 ? "" : row.quantity}
                              onChange={(e) =>
                                handleQuantityChange(
                                  row.productSizeId,
                                  parseInt(e.target.value) || 0
                                )
                              }
                              placeholder="0"
                              className="input input-xs input-bordered w-14 text-center font-bold text-primary focus:outline-none"
                            />
                            <button
                              type="button"
                              disabled={row.quantity >= row.stock || isOutOfStock}
                              onClick={() => handleQuantityChange(row.productSizeId, row.quantity + 1)}
                              className="btn btn-ghost btn-xs btn-circle border border-base-300"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                        <td className="text-right font-bold text-primary">
                          {rowTotal > 0 ? `৳ ${rowTotal.toLocaleString()}` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Footer Summary */}
        <div className="p-4 border-t border-base-200 bg-base-200/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-xs text-base-content/60 block">Selected Variations</span>
              <span className="font-bold text-base-content">{selectedRows.length} Sizes</span>
            </div>
            <div>
              <span className="text-xs text-base-content/60 block">Total Quantity</span>
              <span className="font-bold text-primary text-base">{totalUnits} Pcs</span>
            </div>
            <div>
              <span className="text-xs text-base-content/60 block">Estimated Subtotal</span>
              <span className="font-extrabold text-primary text-lg">
                ৳ {totalSubtotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button onClick={onClose} className="btn btn-ghost btn-sm flex-1 sm:flex-none">
              Cancel
            </button>
            <button
              disabled={selectedRows.length === 0 || loading}
              onClick={handleSubmitBatch}
              className="btn btn-primary btn-sm px-6 gap-2 rounded-xl text-primary-content flex-1 sm:flex-none"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <ShoppingCart size={16} /> Add {totalUnits} Items to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
