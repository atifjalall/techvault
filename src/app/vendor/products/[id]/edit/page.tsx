/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftIcon,
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  ScaleIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon,
  InformationCircleIcon,
  CurrencyEuroIcon,
  CubeIcon,
  TagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/ui/ProductCard";

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  brand?: string;
  modelNumber?: string;
  stock: number;
  lowStockAlert: number;
  isActive: boolean;
  featured: boolean;
  categoryId: string;
  warranty?: string;
  weight?: string;
  dimensions?: string;
  color?: string;
  material?: string;
  tags: string[];
  specifications: Record<string, string>;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [newSpecs, setNewSpecs] = useState<{ key: string; value: string }[]>(
    []
  );
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, name: "Basic Info", icon: InformationCircleIcon },
    { id: 2, name: "Pricing & Stock", icon: CurrencyEuroIcon },
    { id: 3, name: "Media & Specs", icon: CubeIcon },
    { id: 4, name: "Settings", icon: TagIcon },
  ];

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const [productRes, categoriesRes] = await Promise.all([
          fetch(`/api/vendor/products/${params.id}`),
          fetch("/api/categories"),
        ]);

        if (productRes.ok) {
          const productData = await productRes.json();
          if (productData.success) {
            setProduct(productData.product);
            const specsArray = Object.entries(
              productData.product.specifications || {}
            ).map(([key, value]) => ({ key, value: String(value) }));
            setNewSpecs(
              specsArray.length > 0 ? specsArray : [{ key: "", value: "" }]
            );
          }
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          if (categoriesData.success) {
            setCategories(categoriesData.categories);
          }
        }
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadProduct();
    }
  }, [params.id]);

  // Auto-save functionality
  const autoSave = async (updatedProduct: Partial<Product>) => {
    if (!product) return;

    setSaveStatus("saving");
    try {
      const response = await fetch(`/api/vendor/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProduct),
      });

      if (response.ok) {
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch (error) {
      console.error("Auto-save error:", error);
      setSaveStatus("error");
    }
  };

  const handleFieldChange = (field: keyof Product, value: any) => {
    if (!product) return;

    const updatedProduct = { ...product, [field]: value };
    setProduct(updatedProduct);

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    setTimeout(() => {
      autoSave({ [field]: value });
    }, 1000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setNewImages((prev) => [...prev, file]);
          setImagePreviews((prev) => [...prev, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeExistingImage = (index: number) => {
    if (!product) return;
    const updatedImages = product.images.filter((_, i) => i !== index);
    handleFieldChange("images", updatedImages);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addSpecification = () => {
    setNewSpecs((prev) => [...prev, { key: "", value: "" }]);
  };

  const updateSpecification = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    setNewSpecs((prev) =>
      prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec))
    );
  };

  const removeSpecification = (index: number) => {
    setNewSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const saveSpecifications = () => {
    const specificationsObj = newSpecs
      .filter((spec) => spec.key.trim() && spec.value.trim())
      .reduce(
        (acc, spec) => {
          acc[spec.key] = spec.value;
          return acc;
        },
        {} as Record<string, string>
      );

    handleFieldChange("specifications", specificationsObj);
  };

  const uploadNewImages = async (): Promise<string[]> => {
    return newImages.map((img) => `/uploads/${Date.now()}-${img.name}`);
  };

  const handleSave = async () => {
    if (!product) return;

    setSaving(true);
    try {
      const uploadedImageUrls =
        newImages.length > 0 ? await uploadNewImages() : [];
      const allImages = [...product.images, ...uploadedImageUrls];

      const specificationsObj = newSpecs
        .filter((spec) => spec.key.trim() && spec.value.trim())
        .reduce(
          (acc, spec) => {
            acc[spec.key] = spec.value;
            return acc;
          },
          {} as Record<string, string>
        );

      const payload = {
        ...product,
        images: allImages,
        specifications: specificationsObj,
      };

      const response = await fetch(`/api/vendor/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push("/vendor/products?success=Product updated successfully");
      } else {
        const errorData = await response.json();
        setErrors({ general: errorData.error || "Failed to update product" });
      }
    } catch (error) {
      console.error("Error updating product:", error);
      setErrors({ general: "Failed to update product" });
    } finally {
      setSaving(false);
    }
  };

  const getDiscountPercentage = () => {
    if (!product?.price || !product?.comparePrice) return 0;
    if (product.comparePrice <= product.price) return 0;
    return Math.round(
      ((product.comparePrice - product.price) / product.comparePrice) * 100
    );
  };

  const getStockStatus = () => {
    if (!product) return { label: "Unknown", color: "gray" };
    if (product.stock === 0) return { label: "Out of Stock", color: "red" };
    if (product.stock <= product.lowStockAlert)
      return { label: "Low Stock", color: "yellow" };
    return { label: "In Stock", color: "green" };
  };

  // Convert product to ProductCard format
  const getProductCardData = () => {
    if (!product) return null;

    return {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      originalPrice: product.comparePrice,
      image: product.images[0] || "/api/placeholder/300/300",
      images: product.images,
      isNew: false,
      isFeatured: product.featured,
      category: categories.find((c) => c.id === product.categoryId)?.name,
      rating: 4.5, // You can calculate this from reviews
      reviewCount: 0, // You can get this from the database
      slug: product.slug,
      description: product.description,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Product not found
          </h2>
          <p className="text-gray-500 mb-4">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/vendor/products"
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();
  const productCardData = getProductCardData();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/vendor/products"
                className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Products
              </Link>
              <div className="h-4 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Edit Product
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Make changes to your product listing
                </p>
              </div>
            </div>

            {/* Save Status & Actions */}
            <div className="flex items-center space-x-4">
              <AnimatePresence>
                {saveStatus !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`flex items-center text-sm ${
                      saveStatus === "saving"
                        ? "text-blue-600"
                        : saveStatus === "saved"
                          ? "text-green-600"
                          : "text-red-600"
                    }`}
                  >
                    {saveStatus === "saving" && (
                      <>
                        <ClockIcon className="w-4 h-4 mr-1 animate-spin" />
                        Saving...
                      </>
                    )}
                    {saveStatus === "saved" && (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Saved
                      </>
                    )}
                    {saveStatus === "error" && (
                      <>
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        Save failed
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center space-x-2">
                <Link
                  href={`/products/${product.slug}`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <EyeIcon className="w-4 h-4 mr-1" />
                  Preview
                </Link>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <ScaleIcon className="w-4 h-4 mr-1" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                    currentStep >= step.id
                      ? "bg-black border-black text-white"
                      : "border-gray-300 text-gray-500 hover:border-gray-400"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </button>
                <span
                  className={`ml-2 text-sm font-medium ${
                    currentStep >= step.id ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      currentStep > step.id ? "bg-black" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Live Preview */}
          <div className="lg:col-span-1">
            <motion.div
              className="bg-white rounded-xl border border-gray-200 p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Live Preview
              </h3>

              {productCardData && (
                <div className="max-w-sm">
                  <ProductCard
                    product={productCardData}
                    variant="default"
                    showQuickActions={false}
                    showAddToCart={false}
                  />
                </div>
              )}

              {/* Quick Stats */}
              <div className="mt-6 space-y-3 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Status</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Stock</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium bg-${stockStatus.color}-100 text-${stockStatus.color}-800`}
                  >
                    {product.stock} {stockStatus.label}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Featured</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.featured
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {product.featured ? "Yes" : "No"}
                  </span>
                </div>

                {getDiscountPercentage() > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Discount</span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {getDiscountPercentage()}% off
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Form Steps */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Basic Information
                  </h3>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name
                        </label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) =>
                            handleFieldChange("name", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand
                        </label>
                        <input
                          type="text"
                          value={product.brand || ""}
                          onChange={(e) =>
                            handleFieldChange("brand", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category
                        </label>
                        <select
                          value={product.categoryId}
                          onChange={(e) =>
                            handleFieldChange("categoryId", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        >
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Model Number
                        </label>
                        <input
                          type="text"
                          value={product.modelNumber || ""}
                          onChange={(e) =>
                            handleFieldChange("modelNumber", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={product.description || ""}
                        onChange={(e) =>
                          handleFieldChange("description", e.target.value)
                        }
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Pricing & Stock */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Pricing & Stock
                  </h3>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={product.price}
                          onChange={(e) =>
                            handleFieldChange(
                              "price",
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Compare Price (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={product.comparePrice || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "comparePrice",
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock
                        </label>
                        <input
                          type="number"
                          value={product.stock}
                          onChange={(e) =>
                            handleFieldChange("stock", parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Low Stock Alert
                        </label>
                        <input
                          type="number"
                          value={product.lowStockAlert}
                          onChange={(e) =>
                            handleFieldChange(
                              "lowStockAlert",
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        />
                      </div>
                    </div>

                    {getDiscountPercentage() > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">
                            {getDiscountPercentage()}% discount applied
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Media & Specifications */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Media & Specifications
                  </h3>

                  <div className="space-y-8">
                    {/* Product Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Product Images
                      </label>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {product.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <Image
                              src={image}
                              alt={`Product ${index + 1}`}
                              width={150}
                              height={150}
                              className="w-full h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              onClick={() => removeExistingImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        {imagePreviews.map((preview, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <img
                              src={preview}
                              alt={`New ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border border-gray-300"
                            />
                            <button
                              onClick={() => removeNewImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs p-1 rounded-b-lg">
                              New
                            </div>
                          </div>
                        ))}

                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                          <PhotoIcon className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-500 mt-1">
                            Add Images
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {/* Specifications */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Technical Specifications
                        </label>
                        <button
                          onClick={saveSpecifications}
                          className="px-3 py-1 bg-black text-white rounded-lg text-sm hover:bg-gray-800 transition-colors"
                        >
                          Save Specs
                        </button>
                      </div>

                      <div className="space-y-3">
                        {newSpecs.map((spec, index) => (
                          <div key={index} className="grid grid-cols-5 gap-3">
                            <div className="col-span-2">
                              <input
                                type="text"
                                value={spec.key}
                                onChange={(e) =>
                                  updateSpecification(
                                    index,
                                    "key",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Feature name"
                              />
                            </div>
                            <div className="col-span-2">
                              <input
                                type="text"
                                value={spec.value}
                                onChange={(e) =>
                                  updateSpecification(
                                    index,
                                    "value",
                                    e.target.value
                                  )
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="Feature value"
                              />
                            </div>
                            <div>
                              <button
                                onClick={() => removeSpecification(index)}
                                className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <TrashIcon className="w-4 h-4 mx-auto" />
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          onClick={addSpecification}
                          className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          <PlusIcon className="w-4 h-4 mr-1" />
                          Add Specification
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Settings & Additional Info */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-gray-200 p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    Settings & Additional Info
                  </h3>

                  <div className="space-y-6">
                    {/* Quick Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Product Status
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {product.isActive
                                ? "Visible to customers"
                                : "Hidden from customers"}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleFieldChange("isActive", !product.isActive)
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              product.isActive ? "bg-black" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                product.isActive
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Featured Product
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {product.featured
                                ? "Highlighted in listings"
                                : "Regular listing"}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              handleFieldChange("featured", !product.featured)
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              product.featured ? "bg-yellow-500" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                product.featured
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Stock Status
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {product.stock} units available
                          </p>
                          <span
                            className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium bg-${stockStatus.color}-100 text-${stockStatus.color}-800`}
                          >
                            {stockStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color
                        </label>
                        <input
                          type="text"
                          value={product.color || ""}
                          onChange={(e) =>
                            handleFieldChange("color", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Material
                        </label>
                        <input
                          type="text"
                          value={product.material || ""}
                          onChange={(e) =>
                            handleFieldChange("material", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Aluminum"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="text"
                          value={product.weight || ""}
                          onChange={(e) =>
                            handleFieldChange("weight", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Warranty (years)
                        </label>
                        <select
                          value={product.warranty || "2"}
                          onChange={(e) =>
                            handleFieldChange("warranty", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          <option value="0">No Warranty</option>
                          <option value="1">1 Year</option>
                          <option value="2">2 Years</option>
                          <option value="3">3 Years</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dimensions (L x W x H cm)
                      </label>
                      <input
                        type="text"
                        value={product.dimensions || ""}
                        onChange={(e) =>
                          handleFieldChange("dimensions", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="25 x 15 x 8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={product.tags?.join(", ") || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "tags",
                            e.target.value.split(",").map((tag) => tag.trim())
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="wireless, gaming, bluetooth"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step Navigation */}
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Previous
              </button>

              <span className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </span>

              <button
                onClick={() =>
                  setCurrentStep(Math.min(steps.length, currentStep + 1))
                }
                disabled={currentStep === steps.length}
                className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRightIcon className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-red-600 text-sm">{errors.general}</p>
          </motion.div>
        )}

        {/* Bottom Actions */}
        <motion.div
          className="mt-8 flex items-center justify-between bg-white rounded-xl border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center space-x-4">
            <Link
              href="/vendor/products"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </Link>
            <div className="h-4 w-px bg-gray-300" />
            <span className="text-sm text-gray-500">
              Changes are auto-saved
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href={`/products/${product.slug}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              View Live Product
            </Link>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-6 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <ScaleIcon className="w-4 h-4 mr-2" />
                  Save All Changes
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
