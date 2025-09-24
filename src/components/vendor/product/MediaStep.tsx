/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  PhotoIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { uploadMultipleImages } from "@/lib/cloudinary";
import { ProductFormData } from "@/app/vendor/products/add/page";
import { motion } from "framer-motion";

interface MediaStepProps {
  formData: ProductFormData;
  updateFormData: (field: keyof ProductFormData, value: any) => void;
  errors: Record<string, string>;
}

export default function MediaStep({
  formData,
  updateFormData,
  errors,
}: MediaStepProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleBaseImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length + formData.images.length > 5) {
      // Handle error - too many images
      return;
    }

    setIsUploading(true);

    try {
      // Create previews immediately
      const newPreviews = [...formData.imagePreviews];
      const newImages = [...formData.images];

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => newPreviews.push(reader.result as string);
        reader.readAsDataURL(file);
        newImages.push(file);
      });

      // Update form data with previews
      setTimeout(() => {
        updateFormData("images", newImages);
        updateFormData("imagePreviews", newPreviews);
      }, 100);

      // Upload to Cloudinary
      const cloudinaryUrls = await uploadMultipleImages(files);
      updateFormData("cloudinaryUrls", [
        ...formData.cloudinaryUrls,
        ...cloudinaryUrls,
      ]);
    } catch (error) {
      console.error("Base image upload failed:", error);
      // Handle error
    } finally {
      setIsUploading(false);
    }
  };

  const removeBaseImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    const newPreviews = formData.imagePreviews.filter((_, i) => i !== index);
    const newUrls = formData.cloudinaryUrls.filter((_, i) => i !== index);

    updateFormData("images", newImages);
    updateFormData("imagePreviews", newPreviews);
    updateFormData("cloudinaryUrls", newUrls);
  };

  const getActiveVariantsCount = () => {
    return formData.variants.filter((v) => v.isActive).length;
  };

  const getTotalVariantImages = () => {
    return formData.variants.reduce(
      (total, variant) => total + variant.imagePreviews.length,
      0
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
        >
          <PhotoIcon className="w-6 h-6 text-white" />
        </motion.div>

        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-violet-900 to-purple-900 bg-clip-text text-transparent">
            Media & Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Add base product images and configure final settings
          </p>
        </div>
      </div>

      {/* Image Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-blue-50/50 border border-blue-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-blue-600 font-medium">Base Images</p>
            <p className="text-lg font-bold text-blue-800">
              {formData.imagePreviews.length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-50/50 border border-green-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-green-600 font-medium">Variant Images</p>
            <p className="text-lg font-bold text-green-800">
              {getTotalVariantImages()}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50/50 border border-purple-200">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-purple-600 font-medium">Total Images</p>
            <p className="text-lg font-bold text-purple-800">
              {formData.imagePreviews.length + getTotalVariantImages()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Base Product Images */}
      <Card className="bg-white/80 backdrop-blur-sm border border-white/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Base Product Images</CardTitle>
          <p className="text-xs text-gray-600">
            General product images that represent all variants (up to 5 images)
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Existing Base Images */}
            {formData.imagePreviews.map((preview, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={preview}
                  alt={`Base product ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg border"
                />
                {index === 0 && (
                  <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded">
                    Main
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removeBaseImage(index)}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isUploading}
                >
                  <XMarkIcon className="w-3 h-3" />
                </button>
                {formData.cloudinaryUrls[index] && (
                  <div className="absolute bottom-1 right-1 bg-green-500 text-white text-xs px-1 rounded">
                    ✓
                  </div>
                )}
              </div>
            ))}

            {/* Upload Button */}
            {formData.imagePreviews.length < 5 && (
              <label
                className={`
                  flex flex-col items-center justify-center
                  aspect-square border-2 border-dashed border-gray-300 rounded-lg
                  cursor-pointer bg-gray-50/50 hover:bg-gray-100/50 transition-colors
                  ${isUploading ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {isUploading ? (
                  <div className="text-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <span className="text-xs text-gray-500">Uploading...</span>
                  </div>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-xs text-gray-500 text-center">
                      Add Base Images
                    </span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleBaseImageUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            )}
          </div>

          <div className="bg-blue-50/50 rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">i</span>
              </div>
              <div className="text-xs text-blue-800 space-y-1">
                <p>
                  <strong>Base images vs Variant images:</strong>
                </p>
                <ul className="space-y-0.5 ml-2">
                  <li>
                    • <strong>Base images:</strong> General product photos shown
                    by default
                  </li>
                  <li>
                    • <strong>Variant images:</strong> Specific to each
                    color/variant (added in step 2)
                  </li>
                  <li>
                    • When a customer selects a variant, variant images will
                    replace base images
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {errors.images && (
            <p className="text-red-500 text-xs">{errors.images}</p>
          )}
        </CardContent>
      </Card>

      {/* Product Settings */}
      <Card className="bg-white/80 backdrop-blur-sm border border-white/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Product Settings</CardTitle>
          <p className="text-xs text-gray-600">
            Configure product visibility and additional details
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Primary Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Status */}
            <Card className="bg-blue-50/50 border border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Product Status
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
                      updateFormData("isActive", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Featured Product */}
            <Card className="bg-green-50/50 border border-green-200">
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
                      updateFormData("featured", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Secondary Settings Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* New Arrival */}
            <Card className="bg-purple-50/50 border border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">New Arrival</Label>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.newArrival
                        ? "Marked as new arrival"
                        : "Regular product"}
                    </p>
                  </div>
                  <Switch
                    checked={formData.newArrival}
                    onCheckedChange={(checked) =>
                      updateFormData("newArrival", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Returns Policy */}
            <Card className="bg-yellow-50/50 border border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">
                      Returns Allowed
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
                      updateFormData("returnable", checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Additional Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Shipping Details */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDays" className="text-sm font-medium">
                    Delivery Days
                  </Label>
                  <Select
                    value={formData.deliveryDays}
                    onValueChange={(value) =>
                      updateFormData("deliveryDays", value)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Day (Express)</SelectItem>
                      <SelectItem value="2">2 Days</SelectItem>
                      <SelectItem value="3">3 Days (Standard)</SelectItem>
                      <SelectItem value="5">5 Days</SelectItem>
                      <SelectItem value="7">1 Week</SelectItem>
                      <SelectItem value="14">2 Weeks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty" className="text-sm font-medium">
                    Warranty Period
                  </Label>
                  <Select
                    value={formData.warranty}
                    onValueChange={(value) => updateFormData("warranty", value)}
                  >
                    <SelectTrigger className="h-9 text-sm">
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
              </div>

              {/* Physical Properties */}
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm font-medium">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.weight}
                    onChange={(e) => updateFormData("weight", e.target.value)}
                    placeholder="0.5"
                    className="h-9 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dimensions" className="text-sm font-medium">
                    Dimensions (L×W×H cm)
                  </Label>
                  <Input
                    id="dimensions"
                    value={formData.dimensions}
                    onChange={(e) =>
                      updateFormData("dimensions", e.target.value)
                    }
                    placeholder="15.5×7.6×0.8"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEO & Tags */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">
              SEO & Discoverability
            </h3>

            <div className="space-y-2">
              <Label
                htmlFor="tags"
                className="text-sm font-medium flex items-center"
              >
                <TagIcon className="w-4 h-4 mr-1 text-gray-500" />
                Search Tags
              </Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => updateFormData("tags", e.target.value)}
                placeholder="wireless, premium, gaming, professional, smartphone"
                className="h-9 text-sm"
              />
              <p className="text-xs text-gray-500">
                Comma-separated keywords to help customers find your product
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-green-800">
            Ready to Create Product
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="text-center">
              <p className="text-green-600 font-medium">Variants</p>
              <p className="text-lg font-bold text-green-800">
                {getActiveVariantsCount()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-600 font-medium">Images</p>
              <p className="text-lg font-bold text-green-800">
                {formData.imagePreviews.length + getTotalVariantImages()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-600 font-medium">Specs</p>
              <p className="text-lg font-bold text-green-800">
                {
                  formData.specifications.filter(
                    (s) => s.name.trim() && s.value.trim()
                  ).length
                }
              </p>
            </div>
            <div className="text-center">
              <p className="text-green-600 font-medium">Status</p>
              <p className="text-sm font-bold text-green-800">
                {formData.isActive ? "Active" : "Draft"}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-green-200">
            <div className="flex items-center justify-center space-x-2 text-sm text-green-700">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Product ready for creation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-blue-50/30 border border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>Final Review:</strong>
              </p>
              <ul className="space-y-1 ml-2 text-xs">
                <li>• All variants have pricing and stock configured</li>
                <li>• Product images are uploaded and organized</li>
                <li>• Settings match your business needs</li>
                <li>
                  • Click &quot;Create Product&quot; to publish your listing
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
