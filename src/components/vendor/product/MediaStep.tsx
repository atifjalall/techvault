/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CloudArrowUpIcon,
  XMarkIcon,
  PhotoIcon,
  TagIcon,
  CheckCircleIcon,
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
import { Badge } from "@/components/ui/badge";
import { uploadMultipleImages } from "@/lib/cloudinary";
import { ProductFormData } from "@/app/vendor/products/add/page";

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
      alert("Maximum 5 base images allowed");
      return;
    }

    setIsUploading(true);

    try {
      // Create previews immediately
      const readFilePromises = files.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      const newPreviews = await Promise.all(readFilePromises);

      // Update form data with previews and files
      updateFormData("images", [...formData.images, ...files]);
      updateFormData("imagePreviews", [
        ...formData.imagePreviews,
        ...newPreviews,
      ]);

      // Upload to Cloudinary
      const cloudinaryUrls = await uploadMultipleImages(files);
      updateFormData("cloudinaryUrls", [
        ...formData.cloudinaryUrls,
        ...cloudinaryUrls,
      ]);
    } catch (error) {
      console.error("Base image upload failed:", error);
      alert("Failed to upload images. Please try again.");
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

  const getTotalVariantImages = () => {
    return formData.variants.reduce(
      (total, variant) => total + variant.imagePreviews.length,
      0
    );
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
              <PhotoIcon className="w-4 h-4 mr-2 text-blue-600" />
              Media & Settings
            </CardTitle>
            <p className="text-xs text-gray-600">
              Add base product images and configure final settings
            </p>
          </CardHeader>
        </motion.div>

        <CardContent className="space-y-4 pt-2">
          {/* Image Summary Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-3 gap-3"
          >
            <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-center">
              <p className="text-xs text-blue-600 font-medium">Base Images</p>
              <p className="text-sm font-bold text-blue-800">
                {formData.imagePreviews.length}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-md p-2 text-center">
              <p className="text-xs text-green-600 font-medium">
                Variant Images
              </p>
              <p className="text-sm font-bold text-green-800">
                {getTotalVariantImages()}
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-md p-2 text-center">
              <p className="text-xs text-purple-600 font-medium">
                Total Images
              </p>
              <p className="text-sm font-bold text-purple-800">
                {formData.imagePreviews.length + getTotalVariantImages()}
              </p>
            </div>
          </motion.div>

          {/* Base Product Images */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="space-y-2"
          >
            <Label className="text-sm font-semibold text-gray-900">
              Base Product Images
            </Label>
            <p className="text-xs text-gray-600">
              General product images that represent all variants (up to 5)
            </p>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {/* Existing Base Images */}
              {formData.imagePreviews.map((preview, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative group aspect-square"
                >
                  <img
                    src={preview}
                    alt={`Base product ${index + 1}`}
                    className="w-full h-full object-cover rounded-md border"
                  />
                  {index === 0 && (
                    <div className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-1 rounded">
                      Main
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => removeBaseImage(index)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    disabled={isUploading}
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                  {formData.cloudinaryUrls[index] && (
                    <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-1">
                      <CheckCircleIcon className="w-3 h-3" />
                    </div>
                  )}
                </motion.div>
              ))}

              {/* Upload Button */}
              {formData.imagePreviews.length < 5 && (
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  {isUploading ? (
                    <div className="text-center">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-1" />
                      <span className="text-xs text-gray-500">
                        Uploading...
                      </span>
                    </div>
                  ) : (
                    <>
                      <CloudArrowUpIcon className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500 text-center">
                        Add Images
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

            <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
              <div className="flex items-start space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Base vs Variant Images:</p>
                  <ul className="space-y-0.5">
                    <li>
                      • Base images: General product photos shown by default
                    </li>
                    <li>• Variant images: Specific to each color/variant</li>
                    <li>
                      • When customers select a variant, variant images replace
                      base images
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <AnimatePresence>
              {errors.images && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-xs"
                >
                  {errors.images}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Product Settings */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            className="space-y-3"
          >
            <Label className="text-sm font-semibold text-gray-900">
              Product Settings
            </Label>

            {/* Settings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Product Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">
                      Product Status
                    </Label>
                    <p className="text-xs text-gray-600">
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
              </div>

              {/* Featured Product */}
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">
                      Featured Product
                    </Label>
                    <p className="text-xs text-gray-600">
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
              </div>

              {/* New Arrival */}
              <div className="bg-purple-50 border border-purple-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">
                      New Arrival
                    </Label>
                    <p className="text-xs text-gray-600">
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
              </div>

              {/* Returns Policy */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-900">
                      Returns Allowed
                    </Label>
                    <p className="text-xs text-gray-600">
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
              </div>
            </div>
          </motion.div>

          {/* Additional Details */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="space-y-3"
          >
            <Label className="text-sm font-semibold text-gray-900">
              Additional Details
            </Label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Shipping Details */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Delivery Days
                  </Label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <Select
                      value={formData.deliveryDays}
                      onValueChange={(value) =>
                        updateFormData("deliveryDays", value)
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
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
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Warranty Period
                  </Label>
                  <motion.div whileHover={{ scale: 1.01 }}>
                    <Select
                      value={formData.warranty}
                      onValueChange={(value) =>
                        updateFormData("warranty", value)
                      }
                    >
                      <SelectTrigger className="h-8 text-sm">
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
                  </motion.div>
                </div>
              </div>

              {/* Physical Properties */}
              <div className="space-y-2">
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Weight (kg)
                  </Label>
                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.weight}
                      onChange={(e) => updateFormData("weight", e.target.value)}
                      placeholder="0.5"
                      className="h-8 text-sm"
                    />
                  </motion.div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-gray-700">
                    Dimensions (L×W×H cm)
                  </Label>
                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <Input
                      value={formData.dimensions}
                      onChange={(e) =>
                        updateFormData("dimensions", e.target.value)
                      }
                      placeholder="15.5×7.6×0.8"
                      className="h-8 text-sm"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* SEO & Tags */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            className="space-y-2"
          >
            <Label className="text-sm font-semibold text-gray-900">
              SEO & Discoverability
            </Label>

            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-700 flex items-center">
                <TagIcon className="w-3 h-3 mr-1 text-blue-600" />
                Search Tags
              </Label>
              <motion.div whileFocus={{ scale: 1.01 }}>
                <Input
                  value={formData.tags}
                  onChange={(e) => updateFormData("tags", e.target.value)}
                  placeholder="wireless, premium, gaming, professional, smartphone"
                  className="h-8 text-sm"
                />
              </motion.div>
              <p className="text-xs text-gray-500">
                Comma-separated keywords to help customers find your product
              </p>
            </div>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.7 }}
            className="bg-green-50 border border-green-200 rounded-md p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-green-900">
                Ready to Create Product
              </p>
              <Badge variant="success" size="sm" icon="auto">
                {formData.isActive ? "Active" : "Draft"}
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="text-center">
                <p className="text-green-600 font-medium">Variants</p>
                <p className="text-sm font-bold text-green-800">
                  {formData.variants.filter((v) => v.isActive).length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-green-600 font-medium">Images</p>
                <p className="text-sm font-bold text-green-800">
                  {formData.imagePreviews.length + getTotalVariantImages()}
                </p>
              </div>
              <div className="text-center">
                <p className="text-green-600 font-medium">Specs</p>
                <p className="text-sm font-bold text-green-800">
                  {
                    formData.specifications.filter(
                      (s) => s.name.trim() && s.value.trim()
                    ).length
                  }
                </p>
              </div>
              <div className="text-center">
                <p className="text-green-600 font-medium">Status</p>
                <p className="text-sm font-bold text-green-800">Ready</p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-green-200 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-green-700">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Product ready for creation</span>
              </div>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
