/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/buttonSidebar";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

// Match your actual ProductFormData structure
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
  variants: ProductVariant[];
  specifications: any[];
}

interface PricingStepProps {
  formData: ProductFormData;
  updateFormData: (field: keyof ProductFormData, value: any) => void;
  errors: Record<string, string>;
}

export default function PricingStep({
  formData,
  updateFormData,
  errors,
}: PricingStepProps) {
  const addVariant = () => {
    const newVariant: ProductVariant = {
      variantName: `Variant ${formData.variants.length + 1}`,
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
    const updated = formData.variants.map((variant, i) =>
      i === index ? { ...variant, [field]: value } : variant
    );
    updateFormData("variants", updated);
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const updated = formData.variants.filter((_, i) => i !== index);
      updateFormData("variants", updated);
    }
  };

  const calculateDiscount = (price: string, comparePrice: string) => {
    if (!price || !comparePrice) return 0;
    const priceNum = parseFloat(price);
    const comparePriceNum = parseFloat(comparePrice);
    if (comparePriceNum <= priceNum) return 0;
    return Math.round(((comparePriceNum - priceNum) / comparePriceNum) * 100);
  };

  const getStockStatus = (stock: string, lowStockAlert: string) => {
    const stockNum = parseInt(stock || "0");
    const alertNum = parseInt(lowStockAlert || "10");

    if (stockNum === 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (stockNum <= alertNum)
      return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  // Calculate overall product statistics
  const totalStock = formData.variants.reduce(
    (total, variant) => total + parseInt(variant.stock || "0"),
    0
  );

  const activeVariants = formData.variants.filter((v) => v.isActive);
  const cheapestPrice =
    activeVariants.length > 0
      ? Math.min(
          ...activeVariants
            .map((v) => parseFloat(v.price || "0"))
            .filter((p) => p > 0)
        )
      : 0;

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Variants & Pricing</CardTitle>
        <p className="text-sm text-gray-600">
          Manage product variants with individual pricing and stock
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview Stats */}
        <Card className="bg-blue-50/50 border border-blue-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-lg font-bold text-blue-700">
                  {formData.variants.length}
                </p>
                <p className="text-xs text-blue-600">Total Variants</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-700">
                  {activeVariants.length}
                </p>
                <p className="text-xs text-blue-600">Active Variants</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-700">{totalStock}</p>
                <p className="text-xs text-blue-600">Total Stock</p>
              </div>
              <div>
                <p className="text-lg font-bold text-blue-700">
                  {cheapestPrice > 0 ? `€${cheapestPrice.toFixed(2)}` : "--"}
                </p>
                <p className="text-xs text-blue-600">Starting Price</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Variant Button */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Product Variants
            </h3>
            <p className="text-xs text-gray-500">
              Each variant represents a unique purchasable item
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
            className="text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 mr-1" />
            Add Variant
          </Button>
        </div>

        {/* Variants List */}
        <div className="space-y-4">
          {formData.variants.map((variant, index) => (
            <Card key={index} className="bg-gray-50/50 border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Variant Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium">
                        {variant.variantName || `Variant ${index + 1}`}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={variant.isActive}
                          onCheckedChange={(checked) =>
                            updateVariant(index, "isActive", checked)
                          }
                        />
                        <span className="text-xs text-gray-500">
                          {variant.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {formData.variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Variant Name & SKU */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">
                        Variant Name *
                      </Label>
                      <Input
                        value={variant.variantName}
                        onChange={(e) =>
                          updateVariant(index, "variantName", e.target.value)
                        }
                        placeholder="e.g., Space Black - 256GB"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">SKU</Label>
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
                      <Label className="text-xs font-medium">Price (€) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={variant.price}
                        onChange={(e) =>
                          updateVariant(index, "price", e.target.value)
                        }
                        placeholder="299.99"
                        className={`text-sm ${errors[`variant-${index}-price`] ? "border-red-500" : ""}`}
                      />
                      {errors[`variant-${index}-price`] && (
                        <p className="text-red-500 text-xs">
                          {errors[`variant-${index}-price`]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">
                        Compare Price (€)
                      </Label>
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
                      <Label className="text-xs font-medium">Discount</Label>
                      <div className="px-3 py-2 bg-green-50 border rounded-md text-sm font-medium">
                        {calculateDiscount(
                          variant.price,
                          variant.comparePrice || ""
                        ) > 0 ? (
                          <span className="text-green-700">
                            {calculateDiscount(
                              variant.price,
                              variant.comparePrice || ""
                            )}
                            % off
                          </span>
                        ) : (
                          <span className="text-gray-500">No discount</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Inventory */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-2">
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
                        className={`text-sm ${errors[`variant-${index}-stock`] ? "border-red-500" : ""}`}
                      />
                      {errors[`variant-${index}-stock`] && (
                        <p className="text-red-500 text-xs">
                          {errors[`variant-${index}-stock`]}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
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
                        className="text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-medium">
                        Stock Status
                      </Label>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge
                          variant={
                            getStockStatus(variant.stock, variant.lowStockAlert)
                              .variant
                          }
                        >
                          {
                            getStockStatus(variant.stock, variant.lowStockAlert)
                              .label
                          }
                        </Badge>
                        {variant.stock && (
                          <span className="text-xs text-gray-500">
                            {variant.stock} units
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Attributes */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Color</Label>
                      <Input
                        value={variant.color}
                        onChange={(e) =>
                          updateVariant(index, "color", e.target.value)
                        }
                        placeholder="Black"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">Storage</Label>
                      <Input
                        value={variant.storage}
                        onChange={(e) =>
                          updateVariant(index, "storage", e.target.value)
                        }
                        placeholder="256GB"
                        className="text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-medium">RAM</Label>
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
                      <Label className="text-xs font-medium">Size</Label>
                      <Input
                        value={variant.size}
                        onChange={(e) =>
                          updateVariant(index, "size", e.target.value)
                        }
                        placeholder="6.1 inch"
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Variant Summary */}
                  {(variant.price || variant.stock) && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                          {variant.price && (
                            <span className="font-medium text-gray-900">
                              €{parseFloat(variant.price).toFixed(2)}
                            </span>
                          )}
                          {variant.comparePrice &&
                            parseFloat(variant.comparePrice) >
                              parseFloat(variant.price || "0") && (
                              <span className="line-through text-gray-500">
                                €{parseFloat(variant.comparePrice).toFixed(2)}
                              </span>
                            )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {variant.stock
                            ? `${variant.stock} in stock`
                            : "No stock set"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Variants State */}
        {formData.variants.length === 0 && (
          <div className="text-center py-8 bg-gray-50/30 rounded-lg border border-dashed border-gray-300">
            <p className="text-sm text-gray-500">No variants created</p>
            <p className="text-xs text-gray-400 mt-1">
              Add at least one variant to set pricing and stock
            </p>
          </div>
        )}

        {/* Validation Summary */}
        {formData.variants.length > 0 && (
          <Card className="bg-yellow-50/50 border border-yellow-200">
            <CardContent className="p-3">
              <div className="text-sm">
                <p className="font-medium text-yellow-700 mb-2">
                  Variant Validation
                </p>
                <div className="space-y-1 text-xs">
                  {formData.variants.map((variant, index) => {
                    const issues = [];
                    if (!variant.variantName.trim())
                      issues.push("Missing name");
                    if (!variant.price || parseFloat(variant.price) <= 0)
                      issues.push("Invalid price");
                    if (!variant.stock || parseInt(variant.stock) < 0)
                      issues.push("Invalid stock");

                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-yellow-600">
                          Variant {index + 1}:{" "}
                          {variant.variantName || "Unnamed"}
                        </span>
                        <span
                          className={
                            issues.length === 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {issues.length === 0
                            ? "✓ Valid"
                            : `${issues.length} issue(s)`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
