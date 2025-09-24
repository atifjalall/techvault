/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  SparklesIcon,
  TagIcon,
  BuildingStorefrontIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { ProductFormData } from "@/app/vendor/products/add/page";

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface BasicInfoStepProps {
  formData: ProductFormData;
  updateFormData: (field: keyof ProductFormData, value: any) => void;
  errors: Record<string, string>;
}

export default function BasicInfoStep({
  formData,
  updateFormData,
  errors,
}: BasicInfoStepProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Load brands and categories
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch("/api/brands").then((res) => res.json()),
      fetch("/api/categories").then((res) => res.json()),
    ])
      .then(([brandsData, categoriesData]) => {
        if (brandsData.success) setBrands(brandsData.brands);
        if (categoriesData.success) setCategories(categoriesData.categories);
      })
      .catch((err) => console.error("Error loading data:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // Update selected category when categoryId changes
  useEffect(() => {
    if (formData.categoryId && categories.length > 0) {
      const category = categories.find((c) => c.id === formData.categoryId);
      setSelectedCategory(category || null);

      // Clear subcategory if it doesn't belong to new category
      if (
        formData.subcategoryId &&
        category &&
        !category.subcategories.find((s) => s.id === formData.subcategoryId)
      ) {
        updateFormData("subcategoryId", "");
      }
    }
  }, [formData.categoryId, categories]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
        >
          <SparklesIcon className="w-6 h-6 text-white" />
        </motion.div>

        <div>
          <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
            Basic Information
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Essential details about your product
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Product Name */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-2"
        >
          <Label
            htmlFor="name"
            className="text-sm font-semibold text-gray-800 flex items-center"
          >
            <TagIcon className="w-4 h-4 mr-2 text-indigo-600" />
            Product Name
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <div className="relative">
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="e.g., iPhone 16 Pro Max, Premium HDMI Cable"
              className={`
                h-11 text-sm px-4 rounded-lg border-2 transition-all duration-300
                ${
                  errors.name
                    ? "border-red-300 bg-red-50/50 focus:border-red-500"
                    : "border-gray-200 bg-white/80 focus:border-indigo-500 focus:bg-white"
                }
                hover:border-gray-300 focus:ring-2 focus:ring-indigo-500/20
              `}
            />
            {formData.name && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </motion.div>
            )}
          </div>
          {errors.name && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-500 text-xs font-medium"
            >
              {errors.name}
            </motion.p>
          )}
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="space-y-2"
        >
          <Label
            htmlFor="description"
            className="text-sm font-semibold text-gray-800"
          >
            Product Description
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
            rows={3}
            placeholder="Describe your product features, benefits, and what makes it special..."
            className={`
              text-sm px-4 py-3 rounded-lg border-2 transition-all duration-300 resize-none
              ${
                errors.description
                  ? "border-red-300 bg-red-50/50 focus:border-red-500"
                  : "border-gray-200 bg-white/80 focus:border-indigo-500 focus:bg-white"
              }
              hover:border-gray-300 focus:ring-2 focus:ring-indigo-500/20
            `}
          />
          {errors.description && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-red-500 text-xs font-medium"
            >
              {errors.description}
            </motion.p>
          )}
          <p className="text-xs text-gray-500">
            Minimum 20 characters recommended for better SEO
          </p>
        </motion.div>

        {/* Brand and Category Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Brand Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="brand"
              className="text-sm font-semibold text-gray-800 flex items-center"
            >
              <BuildingStorefrontIcon className="w-4 h-4 mr-2 text-emerald-600" />
              Brand
              <span className="text-red-500 ml-1">*</span>
            </Label>

            <Select
              value={formData.brandId || ""}
              onValueChange={(value) => updateFormData("brandId", value)}
            >
              <SelectTrigger
                className={`
                h-11 rounded-lg border-2 transition-all duration-300 bg-white/80 text-sm
                ${
                  errors.brandId
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-emerald-500"
                }
                hover:border-gray-300 focus:ring-2 focus:ring-emerald-500/20
              `}
              >
                <SelectValue placeholder="Choose a brand..." />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-0 shadow-xl">
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading brands...
                  </SelectItem>
                ) : (
                  brands.map((brand) => (
                    <SelectItem
                      key={brand.id}
                      value={brand.id}
                      className="py-2 px-3 rounded-md text-sm"
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-md flex items-center justify-center text-white text-xs font-bold mr-3">
                          {brand.name.charAt(0)}
                        </div>
                        {brand.name}
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {errors.brandId && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 text-xs font-medium"
              >
                {errors.brandId}
              </motion.p>
            )}
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="category"
              className="text-sm font-semibold text-gray-800 flex items-center"
            >
              <Square3Stack3DIcon className="w-4 h-4 mr-2 text-purple-600" />
              Category
              <span className="text-red-500 ml-1">*</span>
            </Label>

            <Select
              value={formData.categoryId || ""}
              onValueChange={(value) => updateFormData("categoryId", value)}
            >
              <SelectTrigger
                className={`
                h-11 rounded-lg border-2 transition-all duration-300 bg-white/80 text-sm
                ${
                  errors.categoryId
                    ? "border-red-300 focus:border-red-500"
                    : "border-gray-200 focus:border-purple-500"
                }
                hover:border-gray-300 focus:ring-2 focus:ring-purple-500/20
              `}
              >
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-0 shadow-xl">
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : (
                  categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      className="py-2 px-3 rounded-md text-sm"
                    >
                      <div className="flex items-center">
                        <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-md flex items-center justify-center text-white text-xs font-bold mr-3">
                          {category.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{category.name}</div>
                          {category.subcategories.length > 0 && (
                            <div className="text-xs text-gray-500">
                              {category.subcategories.length} subcategories
                            </div>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {errors.categoryId && (
              <motion.p
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-red-500 text-xs font-medium"
              >
                {errors.categoryId}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Subcategory and Model Number Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Subcategory */}
          <div className="space-y-2">
            <Label
              htmlFor="subcategory"
              className="text-sm font-semibold text-gray-800"
            >
              Subcategory
              <span className="text-gray-400 ml-1">(Optional)</span>
            </Label>

            <Select
              value={formData.subcategoryId || ""}
              onValueChange={(value) => updateFormData("subcategoryId", value)}
              disabled={
                !selectedCategory || selectedCategory.subcategories.length === 0
              }
            >
              <SelectTrigger
                className={`
                h-11 rounded-lg border-2 transition-all duration-300 bg-white/80 text-sm
                ${
                  !selectedCategory ||
                  selectedCategory.subcategories.length === 0
                    ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                    : "border-gray-200 hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                }
              `}
              >
                <SelectValue
                  placeholder={
                    !selectedCategory
                      ? "Select category first"
                      : selectedCategory.subcategories.length === 0
                        ? "No subcategories available"
                        : "Choose subcategory..."
                  }
                />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-0 shadow-xl">
                {selectedCategory?.subcategories.map((subcategory) => (
                  <SelectItem
                    key={subcategory.id}
                    value={subcategory.id}
                    className="py-2 px-3 rounded-md text-sm"
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5 bg-gradient-to-br from-gray-400 to-gray-500 rounded-md flex items-center justify-center text-white text-xs font-bold mr-3">
                        {subcategory.name.charAt(0)}
                      </div>
                      {subcategory.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Model Number */}
          <div className="space-y-2">
            <Label
              htmlFor="modelNumber"
              className="text-sm font-semibold text-gray-800"
            >
              Model Number / SKU
              <span className="text-gray-400 ml-1">(Optional)</span>
            </Label>
            <Input
              id="modelNumber"
              value={formData.modelNumber}
              onChange={(e) => updateFormData("modelNumber", e.target.value)}
              placeholder="e.g. A3108, WH-1000XM5"
              className="h-11 text-sm rounded-lg border-2 border-gray-200 bg-white/80 hover:border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
            />
            <p className="text-xs text-gray-500">
              Product model or unique identifier for inventory tracking
            </p>
          </div>
        </motion.div>

        {/* Category Info Card */}
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200/50 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {selectedCategory.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-indigo-900">
                        {selectedCategory.name}
                      </h3>
                      <p className="text-indigo-700 text-xs">
                        Selected category for your product
                      </p>
                    </div>
                  </div>

                  {selectedCategory.subcategories.length > 0 && (
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 text-xs">
                      {selectedCategory.subcategories.length} subcategories
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
