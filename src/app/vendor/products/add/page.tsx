/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";

// Components
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/buttonSidebar";
import { Badge } from "@/components/ui/badge";
import ProductFormSteps from "@/components/vendor/product/ProductFormSteps";
import ProductPreview from "@/components/vendor/product/ProductPreview";

// Updated interfaces for variant-based products
export interface ProductVariant {
  id?: string;
  variantName: string;
  sku?: string;

  // Pricing
  price: string;
  comparePrice?: string;

  // Stock
  stock: string;
  lowStockAlert: string;

  // Variant attributes
  color?: string;
  colorHex?: string;
  storage?: string;
  ram?: string;
  size?: string;
  length?: string;
  material?: string;

  // Additional flexible attributes
  attributes?: Record<string, string>;

  // Images
  images: File[];
  imagePreviews: string[];
  cloudinaryUrls: string[];
  thumbnailImage?: string;

  // Status
  isActive: boolean;
}

export interface ProductSpecification {
  category: string;
  categoryOrder: number;
  name: string;
  value: string;
  unit?: string;
  specOrder: number;
  isHighlight: boolean;
}

export interface ProductFormData {
  // Base product info
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  subcategoryId: string;
  modelNumber: string;

  // Base product images (general/default)
  images: File[];
  imagePreviews: string[];
  cloudinaryUrls: string[];

  // Product settings
  featured: boolean;
  newArrival: boolean;
  returnable: boolean;
  isActive: boolean;

  // Shipping and warranty
  deliveryDays: string;
  warranty: string;

  // Physical properties
  weight: string;
  dimensions: string;

  // SEO
  tags: string;

  // Product variants - the purchasable items
  variants: ProductVariant[];

  // Product specifications
  specifications: ProductSpecification[];
}

const STEPS = [
  { id: 1, name: "Basic Info", description: "Product name, brand, category" },
  { id: 2, name: "Variants", description: "Product variants and pricing" },
  { id: 3, name: "Specifications", description: "Technical specifications" },
  { id: 4, name: "Media & Settings", description: "Images and final settings" },
];

