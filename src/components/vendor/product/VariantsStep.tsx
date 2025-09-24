/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  CheckCircleIcon,
  CubeIcon,
  TagIcon,
  CurrencyEuroIcon,
  SwatchIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/buttonSidebar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadMultipleImages } from "@/lib/cloudinary";
import {
  ProductFormData,
  ProductVariant,
} from "@/app/vendor/products/add/page";

interface VariantsStepProps {
  formData: ProductFormData;
  updateFormData: (field: keyof ProductFormData, value: any) => void;
  errors: Record<string, string>;
}

// Common storage options for electronics
const STORAGE_OPTIONS = [
  "32GB",
  "64GB",
  "128GB",
  "256GB",
  "512GB",
  "1TB",
  "2TB",
  "4TB",
  "8TB",
];

// Common RAM options for electronics
const RAM_OPTIONS = [
  "4GB",
  "6GB",
  "8GB",
  "12GB",
  "16GB",
  "24GB",
  "32GB",
  "64GB",
];

// Common size options for various products
const SIZE_OPTIONS = [
  "Small",
  "Medium",
  "Large",
  "XL",
  "XXL",
  "24 inch",
  "27 inch",
  "32 inch",
  "43 inch",
  "55 inch",
];

// Common length options for cables
const LENGTH_OPTIONS = [
  "0.5m",
  "1m",
  "1.5m",
  "2m",
  "3m",
  "5m",
  "10m",
  "15m",
  "20m",
];

