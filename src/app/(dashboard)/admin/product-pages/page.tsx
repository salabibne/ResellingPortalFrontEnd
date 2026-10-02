"use client";

import React, { useEffect, useState } from "react";
import {
  ShoppingBag,
  Search,
  Edit3,
  Check,
  X,
  Plus,
  Trash2,
  Sparkles,
  ToggleRight,
  Film,
  Eye,
} from "lucide-react";
import productPageConfigsApi, {
  ProductPageSection,
  SaveProductPageConfigDto,
} from "@/services/productPageConfigs.api";
import { productApi } from "@/services/product.api";

export default function AdminProductPagesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");

  // Editor Modal/Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [config, setConfig] = useState<Partial<SaveProductPageConfigDto>>({});
  const [existingConfigId, setExistingConfigId] = useState<string | null>(null);
  const [sections, setSections] = useState<Partial<ProductPageSection>[]>([]);
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productApi.getAll();
      setProducts(res);
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfigEditor = async (product: any) => {
    setSelectedProduct(product);
    setLoading(true);
    try {
      const existing = await productPageConfigsApi.getByProductId(product.id);
      if (existing) {
        setExistingConfigId(existing.id);
        setConfig({
          productId: product.id,
          customTitle: existing.customTitle || product.name,
          customDescription: existing.customDescription || product.description,
          bannerImageUrl: existing.bannerImageUrl || "",
          videoUrl: existing.videoUrl || "",
          showReviews: existing.showReviews ?? true,
          showFaq: existing.showFaq ?? true,
          showRelatedItems: existing.showRelatedItems ?? true,
          isLandingPage: existing.isLandingPage ?? false,
          metaTitle: existing.metaTitle || "",
          metaDescription: existing.metaDescription || "",
        });
        setSections(existing.sections || []);
      } else {
        setExistingConfigId(null);
        setConfig({
          productId: product.id,
          customTitle: product.name || "",
          customDescription: product.description || "",
          bannerImageUrl: "",
          videoUrl: "",
          showReviews: true,
          showFaq: true,
          showRelatedItems: true,
          isLandingPage: false,
          metaTitle: "",
          metaDescription: "",
        });
        setSections([]);
      }
      setIsDrawerOpen(true);
    } catch (err) {
      console.error("Failed to load product page config", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddShowcaseSection = () => {
    setSections((prev) => [
      ...prev,
      {
        title: "Craftsmanship & Quality",
        subtitle: "Premium Standard",
        description: "Special features about this product.",
        imageUrl: "",
        buttonText: "Order Now",
        buttonLink: "#buy-now",
        productIds: [selectedProduct?.id],
        sortOrder: prev.length + 1,
      },
    ]);
  };

  const handleRemoveSection = (idx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct?.id) return;

    setSaving(true);
    try {
      const payload: SaveProductPageConfigDto = {
        ...config,
        productId: selectedProduct.id,
        sections,
      };

      if (existingConfigId) {
        await productPageConfigsApi.update(existingConfigId, payload);
      } else {
        await productPageConfigsApi.create(payload);
      }
      alert("Product page CMS configuration saved successfully!");
      setIsDrawerOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Failed to save product config", err);
      alert("Failed to save product config.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenCreateLanding = async () => {
    let currentProducts = products;
    if (currentProducts.length === 0) {
      setLoading(true);
      try {
        const res = await productApi.getAll();
        currentProducts = res;
        setProducts(currentProducts);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    }

    if (currentProducts.length > 0) {
      const unconfigured = currentProducts.find((p) => !p.pageConfig?.isLandingPage) || currentProducts[0];
      handleOpenConfigEditor(unconfigured);
    } else {
      alert("No products available to configure. Please add a product to your catalog first from the Products tab.");
    }
  };

  const getEmbedVideoUrl = (url?: string) => {
    if (!url) return null;
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1]?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 bg-white text-black">
      {/* Page Title Header with Add Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-black flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-primary" /> Product Page CMS Config Builder
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Customize product details, add hero video showcases, and convert high-performing items into standalone landing pages.
          </p>
        </div>
        <button
          onClick={handleOpenCreateLanding}
          className="btn btn-primary text-white flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Product Landing Page
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-gray-200 flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products to configure..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input input-bordered w-full pl-9 text-sm bg-white text-black"
          />
        </div>
      </div>

      {/* Product List Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No products found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th>Product</th>
                  <th>SKU / ID</th>
                  <th>Price</th>
                  <th>Landing Page Mode</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50">
                    <td>
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            prod.images?.[0]?.imageUrl ||
                            prod.imageUrl ||
                            "https://via.placeholder.com/80"
                          }
                          alt={prod.name}
                          className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                        />
                        <div>
                          <div className="font-bold text-black text-sm">
                            {prod.name}
                          </div>
                          <div className="text-xs text-gray-500">{prod.category?.name || "General"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs font-mono text-gray-500">{prod.sku || prod.id}</td>
                    <td className="text-sm font-semibold text-emerald-600">
                      ৳{prod.price || prod.resellerPrice || "0"}
                    </td>
                    <td>
                      {prod.pageConfig?.isLandingPage ? (
                        <span className="badge badge-success gap-1 text-white text-xs">
                          <Check className="w-3 h-3" /> Landing Page Active
                        </span>
                      ) : (
                        <span className="badge badge-ghost text-xs text-gray-400">Standard Product</span>
                      )}
                    </td>
                    <td className="text-right space-x-2">
                      <a
                        href={`/products/${prod.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-ghost btn-sm text-info inline-flex items-center gap-1.5"
                        title="Preview Public Page"
                      >
                        <Eye className="w-4 h-4" /> Preview
                      </a>
                      <button
                        onClick={() => handleOpenConfigEditor(prod)}
                        className="btn btn-outline btn-sm btn-primary inline-flex items-center gap-1.5"
                      >
                        <Edit3 className="w-4 h-4" /> Configure CMS
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {isDrawerOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-white text-black rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto flex flex-col my-auto border border-gray-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-black flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> Product CMS & Landing Page Config
                </h2>
                <p className="text-xs text-gray-500">Configuring: {selectedProduct.name}</p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Editor Body */}
            <form onSubmit={handleSaveConfig} className="p-6 space-y-6 flex-1 bg-white">
              {/* Product Selection Dropdown inside Form */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-1">
                <label className="label-text text-xs font-semibold text-black">Target Product *</label>
                <select
                  value={selectedProduct?.id || ""}
                  onChange={(e) => {
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) handleOpenConfigEditor(p);
                  }}
                  className="select select-bordered w-full text-sm bg-white text-black"
                >
                  {products.map((prod) => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name} ({prod.sku || prod.id.slice(0, 8)})
                    </option>
                  ))}
                </select>
              </div>
              {/* Feature Toggles Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-sm text-black flex items-center gap-2">
                  <ToggleRight className="w-5 h-5 text-primary" /> Feature Toggles & Page Mode
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
                  <label className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 cursor-pointer">
                    <span className="font-semibold text-black">
                      Standalone Landing Page Mode
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-sm"
                      checked={config.isLandingPage || false}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, isLandingPage: e.target.checked }))
                      }
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 cursor-pointer">
                    <span className="font-semibold text-black">
                      Show Reviews Drawer
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-sm"
                      checked={config.showReviews ?? true}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, showReviews: e.target.checked }))
                      }
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 cursor-pointer">
                    <span className="font-semibold text-black">
                      Show FAQ Accordion
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-sm"
                      checked={config.showFaq ?? true}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, showFaq: e.target.checked }))
                      }
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 cursor-pointer">
                    <span className="font-semibold text-black">
                      Show Related Products
                    </span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-sm"
                      checked={config.showRelatedItems ?? true}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, showRelatedItems: e.target.checked }))
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Title & Description Override */}
              <div className="space-y-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-sm text-black">
                  Custom Content Overrides
                </h3>

                <div>
                  <label className="label-text text-xs font-semibold text-black">Custom Landing Title</label>
                  <input
                    type="text"
                    value={config.customTitle || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, customTitle: e.target.value }))
                    }
                    placeholder="e.g. Premium Embroidered Panjabi - Special Edition"
                    className="input input-bordered w-full text-sm mt-1 bg-white text-black"
                  />
                </div>

                <div>
                  <label className="label-text text-xs font-semibold text-black">Custom Landing Description</label>
                  <textarea
                    value={config.customDescription || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, customDescription: e.target.value }))
                    }
                    placeholder="Exclusive handcrafted designer Panjabi for festivals..."
                    className="textarea textarea-bordered w-full text-sm mt-1 h-20 bg-white text-black"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label-text text-xs font-semibold text-black">Banner Image URL</label>
                    <input
                      type="text"
                      value={config.bannerImageUrl || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, bannerImageUrl: e.target.value }))
                      }
                      placeholder="https://cdn.aarhamapparel.com/banner.webp"
                      className="input input-bordered w-full text-sm mt-1 bg-white text-black"
                    />
                  </div>
                  <div>
                    <label className="label-text text-xs font-semibold text-black">Video URL (YouTube/Vimeo)</label>
                    <input
                      type="text"
                      value={config.videoUrl || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, videoUrl: e.target.value }))
                      }
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="input input-bordered w-full text-sm mt-1 bg-white text-black"
                    />
                  </div>
                </div>

                {config.videoUrl && (
                  <div className="mt-2 space-y-1">
                    <label className="label-text text-xs text-gray-500 flex items-center gap-1">
                      <Film className="w-3.5 h-3.5 text-primary" /> Live Video Preview
                    </label>
                    <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-300 bg-black">
                      <iframe
                        src={getEmbedVideoUrl(config.videoUrl) || ""}
                        className="w-full h-full"
                        allowFullScreen
                        title="Product Video Preview"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* SEO Overrides */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-sm text-black">
                  SEO Overrides
                </h3>
                <div>
                  <label className="label-text text-xs font-semibold text-black">Meta Title</label>
                  <input
                    type="text"
                    value={config.metaTitle || ""}
                    onChange={(e) => setConfig((prev) => ({ ...prev, metaTitle: e.target.value }))}
                    placeholder="Buy Luxury Panjabi Online | Aarham Apparel"
                    className="input input-bordered w-full text-sm mt-1 bg-white text-black"
                  />
                </div>
                <div>
                  <label className="label-text text-xs font-semibold text-black">Meta Description</label>
                  <textarea
                    value={config.metaDescription || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, metaDescription: e.target.value }))
                    }
                    placeholder="Top quality Panjabi at reseller prices..."
                    className="textarea textarea-bordered w-full text-sm mt-1 h-16 bg-white text-black"
                  />
                </div>
              </div>

              {/* Product Showcase Dynamic Sections */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm text-black">
                    Showcase Feature Sections ({sections.length})
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddShowcaseSection}
                    className="btn btn-outline btn-xs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Showcase Section
                  </button>
                </div>

                {sections.map((sec, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 relative shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                      <span className="font-bold text-xs text-black">
                        Section #{idx + 1}: {sec.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        className="btn btn-ghost btn-xs text-error"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="label-text text-[11px] font-medium text-black">Title</label>
                        <input
                          type="text"
                          value={sec.title || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSections((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, title: val } : s))
                            );
                          }}
                          className="input input-bordered input-xs w-full mt-1 bg-white text-black"
                        />
                      </div>
                      <div>
                        <label className="label-text text-[11px] font-medium text-black">Subtitle</label>
                        <input
                          type="text"
                          value={sec.subtitle || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSections((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, subtitle: val } : s))
                            );
                          }}
                          className="input input-bordered input-xs w-full mt-1 bg-white text-black"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="label-text text-[11px] font-medium text-black">Image URL</label>
                        <input
                          type="text"
                          value={sec.imageUrl || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSections((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, imageUrl: val } : s))
                            );
                          }}
                          className="input input-bordered input-xs w-full mt-1 bg-white text-black"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="label-text text-[11px] font-medium text-black">Description</label>
                        <textarea
                          value={sec.description || ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSections((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, description: val } : s))
                            );
                          }}
                          className="textarea textarea-bordered textarea-xs w-full mt-1 h-12 bg-white text-black"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawer Footer Buttons */}
              <div className="pt-4 flex items-center justify-between border-t border-gray-200 sticky bottom-0 bg-white p-4">
                {selectedProduct && (
                  <a
                    href={`/products/${selectedProduct.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-ghost btn-xs text-info flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview Page
                  </a>
                )}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="btn btn-ghost text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary text-white text-xs px-6"
                  >
                    {saving ? "Saving Config..." : "Save Product CMS Config"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
