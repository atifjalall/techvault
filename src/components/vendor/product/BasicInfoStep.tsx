/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TagIcon,
  BuildingStorefrontIcon,
  Square3Stack3DIcon,
  CheckCircleIcon,
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
import { Skeleton } from "@/components/ui/skeleton";
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
  }, [formData.categoryId, categories, formData.subcategoryId, updateFormData]);

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {/* Product Name */}
      <div className="space-y-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-8 w-full" />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-3 w-32" />
      </div>

      {/* Brand and Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>

      {/* Subcategory and Model Number Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-full" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
            <TagIcon className="w-4 h-4 mr-2 text-blue-600" />
            Basic Information
          </CardTitle>
          <p className="text-xs text-gray-600">
            Essential details about your product
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <LoadingSkeleton />
        </CardContent>
      </Card>
    );
  }

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
              <TagIcon className="w-4 h-4 mr-2 text-blue-600" />
              Basic Information
            </CardTitle>
            <p className="text-xs text-gray-600">
              Essential details about your product
            </p>
          </CardHeader>
        </motion.div>

        <CardContent className="space-y-3 pt-2">
          {/* Product Name */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-1"
          >
            <Label htmlFor="name" className="text-xs font-medium text-gray-700">
              Product Name <span className="text-red-500">*</span>
            </Label>
            <motion.div whileFocus={{ scale: 1.01 }}>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData("name", e.target.value)}
                placeholder="e.g., iPhone 16 Pro Max"
                className={`h-8 text-sm transition-all duration-200 ${
                  errors.name
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-200"
                }`}
              />
            </motion.div>
            <AnimatePresence>
              {errors.name && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-red-500 text-xs mt-1"
                >
                  {errors.name}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="space-y-1"
          >
            <Label
              htmlFor="description"
              className="text-xs font-medium text-gray-700"
            >
              Description <span className="text-red-500">*</span>
            </Label>
            <motion.div whileFocus={{ scale: 1.01 }}>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                rows={2}
                placeholder="Describe your product features and benefits..."
                className={`text-sm resize-none transition-all duration-200 ${
                  errors.description
                    ? "border-red-300 focus:border-red-400"
                    : "border-gray-200"
                }`}
              />
            </motion.div>
            <AnimatePresence>
              {errors.description && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-red-500 text-xs mt-1"
                >
                  {errors.description}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="text-xs text-gray-500"
            >
              {formData.description.length}/20 characters minimum
            </motion.p>
          </motion.div>

          {/* Brand and Category Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {/* Brand Selection */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="space-y-1"
            >
              <Label
                htmlFor="brand"
                className="text-xs font-medium text-gray-700 flex items-center"
              >
                <BuildingStorefrontIcon className="w-3 h-3 mr-1 text-blue-600" />
                Brand <span className="text-red-500">*</span>
              </Label>
              <motion.div whileHover={{ scale: 1.01 }}>
                <Select
                  value={formData.brandId || ""}
                  onValueChange={(value) => updateFormData("brandId", value)}
                >
                  <SelectTrigger
                    className={`h-8 text-sm border transition-all duration-200 ${
                      errors.brandId ? "border-red-300" : "border-gray-200"
                    } bg-white cursor-pointer`}
                  >
                    <SelectValue placeholder="Choose brand..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-40">
                    {brands.map((brand, index) => (
                      <motion.div
                        key={brand.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <SelectItem
                          value={brand.id}
                          className="text-sm py-1.5 px-3 cursor-pointer hover:bg-blue-50 transition-colors"
                        >
                          {brand.name}
                        </SelectItem>
                      </motion.div>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              <AnimatePresence>
                {errors.brandId && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.brandId}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Category Selection */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="space-y-1"
            >
              <Label
                htmlFor="category"
                className="text-xs font-medium text-gray-700 flex items-center"
              >
                <Square3Stack3DIcon className="w-3 h-3 mr-1 text-blue-600" />
                Category <span className="text-red-500">*</span>
              </Label>
              <motion.div whileHover={{ scale: 1.01 }}>
                <Select
                  value={formData.categoryId || ""}
                  onValueChange={(value) => updateFormData("categoryId", value)}
                >
                  <SelectTrigger
                    className={`h-8 text-sm border transition-all duration-200 ${
                      errors.categoryId ? "border-red-300" : "border-gray-200"
                    } bg-white cursor-pointer`}
                  >
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-40">
                    {categories.map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                      >
                        <SelectItem
                          value={category.id}
                          className="text-sm py-1.5 px-3 cursor-pointer hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-medium">{category.name}</span>
                            {category.subcategories.length > 0 && (
                              <span className="text-xs text-gray-500 ml-2">
                                {category.subcategories.length}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      </motion.div>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
              <AnimatePresence>
                {errors.categoryId && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-red-500 text-xs mt-1"
                  >
                    {errors.categoryId}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>

          {/* Subcategory and Model Number Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            {/* Subcategory */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="space-y-1"
            >
              <Label
                htmlFor="subcategory"
                className="text-xs font-medium text-gray-700"
              >
                Subcategory <span className="text-gray-400">(Optional)</span>
              </Label>
              <motion.div
                whileHover={{
                  scale:
                    !selectedCategory ||
                    selectedCategory.subcategories.length === 0
                      ? 1
                      : 1.01,
                }}
              >
                <Select
                  value={formData.subcategoryId || ""}
                  onValueChange={(value) =>
                    updateFormData("subcategoryId", value)
                  }
                  disabled={
                    !selectedCategory ||
                    selectedCategory.subcategories.length === 0
                  }
                >
                  <SelectTrigger
                    className={`h-8 text-sm border transition-all duration-200 ${
                      !selectedCategory ||
                      selectedCategory.subcategories.length === 0
                        ? "bg-gray-50 cursor-not-allowed border-gray-200 text-gray-400"
                        : "border-gray-200 bg-white cursor-pointer"
                    }`}
                  >
                    <SelectValue
                      placeholder={
                        !selectedCategory
                          ? "Select category first"
                          : selectedCategory.subcategories.length === 0
                            ? "No subcategories"
                            : "Choose subcategory..."
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-40">
                    {selectedCategory?.subcategories.map(
                      (subcategory, index) => (
                        <motion.div
                          key={subcategory.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <SelectItem
                            value={subcategory.id}
                            className="text-sm py-1.5 px-3 cursor-pointer hover:bg-blue-50 transition-colors"
                          >
                            {subcategory.name}
                          </SelectItem>
                        </motion.div>
                      )
                    )}
                  </SelectContent>
                </Select>
              </motion.div>
            </motion.div>

            {/* Model Number */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
              className="space-y-1"
            >
              <Label
                htmlFor="modelNumber"
                className="text-xs font-medium text-gray-700"
              >
                Model Number <span className="text-gray-400">(Optional)</span>
              </Label>
              <motion.div whileFocus={{ scale: 1.01 }}>
                <Input
                  id="modelNumber"
                  value={formData.modelNumber}
                  onChange={(e) =>
                    updateFormData("modelNumber", e.target.value)
                  }
                  placeholder="e.g. A3108, WH-1000XM5"
                  className="h-8 text-sm border-gray-200 transition-all duration-200"
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 1.0 }}
                className="text-xs text-gray-500"
              >
                Product model or unique identifier
              </motion.p>
            </motion.div>
          </motion.div>

          {/* Selected Category Info - Compact */}
          <AnimatePresence>
            {selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-blue-50 border border-blue-200 rounded-md p-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.1,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <CheckCircleIcon className="w-4 h-4 text-blue-600" />
                    </motion.div>
                    <div>
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xs font-semibold text-blue-900"
                      >
                        {selectedCategory.name}
                      </motion.p>
                      <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xs text-blue-600"
                      >
                        Category selected
                      </motion.p>
                    </div>
                  </div>
                  {selectedCategory.subcategories.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Badge
                        variant="default"
                        size="sm"
                        icon="auto"
                        className="bg-blue-100 text-blue-700 border-blue-300"
                      >
                        {selectedCategory.subcategories.length} subs
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