export default function AddProductPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    // Base product info
    name: "",
    description: "",
    brandId: "",
    categoryId: "",
    subcategoryId: "",
    modelNumber: "",

    // Base product images
    images: [],
    imagePreviews: [],
    cloudinaryUrls: [],

    // Product settings
    featured: false,
    newArrival: false,
    returnable: true,
    isActive: true,

    // Shipping and warranty
    deliveryDays: "3",
    warranty: "2",

    // Physical properties
    weight: "",
    dimensions: "",

    // SEO
    tags: "",

    // Product variants
    variants: [
      {
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
      },
    ],

    // Product specifications
    specifications: [],
  });

  const updateFormData = (field: keyof ProductFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getCompletionPercentage = () => {
    let totalFields = 0;
    let completedFields = 0;

    // Base product fields
    const requiredBaseFields = [
      formData.name,
      formData.brandId,
      formData.categoryId,
      formData.description,
    ];
    totalFields += requiredBaseFields.length;
    completedFields += requiredBaseFields.filter(
      (field) => field && field.toString().trim()
    ).length;

    // Variants (at least one complete variant)
    totalFields += 2; // At least 1 variant with price and stock
    if (formData.variants.length > 0) {
      const firstVariant = formData.variants[0];
      if (firstVariant.variantName.trim()) completedFields += 1;
      if (firstVariant.price && parseFloat(firstVariant.price) > 0)
        completedFields += 1;
    }

    // Images
    totalFields += 1;
    if (
      formData.imagePreviews.length > 0 ||
      formData.variants.some((v) => v.imagePreviews.length > 0)
    ) {
      completedFields += 1;
    }

    return Math.round((completedFields / totalFields) * 100);
  };

  const validateFormData = () => {
    const errors: string[] = [];

    // Base product validation
    if (!formData.name.trim()) errors.push("Product name is required");
    if (!formData.brandId) errors.push("Brand is required");
    if (!formData.categoryId) errors.push("Category is required");
    if (!formData.description.trim()) errors.push("Description is required");

    // Variants validation
    if (formData.variants.length === 0) {
      errors.push("At least one variant is required");
    } else {
      formData.variants.forEach((variant, index) => {
        if (!variant.variantName.trim()) {
          errors.push(`Variant ${index + 1}: Name is required`);
        }
        if (!variant.price || parseFloat(variant.price) <= 0) {
          errors.push(`Variant ${index + 1}: Valid price is required`);
        }
        if (!variant.stock || parseInt(variant.stock) < 0) {
          errors.push(`Variant ${index + 1}: Valid stock quantity is required`);
        }
        if (
          variant.comparePrice &&
          parseFloat(variant.comparePrice) <= parseFloat(variant.price || "0")
        ) {
          errors.push(
            `Variant ${index + 1}: Compare price must be higher than regular price`
          );
        }
      });
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateFormData();
    if (validationErrors.length > 0) {
      alert("Please fix the following errors:\n" + validationErrors.join("\n"));
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare variants data
      const variants = formData.variants
        .filter((variant) => variant.variantName.trim() && variant.price)
        .map((variant) => ({
          variantName: variant.variantName.trim(),
          sku: variant.sku?.trim() || undefined,
          price: parseFloat(variant.price),
          comparePrice: variant.comparePrice
            ? parseFloat(variant.comparePrice)
            : undefined,
          stock: parseInt(variant.stock),
          lowStockAlert: parseInt(variant.lowStockAlert),
          color: variant.color?.trim() || undefined,
          colorHex: variant.colorHex?.trim() || undefined,
          storage: variant.storage?.trim() || undefined,
          ram: variant.ram?.trim() || undefined,
          size: variant.size?.trim() || undefined,
          length: variant.length?.trim() || undefined,
          material: variant.material?.trim() || undefined,
          attributes: variant.attributes,
          images: variant.cloudinaryUrls,
          thumbnailImage: variant.thumbnailImage || variant.cloudinaryUrls[0],
          isActive: variant.isActive,
        }));

      // Prepare specifications data
      const specifications = formData.specifications
        .filter((spec) => spec.name.trim() && spec.value.trim())
        .map((spec) => ({
          category: spec.category,
          categoryOrder: spec.categoryOrder,
          name: spec.name.trim(),
          value: spec.value.trim(),
          unit: spec.unit?.trim() || undefined,
          specOrder: spec.specOrder,
          isHighlight: spec.isHighlight,
        }));

      // Prepare the payload
      const payload = {
        // Base product
        name: formData.name.trim(),
        description: formData.description.trim(),
        brandId: formData.brandId,
        categoryId: formData.categoryId,
        subcategoryId: formData.subcategoryId || undefined,
        modelNumber: formData.modelNumber.trim() || undefined,
        images: formData.cloudinaryUrls,

        // Settings
        featured: formData.featured,
        newArrival: formData.newArrival,
        returnable: formData.returnable,
        isActive: formData.isActive,

        // Shipping & warranty
        deliveryDays: formData.deliveryDays
          ? parseInt(formData.deliveryDays)
          : undefined,
        warranty: formData.warranty?.trim() || undefined,

        // Physical
        weight: formData.weight.trim() || undefined,
        dimensions: formData.dimensions.trim() || undefined,

        // SEO
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),

        // Variants and specifications
        variants,
        specifications,
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

      // Success - redirect to products page
      router.push("/vendor/products");
    } catch (error) {
      console.error("Error creating product:", error);
      alert(
        error instanceof Error ? error.message : "Failed to create product"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50/30 min-h-screen">
      {/* Compact Header - Matching Dashboard Style */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div>
          <h1 className="text-lg font-bold text-gray-900 mb-0.5">
            Add New Product
          </h1>
          <p className="text-xs text-gray-600">
            Create a new product with variants and specifications
          </p>
        </div>
        <Badge
          variant="secondary"
          size="sm"
          icon="auto"
          className="bg-blue-50 text-blue-700"
        >
          {getCompletionPercentage()}% Complete
        </Badge>
      </motion.div>

      {/* Compact Progress Bar */}
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-3">
          <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden mb-2">
            <motion.div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / STEPS.length) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between">
            {STEPS.map((step) => (
              <motion.button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`text-xs font-medium transition-colors cursor-pointer px-2 py-1 rounded-md ${
                  currentStep >= step.id
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50"
                }`}
              >
                {step.name}
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compact Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Form Steps - Compact Cards */}
        <div className="lg:col-span-2">
          <ProductFormSteps
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            formData={formData}
            updateFormData={updateFormData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Compact Preview Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <ProductPreview formData={formData} />
          </div>
        </div>
      </div>
    </div>
  );
}
