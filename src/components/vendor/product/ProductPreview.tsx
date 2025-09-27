/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

// Match your actual ProductFormData structure from add product page
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

interface ProductPreviewProps {
  formData: ProductFormData;
}

export default function ProductPreview({ formData }: ProductPreviewProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Get the cheapest active variant for display pricing
  const getDisplayPricing = () => {
    if (!formData.variants || formData.variants.length === 0) {
      return { price: 0, comparePrice: 0, discountPercentage: 0 };
    }

    const activeVariants = formData.variants.filter(
      (v) => v.isActive && v.price
    );
    if (activeVariants.length === 0) {
      return { price: 0, comparePrice: 0, discountPercentage: 0 };
    }

    // Find cheapest variant
    const cheapestVariant = activeVariants.reduce((min, variant) => {
      const variantPrice = parseFloat(variant.price || "0");
      const minPrice = parseFloat(min.price || "0");
      return variantPrice < minPrice ? variant : min;
    });

    const price = parseFloat(cheapestVariant.price || "0");
    const comparePrice = parseFloat(cheapestVariant.comparePrice || "0");

    const discountPercentage =
      comparePrice && comparePrice > price
        ? Math.round(((comparePrice - price) / comparePrice) * 100)
        : 0;

    return { price, comparePrice, discountPercentage };
  };

  // Get total stock across all active variants
  const getTotalStock = () => {
    if (!formData.variants || formData.variants.length === 0) return 0;

    return formData.variants
      .filter((v) => v.isActive)
      .reduce((total, variant) => total + parseInt(variant.stock || "0"), 0);
  };

  // Get active variant count
  const getVariantCount = () => {
    return (
      formData.variants?.filter((v) => v.isActive && v.variantName.trim())
        .length || 0
    );
  };

  // Check if low stock across all variants
  const isLowStock = () => {
    const totalStock = getTotalStock();
    return totalStock > 0 && totalStock <= 5;
  };

  const { price, comparePrice, discountPercentage } = getDisplayPricing();
  const totalStock = getTotalStock();
  const variantCount = getVariantCount();

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  // Get brand name for display
  const getBrandName = () => {
    // You would normally fetch this from brands array, but for preview we'll show placeholder
    return formData.brandId ? "Brand" : undefined;
  };

  // Get main display image (base product images or first variant image)
  const getDisplayImage = () => {
    // First try base product images
    if (formData.imagePreviews.length > 0) {
      return formData.imagePreviews[0];
    }

    // Then try variant images
    for (const variant of formData.variants) {
      if (variant.imagePreviews.length > 0) {
        return variant.imagePreviews[0];
      }
    }

    return null;
  };

  return (
    <Card className="bg-white/70 backdrop-blur-md border border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Live Preview</CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        {/* EXACT COPY of ProductCard structure */}
        <div className="group relative bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200">
          {/* Product Image */}
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            {/* Left side badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
              {formData.newArrival && (
                <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                  NEW
                </span>
              )}
            </div>

            {/* Top right elements */}
            <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
              {/* Discount badge */}
              {discountPercentage > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                  -{discountPercentage}%
                </span>
              )}

              {/* Heart icon */}
              <button
                onClick={handleWishlistToggle}
                className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl border border-white/30 transition-all duration-300 hover:scale-110 hover:bg-white/95 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 cursor-pointer"
                title={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                {isWishlisted ? (
                  <HeartIconSolid className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <HeartIcon className="h-3.5 w-3.5 text-gray-600 hover:text-red-500" />
                )}
              </button>
            </div>

            {/* Product Image or Placeholder */}
            {getDisplayImage() ? (
              <img
                src={getDisplayImage()!}
                alt={formData.name || "Product preview"}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 bg-white rounded-xl shadow-sm mx-auto mb-2 flex items-center justify-center border border-gray-200">
                    <span className="text-lg font-bold text-gray-400">
                      {formData.name
                        ? formData.name.substring(0, 2).toUpperCase()
                        : "PR"}
                    </span>
                  </div>
                  <p className="text-xs font-medium">Product</p>
                </div>
              </div>
            )}

            {/* Quick Add to Cart */}
            <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm">
              <button
                className="w-full bg-black/90 backdrop-blur-md text-white py-2.5 px-3 rounded-lg text-xs font-semibold hover:bg-black/95 transition-all duration-300 flex items-center justify-center border border-white/20 cursor-pointer"
                disabled
              >
                <ShoppingBagIcon className="h-3.5 w-3.5 mr-1.5" />
                Quick Add
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4">
            <div className="space-y-1.5">
              {/* Brand & Name */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {getBrandName() && (
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                      {getBrandName()}
                    </p>
                  )}
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors leading-tight">
                    {formData.name || "Untitled Product"}
                  </h3>
                </div>
                {/* Featured badge next to product name */}
                {formData.featured && (
                  <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0">
                    Featured
                  </span>
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className="h-2.5 w-2.5 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-[10px] text-gray-500 ml-0.5">(0)</span>
              </div>

              {/* Variant count */}
              {variantCount > 0 && (
                <p className="text-[10px] text-gray-500 font-medium">
                  {variantCount} variant{variantCount !== 1 ? "s" : ""}
                </p>
              )}

              {/* Stock status */}
              {isLowStock() && (
                <p className="text-[10px] text-amber-600 font-medium">
                  Only {totalStock} left in stock
                </p>
              )}

              {totalStock === 0 && variantCount > 0 && (
                <p className="text-[10px] text-red-600 font-medium">
                  Out of stock
                </p>
              )}

              {/* Pricing */}
              <div className="flex items-center space-x-1.5 pt-0.5">
                <span className="text-lg font-bold text-gray-900">
                  {price > 0 ? `€${price.toFixed(2)}` : "€0.00"}
                </span>
                {comparePrice > price && (
                  <span className="text-xs line-through text-gray-500">
                    €{comparePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* From label for multiple variants */}
              {variantCount > 1 && (
                <p className="text-[10px] font-medium text-gray-400">From</p>
              )}
            </div>
          </div>
        </div>

        {/* Simple Stats Below */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center">
              <p className="text-gray-500">Images</p>
              <p className="font-semibold">
                {formData.imagePreviews.length +
                  formData.variants.reduce(
                    (total, v) => total + v.imagePreviews.length,
                    0
                  )}
              </p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Variants</p>
              <p className="font-semibold">{variantCount}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-500">Status</p>
              <Badge
                variant={formData.isActive ? "default" : "secondary"}
                className="text-xs"
              >
                {formData.isActive ? "Active" : "Draft"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
