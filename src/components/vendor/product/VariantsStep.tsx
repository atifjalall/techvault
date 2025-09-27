/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Button } from "@/components/ui/Button1";
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

// Common options for dropdowns
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
    if (formData.variants.length <= 1) return;
    const updatedVariants = formData.variants.filter((_, i) => i !== index);
    updateFormData("variants", updatedVariants);
  };

  const handleImageUpload = async (variantIndex: number, files: File[]) => {
    if (files.length === 0) return;

    const currentVariant = formData.variants[variantIndex];
    if (files.length + currentVariant.images.length > 4) {
      alert("Maximum 4 images per variant allowed");
      return;
    }

    setUploadingVariant(variantIndex);

    try {
      const readFilePromises = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      const newPreviews = await Promise.all(readFilePromises);

      const updatedVariant = {
        ...currentVariant,
        images: [...currentVariant.images, ...files],
        imagePreviews: [...currentVariant.imagePreviews, ...newPreviews],
      };

      const updatedVariants = formData.variants.map((variant, i) =>
        i === variantIndex ? updatedVariant : variant
      );

      updateFormData("variants", updatedVariants);

      const cloudinaryUrls = await uploadMultipleImages(files);

      const finalVariant = {
        ...updatedVariant,
        cloudinaryUrls: [...currentVariant.cloudinaryUrls, ...cloudinaryUrls],
      };

      if (!currentVariant.thumbnailImage && cloudinaryUrls.length > 0) {
        finalVariant.thumbnailImage = cloudinaryUrls[0];
      }

      const finalVariants = formData.variants.map((variant, i) =>
        i === variantIndex ? finalVariant : variant
      );

      updateFormData("variants", finalVariants);
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload images. Please try again.");

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

    const updatedVariant = {
      ...variant,
      images: newImages,
      imagePreviews: newPreviews,
      cloudinaryUrls: newUrls,
    };

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-sm bg-white">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
              <CubeIcon className="w-4 h-4 mr-2 text-blue-600" />
              Product Variants
            </CardTitle>
            <p className="text-xs text-gray-600">
              Create different variants with colors, storage, pricing, and
              images
            </p>
          </CardHeader>
        </motion.div>

        <CardContent className="space-y-4 pt-2">
          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-center">
              <p className="text-xs text-blue-600 font-medium">Variants</p>
              <p className="text-sm font-bold text-blue-800">
                {formData.variants.length}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-2 text-center">
              <p className="text-xs text-green-600 font-medium">Stock</p>
              <p className="text-sm font-bold text-green-800">
                {formData.variants
                  .filter((v) => v.stock && v.isActive)
                  .reduce((sum, v) => sum + parseInt(v.stock), 0)}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-md p-2 text-center">
              <p className="text-xs text-purple-600 font-medium">Range</p>
              <p className="text-sm font-bold text-purple-800">
                {(() => {
                  const prices = formData.variants
                    .filter((v) => v.price && v.isActive)
                    .map((v) => parseFloat(v.price));
                  if (prices.length === 0) return "€0";
                  const min = Math.min(...prices);
                  const max = Math.max(...prices);
                  return min === max ? `€${min}` : `€${min} - €${max}`;
                })()}
              </p>
            </div>
          </motion.div>

          {/* Variants List */}
          <div className="space-y-3">
            <AnimatePresence>
              {formData.variants.map((variant, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="bg-gray-50/30 border border-gray-200">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {variant.variantName || `Variant ${index + 1}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={variant.isActive ? "active" : "inactive"}
                            size="sm"
                            icon="auto"
                          >
                            {variant.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {formData.variants.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeVariant(index)}
                              className="w-6 h-6 bg-red-100 hover:bg-red-200 rounded-md flex items-center justify-center text-red-600 cursor-pointer"
                            >
                              <XMarkIcon className="w-3 h-3" />
                            </motion.button>
                          )}
                        </div>
                      </div>
                      <AnimatePresence>
                        {errors[`variant_${index}_name`] && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-red-500 text-xs"
                          >
                            {errors[`variant_${index}_name`]}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </CardHeader>

                    <CardContent className="space-y-3 pt-0">
                      {/* Name and SKU */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-700 flex items-center">
                            <TagIcon className="w-3 h-3 mr-1 text-blue-600" />
                            Variant Name <span className="text-red-500">*</span>
                          </Label>
                          <motion.div whileFocus={{ scale: 1.01 }}>
                            <Input
                              value={variant.variantName}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "variantName",
                                  e.target.value
                                )
                              }
                              placeholder="e.g., Space Black 256GB"
                              className="h-8 text-sm"
                            />
                          </motion.div>
                          <button
                            onClick={() => {
                              const generated = generateVariantName(variant);
                              if (generated)
                                updateVariant(index, "variantName", generated);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 cursor-pointer"
                          >
                            Auto-generate from attributes
                          </button>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-700">
                            SKU{" "}
                            <span className="text-gray-400">(Optional)</span>
                          </Label>
                          <motion.div whileFocus={{ scale: 1.01 }}>
                            <Input
                              value={variant.sku || ""}
                              onChange={(e) =>
                                updateVariant(index, "sku", e.target.value)
                              }
                              placeholder="e.g., IPH16-BLK-256"
                              className="h-8 text-sm"
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Color */}
                      <div className="space-y-1">
                        <Label className="text-xs font-medium text-gray-700 flex items-center">
                          <SwatchIcon className="w-3 h-3 mr-1 text-blue-600" />
                          Color
                        </Label>
                        <div className="flex space-x-2">
                          <motion.div
                            whileFocus={{ scale: 1.01 }}
                            className="flex-1"
                          >
                            <Input
                              value={variant.color || ""}
                              onChange={(e) =>
                                updateVariant(index, "color", e.target.value)
                              }
                              placeholder="Space Black, Ocean Blue, etc."
                              className="h-8 text-sm"
                            />
                          </motion.div>
                          <div className="flex items-center space-x-1">
                            <Label className="text-xs text-gray-500">
                              Hex:
                            </Label>
                            <input
                              type="color"
                              value={variant.colorHex || "#000000"}
                              onChange={(e) =>
                                updateVariant(index, "colorHex", e.target.value)
                              }
                              className="h-8 w-16 p-0 border border-gray-200 rounded-md cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Attributes */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-700">
                            Storage
                          </Label>
                          <motion.div whileHover={{ scale: 1.01 }}>
                            <Select
                              value={variant.storage || ""}
                              onValueChange={(value) =>
                                updateVariant(index, "storage", value)
                              }
                            >
                              <SelectTrigger className="h-8 text-sm">
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
                              </SelectContent>
                            </Select>
                          </motion.div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-700">
                            RAM
                          </Label>
                          <motion.div whileHover={{ scale: 1.01 }}>
                            <Select
                              value={variant.ram || ""}
                              onValueChange={(value) =>
                                updateVariant(index, "ram", value)
                              }
                            >
                              <SelectTrigger className="h-8 text-sm">
                                <SelectValue placeholder="Select RAM" />
                              </SelectTrigger>
                              <SelectContent>
                                {RAM_OPTIONS.map((ram) => (
                                  <SelectItem
                                    key={ram}
                                    value={ram}
                                    className="text-sm"
                                  >
                                    {ram}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </motion.div>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-700">
                            Size
                          </Label>
                          <motion.div whileFocus={{ scale: 1.01 }}>
                            <Input
                              value={variant.size || ""}
                              onChange={(e) =>
                                updateVariant(index, "size", e.target.value)
                              }
                              placeholder="e.g., 27 inch, Large"
                              className="h-8 text-sm"
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-700 flex items-center">
                            <CurrencyEuroIcon className="w-3 h-3 mr-1 text-blue-600" />
                            Price (€) <span className="text-red-500">*</span>
                          </Label>
                          <motion.div whileFocus={{ scale: 1.01 }}>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={variant.price}
                              onChange={(e) =>
                                updateVariant(index, "price", e.target.value)
                              }
                              placeholder="299.99"
                              className="h-8 text-sm"
                            />
                          </motion.div>
                          <AnimatePresence>
                            {errors[`variant_${index}_price`] && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-red-500 text-xs"
                              >
                                {errors[`variant_${index}_price`]}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-700">
                            Compare Price (€){" "}
                            <span className="text-gray-400">(Optional)</span>
                          </Label>
                          <motion.div whileFocus={{ scale: 1.01 }}>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={variant.comparePrice || ""}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "comparePrice",
                                  e.target.value
                                )
                              }
                              placeholder="399.99"
                              className="h-8 text-sm"
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Stock */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-700">
                            Stock Quantity{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <motion.div whileFocus={{ scale: 1.01 }}>
                            <Input
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(e) =>
                                updateVariant(index, "stock", e.target.value)
                              }
                              placeholder="50"
                              className="h-8 text-sm"
                            />
                          </motion.div>
                          <AnimatePresence>
                            {errors[`variant_${index}_stock`] && (
                              <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-red-500 text-xs"
                              >
                                {errors[`variant_${index}_stock`]}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className="space-y-1">
                          <Label className="text-xs font-medium text-gray-700">
                            Low Stock Alert
                          </Label>
                          <motion.div whileFocus={{ scale: 1.01 }}>
                            <Input
                              type="number"
                              min="0"
                              value={variant.lowStockAlert}
                              onChange={(e) =>
                                updateVariant(
                                  index,
                                  "lowStockAlert",
                                  e.target.value
                                )
                              }
                              placeholder="10"
                              className="h-8 text-sm"
                            />
                          </motion.div>
                        </div>
                      </div>

                      {/* Images */}
                      <div className="space-y-2">
                        <Label className="text-xs font-medium text-gray-700 flex items-center">
                          <PhotoIcon className="w-3 h-3 mr-1 text-blue-600" />
                          Images (up to 4)
                        </Label>

                        <div className="grid grid-cols-4 gap-2">
                          {variant.imagePreviews.map((preview, imgIndex) => (
                            <div
                              key={imgIndex}
                              className="relative group aspect-square"
                            >
                              <img
                                src={preview}
                                alt={`Variant ${index + 1} image ${imgIndex + 1}`}
                                className="w-full h-full object-cover rounded-md border"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  removeVariantImage(index, imgIndex)
                                }
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

                          {variant.imagePreviews.length < 4 && (
                            <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                              {uploadingVariant === index ? (
                                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <>
                                  <PhotoIcon className="w-5 h-5 text-gray-400 mb-1" />
                                  <span className="text-xs text-gray-500">
                                    Add
                                  </span>
                                </>
                              )}
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                  const files = Array.from(
                                    e.target.files || []
                                  );
                                  if (files.length > 0)
                                    handleImageUpload(index, files);
                                }}
                                className="hidden"
                                disabled={uploadingVariant === index}
                              />
                            </label>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add Variant Button */}
          <div className="text-center pt-2">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                type="button"
                onClick={addVariant}
                variant="default"
                size="sm"
                className="cursor-pointer"
              >
                <PlusIcon className="w-3 h-3 mr-1" />
                Add Variant
              </Button>
            </motion.div>
          </div>

          {/* Error Summary */}
          <AnimatePresence>
            {errors.variants && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-50 border border-red-200 rounded-md p-2"
              >
                <p className="text-red-600 text-xs font-medium">
                  {errors.variants}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
