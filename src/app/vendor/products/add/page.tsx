/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { uploadMultipleImages } from "@/lib/cloudinary";

import {
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloudArrowUpIcon,
  SparklesIcon,
  HeartIcon,
  ShoppingBagIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";

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

interface ColorVariant {
  color: string;
  image: File | null;
  imagePreview: string;
  cloudinaryUrl?: string;
}

interface FormData {
  name: string;
  brandId: string;
  categoryId: string;
  subcategoryId: string;
  modelNumber: string;
  description: string;
  price: string;
  comparePrice: string;
  stock: string;
  lowStockAlert: string;
  images: File[];
  imagePreviews: string[];
  cloudinaryUrls?: string[];
  colorVariants: ColorVariant[];
  specifications: { key: string; value: string }[];
  featured: boolean;
  newArrival: boolean;
  returnable: boolean;
  isActive: boolean;
  warranty: string;
  weight: string;
  dimensions: string;
  tags: string;
  color: string;
  material: string;
  storage: string;
  length: string;
  deliveryDays: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

// Predefined color options
const COLOR_OPTIONS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#EF4444" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Yellow", value: "#F59E0B" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
  { name: "Orange", value: "#F97316" },
  { name: "Brown", value: "#92400E" },
  { name: "Navy", value: "#1E3A8A" },
  { name: "Rose Gold", value: "#E11D48" },
  { name: "Silver", value: "#9CA3AF" },
  { name: "Gold", value: "#D97706" },
];

// ProductCard Preview Component (original style)
function ProductCardPreview({
  formData,
  selectedCategory,
  brands,
}: {
  formData: FormData;
  selectedCategory: Category | null;
  brands: Brand[];
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discountPercentage =
    formData.comparePrice && formData.price
      ? Math.round(
          ((parseFloat(formData.comparePrice) - parseFloat(formData.price)) /
            parseFloat(formData.comparePrice)) *
            100
        )
      : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div className="group relative bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 hover:border-white/30 hover:-translate-y-1">
      {/* Product Image */}
      <div className="relative aspect-square bg-gradient-to-br from-gray-50/80 to-gray-100/60 backdrop-blur-sm overflow-hidden">
        {/* Left side badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {formData.newArrival && (
            <span className="bg-black text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              NEW
            </span>
          )}
          {formData.featured && (
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              FEATURED
            </span>
          )}
        </div>

        {/* Top right elements */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
          {/* Discount badge */}
          {discountPercentage > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              -{discountPercentage}%
            </span>
          )}

          {/* Heart icon */}
          <button
            onClick={handleWishlistToggle}
            className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl border border-white/30 transition-all duration-300 hover:scale-110 hover:bg-white/95 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
            title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isWishlisted ? (
              <HeartIconSolid className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <HeartIcon className="h-3.5 w-3.5 text-gray-600 hover:text-red-500" />
            )}
          </button>
        </div>

        {/* Product Image */}
        <div className="w-full h-full bg-gradient-to-br from-gray-100/80 to-gray-200/60 backdrop-blur-sm flex items-center justify-center group-hover:scale-105 transition-transform duration-700">
          {formData.imagePreviews.length > 0 ? (
            <img
              src={formData.imagePreviews[0]}
              alt={formData.name || "Product preview"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-xl shadow-md mx-auto mb-2 flex items-center justify-center border border-white/20">
                <div className="w-8 h-8 bg-gray-300/70 rounded-lg"></div>
              </div>
              <p className="text-xs font-medium">
                {selectedCategory?.name || "Product"}
              </p>
            </div>
          )}
        </div>

        {/* Color variants display */}
        {formData.colorVariants.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1">
            {formData.colorVariants.slice(0, 4).map((variant, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{
                  backgroundColor:
                    COLOR_OPTIONS.find((c) => c.name === variant.color)
                      ?.value || "#6B7280",
                }}
              />
            ))}
            {formData.colorVariants.length > 4 && (
              <span className="text-xs text-white bg-black/50 px-1 rounded">
                +{formData.colorVariants.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Quick Add to Cart - slides up from bottom */}
        <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm">
          <button
            className="w-full bg-black/90 backdrop-blur-md text-white py-2.5 px-3 rounded-lg text-xs font-semibold hover:bg-black/95 transition-all duration-300 flex items-center justify-center border border-white/20 cursor-pointer"
            disabled
          >
            <ShoppingBagIcon className="h-3.5 w-3.5 mr-1.5" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="space-y-1.5">
          {/* Brand & Name */}
          <div>
            {formData.brandId && (
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                {brands.find((brand) => brand.id === formData.brandId)?.name ||
                  "Brand"}
              </p>
            )}
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors leading-tight">
              {formData.name || "Untitled Product"}
            </h3>
          </div>

          {/* Rating */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="h-2.5 w-2.5 fill-gray-200"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-gray-400">(0)</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline space-x-2">
              <span className="text-base font-bold text-gray-900">
                {formData.price ? `€${formData.price}` : "€0.00"}
              </span>
              {formData.comparePrice &&
                parseFloat(formData.comparePrice) >
                  parseFloat(formData.price || "0") && (
                  <span className="text-sm text-gray-500 line-through">
                    €{formData.comparePrice}
                  </span>
                )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {formData.stock && <span>{formData.stock} in stock</span>}
            {formData.deliveryDays && (
              <span>{formData.deliveryDays}d delivery</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Color Variant Component
function ColorVariantManager({
  colorVariants,
  onUpdate,
}: {
  colorVariants: ColorVariant[];
  onUpdate: (variants: ColorVariant[]) => void;
}) {
  const addColorVariant = () => {
    onUpdate([...colorVariants, { color: "", image: null, imagePreview: "" }]);
  };

  const updateColorVariant = (
    index: number,
    field: keyof ColorVariant,
    value: any
  ) => {
    const updated = colorVariants.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    );
    onUpdate(updated);
  };

  const removeColorVariant = (index: number) => {
    onUpdate(colorVariants.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (index: number, file: File) => {
    // Create preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      updateColorVariant(index, "imagePreview", reader.result as string);
    };
    reader.readAsDataURL(file);

    updateColorVariant(index, "image", file);

    // Upload to Cloudinary in background
    try {
      const cloudinaryUrls = await uploadMultipleImages([file]);
      updateColorVariant(index, "cloudinaryUrl", cloudinaryUrls[0]);
    } catch (error) {
      console.error("Color image upload failed:", error);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Color Variants (Optional)</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addColorVariant}
          className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Add Color
        </Button>
      </div>

      {colorVariants.length > 0 && (
        <div className="space-y-3">
          {colorVariants.map((variant, index) => (
            <Card
              key={index}
              className="bg-gray-50/50 backdrop-blur-sm border border-gray-200"
            >
              <CardContent className="p-3">
                <div className="flex items-center space-x-3">
                  {/* Color Selection */}
                  <div className="flex-1">
                    <Select
                      value={variant.color}
                      onValueChange={(value) =>
                        updateColorVariant(index, "color", value)
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select color" />
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map((color) => (
                          <SelectItem key={color.name} value={color.name}>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: color.value }}
                              />
                              <span>{color.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Image Upload */}
                  <div className="flex items-center space-x-2">
                    {variant.imagePreview ? (
                      <img
                        src={variant.imagePreview}
                        alt={`${variant.color} variant`}
                        className="w-12 h-12 rounded-lg object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg border flex items-center justify-center">
                        <PhotoIcon className="w-6 h-6 text-gray-400" />
                      </div>
                    )}

                    <label className="cursor-pointer">
                      <span className="text-sm text-blue-600 hover:text-blue-700 underline">
                        {variant.imagePreview ? "Change" : "Upload"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(index, file);
                        }}
                      />
                    </label>

                    {variant.cloudinaryUrl && (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeColorVariant(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {colorVariants.length === 0 && (
        <div className="text-center py-6 text-gray-500 bg-gray-50/30 rounded-lg border border-dashed border-gray-300">
          <SwatchIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm">No color variants added</p>
          <p className="text-xs">
            Add colors to help customers choose variants
          </p>
        </div>
      )}
    </div>
  );
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
    brandId: "",
    categoryId: "",
    subcategoryId: "",
    modelNumber: "",
    description: "",
    price: "",
    comparePrice: "",
    stock: "",
    lowStockAlert: "10",
    images: [],
    imagePreviews: [],
    colorVariants: [],
    specifications: [{ key: "", value: "" }],
    featured: false,
    newArrival: false,
    returnable: true,
    isActive: true,
    warranty: "2",
    weight: "",
    dimensions: "",
    tags: "",
    color: "",
    material: "",
    storage: "",
    length: "",
    deliveryDays: "3",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);

  const steps = [
    {
      id: 1,
      name: "Basic Info",
      description: "Product name, brand, and category",
    },
    {
      id: 2,
      name: "Details",
      description: "Description, specifications, and attributes",
    },
    { id: 3, name: "Pricing", description: "Set price and manage inventory" },
    { id: 4, name: "Media", description: "Add images and configure settings" },
  ];

  // Load categories with subcategories
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

  // Update selected category when categoryId changes
  useEffect(() => {
    if (formData.categoryId && categories.length > 0) {
      const category = categories.find((c) => c.id === formData.categoryId);
      setSelectedCategory(category || null);
      if (
        formData.subcategoryId &&
        category &&
        !category.subcategories.find((s) => s.id === formData.subcategoryId)
      ) {
        setFormData((prev) => ({ ...prev, subcategoryId: "" }));
      }
    }
  }, [formData.categoryId, categories]);

  // Auto-save simulation
  useEffect(() => {
    if (formData.name || formData.brandId || formData.description) {
      setAutoSaveStatus("saving");
      const timer = setTimeout(() => {
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [formData.name, formData.brandId, formData.description, formData.price]);

  useEffect(() => {
    // Load brands
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBrands(data.brands);
        }
      })
      .catch((err) => console.error("Error loading brands:", err));
  }, []);

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    if (apiError) {
      setApiError("");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      setErrors({ images: "Maximum 5 images allowed" });
      return;
    }

    setIsLoading(true);

    try {
      const newPreviews = [...formData.imagePreviews];
      const newImages = [...formData.images];

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => newPreviews.push(reader.result as string);
        reader.readAsDataURL(file);
        newImages.push(file);
      });

      setTimeout(() => {
        setFormData((prev) => ({
          ...prev,
          images: newImages,
          imagePreviews: newPreviews,
        }));
      }, 100);

      const cloudinaryUrls = await uploadMultipleImages(files);
      setFormData((prev) => ({
        ...prev,
        cloudinaryUrls: [...(prev.cloudinaryUrls || []), ...cloudinaryUrls],
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
      setErrors({ images: "Failed to upload images. Please try again." });
    } finally {
      setIsLoading(false);
    }
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

  const validateCurrentStep = () => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) stepErrors.name = "Product name is required";
      if (!formData.categoryId) stepErrors.categoryId = "Category is required";
      if (!formData.brandId) stepErrors.brandId = "Brand is required";
    } else if (currentStep === 2) {
      if (!formData.description.trim())
        stepErrors.description = "Description is required";
      if (formData.weight && isNaN(parseFloat(formData.weight))) {
        stepErrors.weight = "Weight must be a valid number";
      }
    } else if (currentStep === 3) {
      if (!formData.price || parseFloat(formData.price) <= 0) {
        stepErrors.price = "Valid price is required";
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        stepErrors.stock = "Valid stock quantity is required";
      }
      if (
        formData.comparePrice &&
        parseFloat(formData.comparePrice) <= parseFloat(formData.price || "0")
      ) {
        stepErrors.comparePrice =
          "Compare price must be higher than regular price";
      }
      if (
        formData.deliveryDays &&
        (parseInt(formData.deliveryDays) < 1 ||
          parseInt(formData.deliveryDays) > 30)
      ) {
        stepErrors.deliveryDays = "Delivery days must be between 1 and 30";
      }
    }

    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep() && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getCompletionPercentage = () => {
    const requiredFields = [
      formData.name,
      formData.brandId,
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
    if (!validateCurrentStep()) return;

    setIsLoading(true);
    setApiError("");

    try {
      let finalImageUrls: string[] = [];

      if (formData.cloudinaryUrls && formData.cloudinaryUrls.length > 0) {
        finalImageUrls = formData.cloudinaryUrls;
      } else if (formData.images.length > 0) {
        finalImageUrls = await uploadMultipleImages(formData.images);
      }

      // Prepare color variants with Cloudinary URLs
      const colorVariantsForSubmission = formData.colorVariants
        .filter((variant) => variant.color && variant.cloudinaryUrl)
        .map((variant) => ({
          color: variant.color,
          image: variant.cloudinaryUrl!,
        }));

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
        brandId: formData.brandId.trim() || undefined,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        modelNumber: formData.modelNumber.trim() || undefined,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice
          ? parseFloat(formData.comparePrice)
          : undefined,
        stock: parseInt(formData.stock),
        lowStockAlert: parseInt(formData.lowStockAlert),
        images: finalImageUrls,
        colors: colorVariantsForSubmission, // This will be processed in the API
        specifications:
          Object.keys(specificationsObj).length > 0
            ? specificationsObj
            : undefined,
        featured: formData.featured,
        newArrival: formData.newArrival,
        returnable: formData.returnable,
        isActive: formData.isActive,
        warranty: formData.warranty || undefined,
        weight: formData.weight.trim() || undefined,
        dimensions: formData.dimensions.trim() || undefined,
        storage: formData.storage.trim() || undefined,
        length: formData.length.trim() || undefined,
        deliveryDays: formData.deliveryDays
          ? parseInt(formData.deliveryDays)
          : undefined,
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
    <div className="p-4 space-y-4">
      {/* Header */}
      <Card className="bg-white/70 backdrop-blur-md border border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Add New Product
              </h1>
              <p className="text-sm text-gray-600">
                Create a new product listing for your store
              </p>
            </div>

            <div className="flex items-center space-x-3">
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
              <Badge
                variant="secondary"
                className="bg-blue-50 text-blue-700 text-xs"
              >
                {getCompletionPercentage()}% Complete
              </Badge>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="bg-white/30 backdrop-blur-sm rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <Button
                  key={step.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentStep(step.id)}
                  className={`text-xs cursor-pointer ${
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
          <CardContent className="p-3">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mr-2" />
              <p className="text-red-600 text-sm font-medium">{apiError}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Preview Sidebar */}
        <Card className="lg:col-span-1 bg-white/70 backdrop-blur-md border border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProductCardPreview
              formData={formData}
              selectedCategory={selectedCategory}
              brands={brands}
            />

            {/* Stats */}
            <div className="space-y-2 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Images</span>
                <span className="font-medium">
                  {formData.imagePreviews.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Colors</span>
                <span className="font-medium">
                  {formData.colorVariants.length}
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
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                    <p className="text-sm text-gray-600">
                      Tell us about your product
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm">
                          Product Name *
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) =>
                            handleInputChange("name", e.target.value)
                          }
                          placeholder="e.g. Wireless Gaming Headset Pro"
                          className={`text-sm ${errors.name ? "border-red-500" : ""}`}
                        />
                        {errors.name && (
                          <p className="text-red-500 text-xs">{errors.name}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="brand" className="text-sm">
                          Brand *
                        </Label>
                        <Select
                          value={formData.brandId || "select"}
                          onValueChange={(value) =>
                            handleInputChange(
                              "brandId",
                              value === "select" ? "" : value
                            )
                          }
                        >
                          <SelectTrigger
                            className={`text-sm ${errors.brandId ? "border-red-500" : ""}`}
                          >
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="select">
                              Select a brand
                            </SelectItem>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id}>
                                {brand.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.brandId && (
                          <p className="text-red-500 text-xs">
                            {errors.brandId}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm">
                          Category *
                        </Label>
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
                            className={`text-sm ${errors.categoryId ? "border-red-500" : ""}`}
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
                          <p className="text-red-500 text-xs">
                            {errors.categoryId}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="subcategory" className="text-sm">
                          Subcategory
                        </Label>
                        <Select
                          value={formData.subcategoryId || "select"}
                          onValueChange={(value) =>
                            handleInputChange(
                              "subcategoryId",
                              value === "select" ? "" : value
                            )
                          }
                          disabled={
                            !selectedCategory ||
                            selectedCategory.subcategories.length === 0
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue placeholder="Select a subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="select">
                              Select a subcategory
                            </SelectItem>
                            {selectedCategory?.subcategories.map(
                              (subcategory) => (
                                <SelectItem
                                  key={subcategory.id}
                                  value={subcategory.id}
                                >
                                  {subcategory.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="modelNumber" className="text-sm">
                        Model Number / SKU
                      </Label>
                      <Input
                        id="modelNumber"
                        value={formData.modelNumber}
                        onChange={(e) =>
                          handleInputChange("modelNumber", e.target.value)
                        }
                        placeholder="e.g. WH-1000XM5"
                        className="text-sm"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-md border border-white/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Product Details</CardTitle>
                    <p className="text-sm text-gray-600">
                      Description, specifications, and attributes
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        rows={4}
                        placeholder="Describe your product features, benefits, and specifications..."
                        className={`text-sm ${errors.description ? "border-red-500" : ""}`}
                      />
                      {errors.description && (
                        <p className="text-red-500 text-xs">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Physical Attributes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="color" className="text-sm">
                          Color
                        </Label>
                        <Input
                          id="color"
                          value={formData.color}
                          onChange={(e) =>
                            handleInputChange("color", e.target.value)
                          }
                          placeholder="Black"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="material" className="text-sm">
                          Material
                        </Label>
                        <Input
                          id="material"
                          value={formData.material}
                          onChange={(e) =>
                            handleInputChange("material", e.target.value)
                          }
                          placeholder="Aluminum"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-sm">
                          Weight (kg)
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          value={formData.weight}
                          onChange={(e) =>
                            handleInputChange("weight", e.target.value)
                          }
                          placeholder="1.5"
                          className={`text-sm ${errors.weight ? "border-red-500" : ""}`}
                        />
                        {errors.weight && (
                          <p className="text-red-500 text-xs">
                            {errors.weight}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dimensions" className="text-sm">
                          Dimensions (L x W x H cm)
                        </Label>
                        <Input
                          id="dimensions"
                          value={formData.dimensions}
                          onChange={(e) =>
                            handleInputChange("dimensions", e.target.value)
                          }
                          placeholder="25 x 15 x 8"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="storage" className="text-sm">
                          Storage/Memory
                        </Label>
                        <Input
                          id="storage"
                          value={formData.storage}
                          onChange={(e) =>
                            handleInputChange("storage", e.target.value)
                          }
                          placeholder="128GB, 16GB RAM, etc."
                          className="text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="length" className="text-sm">
                        Length (if applicable)
                      </Label>
                      <Input
                        id="length"
                        value={formData.length}
                        onChange={(e) =>
                          handleInputChange("length", e.target.value)
                        }
                        placeholder="Cable length, etc."
                        className="text-sm"
                      />
                    </div>

                    {/* Specifications */}
                    <div className="space-y-3">
                      <Label className="text-sm">
                        Technical Specifications
                      </Label>
                      <div className="space-y-2">
                        {formData.specifications.map((spec, index) => (
                          <div key={index} className="grid grid-cols-5 gap-2">
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
                                className="text-sm"
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
                                className="text-sm"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeSpecification(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSpecification}
                          className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                        >
                          <PlusIcon className="w-3 h-3 mr-1" />
                          Add Specification
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Pricing & Stock */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-md border border-white/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Pricing & Stock</CardTitle>
                    <p className="text-sm text-gray-600">
                      Set your pricing and inventory levels
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-sm">
                          Price (€) *
                        </Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.price}
                          onChange={(e) =>
                            handleInputChange("price", e.target.value)
                          }
                          placeholder="299.99"
                          className={`text-sm ${errors.price ? "border-red-500" : ""}`}
                        />
                        {errors.price && (
                          <p className="text-red-500 text-xs">{errors.price}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="comparePrice" className="text-sm">
                          Compare Price (€)
                        </Label>
                        <Input
                          id="comparePrice"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.comparePrice}
                          onChange={(e) =>
                            handleInputChange("comparePrice", e.target.value)
                          }
                          placeholder="399.99"
                          className={`text-sm ${errors.comparePrice ? "border-red-500" : ""}`}
                        />
                        {errors.comparePrice && (
                          <p className="text-red-500 text-xs">
                            {errors.comparePrice}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Original price for showing discount
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm">Discount</Label>
                        <div className="px-3 py-2 bg-blue-50 border rounded-md text-sm text-blue-700 font-medium">
                          {formData.comparePrice &&
                          formData.price &&
                          parseFloat(formData.comparePrice) >
                            parseFloat(formData.price)
                            ? Math.round(
                                ((parseFloat(formData.comparePrice) -
                                  parseFloat(formData.price)) /
                                  parseFloat(formData.comparePrice)) *
                                  100
                              )
                            : 0}
                          % off
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="stock" className="text-sm">
                          Stock Quantity *
                        </Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={formData.stock}
                          onChange={(e) =>
                            handleInputChange("stock", e.target.value)
                          }
                          placeholder="50"
                          className={`text-sm ${errors.stock ? "border-red-500" : ""}`}
                        />
                        {errors.stock && (
                          <p className="text-red-500 text-xs">{errors.stock}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lowStockAlert" className="text-sm">
                          Low Stock Alert
                        </Label>
                        <Input
                          id="lowStockAlert"
                          type="number"
                          min="0"
                          value={formData.lowStockAlert}
                          onChange={(e) =>
                            handleInputChange("lowStockAlert", e.target.value)
                          }
                          placeholder="10"
                          className="text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          Alert when stock falls below this number
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="warranty" className="text-sm">
                          Warranty (years)
                        </Label>
                        <Select
                          value={formData.warranty}
                          onValueChange={(value) =>
                            handleInputChange("warranty", value)
                          }
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">No Warranty</SelectItem>
                            <SelectItem value="1">1 Year</SelectItem>
                            <SelectItem value="2">2 Years</SelectItem>
                            <SelectItem value="3">3 Years</SelectItem>
                            <SelectItem value="5">5 Years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryDays" className="text-sm">
                          Delivery Days
                        </Label>
                        <Input
                          id="deliveryDays"
                          type="number"
                          min="1"
                          max="30"
                          value={formData.deliveryDays}
                          onChange={(e) =>
                            handleInputChange("deliveryDays", e.target.value)
                          }
                          placeholder="3"
                          className={`text-sm ${errors.deliveryDays ? "border-red-500" : ""}`}
                        />
                        {errors.deliveryDays && (
                          <p className="text-red-500 text-xs">
                            {errors.deliveryDays}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Expected delivery time (1-30 days)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 4: Media & Settings */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="bg-white/70 backdrop-blur-md border border-white/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Media & Settings</CardTitle>
                    <p className="text-sm text-gray-600">
                      Add images and configure product settings
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product Images */}
                    <div className="space-y-3">
                      <Label className="text-sm">Product Images</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {formData.imagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Product ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 cursor-pointer"
                              onClick={() => removeImage(index)}
                              disabled={isLoading}
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </Button>
                            {formData.cloudinaryUrls?.[index] && (
                              <div className="absolute bottom-0 left-0 right-0 bg-green-500 text-white text-xs p-1 rounded-b-lg">
                                Uploaded ✓
                              </div>
                            )}
                          </div>
                        ))}

                        <label
                          className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-colors ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <CloudArrowUpIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">
                            {isLoading ? "Uploading..." : "Add Images"}
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={isLoading}
                          />
                        </label>
                      </div>
                      {errors.images && (
                        <p className="text-red-500 text-xs">{errors.images}</p>
                      )}
                    </div>

                    {/* Color Variants */}
                    <ColorVariantManager
                      colorVariants={formData.colorVariants}
                      onUpdate={(variants) =>
                        handleInputChange("colorVariants", variants)
                      }
                    />

                    {/* Product Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card className="bg-blue-50/50 backdrop-blur-sm border border-blue-100">
                        <CardContent className="p-3">
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
                        <CardContent className="p-3">
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

                      <Card className="bg-green-50/50 backdrop-blur-sm border border-green-100">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">
                                <SparklesIcon className="w-4 h-4 inline mr-1" />
                                New Arrival
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                {formData.newArrival
                                  ? "Marked as new arrival"
                                  : "Regular product"}
                              </p>
                            </div>
                            <Switch
                              checked={formData.newArrival}
                              onCheckedChange={(checked) =>
                                handleInputChange("newArrival", checked)
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="bg-yellow-50/50 backdrop-blur-sm border border-yellow-100">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">
                                Returnable
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                {formData.returnable
                                  ? "Customers can return"
                                  : "No returns allowed"}
                              </p>
                            </div>
                            <Switch
                              checked={formData.returnable}
                              onCheckedChange={(checked) =>
                                handleInputChange("returnable", checked)
                              }
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags" className="text-sm">
                        Tags (comma separated)
                      </Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) =>
                          handleInputChange("tags", e.target.value)
                        }
                        placeholder="wireless, gaming, bluetooth, premium"
                        className="text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Help customers find your product with relevant tags
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Step Navigation */}
          <Card className="mt-4 bg-white/70 backdrop-blur-md border border-white/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer text-sm"
                >
                  <ChevronLeftIcon className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <Badge
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 text-xs"
                >
                  Step {currentStep} of {steps.length}
                </Badge>

                {currentStep < steps.length ? (
                  <Button
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-sm"
                  >
                    Next
                    <ChevronRightIcon className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-sm"
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Actions */}
      <Card className="bg-white/70 backdrop-blur-md border border-white/20">
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" asChild className="cursor-pointer">
                <Link
                  href="/vendor/products"
                  className="text-gray-600 hover:text-gray-800 text-sm"
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
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
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
              className="border-gray-300 cursor-pointer"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowErrorModal(false);
                handleSubmit();
              }}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
