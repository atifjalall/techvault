/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  EyeIcon,
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

export default function VendorEditProductPage() {
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
  const [specifications, setSpecifications] = useState<
    { key: string; value: string }[]
  >([]);
  const [currentStep, setCurrentStep] = useState(1);
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
            setSpecifications(
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
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
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
    setSpecifications((prev) => [...prev, { key: "", value: "" }]);
  };

  const updateSpecification = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    setSpecifications((prev) =>
      prev.map((spec, i) => (i === index ? { ...spec, [field]: value } : spec))
    );
  };

  const removeSpecification = (index: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== index));
  };

  const calculateDiscount = () => {
    if (!product?.price || !product?.comparePrice) return 0;
    if (product.comparePrice <= product.price) return 0;
    return Math.round(
      ((product.comparePrice - product.price) / product.comparePrice) * 100
    );
  };

  const getStockStatus = (): {
    label: string;
    variant: "destructive" | "secondary" | "default" | "outline";
  } => {
    if (!product) return { label: "Unknown", variant: "secondary" };
    if (product.stock === 0)
      return { label: "Out of Stock", variant: "destructive" };
    if (product.stock <= product.lowStockAlert)
      return { label: "Low Stock", variant: "secondary" };
    return { label: "In Stock", variant: "default" };
  };

  const handleSave = async () => {
    if (!product) return;

    setSaving(true);
    try {
      // Simulate image upload
      const uploadedImageUrls =
        newImages.length > 0
          ? newImages.map((img) => `/products/${Date.now()}-${img.name}`)
          : [];

      const allImages = [...product.images, ...uploadedImageUrls];

      const specificationsObj = specifications
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

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        router.push("/vendor/products");
      }, 2000);
    } catch (error) {
      console.error("Error updating product:", error);
      setErrors({ general: "Failed to update product" });
      setShowErrorModal(true);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
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
          <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
            <Link href="/vendor/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="p-6 space-y-6">
      {/* Header with Glassmorphism */}
      <Card className="bg-white/70 backdrop-blur-md border border-white/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-sm text-gray-600">
                Make changes to your product listing
              </p>
            </div>

            {/* Auto-save Status */}
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
                        <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    )}
                    {saveStatus === "saved" && (
                      <>
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Saved
                      </>
                    )}
                    {saveStatus === "error" && (
                      <>
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        Save failed
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center space-x-2">
                <Button variant="outline" asChild>
                  <Link href={`/products/${product.slug}`}>
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview
                  </Link>
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
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

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Sidebar */}
        <Card className="lg:col-span-1 bg-white/70 backdrop-blur-md border border-white/20">
          <CardHeader>
            <CardTitle className="text-lg">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Product Preview */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-100">
                {product.images.length > 0 || imagePreviews.length > 0 ? (
                  <img
                    src={imagePreviews[0] || product.images[0]}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}

                {/* Featured Badge */}
                {product.featured && (
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
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500">{product.brand}</p>
                </div>

                {/* Price */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </span>
                  {product.comparePrice && calculateDiscount() > 0 && (
                    <span className="text-sm text-gray-500 line-through">
                      {formatPrice(product.comparePrice)}
                    </span>
                  )}
                </div>

                {/* Category */}
                {product.categoryId && (
                  <p className="text-xs text-gray-600 mb-3">
                    {categories.find((c) => c.id === product.categoryId)
                      ?.name || "Category"}
                  </p>
                )}

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

            {/* Stats */}
            <div className="space-y-3 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status</span>
                <Badge
                  variant={product.isActive ? "default" : "secondary"}
                  className="text-xs"
                >
                  {product.isActive ? "Active" : "Draft"}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stock</span>
                <Badge variant={stockStatus.variant} className="text-xs">
                  {product.stock} {stockStatus.label}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Featured</span>
                <Badge
                  variant={product.featured ? "default" : "secondary"}
                  className="text-xs"
                >
                  {product.featured ? "Yes" : "No"}
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
                      Update your product details
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={product.name}
                          onChange={(e) =>
                            handleFieldChange("name", e.target.value)
                          }
                          placeholder="e.g. Wireless Gaming Headset Pro"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brand">Brand</Label>
                        <Input
                          id="brand"
                          value={product.brand || ""}
                          onChange={(e) =>
                            handleFieldChange("brand", e.target.value)
                          }
                          placeholder="e.g. Sony, Apple, Samsung"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={product.categoryId}
                          onValueChange={(value) =>
                            handleFieldChange("categoryId", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="modelNumber">Model Number / SKU</Label>
                        <Input
                          id="modelNumber"
                          value={product.modelNumber || ""}
                          onChange={(e) =>
                            handleFieldChange("modelNumber", e.target.value)
                          }
                          placeholder="e.g. WH-1000XM5"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={product.description || ""}
                        onChange={(e) =>
                          handleFieldChange("description", e.target.value)
                        }
                        rows={4}
                        placeholder="Describe your product features, benefits, and specifications..."
                      />
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
                      Update your pricing and inventory levels
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Price (€)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={product.price}
                          onChange={(e) =>
                            handleFieldChange(
                              "price",
                              parseFloat(e.target.value)
                            )
                          }
                          placeholder="299.99"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comparePrice">Compare Price (€)</Label>
                        <Input
                          id="comparePrice"
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
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          value={product.stock}
                          onChange={(e) =>
                            handleFieldChange("stock", parseInt(e.target.value))
                          }
                          placeholder="50"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lowStockAlert">Low Stock Alert</Label>
                        <Input
                          id="lowStockAlert"
                          type="number"
                          value={product.lowStockAlert}
                          onChange={(e) =>
                            handleFieldChange(
                              "lowStockAlert",
                              parseInt(e.target.value)
                            )
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
                      Update images and specifications
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Product Images */}
                    <div className="space-y-4">
                      <Label>Product Images</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {/* Existing Images */}
                        {product.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={() => removeExistingImage(index)}
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}

                        {/* New Images */}
                        {imagePreviews.map((preview, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <img
                              src={preview}
                              alt={`New ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-2 -right-2 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={() => removeNewImage(index)}
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </Button>
                            <div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs p-1 rounded-b-lg">
                              New
                            </div>
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
                        {specifications.map((spec, index) => (
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
                    <CardTitle>Settings & Additional Info</CardTitle>
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
                                {product.isActive
                                  ? "Visible to customers"
                                  : "Hidden from customers"}
                              </p>
                            </div>
                            <Switch
                              checked={product.isActive}
                              onCheckedChange={(checked) =>
                                handleFieldChange("isActive", checked)
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
                                {product.featured
                                  ? "Highlighted in listings"
                                  : "Regular listing"}
                              </p>
                            </div>
                            <Switch
                              checked={product.featured}
                              onCheckedChange={(checked) =>
                                handleFieldChange("featured", checked)
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
                          value={product.color || ""}
                          onChange={(e) =>
                            handleFieldChange("color", e.target.value)
                          }
                          placeholder="Black"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="material">Material</Label>
                        <Input
                          id="material"
                          value={product.material || ""}
                          onChange={(e) =>
                            handleFieldChange("material", e.target.value)
                          }
                          placeholder="Aluminum"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg)</Label>
                        <Input
                          id="weight"
                          value={product.weight || ""}
                          onChange={(e) =>
                            handleFieldChange("weight", e.target.value)
                          }
                          placeholder="1.5"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="warranty">Warranty (years)</Label>
                        <Select
                          value={product.warranty || "2"}
                          onValueChange={(value) =>
                            handleFieldChange("warranty", value)
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
                        value={product.dimensions || ""}
                        onChange={(e) =>
                          handleFieldChange("dimensions", e.target.value)
                        }
                        placeholder="25 x 15 x 8"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={product.tags?.join(", ") || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "tags",
                            e.target.value.split(",").map((tag) => tag.trim())
                          )
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
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
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
                    onClick={() =>
                      setCurrentStep(Math.min(steps.length, currentStep + 1))
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Updating Product...
                      </>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                        Update Product
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
                Changes are auto-saved
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" asChild>
                <Link href={`/products/${product.slug}`}>
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View Live Product
                </Link>
              </Button>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                    Save All Changes
                  </>
                )}
              </Button>
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
              Product Updated Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Your product changes have been saved and are now live.
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
              Failed to Update Product
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {errors.general ||
                "An error occurred while updating your product. Please try again."}
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
                handleSave();
              }}
              disabled={saving}
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
