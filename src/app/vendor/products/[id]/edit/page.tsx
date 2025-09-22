/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
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
  SparklesIcon,
  HeartIcon,
  ShoppingBagIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { uploadMultipleImages } from "@/lib/cloudinary";

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

interface ColorVariant {
  id?: string;
  color: string;
  image: string;
  imageFile?: File;
  imagePreview?: string;
  isNew?: boolean;
  cloudinaryUrl?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  brand?: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  modelNumber?: string;
  stock: number;
  lowStockAlert: number;
  isActive: boolean;
  featured: boolean;
  newArrival: boolean;
  returnable: boolean;
  categoryId: string;
  subcategoryId?: string;
  warranty?: string;
  weight?: string;
  dimensions?: string;
  color?: string;
  material?: string;
  storage?: string;
  length?: string;
  deliveryDays?: number;
  tags: string[];
  specifications: Record<string, string>;
  colors?: ColorVariant[];
  category: {
    id: string;
    name: string;
  };
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

// ProductCard Preview Component (matching UI ProductCard exactly)
function ProductCardPreview({ product }: { product: Product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discountPercentage =
    product.comparePrice && product.price
      ? Math.round(
          ((product.comparePrice - product.price) / product.comparePrice) * 100
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
          {product.newArrival && (
            <span className="bg-black text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
              NEW
            </span>
          )}
          {product.featured && (
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
          {product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name || "Product preview"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center text-gray-400">
              <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-xl shadow-md mx-auto mb-2 flex items-center justify-center border border-white/20">
                <div className="w-8 h-8 bg-gray-300/70 rounded-lg"></div>
              </div>
              <p className="text-xs font-medium">
                {product.category?.name || "Product"}
              </p>
            </div>
          )}
        </div>

        {/* Color variants display */}
        {product.colors && product.colors.length > 0 && (
          <div className="absolute bottom-3 left-3 flex gap-1">
            {product.colors.slice(0, 4).map((variant, index) => (
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
            {product.colors.length > 4 && (
              <span className="text-xs text-white bg-black/50 px-1 rounded">
                +{product.colors.length - 4}
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
            {product.brand && (
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                {product.brand.name}
              </p>
            )}
            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors leading-tight">
              {product.name || "Untitled Product"}
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
                €{product.price}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  €{product.comparePrice}
                </span>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            {product.stock && <span>{product.stock} in stock</span>}
            {product.deliveryDays && (
              <span>{product.deliveryDays}d delivery</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Color Variant Manager Component
function ColorVariantManager({
  colorVariants,
  onUpdate,
}: {
  colorVariants: ColorVariant[];
  onUpdate: (variants: ColorVariant[]) => void;
}) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const addColorVariant = () => {
    onUpdate([...colorVariants, { color: "", image: "", isNew: true }]);
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
    setUploadingIndex(index);

    // Create preview immediately
    const reader = new FileReader();
    reader.onload = () => {
      updateColorVariant(index, "imagePreview", reader.result as string);
    };
    reader.readAsDataURL(file);

    updateColorVariant(index, "imageFile", file);

    // Upload to Cloudinary in background
    try {
      const cloudinaryUrls = await uploadMultipleImages([file]);
      updateColorVariant(index, "cloudinaryUrl", cloudinaryUrls[0]);
      updateColorVariant(index, "image", cloudinaryUrls[0]);
    } catch (error) {
      console.error("Color image upload failed:", error);
    } finally {
      setUploadingIndex(null);
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
                    {variant.imagePreview || variant.image ? (
                      <img
                        src={variant.imagePreview || variant.image}
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
                        {variant.image ? "Change" : "Upload"}
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

                    {/* Upload Status */}
                    {uploadingIndex === index ? (
                      <div className="w-4 h-4 border border-blue-600 border-t-transparent rounded-full animate-spin" />
                    ) : variant.cloudinaryUrl ? (
                      <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    ) : variant.isNew ? (
                      <span className="text-xs text-orange-500">New</span>
                    ) : (
                      <CheckCircleIcon className="w-4 h-4 text-gray-400" />
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

export default function VendorEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
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
  const [uploadingImages, setUploadingImages] = useState(false);
  const [newCloudinaryUrls, setNewCloudinaryUrls] = useState<string[]>([]);
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
    {
      id: 4,
      name: "Media",
      description: "Update images and configure settings",
    },
  ];

  // Load product data
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const [productRes, categoriesRes, brandsRes] = await Promise.all([
          fetch(`/api/vendor/products/${params.id}`),
          fetch("/api/categories"),
          fetch("/api/brands"),
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
        if (brandsRes.ok) {
          const brandsData = await brandsRes.json();
          if (brandsData.success) {
            setBrands(brandsData.brands);
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

  // Update selected category when categoryId changes
  useEffect(() => {
    if (product?.categoryId && categories.length > 0) {
      const category = categories.find((c) => c.id === product.categoryId);
      setSelectedCategory(category || null);
    }
  }, [product?.categoryId, categories]);

  // Auto-save functionality
  const autoSave = async (updatedProduct: Partial<Product>) => {
    if (!product) return;

    setSaveStatus("saving");
    try {
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

    // Reset subcategory when category changes
    if (field === "categoryId" && value !== product.categoryId) {
      updatedProduct.subcategoryId = "";
      setProduct(updatedProduct);
    }

    setTimeout(() => {
      autoSave({ [field]: value });
    }, 1000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (
      !product ||
      files.length + product.images.length + newImages.length > 5
    ) {
      setErrors({ images: "Maximum 5 images allowed" });
      return;
    }

    setUploadingImages(true);

    try {
      // Show immediate previews for better UX
      const newPreviews: string[] = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => newPreviews.push(reader.result as string);
        reader.readAsDataURL(file);
      });

      // Update previews first
      setTimeout(() => {
        setNewImages((prev) => [...prev, ...files]);
        setImagePreviews((prev) => [...prev, ...newPreviews]);
      }, 100);

      // Upload to Cloudinary in background
      const cloudinaryUrls = await uploadMultipleImages(files);
      setNewCloudinaryUrls((prev) => [...prev, ...cloudinaryUrls]);
    } catch (error) {
      console.error("Image upload failed:", error);
      setErrors({ images: "Failed to upload images. Please try again." });

      // Remove failed uploads from previews
      const failedCount = files.length;
      setNewImages((prev) => prev.slice(0, -failedCount));
      setImagePreviews((prev) => prev.slice(0, -failedCount));
    } finally {
      setUploadingImages(false);
    }
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setNewCloudinaryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    if (!product) return;
    const updatedImages = product.images.filter((_, i) => i !== index);
    handleFieldChange("images", updatedImages);
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
      // Combine existing images with new uploads
      let finalImageUrls: string[] = [...product.images];

      // Add newly uploaded Cloudinary URLs
      if (newCloudinaryUrls.length > 0) {
        finalImageUrls = [...finalImageUrls, ...newCloudinaryUrls];
      }

      // If there are still unuploaded images, upload them now
      const unuploadedImages = newImages.slice(newCloudinaryUrls.length);
      if (unuploadedImages.length > 0) {
        const additionalUrls = await uploadMultipleImages(unuploadedImages);
        finalImageUrls = [...finalImageUrls, ...additionalUrls];
      }

      // Process specifications
      const specificationsObj = specifications
        .filter((spec) => spec.key.trim() && spec.value.trim())
        .reduce(
          (acc, spec) => {
            acc[spec.key] = spec.value;
            return acc;
          },
          {} as Record<string, string>
        );

      // Prepare color variants for submission
      // Make sure this matches what your API expects
      const colorVariantsForSubmission = (product.colors || [])
        .filter(
          (variant) => variant.color && (variant.cloudinaryUrl || variant.image)
        )
        .map((variant) => ({
          color: variant.color,
          image: variant.cloudinaryUrl || variant.image,
        }));

      // Prepare the complete payload
      const payload = {
        name: product.name,
        description: product.description,
        brandId: product.brand?.id,
        modelNumber: product.modelNumber,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        price: product.price,
        comparePrice: product.comparePrice,
        stock: product.stock,
        lowStockAlert: product.lowStockAlert,
        images: finalImageUrls,
        colors: colorVariantsForSubmission,
        replaceAllColors: false,
        specifications: specificationsObj,
        featured: product.featured,
        newArrival: product.newArrival,
        returnable: product.returnable,
        isActive: product.isActive,
        warranty: product.warranty,
        weight: product.weight,
        dimensions: product.dimensions,
        storage: product.storage,
        length: product.length,
        deliveryDays: product.deliveryDays,
        tags: product.tags,
        color: product.color,
        material: product.material,
      };

      const response = await fetch(`/api/vendor/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to update product");
      }

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

  // Validation function
  const validateCurrentStep = () => {
    const stepErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!product?.name?.trim()) stepErrors.name = "Product name is required";
      if (!product?.categoryId) stepErrors.categoryId = "Category is required";
      if (!product?.brand?.name?.trim()) stepErrors.brand = "Brand is required";
    } else if (currentStep === 2) {
      if (!product?.description?.trim())
        stepErrors.description = "Description is required";
      if (product?.weight && isNaN(parseFloat(product.weight))) {
        stepErrors.weight = "Weight must be a valid number";
      }
    } else if (currentStep === 3) {
      if (!product?.price || product.price <= 0) {
        stepErrors.price = "Valid price is required";
      }
      if (!product?.stock || product.stock < 0) {
        stepErrors.stock = "Valid stock quantity is required";
      }
      if (product?.comparePrice && product.comparePrice <= product.price) {
        stepErrors.comparePrice =
          "Compare price must be higher than regular price";
      }
      if (
        product?.deliveryDays &&
        (product.deliveryDays < 1 || product.deliveryDays > 30)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Product not found
          </h2>
          <p className="text-gray-500 mb-4 text-sm">
            The product you&apos;re looking for doesn&apos;t exist.
          </p>
          <Button
            asChild
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm cursor-pointer"
          >
            <Link href="/vendor/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  const stockStatus = getStockStatus();

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <Card className="bg-white/70 backdrop-blur-md border border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-sm text-gray-600">
                Make changes to your product listing
              </p>
            </div>

            {/* Auto-save Status & Actions */}
            <div className="flex items-center space-x-3">
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
                <Button
                  variant="outline"
                  asChild
                  className="text-sm cursor-pointer"
                >
                  <Link href={`/products/${product.slug}`}>
                    <EyeIcon className="w-4 h-4 mr-2" />
                    Preview
                  </Link>
                </Button>

                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm cursor-pointer"
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

      {/* Main Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Preview Sidebar */}
        <Card className="lg:col-span-1 bg-white/70 backdrop-blur-md border border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Live Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProductCardPreview product={product} />

            {/* Stats */}
            <div className="space-y-2 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Images</span>
                <span className="font-medium">
                  {product.images.length + imagePreviews.length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Colors</span>
                <span className="font-medium">
                  {product.colors?.length || 0}
                </span>
              </div>
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
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Basic Information</CardTitle>
                    <p className="text-sm text-gray-600">
                      Update your product details
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
                          value={product.name}
                          onChange={(e) =>
                            handleFieldChange("name", e.target.value)
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
                          value={product.brand?.id || "select"}
                          onValueChange={(value) => {
                            if (value === "select") {
                              handleFieldChange("brand", undefined);
                            } else {
                              const selectedBrand = brands.find(
                                (b) => b.id === value
                              );
                              if (selectedBrand) {
                                handleFieldChange("brand", selectedBrand);
                              }
                            }
                          }}
                        >
                          <SelectTrigger
                            className={`text-sm ${errors.brand ? "border-red-500" : ""}`}
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
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-sm">
                          Category *
                        </Label>
                        <Select
                          value={product.categoryId}
                          onValueChange={(value) =>
                            handleFieldChange("categoryId", value)
                          }
                        >
                          <SelectTrigger
                            className={`text-sm ${errors.categoryId ? "border-red-500" : ""}`}
                          >
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
                          value={product.subcategoryId || "select"}
                          onValueChange={(value) =>
                            handleFieldChange(
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
                        value={product.modelNumber || ""}
                        onChange={(e) =>
                          handleFieldChange("modelNumber", e.target.value)
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
                      Update description, specifications, and attributes
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm">
                        Description *
                      </Label>
                      <Textarea
                        id="description"
                        value={product.description || ""}
                        onChange={(e) =>
                          handleFieldChange("description", e.target.value)
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
                          value={product.color || ""}
                          onChange={(e) =>
                            handleFieldChange("color", e.target.value)
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
                          value={product.material || ""}
                          onChange={(e) =>
                            handleFieldChange("material", e.target.value)
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
                          value={product.weight || ""}
                          onChange={(e) =>
                            handleFieldChange("weight", e.target.value)
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
                          value={product.dimensions || ""}
                          onChange={(e) =>
                            handleFieldChange("dimensions", e.target.value)
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
                          value={product.storage || ""}
                          onChange={(e) =>
                            handleFieldChange("storage", e.target.value)
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
                        value={product.length || ""}
                        onChange={(e) =>
                          handleFieldChange("length", e.target.value)
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
                        {specifications.map((spec, index) => (
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
                      Update your pricing and inventory levels
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
                          value={product.price}
                          onChange={(e) =>
                            handleFieldChange(
                              "price",
                              parseFloat(e.target.value)
                            )
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
                          {calculateDiscount()}% off
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
                          value={product.stock}
                          onChange={(e) =>
                            handleFieldChange("stock", parseInt(e.target.value))
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
                          value={product.lowStockAlert}
                          onChange={(e) =>
                            handleFieldChange(
                              "lowStockAlert",
                              parseInt(e.target.value)
                            )
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
                          value={product.warranty || "2"}
                          onValueChange={(value) =>
                            handleFieldChange("warranty", value)
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
                          value={product.deliveryDays || ""}
                          onChange={(e) =>
                            handleFieldChange(
                              "deliveryDays",
                              e.target.value
                                ? parseInt(e.target.value)
                                : undefined
                            )
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
                      Update images and configure product settings
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Product Images */}
                    <div className="space-y-3">
                      <Label className="text-sm">Product Images</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* Existing Images from Database */}
                        {product.images.map((image, index) => (
                          <div
                            key={`existing-${index}`}
                            className="relative group"
                          >
                            <img
                              src={image}
                              alt={`Product ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 cursor-pointer"
                              onClick={() => removeExistingImage(index)}
                              disabled={saving}
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </Button>
                            <div className="absolute bottom-0 left-0 right-0 bg-gray-500 text-white text-xs p-1 rounded-b-lg">
                              Current
                            </div>
                          </div>
                        ))}

                        {/* New Images */}
                        {imagePreviews.map((preview, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <img
                              src={preview}
                              alt={`New ${index + 1}`}
                              className="w-full h-20 object-cover rounded-lg border"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute -top-1 -right-1 h-5 w-5 p-0 opacity-0 group-hover:opacity-100 cursor-pointer"
                              onClick={() => removeNewImage(index)}
                              disabled={uploadingImages || saving}
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </Button>

                            {/* Upload Status Indicator */}
                            <div className="absolute bottom-0 left-0 right-0 text-white text-xs p-1 rounded-b-lg">
                              {newCloudinaryUrls[index] ? (
                                <div className="bg-green-500">Uploaded ✓</div>
                              ) : uploadingImages ? (
                                <div className="bg-blue-500">Uploading...</div>
                              ) : (
                                <div className="bg-orange-500">Pending</div>
                              )}
                            </div>
                          </div>
                        ))}

                        <label
                          className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-colors ${uploadingImages || saving ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <CloudArrowUpIcon className="w-5 h-5 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">
                            {uploadingImages ? "Uploading..." : "Add Images"}
                          </span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploadingImages || saving}
                          />
                        </label>
                      </div>

                      {/* Upload Progress Info */}
                      {uploadingImages && (
                        <div className="text-xs text-blue-600 flex items-center">
                          <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                          Uploading images to Cloudinary...
                        </div>
                      )}

                      {errors.images && (
                        <p className="text-red-500 text-xs">{errors.images}</p>
                      )}
                    </div>

                    {/* Color Variants */}
                    <ColorVariantManager
                      colorVariants={product.colors || []}
                      onUpdate={(variants) =>
                        handleFieldChange("colors", variants)
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
                        <CardContent className="p-3">
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

                      <Card className="bg-green-50/50 backdrop-blur-sm border border-green-100">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <Label className="text-sm font-medium">
                                <SparklesIcon className="w-4 h-4 inline mr-1" />
                                New Arrival
                              </Label>
                              <p className="text-xs text-gray-500 mt-1">
                                {product.newArrival
                                  ? "Marked as new arrival"
                                  : "Regular product"}
                              </p>
                            </div>
                            <Switch
                              checked={product.newArrival}
                              onCheckedChange={(checked) =>
                                handleFieldChange("newArrival", checked)
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
                                {product.returnable
                                  ? "Customers can return"
                                  : "No returns allowed"}
                              </p>
                            </div>
                            <Switch
                              checked={product.returnable}
                              onCheckedChange={(checked) =>
                                handleFieldChange("returnable", checked)
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
                        value={product.tags?.join(", ") || ""}
                        onChange={(e) =>
                          handleFieldChange(
                            "tags",
                            e.target.value.split(",").map((tag) => tag.trim())
                          )
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
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-sm"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Updating...
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
                Changes are auto-saved
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" asChild className="cursor-pointer">
                <Link href={`/products/${product.slug}`} className="text-sm">
                  <EyeIcon className="w-4 h-4 mr-2" />
                  View Live Product
                </Link>
              </Button>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer text-sm"
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
              className="border-gray-300 cursor-pointer"
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowErrorModal(false);
                handleSave();
              }}
              disabled={saving}
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
