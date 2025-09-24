/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/buttonSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Match your actual ProductFormData structure
interface ProductSpecification {
  category: string;
  categoryOrder: number;
  name: string;
  value: string;
  unit?: string;
  specOrder: number;
  isHighlight: boolean;
}

interface ProductFormData {
  name: string;
  description: string;
  brandId: string;
  categoryId: string;
  subcategoryId: string;
  modelNumber: string;
  images: File[];
  imagePreviews: string[];
  cloudinaryUrls: string[];
  featured: boolean;
  newArrival: boolean;
  returnable: boolean;
  isActive: boolean;
  deliveryDays: string;
  warranty: string;
  weight: string;
  dimensions: string;
  tags: string;
  variants: any[];
  specifications: ProductSpecification[];
}

interface ProductDetailsStepProps {
  formData: ProductFormData;
  updateFormData: (field: keyof ProductFormData, value: any) => void;
  errors: Record<string, string>;
}

// Specification categories for better organization
const SPEC_CATEGORIES = [
  "Display",
  "Performance",
  "Camera",
  "Battery",
  "Connectivity",
  "Audio",
  "Design",
  "Software",
  "Other",
];

export default function ProductDetailsStep({
  formData,
  updateFormData,
  errors,
}: ProductDetailsStepProps) {
  const addSpecification = () => {
    const newSpec: ProductSpecification = {
      category: "Other",
      categoryOrder: 0,
      name: "",
      value: "",
      unit: "",
      specOrder: formData.specifications.length,
      isHighlight: false,
    };

    updateFormData("specifications", [...formData.specifications, newSpec]);
  };

  const updateSpecification = (
    index: number,
    field: keyof ProductSpecification,
    value: any
  ) => {
    const updated = formData.specifications.map((spec, i) =>
      i === index ? { ...spec, [field]: value } : spec
    );
    updateFormData("specifications", updated);
  };

  const removeSpecification = (index: number) => {
    const updated = formData.specifications.filter((_, i) => i !== index);
    updateFormData("specifications", updated);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Product Details</CardTitle>
        <p className="text-sm text-gray-600">
          Provide detailed information about your product
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Product Description *
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData("description", e.target.value)}
            rows={4}
            placeholder="Describe your product features, benefits, and what makes it special..."
            className={`${errors.description ? "border-red-500" : ""}`}
          />
          {errors.description && (
            <p className="text-red-500 text-xs">{errors.description}</p>
          )}
          <p className="text-xs text-gray-500">
            Minimum 50 characters recommended for better SEO
          </p>
        </div>

        {/* Model Number */}
        <div className="space-y-2">
          <Label htmlFor="modelNumber" className="text-sm font-medium">
            Model Number / SKU
          </Label>
          <Input
            id="modelNumber"
            value={formData.modelNumber}
            onChange={(e) => updateFormData("modelNumber", e.target.value)}
            placeholder="e.g., iPhone-15-Pro-Max, DELL-XPS-13-2024"
          />
          <p className="text-xs text-gray-500">
            Unique identifier for this product model
          </p>
        </div>

        {/* Physical Specifications */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Physical Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              />
              <p className="text-xs text-gray-500">
                Product weight in kilograms
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dimensions" className="text-sm font-medium">
                Dimensions (L×W×H cm)
              </Label>
              <Input
                id="dimensions"
                value={formData.dimensions}
                onChange={(e) => updateFormData("dimensions", e.target.value)}
                placeholder="15.5×7.6×0.8"
              />
              <p className="text-xs text-gray-500">
                Length × Width × Height in centimeters
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-50/50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 font-medium mb-1">
              💡 Variant-Specific Attributes
            </p>
            <p className="text-xs text-blue-600">
              Color, material, storage, and other variant-specific attributes
              are configured in the Variants step. Each variant can have its own
              unique attributes.
            </p>
          </div>
        </div>

        {/* Shipping & Warranty */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">
            Delivery & Warranty
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryDays" className="text-sm font-medium">
                Delivery Days
              </Label>
              <Select
                value={formData.deliveryDays}
                onValueChange={(value) => updateFormData("deliveryDays", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery time" />
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
                <SelectTrigger>
                  <SelectValue placeholder="Select warranty period" />
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
        </div>

        {/* Technical Specifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">
              Technical Specifications
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSpecification}
              className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
            >
              <PlusIcon className="w-4 h-4 mr-1" />
              Add Spec
            </Button>
          </div>

          <div className="space-y-3">
            {formData.specifications.map((spec, index) => (
              <div
                key={index}
                className="space-y-3 p-3 bg-gray-50/50 rounded-lg border border-gray-200"
              >
                {/* Category and Highlight */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Category</Label>
                    <Select
                      value={spec.category}
                      onValueChange={(value) =>
                        updateSpecification(index, "category", value)
                      }
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {SPEC_CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Specification Name *</Label>
                    <Input
                      value={spec.name}
                      onChange={(e) =>
                        updateSpecification(index, "name", e.target.value)
                      }
                      placeholder="e.g., Screen Size"
                      className="text-sm"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Value *</Label>
                    <Input
                      value={spec.value}
                      onChange={(e) =>
                        updateSpecification(index, "value", e.target.value)
                      }
                      placeholder="e.g., 6.7 inches"
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Unit and Controls */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Unit</Label>
                      <Input
                        value={spec.unit || ""}
                        onChange={(e) =>
                          updateSpecification(index, "unit", e.target.value)
                        }
                        placeholder="inches, GB, MP"
                        className="text-sm w-24"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-4">
                      <input
                        type="checkbox"
                        id={`highlight-${index}`}
                        checked={spec.isHighlight}
                        onChange={(e) =>
                          updateSpecification(
                            index,
                            "isHighlight",
                            e.target.checked
                          )
                        }
                        className="w-4 h-4 text-blue-600 rounded border-gray-300"
                      />
                      <Label htmlFor={`highlight-${index}`} className="text-xs">
                        Highlight
                      </Label>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSpecification(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}

            {formData.specifications.length === 0 && (
              <div className="text-center py-6 bg-gray-50/50 rounded-lg border border-dashed border-gray-300">
                <p className="text-sm text-gray-500">
                  No specifications added yet
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Add technical details like screen size, processor, battery
                  life, etc.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-sm font-medium">
            Search Tags
          </Label>
          <Input
            id="tags"
            value={formData.tags}
            onChange={(e) => updateFormData("tags", e.target.value)}
            placeholder="wireless, premium, gaming, professional, smartphone"
          />
          <p className="text-xs text-gray-500">
            Comma-separated keywords to help customers find your product
          </p>
        </div>

        {/* Summary Card */}
        {(formData.description || formData.specifications.length > 0) && (
          <Card className="bg-green-50/50 border border-green-200">
            <CardContent className="p-3">
              <div className="text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-700">
                    Details Summary
                  </span>
                </div>
                <div className="space-y-1 text-xs text-green-600">
                  {formData.description && (
                    <p>
                      ✓ Description: {formData.description.length} characters
                    </p>
                  )}
                  {formData.specifications.length > 0 && (
                    <p>
                      ✓ Specifications: {formData.specifications.length} added
                    </p>
                  )}
                  {formData.weight && <p>✓ Weight: {formData.weight} kg</p>}
                  {formData.dimensions && (
                    <p>✓ Dimensions: {formData.dimensions} cm</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
