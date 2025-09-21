/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
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
  stock?: number; // Added stock field
  isActive?: boolean; // Added active status
}

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  showQuickActions?: boolean;
  showAddToCart?: boolean;
  isOnWishlistPage?: boolean;
  className?: string;
}

export default function ProductCard({
  product,
  variant = "default",
  showQuickActions = true,
  showAddToCart = true,
  isOnWishlistPage = false,
  className = "",
}: ProductCardProps) {
  const { data: session } = useSession();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [checkingWishlist, setCheckingWishlist] = useState(true);

  // Check if product is out of stock or inactive
  const isOutOfStock =
    (product.stock !== undefined && product.stock <= 0) ||
    product.isActive === false;

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const productUrl = `/products/${product.slug || product.id}`;

  // Check if product is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!session?.user) {
        setCheckingWishlist(false);
        return;
      }

      try {
        const response = await fetch("/api/wishlist");
        if (response.ok) {
          const data = await response.json();
          const isInWishlist = data.items.some(
            (item: any) => item.productId === product.id
          );
          setIsWishlisted(isInWishlist);
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      } finally {
        setCheckingWishlist(false);
      }
    };

    checkWishlistStatus();
  }, [session, product.id]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent adding out of stock items
    if (isOutOfStock) {
      return;
    }

    if (!session?.user) {
      window.location.href = "/signin";
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Added to cart:", data.message);
        window.dispatchEvent(new CustomEvent("cartUpdated"));

        if (isOnWishlistPage) {
          try {
            const wishlistResponse = await fetch("/api/wishlist", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId: product.id,
              }),
            });

            if (wishlistResponse.ok) {
              console.log("Removed from wishlist after adding to cart");
              window.dispatchEvent(new CustomEvent("wishlistUpdated"));
            }
          } catch (wishlistError) {
            console.error("Failed to remove from wishlist:", wishlistError);
          }
        }
      } else {
        // Better error handling for out of stock
        if (data.error && data.error.includes("stock")) {
          alert("Sorry, this item is currently out of stock.");
        } else {
          alert(data.error || "Failed to add to cart");
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      window.location.href = "/signin";
      return;
    }

    try {
      const method = isWishlisted ? "DELETE" : "POST";
      const response = await fetch("/api/wishlist", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
        console.log("Wishlist updated:", data.message);
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      } else {
        alert(data.error || "Failed to update wishlist");
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const cardClasses = {
    default: `group relative bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-gray-200 ${
      isOutOfStock ? "opacity-60 grayscale cursor-not-allowed" : ""
    }`,
    compact: `group relative bg-white/90 backdrop-blur-sm rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-gray-200 ${
      isOutOfStock ? "opacity-60 grayscale cursor-not-allowed" : ""
    }`,
    featured: `group relative bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-gray-300 ${
      isOutOfStock ? "opacity-60 grayscale cursor-not-allowed" : ""
    }`,
  };

  const imageClasses = {
    default: "relative aspect-square bg-gray-50 overflow-hidden",
    compact: "relative aspect-square bg-gray-50 overflow-hidden",
    featured: "relative aspect-[4/3] bg-gray-50 overflow-hidden",
  };

  return (
    <div className={`${cardClasses[variant]} ${className}`}>
      <Link
        href={productUrl}
        className={`block ${isOutOfStock ? "pointer-events-none" : ""}`}
      >
        {/* Product Image */}
        <div className={imageClasses[variant]}>
          {/* Left side badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
            {isOutOfStock && (
              <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                OUT OF STOCK
              </span>
            )}
            {product.isNew && !isOutOfStock && (
              <span className="bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                NEW
              </span>
            )}
          </div>

          {/* Top right elements */}
          <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
            {/* Discount badge */}
            {discountPercentage > 0 && !isOutOfStock && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                -{discountPercentage}%
              </span>
            )}

            {/* Heart icon */}
            {showQuickActions && session?.user && (
              <button
                onClick={handleWishlistToggle}
                disabled={checkingWishlist}
                className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl border border-white/30 transition-all duration-300 hover:scale-110 hover:bg-white/95 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 cursor-pointer disabled:opacity-50"
                title={
                  isWishlisted
                    ? "Remove from wishlist"
                    : isOutOfStock
                      ? "Add to wishlist - notify when available"
                      : "Add to wishlist"
                }
              >
                {checkingWishlist ? (
                  <div className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : isWishlisted ? (
                  <HeartIconSolid className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <HeartIcon className="h-3.5 w-3.5 text-gray-600 hover:text-red-500" />
                )}
              </button>
            )}
          </div>

          {/* Product Image or Placeholder */}
          {product.image && !imageError ? (
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                isOutOfStock ? "" : "group-hover:scale-105"
              }`}
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div
                  className={`${variant === "compact" ? "w-12 h-12" : "w-16 h-16"} bg-white rounded-xl shadow-sm mx-auto mb-2 flex items-center justify-center border border-gray-200`}
                >
                  <span
                    className={`${variant === "compact" ? "text-sm" : "text-lg"} font-bold text-gray-400`}
                  >
                    {product.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <p className="text-xs font-medium">
                  {product.category || "Product"}
                </p>
              </div>
            </div>
          )}

          {/* Quick Add to Cart - only show if in stock */}
          {showAddToCart && session?.user && !isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm">
              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="w-full bg-black/90 backdrop-blur-md text-white py-2.5 px-3 rounded-lg text-xs font-semibold hover:bg-black/95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-white/20 cursor-pointer"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <ShoppingBagIcon className="h-3.5 w-3.5 mr-1.5" />
                    Quick Add
                  </>
                )}
              </button>
            </div>
          )}

          {/* Login prompt for non-authenticated users - only if in stock */}
          {showAddToCart && !session?.user && !isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm">
              <button
                onClick={() => (window.location.href = "/signin")}
                className="w-full bg-black/90 backdrop-blur-md text-white py-2.5 px-3 rounded-lg text-xs font-semibold hover:bg-black/95 transition-all duration-300 flex items-center justify-center border border-white/20 cursor-pointer"
              >
                Sign in to buy
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={variant === "compact" ? "p-3" : "p-4"}>
          <div className="space-y-1.5">
            {/* Brand & Name */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {product.brand && (
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    {product.brand}
                  </p>
                )}
                <h3
                  className={`${variant === "compact" ? "text-xs" : "text-sm"} font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors leading-tight ${
                    isOutOfStock ? "text-gray-500" : ""
                  }`}
                >
                  {product.name}
                </h3>
              </div>
              {/* Featured badge next to product name */}
              {product.isFeatured && !isOutOfStock && (
                <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-medium ml-2 flex-shrink-0">
                  Featured
                </span>
              )}
            </div>

            {/* Rating */}
            {product.rating && (
              <div className="flex items-center space-x-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-2.5 w-2.5 ${i < Math.floor(product.rating!) ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {product.reviewCount && (
                  <span className="text-[10px] text-gray-500 ml-0.5">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}

            {/* Variants */}
            {product.variants && (
              <p className="text-[10px] text-gray-500 font-medium">
                {typeof product.variants === "number"
                  ? `${product.variants} variants`
                  : product.variants}
              </p>
            )}

            {/* Stock status for low stock */}
            {!isOutOfStock &&
              product.stock !== undefined &&
              product.stock <= 5 &&
              product.stock > 0 && (
                <p className="text-[10px] text-amber-600 font-medium">
                  Only {product.stock} left in stock
                </p>
              )}

            {/* Pricing */}
            <div className="flex items-center space-x-1.5 pt-0.5">
              <span
                className={`${variant === "compact" ? "text-base" : "text-lg"} font-bold ${
                  isOutOfStock ? "text-gray-500" : "text-gray-900"
                }`}
              >
                {formatPrice(product.price)}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span
                    className={`text-xs line-through ${
                      isOutOfStock ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
            </div>

            {/* From label */}
            <p
              className={`text-[10px] font-medium ${
                isOutOfStock ? "text-gray-300" : "text-gray-400"
              }`}
            >
              {isOutOfStock ? "Currently unavailable" : "From"}
            </p>

            {/* Description for featured variant */}
            {variant === "featured" && product.description && (
              <p
                className={`text-xs line-clamp-2 mt-2 leading-relaxed ${
                  isOutOfStock ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {product.description}
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
