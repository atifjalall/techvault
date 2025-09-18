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
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";

// UI Components
import { Button } from "@/components/ui/buttonSidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { formatPrice } from "@/lib/utils";

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

export default function VendorAddProductPage() {
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const steps = [
    {
      id: 1,
      name: "Basic Info",
      description: "Product name, brand, and description",
    },
    { id: 2, name: "Pricing", description: "Set price and manage inventory" },
    { id: 3, name: "Media", description: "Add images and specifications" },
    {
      id: 4,
      name: "Settings",
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

  // Auto-save simulation
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

  const handleSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) {
      setCurrentStep(1);
      return;
    }

    if (!session?.user) {
      setApiError("You must be logged in to create products");
      setShowErrorModal(true);
      return;
    }

    setIsLoading(true);
    setApiError("");

    try {
      // Simulate image upload
      const uploadedImageUrls =
        formData.images.length > 0
          ? formData.images.map((img) => `/products/${Date.now()}-${img.name}`)
          : [];

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

      setShowSuccessModal(true);
      // Reset form after successful creation
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/vendor/products");
      }, 2000);
    } catch (error) {
      console.error("Error creating product:", error);
      setApiError(
        error instanceof Error ? error.message : "Failed to create product"
      );
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header with Glassmorphism */}
      <Card className="bg-white/70 backdrop-blur-md border border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="text-sm text-gray-600">
                Create a new product listing for your store
              </p>
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
                        <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                        Saving draft...
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Draft saved
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {getCompletionPercentage()}% Complete
              </Badge>
            </div>
          </div>

          {/* Progress Bar - Blue Glassmorphism */}
          <div className="mt-6">
            <div className="bg-white/30 backdrop-blur-sm rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-3">
              {steps.map((step, index) => (
                <Button
                  key={step.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(step.id)}
                  className={`text-xs ${
                    currentStep >= step.id
                      ? "text-blue-600 font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {step.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Error */}
      {apiError && (
        <Card className="bg-red-50/80 backdrop-blur-md border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-600 text-sm font-medium">{apiError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Sidebar */}
        <Card className="lg:col-span-1 bg-white/70 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-lg">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Original ProductCard Live Preview */}
            <div className="max-w-sm">
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-100">
                  {formData.imagePreviews.length > 0 ? (
                    <img
                      src={formData.imagePreviews[0]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}

                  {/* Featured Badge */}
                  {formData.featured && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-blue-600 text-white text-xs">
                        Featured
                      </Badge>
                    </div>
                  )}

                  {/* Discount Badge */}
                  {calculateDiscount() > 0 && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-500 text-white text-xs">
                        -{calculateDiscount()}%
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">
                      {formData.name || "Product Name"}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {formData.brand || "Brand"}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-lg font-bold text-blue-600">
                      {formData.price
                        ? formatPrice(parseFloat(formData.price))
                        : "€0.00"}
                    </span>
                    {formData.comparePrice && calculateDiscount() > 0 && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(parseFloat(formData.comparePrice))}
                      </span>
                    )}
                  </div>

                  {/* Category */}
                  {formData.categoryId && (
                    <p className="text-xs text-gray-600 mb-3">
                      {categories.find((c) => c.id === formData.categoryId)
                        ?.name || "Category"}
                    </p>
                  )}

                  {/* Rating Placeholder */}
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 bg-gray-200 rounded-full"
                      ></div>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      (0 reviews)
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      disabled
                    >
                      Add to Cart
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-gray-600 border-gray-200"
                      disabled
                    >
                      Add to Wishlist
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Images</span>
                <span className="font-medium">
                  {formData.imagePreviews.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Specifications</span>
                <span className="font-medium">
                  {
                    formData.specifications.filter((s) => s.key && s.value)
                      .length
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <Badge
                  variant={formData.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {formData.isActive ? "Active" : "Draft"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Steps */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <p className="text-sm text-gray-600">
                      Tell us about your product
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="e.g. Wireless Gaming Headset Pro"
                          className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-sm">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand *</Label>
                        <Input
                          id="brand"
                          value={formData.brand}
                          onChange={(e) =>
                            handleInputChange("brand", e.target.value)
                          }
                          placeholder="e.g. Sony, Apple, Samsung"
                          className={errors.brand ? "border-red-500" : ""}
                        />
                        {errors.brand && (
                          <p className="text-red-500 text-sm">{errors.brand}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={formData.categoryId || "select"}
                          onValueChange={(value) =>
                            handleInputChange(
                              "categoryId",
                              value === "select" ? "" : value
                            )
                          }
                        >
                          <SelectTrigger
                            className={
                              errors.categoryId ? "border-red-500" : ""
                            }
                          >
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="select">
                              Select a category
                            </SelectItem>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.categoryId && (
                          <p className="text-red-500 text-sm">
                            {errors.categoryId}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="modelNumber">Model Number / SKU</Label>
                        <Input
                          id="modelNumber"
                          value={formData.modelNumber}
                          onChange={(e) =>
                            handleInputChange("modelNumber", e.target.value)
                          }
                          placeholder="e.g. WH-1000XM5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={4}
                        placeholder="Describe your product features, benefits, and specifications..."
                        className={errors.description ? "border-red-500" : ""}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-sm">
                          {errors.description}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Pricing & Stock */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle>Pricing & Stock</CardTitle>
                    <p className="text-sm text-gray-600">
                      Set your pricing and inventory levels
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (€) *</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) =>
                            handleInputChange("price", e.target.value)
                          }
                          placeholder="299.99"
                          className={errors.price ? "border-red-500" : ""}
                        />
                        {errors.price && (
                          <p className="text-red-500 text-sm">{errors.price}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comparePrice">Compare Price (€)</Label>
                        <Input
                          id="comparePrice"
                          type="number"
                          step="0.01"
                          value={formData.comparePrice}
                          onChange={(e) =>
                            handleInputChange("comparePrice", e.target.value)
                          }
                          placeholder="399.99"
                        />
                        <p className="text-xs text-gray-500">
                          Original price for showing discount
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label>Discount</Label>
                        <div className="px-3 py-2 bg-blue-50 border rounded-md text-sm text-blue-700 font-medium">
                          {calculateDiscount()}% off
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock">Stock Quantity *</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={formData.stock}
                          onChange={(e) =>
                            handleInputChange("stock", e.target.value)
                          }
                          placeholder="50"
                          className={errors.stock ? "border-red-500" : ""}
                        />
                        {errors.stock && (
                          <p className="text-red-500 text-sm">{errors.stock}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                        <Input
                          id="lowStockAlert"
                          type="number"
                          value={formData.lowStockAlert}
                          onChange={(e) =>
                            handleInputChange("lowStockAlert", e.target.value)
                          }
                          placeholder="10"
                        />
                        <p className="text-xs text-gray-500">
                          Alert when stock falls below this number
                        </p>
                      </div>
                    </div>

                    {calculateDiscount() > 0 && (
                      <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                          <span className="text-sm font-medium text-blue-800">
                            {calculateDiscount()}% discount applied - Great for
                            attracting customers!
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Media & Details */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle>Media & Details</CardTitle>
                    <p className="text-sm text-gray-600">
                      Add images and technical specifications
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Product Images */}
                    <div className="space-y-4">
                      <Label>Product Images</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {formData.imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={() => removeImage(index)}
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}

                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                          <CloudArrowUpIcon className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">
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
                    <div className="space-y-4">
                      <Label>Technical Specifications</Label>
                      <div className="space-y-3">
                        {formData.specifications.map((spec, index) => (
                          <div key={index} className="grid grid-cols-5 gap-3">
                            <div className="col-span-2">
                              <Input
                                value={spec.key}
                                onChange={(e) =>
                                  updateSpecification(
                                    index,
                                    "key",
                                    e.target.value
                                  )
                                }
                                placeholder="Feature name"
                              />
                            </div>
                            <div className="col-span-2">
                              <Input
                                value={spec.value}
                                onChange={(e) =>
                                  updateSpecification(
                                    index,
                                    "value",
                                    e.target.value
                                  )
                                }
                                placeholder="Feature value"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSpecification(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XMarkIcon className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSpecification}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        >
                          <PlusIcon className="w-4 h-4 mr-2" />
                          Add Specification
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Settings */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle>Settings & Launch</CardTitle>
                    <p className="text-sm text-gray-600">
                      Configure visibility and additional details
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Quick Settings with Glass Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="bg-blue-50/50 backdrop-blur-sm border border-blue-100">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">
                                Product Visibility
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                {formData.isActive
                                  ? "Visible to customers"
                                  : "Hidden from customers"}
                              </p>
                            </div>
                            <Switch
                              checked={formData.isActive}
                              onCheckedChange={(checked) =>
                                handleInputChange("isActive", checked)
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-blue-50/50 backdrop-blur-sm border border-blue-100">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">
                                Featured Product
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                {formData.featured
                                  ? "Highlighted in listings"
                                  : "Regular listing"}
                              </p>
                            </div>
                            <Switch
                              checked={formData.featured}
                              onCheckedChange={(checked) =>
                                handleInputChange("featured", checked)
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Additional Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="color">Color</Label>
                        <Input
                          id="color"
                          value={formData.color}
                          onChange={(e) =>
                            handleInputChange("color", e.target.value)
                          }
                          placeholder="Black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="material">Material</Label>
                        <Input
                          id="material"
                          value={formData.material}
                          onChange={(e) =>
                            handleInputChange("material", e.target.value)
                          }
                          placeholder="Aluminum"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          value={formData.weight}
                          onChange={(e) =>
                            handleInputChange("weight", e.target.value)
                          }
                          placeholder="1.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="warranty">Warranty (years)</Label>
                        <Select
                          value={formData.warranty}
                          onValueChange={(value) =>
                            handleInputChange("warranty", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No Warranty</SelectItem>
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dimensions">
                        Dimensions (L x W x H cm)
                      </Label>
                      <Input
                        id="dimensions"
                        value={formData.dimensions}
                        onChange={(e) =>
                          handleInputChange("dimensions", e.target.value)
                        }
                        placeholder="25 x 15 x 8"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) =>
                          handleInputChange("tags", e.target.value)
                        }
                        placeholder="wireless, gaming, bluetooth"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Navigation */}
          <Card className="mt-6 bg-white/70 backdrop-blur-md border border-white/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50"
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  Step {currentStep} of {steps.length}
                </Badge>

                {currentStep < steps.length ? (
                  <Button
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Product...
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                        Create Product
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Actions */}
      <Card className="bg-white/70 backdrop-blur-md border border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link
                  href="/vendor/products"
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </Link>
              </Button>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-sm text-gray-500">
                Draft auto-saves as you type
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-500">
                {formData.name
                  ? `"${formData.name.slice(0, 30)}${formData.name.length > 30 ? "..." : ""}"`
                  : "Untitled Product"}
              </span>

              {currentStep === steps.length && (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                      Create Product
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="bg-white/90 backdrop-blur-md border border-green-200">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-800">
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Product Created Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Your product has been created and is now available in your product
              listing.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/vendor/products");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Go to Products
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="bg-white/90 backdrop-blur-md border border-red-200">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-800">
              <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
              Failed to Create Product
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {apiError ||
                "An error occurred while creating your product. Please try again."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowErrorModal(false)}
              className="border-gray-300"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowErrorModal(false);
                handleSubmit();
              }}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
