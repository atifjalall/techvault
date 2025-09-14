"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HeartIcon,
  ShoppingBagIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";

export interface Product {
  id: string | number;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  variants?: string | number;
  isNew?: boolean;
  isFeatured?: boolean;
  category?: string;
  rating?: number;
  reviewCount?: number;
  slug?: string;
  description?: string;
}

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  showQuickActions?: boolean;
  showAddToCart?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  variant = "default",
  showQuickActions = true,
  showAddToCart = true,
  className = "",
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const productUrl = `/products/${product.slug || product.id}`;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsLoading(false);
    // Add actual cart logic here
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    // Add actual wishlist logic here
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Add quick view modal logic here
  };

  const cardClasses = {
    default:
      "group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200",
    compact:
      "group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 hover:border-gray-200",
    featured:
      "group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200",
  };

  const imageClasses = {
    default: "relative aspect-square bg-gray-50 overflow-hidden",
    compact: "relative aspect-square bg-gray-50 overflow-hidden",
    featured: "relative aspect-[4/3] bg-gray-50 overflow-hidden",
  };

  return (
    <div className={`${cardClasses[variant]} ${className}`}>
      <Link href={productUrl} className="block">
        {/* Product Image */}
        <div className={imageClasses[variant]}>
          {/* Top Badges Row */}
          <div className="absolute top-3 left-3 right-3 z-10 flex justify-between items-start">
            {/* Left side badges */}
            <div className="flex flex-col gap-1">
              {product.isNew && (
                <span className="bg-black text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  NEW
                </span>
              )}
              {product.isFeatured && (
                <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  FEATURED
                </span>
              )}
            </div>

            {/* Right side - Discount badge */}
            {discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{discountPercentage}%
              </span>
            )}
          </div>

          {/* Quick Actions - Positioned on right side */}
          {showQuickActions && (
            <div className="absolute top-12 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 z-20">
              <button
                onClick={handleWishlistToggle}
                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl border border-gray-100 transition-all duration-200 hover:scale-110"
                title={
                  isWishlisted ? "Remove from wishlist" : "Add to wishlist"
                }
              >
                {isWishlisted ? (
                  <HeartIconSolid className="h-4 w-4 text-red-500" />
                ) : (
                  <HeartIcon className="h-4 w-4 text-gray-600 hover:text-red-500" />
                )}
              </button>
              <button
                onClick={handleQuickView}
                className="p-2.5 bg-white/95 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl border border-gray-100 transition-all duration-200 hover:scale-110"
                title="Quick view"
              >
                <EyeIcon className="h-4 w-4 text-gray-600 hover:text-blue-500" />
              </button>
            </div>
          )}

          {/* Product Image Placeholder */}
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
            <div className="text-center text-gray-400">
              <div
                className={`${variant === "compact" ? "w-16 h-16" : "w-24 h-24"} bg-white rounded-xl shadow-sm mx-auto mb-3 flex items-center justify-center`}
              >
                <div
                  className={`${variant === "compact" ? "w-8 h-8" : "w-12 h-12"} bg-gray-300 rounded-lg`}
                ></div>
              </div>
              <p className="text-xs font-medium">
                {product.category || "Product"}
              </p>
            </div>
          </div>

          {/* Quick Add to Cart - slides up from bottom */}
          {showAddToCart && (
            <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/50 to-transparent">
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full bg-black/90 backdrop-blur-sm text-white py-3 px-4 rounded-lg text-sm font-semibold hover:bg-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-white/20"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShoppingBagIcon className="h-4 w-4 mr-2" />
                    Quick Add
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={variant === "compact" ? "p-4" : "p-5"}>
          <div className="space-y-2">
            {/* Brand & Name */}
            <div>
              {product.brand && (
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  {product.brand}
                </p>
              )}
              <h3
                className={`${variant === "compact" ? "text-sm" : "text-base"} font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors leading-snug`}
              >
                {product.name}
              </h3>
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-3.5 w-3.5 ${i < Math.floor(product.rating!) ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {product.reviewCount && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}

            {/* Variants */}
            {product.variants && (
              <p className="text-xs text-gray-500 font-medium">
                {typeof product.variants === "number"
                  ? `${product.variants} variants`
                  : product.variants}
              </p>
            )}

            {/* Pricing */}
            <div className="flex items-center space-x-2 pt-1">
              <span
                className={`${variant === "compact" ? "text-lg" : "text-xl"} font-bold text-gray-900`}
              >
                {formatPrice(product.price)}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-sm text-gray-500 line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
            </div>

            {/* From label */}
            <p className="text-xs text-gray-400 font-medium">From</p>

            {/* Description for featured variant */}
            {variant === "featured" && product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-3 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
