"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  X,
  Loader2,
  Search,
  Package,
  Layers,
  DollarSign,
  Tag,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Truck,
  Video,
  ChevronRight,
  ChevronLeft,
  Lock,
} from "lucide-react";
import api from "@/services/axios";
import {
  productApi,
  Product,
  CreateProductDto,
} from "@/services/product.api";

type TabType = "general" | "pricing" | "variants" | "images" | "inventory";

const TABS: { id: TabType; label: string; icon: any }[] = [
  { id: "general", label: "Basic Info", icon: Package },
  { id: "pricing", label: "Pricing & Badges", icon: DollarSign },
  { id: "variants", label: "Variants Selection", icon: Layers },
  { id: "images", label: "Images", icon: ImageIcon },
  { id: "inventory", label: "Inventory Setup", icon: Truck },
];

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [childCategories, setChildCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [ageVariants, setAgeVariants] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("general");

  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Form Data State
  const [formData, setFormData] = useState<CreateProductDto>({
    name: "",
    categoryId: "",
    subcategoryId: "",
    childCategoryId: "",
    brandId: "",
    purchasePrice: 0,
    oldPrice: 0,
    newPrice: 0,
    resellerPrice: 0,
    videoUrl: "",
    unit: "Pcs",
    description: "",
    status: "ACTIVE",
    showAsNewArrival: false,
    images: [],
    colorIds: [],
    sizeIds: [],
    ageVariantIds: [],
    supplierName: "",
    supplierMobile: "",
    stockLimitAlert: 10,
  });

  const [newImageUrl, setNewImageUrl] = useState("");

  // Fetch all metadata & products
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadingProgress(20);

      const prodsPromise = productApi.getAll().catch(() => []);
      setLoadingProgress(50);

      const [
        prodsData,
        catsData,
        subCatsData,
        childCatsData,
        brandsData,
        colorsData,
        sizesData,
        agesData,
      ] = await Promise.all([
        prodsPromise,
        api.get("/categories").then((r) => r.data).catch(() => []),
        api.get("/subcategories").then((r) => r.data).catch(() => []),
        api.get("/child-categories").then((r) => r.data).catch(() => []),
        api.get("/brands").then((r) => r.data).catch(() => []),
        api.get("/colors").then((r) => r.data).catch(() => []),
        api.get("/sizes").then((r) => r.data).catch(() => []),
        api.get("/age-variants").then((r) => r.data).catch(() => []),
      ]);

      setLoadingProgress(85);

      setProducts(Array.isArray(prodsData) ? prodsData : prodsData?.data || []);
      setCategories(Array.isArray(catsData) ? catsData : catsData?.data || []);
      setSubcategories(Array.isArray(subCatsData) ? subCatsData : subCatsData?.data || []);
      setChildCategories(Array.isArray(childCatsData) ? childCatsData : childCatsData?.data || []);
      setBrands(Array.isArray(brandsData) ? brandsData : brandsData?.data || []);
      setColors(Array.isArray(colorsData) ? colorsData : colorsData?.data || []);
      setSizes(Array.isArray(sizesData) ? sizesData : sizesData?.data || []);
      setAgeVariants(Array.isArray(agesData) ? agesData : agesData?.data || []);

      setLoadingProgress(100);
    } catch (err) {
      console.error("Failed to load products or attributes", err);
    } finally {
      setTimeout(() => setIsLoading(false), 200);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Mandatory required step completion validations
  const isStep1Complete = Boolean(
    formData.name?.trim() &&
    formData.categoryId &&
    formData.brandId &&
    formData.description?.trim()
  );

  const isStep2Complete =
    formData.purchasePrice !== undefined &&
    formData.purchasePrice !== null &&
    Number(formData.purchasePrice) >= 0 &&
    formData.oldPrice !== undefined &&
    formData.oldPrice !== null &&
    Number(formData.oldPrice) >= 0 &&
    formData.newPrice !== undefined &&
    formData.newPrice !== null &&
    Number(formData.newPrice) >= 0 &&
    formData.resellerPrice !== undefined &&
    formData.resellerPrice !== null &&
    Number(formData.resellerPrice) >= 0;

  const areAllRequiredStepsComplete = isStep1Complete && isStep2Complete;

  // Determine available tabs
  const activeTabsList = currentProduct
    ? TABS.filter((t) => t.id !== "inventory")
    : TABS;

  const activeTabIndex = activeTabsList.findIndex((t) => t.id === activeTab);
  const totalSteps = activeTabsList.length;
  const currentStepNum = activeTabIndex + 1;
  const isLastStep = activeTabIndex === totalSteps - 1;

  // Check if a specific tab can be accessed
  const canAccessTab = (tabId: TabType) => {
    if (tabId === "general") return true;
    if (tabId === "pricing") return isStep1Complete;
    // For step 3, 4, 5: requires step 1 and step 2 complete
    return isStep1Complete && isStep2Complete;
  };

  // Open Create/Edit Form
  const handleOpenForm = (product: Product | null = null) => {
    setCurrentProduct(product);
    setActiveTab("general");
    setNewImageUrl("");

    if (product) {
      setFormData({
        name: product.name || "",
        categoryId: product.categoryId || "",
        subcategoryId: product.subcategoryId || "",
        childCategoryId: product.childCategoryId || "",
        brandId: product.brandId || "",
        purchasePrice: Number(product.purchasePrice) || 0,
        oldPrice: Number(product.oldPrice) || 0,
        newPrice: Number(product.newPrice) || 0,
        resellerPrice: Number(product.resellerPrice) || 0,
        videoUrl: product.videoUrl || "",
        unit: product.unit || "Pcs",
        description: product.description || "",
        status: product.status || "ACTIVE",
        showAsNewArrival: Boolean(product.showAsNewArrival),
        images: product.images?.map((img) => ({
          imageUrl: img.imageUrl,
          isPrimary: img.isPrimary,
        })) || [],
        colorIds: product.colors?.map((c) => c.colorId) || [],
        sizeIds: product.sizes?.map((s) => s.sizeId) || [],
        ageVariantIds: product.ages?.map((a) => a.ageVariantId) || [],
        supplierName: "",
        supplierMobile: "",
        stockLimitAlert: 10,
      });
    } else {
      setFormData({
        name: "",
        categoryId: categories[0]?.id || "",
        subcategoryId: "",
        childCategoryId: "",
        brandId: brands[0]?.id || "",
        purchasePrice: 0,
        oldPrice: 0,
        newPrice: 0,
        resellerPrice: 0,
        videoUrl: "",
        unit: "Pcs",
        description: "",
        status: "ACTIVE",
        showAsNewArrival: false,
        images: [],
        colorIds: [],
        sizeIds: [],
        ageVariantIds: [],
        supplierName: "",
        supplierMobile: "",
        stockLimitAlert: 10,
      });
    }

    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setCurrentProduct(null);
    setNewImageUrl("");
  };

  // Open Detail View
  const handleOpenDetail = (product: Product) => {
    setCurrentProduct(product);
    setIsDetailOpen(true);
  };

  // Open Delete Prompt
  const handleOpenDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteOpen(true);
  };

  // Delete product submit
  const handleDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      setIsSubmitting(true);
      await productApi.delete(productToDelete.id);
      await fetchData();
      setIsDeleteOpen(false);
      setProductToDelete(null);
    } catch (err) {
      console.error("Failed to delete product", err);
      alert("Failed to delete product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form field change handlers
  const handleInputChange = (field: keyof CreateProductDto, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === "categoryId") {
        updated.subcategoryId = "";
        updated.childCategoryId = "";
      }
      if (field === "subcategoryId") {
        updated.childCategoryId = "";
      }
      return updated;
    });
  };

  // Variant array toggles
  const toggleArrayItem = (field: "colorIds" | "sizeIds" | "ageVariantIds", id: string) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id];
      return { ...prev, [field]: updated };
    });
  };

  // Image Management Handlers
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    const isFirst = (formData.images || []).length === 0;
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), { imageUrl: newImageUrl.trim(), isPrimary: isFirst }],
    }));
    setNewImageUrl("");
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => {
      const newImages = (prev.images || []).filter((_, i) => i !== index);
      if (newImages.length > 0 && !newImages.some((img) => img.isPrimary)) {
        newImages[0].isPrimary = true;
      }
      return { ...prev, images: newImages };
    });
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).map((img, i) => ({
        ...img,
        isPrimary: i === index,
      })),
    }));
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!areAllRequiredStepsComplete) {
      alert("Please complete all required fields in Step 1 and Step 2 first.");
      return;
    }

    if (!isLastStep) {
      return;
    }

    try {
      setIsSubmitting(true);

      const payload: CreateProductDto = {
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        oldPrice: Number(formData.oldPrice),
        newPrice: Number(formData.newPrice),
        resellerPrice: Number(formData.resellerPrice),
        stockLimitAlert: Number(formData.stockLimitAlert),
      };

      if (!payload.subcategoryId) delete payload.subcategoryId;
      if (!payload.childCategoryId) delete payload.childCategoryId;

      if (currentProduct) {
        delete payload.supplierName;
        delete payload.supplierMobile;
        delete payload.stockLimitAlert;
        await productApi.update(currentProduct.id, payload);
      } else {
        await productApi.create(payload);
      }

      await fetchData();
      handleCloseForm();
    } catch (err: any) {
      console.error("Failed to save product", err);
      alert(err.response?.data?.message || "Failed to save product. Check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesQuery = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? p.categoryId === categoryFilter : true;
    const matchesBrand = brandFilter ? p.brandId === brandFilter : true;
    const matchesStatus = statusFilter ? p.status === statusFilter : true;
    return matchesQuery && matchesCategory && matchesBrand && matchesStatus;
  });

  const availableSubcategories = subcategories.filter(
    (sc) => sc.categoryId === formData.categoryId
  );
  const availableChildCategories = childCategories.filter(
    (cc) => cc.subcategoryId === formData.subcategoryId
  );

  return (
    <div className="p-6 w-full flex flex-col h-full bg-base-200 text-black relative">
      {/* Top Global Data Loading Progress Line */}
      {isLoading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <div
            className="h-1 bg-primary transition-all duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
      )}

      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-black flex items-center gap-2">
            <Package className="text-primary" size={32} /> Products Management
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your store items, pricing, attributes, and stock setup
          </p>
        </div>
        <button
          onClick={() => handleOpenForm(null)}
          className="btn btn-primary flex items-center gap-2 text-white"
          disabled={isLoading}
        >
          <Plus size={20} /> Add New Product
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-base-100 p-4 rounded-box shadow-sm mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products by name..."
            className="input input-bordered w-full pl-10 bg-white text-black"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select
          className="select select-bordered bg-white text-black min-w-[160px]"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="select select-bordered bg-white text-black min-w-[160px]"
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>

        <select
          className="select select-bordered bg-white text-black min-w-[140px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="DEACTIVATED">Deactivated</option>
        </select>
      </div>

      {/* Main Table Container */}
      <div className="bg-base-100 rounded-box shadow-md flex-1 overflow-hidden w-full">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-base-200">
                <th className="text-black">Product</th>
                <th className="text-black">Category / Brand</th>
                <th className="text-black">Prices (New / Old / Reseller)</th>
                <th className="text-black text-center">Attributes & Variants</th>
                <th className="text-black text-center">Status</th>
                <th className="text-right text-black">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <div className="max-w-xs mx-auto space-y-3">
                      <progress className="progress progress-primary w-full" value={loadingProgress} max="100" />
                      <p className="text-sm font-medium text-gray-500">Loading store products...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-500">
                    No products found. Click "Add New Product" to create one.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const primaryImg =
                    product.images?.find((img) => img.isPrimary)?.imageUrl ||
                    product.images?.[0]?.imageUrl;

                  return (
                    <tr key={product.id} className="hover:bg-base-200 transition-colors">
                      {/* Product Name & Image */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-lg bg-base-300 flex items-center justify-center overflow-hidden border">
                              {primaryImg ? (
                                <img
                                  src={primaryImg}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = "none";
                                  }}
                                />
                              ) : (
                                <ImageIcon className="text-gray-400" size={24} />
                              )}
                            </div>
                          </div>
                          <div>
                            <div className="font-bold text-black flex items-center gap-2">
                              {product.name}
                              {product.showAsNewArrival && (
                                <span className="badge badge-secondary badge-xs font-semibold">
                                  New
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">
                              Unit: {product.unit || "N/A"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category & Brand */}
                      <td>
                        <div className="text-sm font-medium text-black">
                          {product.category?.name || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500">
                          Brand: {product.brand?.name || "N/A"}
                        </div>
                      </td>

                      {/* Pricing Breakdown in Currency ৳ */}
                      <td>
                        <div className="text-sm font-semibold text-emerald-600">
                          ৳{Number(product.newPrice).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400 line-through">
                          ৳{Number(product.oldPrice).toLocaleString()}
                        </div>
                        <div className="text-xs text-blue-600">
                          Reseller: ৳{Number(product.resellerPrice).toLocaleString()}
                        </div>
                      </td>

                      {/* Variant Badges */}
                      <td className="text-center">
                        <div className="flex flex-wrap justify-center gap-1">
                          <span className="badge badge-outline badge-sm">
                            {product.colors?.length || 0} Colors
                          </span>
                          <span className="badge badge-outline badge-sm">
                            {product.sizes?.length || 0} Sizes
                          </span>
                          <span className="badge badge-outline badge-sm">
                            {product.ages?.length || 0} Ages
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="text-center">
                        {product.status === "ACTIVE" && (
                          <span className="btn btn-xs btn-success text-white">Active</span>
                        )}
                        {product.status === "PENDING" && (
                          <span className="btn btn-xs btn-warning text-white">Pending</span>
                        )}
                        {product.status === "DEACTIVATED" && (
                          <span className="btn btn-xs btn-error text-white">Deactivated</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            className="btn btn-ghost btn-xs text-info"
                            title="View Details"
                            onClick={() => handleOpenDetail(product)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-primary"
                            title="Edit Product"
                            onClick={() => handleOpenForm(product)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            title="Delete Product"
                            onClick={() => handleOpenDelete(product)}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-base-100 rounded-box shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-150 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-base-300 flex justify-between items-center bg-white">
              <div>
                <h2 className="text-2xl font-bold text-black flex items-center gap-2">
                  <Package className="text-primary" size={24} />
                  {currentProduct ? `Edit Product: ${currentProduct.name}` : "Create New Product"}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-primary text-white font-bold">
                    Step {currentStepNum} of {totalSteps}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {activeTabsList[activeTabIndex]?.label}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCloseForm}
                className="btn btn-ghost btn-circle btn-sm text-black"
                disabled={isSubmitting}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form Tabs Navigation (Enforces completion of required steps) */}
            <div className="bg-base-200 px-6 border-b border-base-300 flex gap-2 overflow-x-auto">
              {activeTabsList.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isAccessible = canAccessTab(tab.id);

                return (
                  <button
                    key={tab.id}
                    type="button"
                    disabled={!isAccessible}
                    className={`py-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
                      isActive
                        ? "border-primary text-primary bg-white"
                        : isAccessible
                        ? "border-transparent text-gray-700 hover:text-black"
                        : "border-transparent text-gray-400 opacity-60 cursor-not-allowed"
                    }`}
                    onClick={() => isAccessible && setActiveTab(tab.id)}
                  >
                    {!isAccessible ? <Lock size={14} className="text-gray-400" /> : <Icon size={16} />}
                    <span>Step {idx + 1}: {tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body / Tab Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Submission Overlay */}
              {isSubmitting && (
                <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-primary" size={40} />
                  <p className="font-bold text-black text-lg">Saving Product Details...</p>
                </div>
              )}

              {/* TAB 1: BASIC INFO */}
              {activeTab === "general" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control md:col-span-2">
                    <label className="label font-semibold text-black">Product Name *</label>
                    <input
                      type="text"
                      className="input input-bordered w-full bg-white text-black"
                      placeholder="e.g. Premium Cotton Casual Shirt"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label font-semibold text-black">Category *</label>
                    <select
                      className="select select-bordered w-full bg-white text-black"
                      value={formData.categoryId}
                      onChange={(e) => handleInputChange("categoryId", e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select Category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label font-semibold text-black">
                      Subcategory <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      className="select select-bordered w-full bg-white text-black"
                      value={formData.subcategoryId || ""}
                      onChange={(e) => handleInputChange("subcategoryId", e.target.value)}
                      disabled={!formData.categoryId}
                    >
                      <option value="">None / Select Subcategory</option>
                      {availableSubcategories.map((sc) => (
                        <option key={sc.id} value={sc.id}>
                          {sc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label font-semibold text-black">
                      Child Category <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <select
                      className="select select-bordered w-full bg-white text-black"
                      value={formData.childCategoryId || ""}
                      onChange={(e) => handleInputChange("childCategoryId", e.target.value)}
                      disabled={!formData.subcategoryId}
                    >
                      <option value="">None / Select Child Category</option>
                      {availableChildCategories.map((cc) => (
                        <option key={cc.id} value={cc.id}>
                          {cc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label font-semibold text-black">Brand *</label>
                    <select
                      className="select select-bordered w-full bg-white text-black"
                      value={formData.brandId}
                      onChange={(e) => handleInputChange("brandId", e.target.value)}
                      required
                    >
                      <option value="" disabled>
                        Select Brand
                      </option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label font-semibold text-black">
                      Unit <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered w-full bg-white text-black"
                      placeholder="e.g. Pcs, Pair, Pack"
                      value={formData.unit || ""}
                      onChange={(e) => handleInputChange("unit", e.target.value)}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label font-semibold text-black">
                      Video URL <span className="text-xs text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        className="input input-bordered w-full bg-white text-black pl-10"
                        placeholder="https://youtube.com/..."
                        value={formData.videoUrl || ""}
                        onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                      />
                      <Video className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                  </div>

                  <div className="form-control md:col-span-2">
                    <label className="label font-semibold text-black">Description *</label>
                    <textarea
                      className="textarea textarea-bordered w-full h-24 bg-white text-black"
                      placeholder="Detailed product descriptions, material composition, features..."
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: PRICING & BADGES (Currency in ৳) */}
              {activeTab === "pricing" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label font-semibold text-black">Purchase Price (৳) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input input-bordered w-full bg-white text-black"
                        value={formData.purchasePrice}
                        onChange={(e) => handleInputChange("purchasePrice", e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label font-semibold text-black">Old Price / MSRP (৳) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input input-bordered w-full bg-white text-black"
                        value={formData.oldPrice}
                        onChange={(e) => handleInputChange("oldPrice", e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label font-semibold text-black">New Sale Price (৳) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input input-bordered w-full bg-white text-black"
                        value={formData.newPrice}
                        onChange={(e) => handleInputChange("newPrice", e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label font-semibold text-black">Reseller Price (৳) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className="input input-bordered w-full bg-white text-black"
                        value={formData.resellerPrice}
                        onChange={(e) => handleInputChange("resellerPrice", e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="divider">Status & Display</div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    <div className="form-control">
                      <label className="label font-semibold text-black">Status</label>
                      <select
                        className="select select-bordered w-full bg-white text-black"
                        value={formData.status}
                        onChange={(e) => handleInputChange("status", e.target.value)}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PENDING">PENDING</option>
                        <option value="DEACTIVATED">DEACTIVATED</option>
                      </select>
                    </div>

                    <div className="form-control pt-6">
                      <label className="label cursor-pointer justify-start gap-4 border p-3 rounded-lg bg-white">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary"
                          checked={formData.showAsNewArrival}
                          onChange={(e) => handleInputChange("showAsNewArrival", e.target.checked)}
                        />
                        <span className="label-text font-semibold text-black">
                          Show as New Arrival Badge
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: VARIANTS SELECTION (All Optional) */}
              {activeTab === "variants" && (
                <div className="space-y-6">
                  {/* Colors Attribute Selection */}
                  <div>
                    <h3 className="text-md font-bold text-black mb-2 flex items-center gap-2">
                      <Tag size={18} className="text-primary" /> Colors (Optional)
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Select colors assigned to this product:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {colors.length === 0 ? (
                        <span className="text-xs text-gray-400">
                          No colors available in Product Attributes.
                        </span>
                      ) : (
                        colors.map((c) => {
                          const isSelected = formData.colorIds?.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => toggleArrayItem("colorIds", c.id)}
                              className={`btn btn-sm gap-2 border ${
                                isSelected
                                  ? "btn-primary text-white"
                                  : "btn-outline text-black bg-white"
                              }`}
                            >
                              <span
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: c.colorCode || "#000" }}
                              />
                              {c.name}
                              {isSelected && <CheckCircle size={14} />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="divider" />

                  {/* Sizes Attribute Selection */}
                  <div>
                    <h3 className="text-md font-bold text-black mb-2 flex items-center gap-2">
                      <Layers size={18} className="text-primary" /> Sizes (Optional)
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Select sizes available for this product:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {sizes.length === 0 ? (
                        <span className="text-xs text-gray-400">
                          No sizes available in Product Attributes.
                        </span>
                      ) : (
                        sizes.map((s) => {
                          const isSelected = formData.sizeIds?.includes(s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => toggleArrayItem("sizeIds", s.id)}
                              className={`btn btn-sm gap-2 border ${
                                isSelected
                                  ? "btn-primary text-white"
                                  : "btn-outline text-black bg-white"
                              }`}
                            >
                              {s.name}
                              {isSelected && <CheckCircle size={14} />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className="divider" />

                  {/* Age Variants Attribute Selection */}
                  <div>
                    <h3 className="text-md font-bold text-black mb-2 flex items-center gap-2">
                      <Package size={18} className="text-primary" /> Age Variants (Optional)
                    </h3>
                    <p className="text-xs text-gray-500 mb-3">
                      Select age groups applicable to this product:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {ageVariants.length === 0 ? (
                        <span className="text-xs text-gray-400">
                          No age variants available in Product Attributes.
                        </span>
                      ) : (
                        ageVariants.map((a) => {
                          const isSelected = formData.ageVariantIds?.includes(a.id);
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() => toggleArrayItem("ageVariantIds", a.id)}
                              className={`btn btn-sm gap-2 border ${
                                isSelected
                                  ? "btn-primary text-white"
                                  : "btn-outline text-black bg-white"
                              }`}
                            >
                              {a.ageRange}
                              {isSelected && <CheckCircle size={14} />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: IMAGES (Optional) */}
              {activeTab === "images" && (
                <div className="space-y-6">
                  <div className="flex gap-2 items-center">
                    <input
                      type="url"
                      placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                      className="input input-bordered flex-1 bg-white text-black"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-primary text-white flex items-center gap-1"
                      onClick={handleAddImage}
                    >
                      <Plus size={18} /> Add Image
                    </button>
                  </div>

                  {formData.images?.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed rounded-box text-gray-400">
                      <ImageIcon className="mx-auto mb-2" size={36} />
                      <p>No images added yet (Optional). Add image URLs above.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {formData.images?.map((img, idx) => (
                        <div
                          key={idx}
                          className={`relative group rounded-box border p-2 bg-white ${
                            img.isPrimary ? "ring-2 ring-primary" : ""
                          }`}
                        >
                          <div className="w-full h-32 rounded-lg bg-base-200 overflow-hidden flex items-center justify-center">
                            <img
                              src={img.imageUrl}
                              alt={`Product image ${idx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <label className="text-xs flex items-center gap-1 cursor-pointer font-semibold text-black">
                              <input
                                type="radio"
                                name="primaryImage"
                                className="radio radio-primary radio-xs"
                                checked={img.isPrimary}
                                onChange={() => handleSetPrimaryImage(idx)}
                              />
                              {img.isPrimary ? "Primary" : "Set Primary"}
                            </label>
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => handleRemoveImage(idx)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: INVENTORY SETUP (Optional) */}
              {activeTab === "inventory" && !currentProduct && (
                <div className="space-y-4">
                  <div className="alert alert-info text-sm text-black bg-blue-50 border-blue-200">
                    <AlertCircle size={20} className="text-info" />
                    <span>
                      Inventory records will be automatically seeded for each selected Size (or a primary inventory record if no size is chosen). Supplier details are optional.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label font-semibold text-black">Supplier Name (Optional)</label>
                      <input
                        type="text"
                        className="input input-bordered w-full bg-white text-black"
                        placeholder="e.g. Acme Textile Ltd."
                        value={formData.supplierName || ""}
                        onChange={(e) => handleInputChange("supplierName", e.target.value)}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label font-semibold text-black">Supplier Mobile (Optional)</label>
                      <input
                        type="text"
                        className="input input-bordered w-full bg-white text-black"
                        placeholder="e.g. +8801700000000"
                        value={formData.supplierMobile || ""}
                        onChange={(e) => handleInputChange("supplierMobile", e.target.value)}
                      />
                    </div>

                    <div className="form-control">
                      <label className="label font-semibold text-black">
                        Low Stock Alert Limit
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="input input-bordered w-full bg-white text-black"
                        value={formData.stockLimitAlert ?? 10}
                        onChange={(e) => handleInputChange("stockLimitAlert", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Bottom Step & Action Navigation */}
              <div className="pt-6 border-t border-base-300 flex justify-between items-center">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-600">
                  {activeTabIndex > 0 && (
                    <button
                      type="button"
                      className="btn btn-sm btn-outline gap-1"
                      onClick={() => setActiveTab(activeTabsList[activeTabIndex - 1].id)}
                    >
                      <ChevronLeft size={16} /> Previous Step
                    </button>
                  )}
                  <span>Step {currentStepNum} of {totalSteps}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="btn btn-ghost text-black"
                    onClick={handleCloseForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>

                  {!isLastStep ? (
                    <button
                      type="button"
                      className="btn btn-primary text-white gap-1"
                      disabled={
                        (activeTab === "general" && !isStep1Complete) ||
                        (activeTab === "pricing" && !isStep2Complete)
                      }
                      onClick={() => {
                        if (canAccessTab(activeTabsList[activeTabIndex + 1].id)) {
                          setActiveTab(activeTabsList[activeTabIndex + 1].id);
                        }
                      }}
                    >
                      Next Step <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="btn btn-success text-white px-8 flex items-center gap-2"
                      disabled={isSubmitting || !areAllRequiredStepsComplete || !isLastStep}
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : currentProduct ? (
                        "Update Product"
                      ) : (
                        "Save Product"
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL PREVIEW MODAL */}
      {isDetailOpen && currentProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-base-100 rounded-box shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-base-300 flex justify-between items-center bg-white rounded-t-box">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <Eye size={20} className="text-primary" /> Product Details
              </h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="btn btn-ghost btn-circle btn-sm text-black"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 text-black">
              {/* Product Header & Images */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="w-32 h-32 rounded-box bg-base-200 overflow-hidden flex-shrink-0 border">
                  {currentProduct.images?.[0]?.imageUrl ? (
                    <img
                      src={currentProduct.images[0].imageUrl}
                      alt={currentProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-bold">{currentProduct.name}</h3>
                  <div className="flex gap-2 items-center mt-1">
                    <span className="badge badge-primary text-white">
                      {currentProduct.category?.name}
                    </span>
                    {currentProduct.brand && (
                      <span className="badge badge-outline">{currentProduct.brand.name}</span>
                    )}
                    <span
                      className={`badge text-white ${
                        currentProduct.status === "ACTIVE"
                          ? "badge-success"
                          : currentProduct.status === "PENDING"
                          ? "badge-warning"
                          : "badge-error"
                      }`}
                    >
                      {currentProduct.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{currentProduct.description}</p>
                </div>
              </div>

              <div className="divider" />

              {/* Prices Grid in Currency ৳ */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center bg-base-200 p-4 rounded-box">
                <div>
                  <div className="text-xs text-gray-500">Purchase Price</div>
                  <div className="text-lg font-bold">৳{Number(currentProduct.purchasePrice).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Old Price</div>
                  <div className="text-lg font-bold line-through text-gray-400">
                    ৳{Number(currentProduct.oldPrice).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">New Price</div>
                  <div className="text-lg font-bold text-emerald-600">
                    ৳{Number(currentProduct.newPrice).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Reseller Price</div>
                  <div className="text-lg font-bold text-blue-600">
                    ৳{Number(currentProduct.resellerPrice).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Attributes Summary */}
              <div className="space-y-3">
                <h4 className="font-semibold text-black">Assigned Attributes:</h4>
                <div>
                  <span className="text-xs font-semibold text-gray-500 block mb-1">Colors:</span>
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.colors?.map((c) => (
                      <span
                        key={c.id}
                        className="badge badge-outline gap-1 text-black bg-white"
                      >
                        <span
                          className="w-3 h-3 rounded-full border"
                          style={{ backgroundColor: c.color.colorCode }}
                        />
                        {c.color.name}
                      </span>
                    ))}
                    {!currentProduct.colors?.length && (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500 block mb-1">Sizes:</span>
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.sizes?.map((s) => (
                      <span key={s.id} className="badge badge-outline text-black bg-white">
                        {s.size.name}
                      </span>
                    ))}
                    {!currentProduct.sizes?.length && (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-gray-500 block mb-1">Age Variants:</span>
                  <div className="flex flex-wrap gap-2">
                    {currentProduct.ages?.map((a) => (
                      <span key={a.id} className="badge badge-outline text-black bg-white">
                        {a.ageVariant.ageRange}
                      </span>
                    ))}
                    {!currentProduct.ages?.length && (
                      <span className="text-xs text-gray-400">None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-base-100 rounded-box shadow-2xl p-6 w-full max-w-md animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-black flex items-center gap-2">
              <Trash2 className="text-error" size={20} /> Delete Product
            </h3>
            <p className="py-4 text-sm text-black">
              Are you sure you want to delete <strong>"{productToDelete.name}"</strong>? This action will remove it from active lists.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="btn btn-ghost text-black"
                onClick={() => setIsDeleteOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="btn btn-error text-white flex items-center gap-2"
                onClick={handleDeleteProduct}
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
