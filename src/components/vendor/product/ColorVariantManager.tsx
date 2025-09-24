/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/buttonSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadMultipleImages } from "@/lib/cloudinary";

// Use the ProductVariant from your add product page
interface ProductVariant {
  id?: string;
  variantName: string;
  sku?: string;
  price: string;
  comparePrice?: string;
  stock: string;
  lowStockAlert: string;
  color?: string;
  colorHex?: string;
  storage?: string;
  ram?: string;
  size?: string;
  length?: string;
  material?: string;
  attributes?: Record<string, string>;
  images: File[];
  imagePreviews: string[];
  cloudinaryUrls: string[];
  thumbnailImage?: string;
  isActive: boolean;
}

interface ColorVariantManagerProps {
  variants: ProductVariant[];
  onUpdate: (variants: ProductVariant[]) => void;
}

// Color options for selection
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

export default function ColorVariantManager({
  variants,
  onUpdate,
}: ColorVariantManagerProps) {
  const [isUploading, setIsUploading] = useState<number | null>(null);

  const addColorVariant = () => {
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

    onUpdate([...variants, newVariant]);
  };

  const updateVariant = (
    index: number,
    field: keyof ProductVariant,
    value: any
  ) => {
    const updated = variants.map((variant, i) => {
      if (i === index) {
        const updatedVariant = { ...variant, [field]: value };

        // Auto-generate variant name when color changes
        if (field === "color" && value) {
          updatedVariant.variantName = value;
          // Also set the hex color
          const colorOption = COLOR_OPTIONS.find((c) => c.name === value);
          if (colorOption) {
            updatedVariant.colorHex = colorOption.value;
          }
        }

        return updatedVariant;
      }
      return variant;
    });
    onUpdate(updated);
  };

  const removeVariant = (index: number) => {
    onUpdate(variants.filter((_, i) => i !== index));
  };

  const handleImageUpload = async (index: number, file: File) => {
    setIsUploading(index);

    try {
      // Create preview immediately
      const reader = new FileReader();
      reader.onload = () => {
        const currentVariant = variants[index];
        const updatedVariant = {
          ...currentVariant,
          imagePreviews: [
            ...currentVariant.imagePreviews,
            reader.result as string,
          ],
          images: [...currentVariant.images, file],
        };

        const updated = variants.map((variant, i) =>
          i === index ? updatedVariant : variant
        );
        onUpdate(updated);
      };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      const cloudinaryUrls = await uploadMultipleImages([file]);

      // Update with Cloudinary URL
      const currentVariant = variants[index];
      const updatedVariant = {
        ...currentVariant,
        cloudinaryUrls: [...currentVariant.cloudinaryUrls, cloudinaryUrls[0]],
        thumbnailImage: currentVariant.thumbnailImage || cloudinaryUrls[0],
      };

      const updated = variants.map((variant, i) =>
        i === index ? updatedVariant : variant
      );
      onUpdate(updated);
    } catch (error) {
      console.error("Color image upload failed:", error);
    } finally {
      setIsUploading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Product Variants</Label>
          <p className="text-xs text-gray-500 mt-1">
            Create different variants (colors, sizes, etc.) for your product
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addColorVariant}
          className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Add Variant
        </Button>
      </div>

      {variants.length > 0 && (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <Card key={index} className="bg-gray-50/50 border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Variant {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVariant(index)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Variant Name and SKU */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Variant Name *</Label>
                      <Input
                        value={variant.variantName}
                        onChange={(e) =>
                          updateVariant(index, "variantName", e.target.value)
                        }
                        placeholder="e.g., Space Black, 256GB"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">SKU</Label>
                      <Input
                        value={variant.sku}
                        onChange={(e) =>
                          updateVariant(index, "sku", e.target.value)
                        }
                        placeholder="e.g., IPH-15-BLK-256"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">Price (€) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(index, "price", e.target.value)
                        }
                        placeholder="299.99"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Compare Price (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.comparePrice}
                        onChange={(e) =>
                          updateVariant(index, "comparePrice", e.target.value)
                        }
                        placeholder="399.99"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Stock *</Label>
                      <Input
                        type="number"
                        min="0"
                        value={variant.stock}
                        onChange={(e) =>
                          updateVariant(index, "stock", e.target.value)
                        }
                        placeholder="50"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Attributes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Color Selection */}
                    <div className="space-y-2">
                      <Label className="text-xs">Color</Label>
                      <Select
                        value={variant.color}
                        onValueChange={(value) =>
                          updateVariant(index, "color", value)
                        }
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Choose a color" />
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

                    {/* Storage */}
                    <div className="space-y-2">
                      <Label className="text-xs">Storage</Label>
                      <Input
                        value={variant.storage}
                        onChange={(e) =>
                          updateVariant(index, "storage", e.target.value)
                        }
                        placeholder="256GB"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* More Attributes */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs">RAM</Label>
                      <Input
                        value={variant.ram}
                        onChange={(e) =>
                          updateVariant(index, "ram", e.target.value)
                        }
                        placeholder="8GB"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Size</Label>
                      <Input
                        value={variant.size}
                        onChange={(e) =>
                          updateVariant(index, "size", e.target.value)
                        }
                        placeholder="6.1 inch"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs">Material</Label>
                      <Input
                        value={variant.material}
                        onChange={(e) =>
                          updateVariant(index, "material", e.target.value)
                        }
                        placeholder="Aluminum"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-2">
                    <Label className="text-xs">Variant Images</Label>
                    <div className="flex items-center space-x-3">
                      {/* Image Previews */}
                      <div className="flex space-x-2">
                        {variant.imagePreviews.map((preview, imgIndex) => (
                          <div key={imgIndex} className="relative">
                            <img
                              src={preview}
                              alt={`${variant.variantName} ${imgIndex + 1}`}
                              className="w-16 h-16 rounded-lg object-cover border"
                            />
                            {variant.cloudinaryUrls[imgIndex] && (
                              <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1">
                                <CheckCircleIcon className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        ))}

                        {variant.imagePreviews.length === 0 && (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg border flex items-center justify-center">
                            <PhotoIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Upload Button */}
                      <div className="flex-1">
                        <label className="cursor-pointer">
                          <span className="text-sm text-blue-600 hover:text-blue-700 underline">
                            {variant.imagePreviews.length > 0
                              ? "Add More Images"
                              : "Upload Images"}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              files.forEach((file) =>
                                handleImageUpload(index, file)
                              );
                            }}
                            disabled={isUploading === index}
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Upload images specific to this variant
                        </p>
                      </div>

                      {/* Upload Status */}
                      {isUploading === index && (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-xs text-blue-600">
                            Uploading...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Variant Preview */}
                  {variant.color && (
                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{
                          backgroundColor:
                            COLOR_OPTIONS.find((c) => c.name === variant.color)
                              ?.value || "#6B7280",
                        }}
                      />
                      <span className="text-sm text-gray-600">
                        {variant.variantName || variant.color}
                      </span>
                      {variant.price && (
                        <span className="text-sm font-medium text-gray-900">
                          €{variant.price}
                        </span>
                      )}
                      {variant.cloudinaryUrls.length > 0 && (
                        <span className="text-xs text-green-600 font-medium">
                          ✓ {variant.cloudinaryUrls.length} image(s) uploaded
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {variants.length === 0 && (
        <div className="text-center py-8 bg-gray-50/30 rounded-lg border border-dashed border-gray-300">
          <PhotoIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-gray-500">No variants added</p>
          <p className="text-xs text-gray-400">
            Add variants to give customers different options
          </p>
        </div>
      )}

      {/* Summary */}
      {variants.length > 0 && (
        <Card className="bg-blue-50/50 border border-blue-200">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Product Variants:</span>
              <div className="flex items-center space-x-2">
                <span className="font-medium">
                  {variants.length} variant{variants.length !== 1 ? "s" : ""}
                </span>
                <span className="text-gray-500">
                  (
                  {variants.reduce(
                    (total, v) => total + v.cloudinaryUrls.length,
                    0
                  )}{" "}
                  images)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