export default function VariantsStep({
  formData,
  updateFormData,
  errors,
}: VariantsStepProps) {
  const [uploadingVariant, setUploadingVariant] = useState<number | null>(null);

  const addVariant = () => {
    const newVariant: ProductVariant = {
      variantName: "",
      sku: "",
      price: "",
      comparePrice: "",
      stock: "",
      lowStockAlert: "10",
      color: "",
      colorHex: "",
      storage: "",
      ram: "",
      size: "",
      length: "",
      material: "",
      attributes: {},
      images: [],
      imagePreviews: [],
      cloudinaryUrls: [],
      thumbnailImage: "",
      isActive: true,
    };

    updateFormData("variants", [...formData.variants, newVariant]);
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    const updatedVariants = formData.variants.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    );
    updateFormData("variants", updatedVariants);
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length <= 1) return; // Keep at least one variant
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    updateFormData("variants", updatedVariants);
  };

  // FIXED: Proper async handling for image upload and preview
  const handleImageUpload = async (variantIndex: number, files: File[]) => {
    if (files.length === 0) return;

    const currentVariant = formData.variants[variantIndex];
    if (files.length + currentVariant.images.length > 4) {
      alert("Maximum 4 images per variant allowed");
      return;
    }

    setUploadingVariant(variantIndex);

    try {
      console.log(
        `Starting upload for variant ${variantIndex + 1} with ${files.length} files`
      );

      // FIXED: Use Promise.all to wait for all FileReader operations to complete
      const readFilePromises = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      // Wait for all previews to be generated
      const newPreviews = await Promise.all(readFilePromises);
      console.log(`Generated ${newPreviews.length} previews`);

      // FIXED: Update variant state immediately with previews and files
      const updatedVariant = {
        ...currentVariant,
        images: [...currentVariant.images, ...files],
        imagePreviews: [...currentVariant.imagePreviews, ...newPreviews],
      };

      // Update the variants array with the new variant data
      const updatedVariants = formData.variants.map((variant, i) =>
        i === variantIndex ? updatedVariant : variant
      );

      // Update form data immediately so user sees previews
      updateFormData("variants", updatedVariants);
      console.log(`Updated variant ${variantIndex + 1} with previews`);

      // Upload to Cloudinary in background
      console.log(`Uploading ${files.length} images to Cloudinary...`);
      const cloudinaryUrls = await uploadMultipleImages(files);
      console.log(`Cloudinary upload successful:`, cloudinaryUrls);

      // FIXED: Update with Cloudinary URLs using current state
      const finalVariant = {
        ...updatedVariant,
        cloudinaryUrls: [...currentVariant.cloudinaryUrls, ...cloudinaryUrls],
      };

      // Set first uploaded image as thumbnail if not already set
      if (!currentVariant.thumbnailImage && cloudinaryUrls.length > 0) {
        finalVariant.thumbnailImage = cloudinaryUrls[0];
      }

      // Final update with Cloudinary URLs
      const finalVariants = formData.variants.map((variant, i) =>
        i === variantIndex ? finalVariant : variant
      );

      updateFormData("variants", finalVariants);

      console.log(
        `✅ Variant ${variantIndex + 1} images uploaded successfully!`
      );
    } catch (error) {
      console.error("❌ Variant image upload failed:", error);
      alert("Failed to upload variant images. Please try again.");

      // Revert to previous state on error
      const revertedVariants = formData.variants.map((variant, i) => {
        if (i === variantIndex) {
          return {
            ...variant,
            images: variant.images.slice(0, -files.length),
            imagePreviews: variant.imagePreviews.slice(0, -files.length),
          };
        }
        return variant;
      });
      updateFormData("variants", revertedVariants);
    } finally {
      setUploadingVariant(null);
    }
  };

  const removeVariantImage = (variantIndex: number, imageIndex: number) => {
    const variant = formData.variants[variantIndex];
    const newImages = variant.images.filter((_, i) => i !== imageIndex);
    const newPreviews = variant.imagePreviews.filter(
      (_, i) => i !== imageIndex
    );
    const newUrls = variant.cloudinaryUrls.filter((_, i) => i !== imageIndex);

    // Update all three arrays at once
    const updatedVariant = {
      ...variant,
      images: newImages,
      imagePreviews: newPreviews,
      cloudinaryUrls: newUrls,
    };

    // Update thumbnail if the removed image was the thumbnail
    if (
      variant.thumbnailImage === variant.cloudinaryUrls[imageIndex] &&
      newUrls.length > 0
    ) {
      updatedVariant.thumbnailImage = newUrls[0];
    } else if (newUrls.length === 0) {
      updatedVariant.thumbnailImage = "";
    }

    const updatedVariants = formData.variants.map((v, i) =>
      i === variantIndex ? updatedVariant : v
    );

    updateFormData("variants", updatedVariants);
  };

  const generateVariantName = (variant: ProductVariant) => {
    const parts = [
      variant.color,
      variant.storage,
      variant.ram,
      variant.size,
      variant.length,
      variant.material,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(" - ") : "";
  };

  const getTotalStock = () => {
    return formData.variants
      .filter((v) => v.stock && v.isActive)
      .reduce((sum, v) => sum + parseInt(v.stock), 0);
  };

  const getPriceRange = () => {
    const prices = formData.variants
      .filter((v) => v.price && v.isActive)
      .map((v) => parseFloat(v.price));

    if (prices.length === 0) return null;

    const min = Math.min(...prices);
    const max = Math.max(...prices);

    return min === max ? `€${min}` : `€${min} - €${max}`;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg"
        >
          <CubeIcon className="w-6 h-6 text-white" />
        </motion.div>

        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-emerald-900 to-teal-900 bg-clip-text text-transparent">
            Product Variants
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Create different variants with colors, storage, pricing, and images
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-50/50 border border-blue-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">Variants</p>
            <p className="text-lg font-bold text-blue-800">
              {formData.variants.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border border-green-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-green-600 font-medium">Total Stock</p>
            <p className="text-lg font-bold text-green-800">
              {getTotalStock()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 border border-purple-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-purple-600 font-medium">Price Range</p>
            <p className="text-lg font-bold text-purple-800">
              {getPriceRange() || "€0"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Variants List */}
      <div className="space-y-4">
        {formData.variants.map((variant, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="bg-white/90 backdrop-blur-sm border border-white/60 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <CardTitle className="text-sm">
                        {variant.variantName || `Variant ${index + 1}`}
                      </CardTitle>
                      <p className="text-xs text-gray-500">
                        {variant.isActive ? "Active" : "Inactive"} variant
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={variant.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {variant.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {formData.variants.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {errors[`variant_${index}_name`] && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors[`variant_${index}_name`]}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Variant Name and SKU */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium flex items-center">
                      <TagIcon className="w-3 h-3 mr-1 text-gray-500" />
                      Variant Name *
                    </Label>
                    <Input
                      value={variant.variantName}
                      onChange={(e) =>
                        updateVariant(index, "variantName", e.target.value)
                      }
                      placeholder="e.g., Space Black 256GB"
                      className="h-9 text-sm"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const generated = generateVariantName(variant);
                        if (generated)
                          updateVariant(index, "variantName", generated);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto cursor-pointer"
                    >
                      Auto-generate from attributes
                    </Button>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">
                      SKU (Optional)
                    </Label>
                    <Input
                      value={variant.sku || ""}
                      onChange={(e) =>
                        updateVariant(index, "sku", e.target.value)
                      }
                      placeholder="e.g., IPH16-BLK-256"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Color and Custom Color Input */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center">
                    <SwatchIcon className="w-3 h-3 mr-1 text-gray-500" />
                    Color
                  </Label>
                  <div className="flex space-x-2">
                    <Input
                      value={variant.color || ""}
                      onChange={(e) =>
                        updateVariant(index, "color", e.target.value)
                      }
                      placeholder="Space Black, Ocean Blue, etc."
                      className="h-9 text-sm flex-1"
                    />
                    <div className="flex items-center space-x-2">
                      <Label className="text-xs text-gray-500">Hex:</Label>
                      <Input
                        type="color"
                        value={variant.colorHex || "#000000"}
                        onChange={(e) =>
                          updateVariant(index, "colorHex", e.target.value)
                        }
                        className="h-9 w-16 p-1 border rounded"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Enter custom color name and select hex color
                  </p>
                </div>

                {/* Variant Attributes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Storage</Label>
                    <Select
                      value={variant.storage || ""}
                      onValueChange={(value) =>
                        updateVariant(index, "storage", value)
                      }
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select storage" />
                      </SelectTrigger>
                      <SelectContent>
                        {STORAGE_OPTIONS.map((storage) => (
                          <SelectItem
                            key={storage}
                            value={storage}
                            className="text-sm"
                          >
                            {storage}
                          </SelectItem>
                        ))}
                        <SelectItem
                          value="custom"
                          className="text-sm font-medium text-blue-600"
                        >
                          Custom...
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {variant.storage === "custom" && (
                      <Input
                        placeholder="Enter custom storage"
                        onChange={(e) =>
                          updateVariant(index, "storage", e.target.value)
                        }
                        className="h-8 text-sm mt-1"
                      />
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">RAM</Label>
                    <Select
                      value={variant.ram || ""}
                      onValueChange={(value) =>
                        updateVariant(index, "ram", value)
                      }
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select RAM" />
                      </SelectTrigger>
                      <SelectContent>
                        {RAM_OPTIONS.map((ram) => (
                          <SelectItem key={ram} value={ram} className="text-sm">
                            {ram}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Size</Label>
                    <Input
                      value={variant.size || ""}
                      onChange={(e) =>
                        updateVariant(index, "size", e.target.value)
                      }
                      placeholder="e.g., 27 inch, Large"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Additional Attributes Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Length</Label>
                    <Select
                      value={variant.length || ""}
                      onValueChange={(value) =>
                        updateVariant(index, "length", value)
                      }
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent>
                        {LENGTH_OPTIONS.map((length) => (
                          <SelectItem
                            key={length}
                            value={length}
                            className="text-sm"
                          >
                            {length}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">Material</Label>
                    <Input
                      value={variant.material || ""}
                      onChange={(e) =>
                        updateVariant(index, "material", e.target.value)
                      }
                      placeholder="e.g., Aluminum, Leather"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium flex items-center">
                      <CurrencyEuroIcon className="w-3 h-3 mr-1 text-gray-500" />
                      Price (€) *
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.price}
                      onChange={(e) =>
                        updateVariant(index, "price", e.target.value)
                      }
                      placeholder="299.99"
                      className="h-9 text-sm"
                    />
                    {errors[`variant_${index}_price`] && (
                      <p className="text-red-500 text-xs">
                        {errors[`variant_${index}_price`]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">
                      Compare Price (€)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={variant.comparePrice || ""}
                      onChange={(e) =>
                        updateVariant(index, "comparePrice", e.target.value)
                      }
                      placeholder="399.99"
                      className="h-9 text-sm"
                    />
                    {errors[`variant_${index}_comparePrice`] && (
                      <p className="text-red-500 text-xs">
                        {errors[`variant_${index}_comparePrice`]}
                      </p>
                    )}
                  </div>
                </div>

                {/* Stock Management */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium">
                      Stock Quantity *
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={variant.stock}
                      onChange={(e) =>
                        updateVariant(index, "stock", e.target.value)
                      }
                      placeholder="50"
                      className="h-9 text-sm"
                    />
                    {errors[`variant_${index}_stock`] && (
                      <p className="text-red-500 text-xs">
                        {errors[`variant_${index}_stock`]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium">
                      Low Stock Alert
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={variant.lowStockAlert}
                      onChange={(e) =>
                        updateVariant(index, "lowStockAlert", e.target.value)
                      }
                      placeholder="10"
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* FIXED: Variant Images Section */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium flex items-center">
                    <PhotoIcon className="w-3 h-3 mr-1 text-gray-500" />
                    Variant Images (up to 4)
                  </Label>

                  <div className="grid grid-cols-4 gap-2">
                    {/* Display Image Previews */}
                    {variant.imagePreviews.map((preview, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative group aspect-square"
                      >
                        <img
                          src={preview}
                          alt={`Variant ${index + 1} image ${imgIndex + 1}`}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => removeVariantImage(index, imgIndex)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        >
                          <XMarkIcon className="w-3 h-3" />
                        </button>
                        {variant.thumbnailImage ===
                          variant.cloudinaryUrls[imgIndex] && (
                          <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                            Main
                          </div>
                        )}
                        {variant.cloudinaryUrls[imgIndex] && (
                          <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1">
                            <CheckCircleIcon className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Upload Button */}
                    {variant.imagePreviews.length < 4 && (
                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                        {uploadingVariant === index ? (
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <PhotoIcon className="w-6 h-6 text-gray-400 mb-1" />
                            <span className="text-xs text-gray-500 text-center">
                              Add Images
                            </span>
                          </>
                        )}
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            if (files.length > 0)
                              handleImageUpload(index, files);
                          }}
                          className="hidden"
                          disabled={uploadingVariant === index}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Upload up to 4 images for this variant. First image will be
                    used as thumbnail.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Variant Button */}
      <div className="text-center">
        <Button
          type="button"
          onClick={addVariant}
          className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer px-6 py-2"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add Another Variant
        </Button>
      </div>

      {/* Validation Errors Summary */}
      {errors.variants && (
        <Card className="bg-red-50 border border-red-200">
          <CardContent className="p-3">
            <p className="text-red-600 text-sm font-medium">
              {errors.variants}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
