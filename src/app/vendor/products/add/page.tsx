/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ScaleIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/ui/ProductCard";

interface FormData {
  name: string;
  brand: string;
  categoryId: string;
  modelNumber: string;
  description: string;
  price: string;
  comparePrice: string;
  stock: string;
  lowStockAlert: string;
  images: File[];
  imagePreviews: string[];
  specifications: { key: string; value: string }[];
  featured: boolean;
  isActive: boolean;
  warranty: string;
  weight: string;
  dimensions: string;
  tags: string;
  color: string;
  material: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function EnhancedAddProductForm() {
  const router = useRouter();
  const { data: session } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    brand: "",
    categoryId: "",
    modelNumber: "",
    description: "",
    price: "",
    comparePrice: "",
    stock: "",
    lowStockAlert: "10",
    images: [],
    imagePreviews: [],
    specifications: [{ key: "", value: "" }],
    featured: false,
    isActive: true,
    warranty: "2",
    weight: "",
    dimensions: "",
    tags: "",
    color: "",
    material: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");

  const steps = [
    {
      id: 1,
      name: "Basic Information",
      description: "Product name, brand, and description",
    },
    {
      id: 2,
      name: "Pricing & Stock",
      description: "Set price and manage inventory",
    },
    {
      id: 3,
      name: "Media & Details",
      description: "Add images and specifications",
    },
    {
      id: 4,
      name: "Settings & Launch",
      description: "Configure visibility and features",
    },
  ];

  // Load categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  // Auto-save draft (simulate)
  useEffect(() => {
    if (formData.name || formData.brand || formData.description) {
      setAutoSaveStatus("saving");
      const timer = setTimeout(() => {
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.name, formData.brand, formData.description, formData.price]);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, file],
            imagePreviews: [...prev.imagePreviews, result],
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const updateSpecification = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec
      ),
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = "Product name is required";
      if (!formData.brand.trim()) newErrors.brand = "Brand is required";
      if (!formData.categoryId) newErrors.categoryId = "Category is required";
      if (!formData.description.trim())
        newErrors.description = "Description is required";
    }

    if (step === 2) {
      if (!formData.price || parseFloat(formData.price) <= 0)
        newErrors.price = "Valid price is required";
      if (!formData.stock || parseInt(formData.stock) < 0)
        newErrors.stock = "Valid stock quantity is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(Math.min(currentStep + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const uploadImages = async (images: File[]): Promise<string[]> => {
    return images.map((img) => `/uploads/${Date.now()}-${img.name}`);
  };

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1);
      return;
    }

    if (!session?.user) {
      setApiError("You must be logged in to create products");
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      const uploadedImageUrls =
        formData.images.length > 0 ? await uploadImages(formData.images) : [];

      const specificationsObj = formData.specifications
        .filter((spec) => spec.key.trim() && spec.value.trim())
        .reduce(
          (acc, spec) => {
            acc[spec.key] = spec.value;
            return acc;
          },
          {} as Record<string, string>
        );

      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        brand: formData.brand.trim() || undefined,
        categoryId: formData.categoryId,
        modelNumber: formData.modelNumber.trim() || undefined,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice
          ? parseFloat(formData.comparePrice)
          : undefined,
        stock: parseInt(formData.stock),
        lowStockAlert: parseInt(formData.lowStockAlert),
        images: uploadedImageUrls,
        specifications:
          Object.keys(specificationsObj).length > 0
            ? specificationsObj
            : undefined,
        featured: formData.featured,
        isActive: formData.isActive,
        warranty: formData.warranty || undefined,
        weight: formData.weight.trim() || undefined,
        dimensions: formData.dimensions.trim() || undefined,
        tags: tagsArray,
        color: formData.color.trim() || undefined,
        material: formData.material.trim() || undefined,
      };

      const response = await fetch("/api/vendor/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create product");
      }

      router.push("/vendor/products?success=Product created successfully");
    } catch (error) {
      console.error("Error creating product:", error);
      setApiError(
        error instanceof Error ? error.message : "Failed to create product"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDiscount = () => {
    if (formData.price && formData.comparePrice) {
      const price = parseFloat(formData.price);
      const comparePrice = parseFloat(formData.comparePrice);
      if (comparePrice > price) {
        return Math.round(((comparePrice - price) / comparePrice) * 100);
      }
    }
    return 0;
  };

  // Convert form data to ProductCard format for preview
  const getProductCardData = () => {
    return {
      id: "preview",
      name: formData.name || "Product Name",
      brand: formData.brand || undefined,
      price: parseFloat(formData.price) || 0,
      originalPrice: formData.comparePrice
        ? parseFloat(formData.comparePrice)
        : undefined,
      image: formData.imagePreviews[0] || "/api/placeholder/300/300",
      images: formData.imagePreviews,
      isNew: false,
      isFeatured: formData.featured,
      category: categories.find((c) => c.id === formData.categoryId)?.name,
      rating: 4.5,
      reviewCount: 0,
      slug: "preview",
      description: formData.description || undefined,
    };
  };

  const getCompletionPercentage = () => {
    const requiredFields = [
      formData.name,
      formData.brand,
      formData.categoryId,
      formData.description,
      formData.price,
      formData.stock,
    ];
    const completedFields = requiredFields.filter(
      (field) => field && field.toString().trim()
    ).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

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
                  Add New Product
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Create a new product listing for your store
                </p>
              </div>
            </div>

            {/* Auto-save Status */}
            <div className="flex items-center space-x-4">
              <AnimatePresence>
                {autoSaveStatus !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`flex items-center text-sm ${
                      autoSaveStatus === "saving"
                        ? "text-blue-600"
                        : "text-green-600"
                    }`}
                  >
                    {autoSaveStatus === "saving" ? (
                      <>
                        <ClockIcon className="w-4 h-4 mr-1 animate-spin" />
                        Saving draft...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Draft saved
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="text-sm text-gray-500">
                {getCompletionPercentage()}% Complete
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-black rounded-full h-2"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(step.id)}
                  className={`text-xs ${
                    currentStep >= step.id
                      ? "text-black font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {step.name}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* API Error */}
        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl"
          >
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600 text-sm font-medium">{apiError}</p>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
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

              <div className="max-w-sm">
                <ProductCard
                  product={getProductCardData()}
                  variant="default"
                  showQuickActions={false}
                  showAddToCart={false}
                />
              </div>

              {/* Preview Stats */}
              <div className="mt-6 space-y-3 pt-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completion</span>
                  <span className="text-sm font-medium text-gray-900">
                    {getCompletionPercentage()}%
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Images</span>
                  <span className="text-sm text-gray-900">
                    {formData.imagePreviews.length} uploaded
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Specifications</span>
                  <span className="text-sm text-gray-900">
                    {
                      formData.specifications.filter((s) => s.key && s.value)
                        .length
                    }{" "}
                    added
                  </span>
                </div>

                {calculateDiscount() > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Discount</span>
                    <span className="text-sm text-green-600 font-medium">
                      {calculateDiscount()}% off
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
                  className="bg-white rounded-xl border border-gray-200 p-8"
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Basic Information
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Tell us about your product
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Product Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                            errors.name ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="e.g. Wireless Gaming Headset Pro"
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Brand *
                        </label>
                        <input
                          type="text"
                          value={formData.brand}
                          onChange={(e) =>
                            handleInputChange("brand", e.target.value)
                          }
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                            errors.brand ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="e.g. Sony, Apple, Samsung"
                        />
                        {errors.brand && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.brand}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          value={formData.categoryId}
                          onChange={(e) =>
                            handleInputChange("categoryId", e.target.value)
                          }
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                            errors.categoryId
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {errors.categoryId && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.categoryId}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Model Number / SKU
                        </label>
                        <input
                          type="text"
                          value={formData.modelNumber}
                          onChange={(e) =>
                            handleInputChange("modelNumber", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="e.g. WH-1000XM5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={4}
                        className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                          errors.description
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Describe your product features, benefits, and specifications..."
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.description}
                        </p>
                      )}
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
                  className="bg-white rounded-xl border border-gray-200 p-8"
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Pricing & Stock
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Set your pricing and inventory levels
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Price (€) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) =>
                            handleInputChange("price", e.target.value)
                          }
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                            errors.price ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="299.99"
                        />
                        {errors.price && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.price}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Compare Price (€)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.comparePrice}
                          onChange={(e) =>
                            handleInputChange("comparePrice", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="399.99"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Original price for showing discount
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Discount
                        </label>
                        <div className="px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-gray-900">
                          {calculateDiscount()}% off
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock Quantity *
                        </label>
                        <input
                          type="number"
                          value={formData.stock}
                          onChange={(e) =>
                            handleInputChange("stock", e.target.value)
                          }
                          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all ${
                            errors.stock ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="50"
                        />
                        {errors.stock && (
                          <p className="text-red-500 text-sm mt-1">
                            {errors.stock}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Low Stock Alert
                        </label>
                        <input
                          type="number"
                          value={formData.lowStockAlert}
                          onChange={(e) =>
                            handleInputChange("lowStockAlert", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="10"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Alert when stock falls below this number
                        </p>
                      </div>
                    </div>

                    {calculateDiscount() > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">
                            {calculateDiscount()}% discount applied - Great for
                            attracting customers!
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Media & Details */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-gray-200 p-8"
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Media & Details
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Add images and technical specifications
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Product Images */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Product Images
                      </label>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Product ${index + 1}`}
                              className="w-full h-32 object-cover rounded-xl border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </button>
                          </div>
                        ))}

                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
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
                      <label className="block text-sm font-medium text-gray-700 mb-4">
                        Technical Specifications
                      </label>

                      <div className="space-y-3">
                        {formData.specifications.map((spec, index) => (
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                                placeholder="Feature value"
                              />
                            </div>
                            <div>
                              <button
                                type="button"
                                onClick={() => removeSpecification(index)}
                                className="w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <XMarkIcon className="w-4 h-4 mx-auto" />
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
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

              {/* Step 4: Settings & Launch */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-xl border border-gray-200 p-8"
                >
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Settings & Launch
                    </h3>
                    <p className="text-gray-600 mt-1">
                      Configure visibility and additional details
                    </p>
                  </div>

                  <div className="space-y-8">
                    {/* Quick Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Product Visibility
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formData.isActive
                                ? "Visible to customers"
                                : "Hidden from customers"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange("isActive", !formData.isActive)
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              formData.isActive ? "bg-black" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                formData.isActive
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Featured Product
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formData.featured
                                ? "Highlighted in listings"
                                : "Regular listing"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleInputChange("featured", !formData.featured)
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              formData.featured
                                ? "bg-yellow-500"
                                : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                formData.featured
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Color
                        </label>
                        <input
                          type="text"
                          value={formData.color}
                          onChange={(e) =>
                            handleInputChange("color", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="Black"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Material
                        </label>
                        <input
                          type="text"
                          value={formData.material}
                          onChange={(e) =>
                            handleInputChange("material", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="Aluminum"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Weight (kg)
                        </label>
                        <input
                          type="text"
                          value={formData.weight}
                          onChange={(e) =>
                            handleInputChange("weight", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                          placeholder="1.5"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Warranty (years)
                        </label>
                        <select
                          value={formData.warranty}
                          onChange={(e) =>
                            handleInputChange("warranty", e.target.value)
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
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
                        value={formData.dimensions}
                        onChange={(e) =>
                          handleInputChange("dimensions", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                        placeholder="25 x 15 x 8"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.tags}
                        onChange={(e) =>
                          handleInputChange("tags", e.target.value)
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all"
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
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="w-4 h-4 mr-1" />
                Previous
              </button>

              <span className="text-sm text-gray-500">
                Step {currentStep} of {steps.length}
              </span>

              {currentStep < steps.length ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Next
                  <ChevronRightIcon className="w-4 h-4 ml-1" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Product...
                    </>
                  ) : (
                    <>
                      <ScaleIcon className="w-4 h-4 mr-1" />
                      Create Product
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Summary */}
        <motion.div
          className="mt-8 bg-white rounded-xl border border-gray-200 p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/vendor/products"
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </Link>
              <div className="h-4 w-px bg-gray-300" />
              <span className="text-sm text-gray-500">
                Draft auto-saves as you type
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <div className="text-sm text-gray-500">
                {formData.name
                  ? `"${formData.name.slice(0, 30)}${formData.name.length > 30 ? "..." : ""}"`
                  : "Untitled Product"}
              </div>

              {currentStep === steps.length && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating Product...
                    </>
                  ) : (
                    <>
                      <ScaleIcon className="w-4 h-4 mr-2" />
                      Create Product
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
