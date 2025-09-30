/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { HeartIcon, ShoppingBagIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";

// Updated Product interface with variant support
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
  slug: string;
  description?: string;
  stock?: number;
  isActive?: boolean;

  // New fields for variant support
  selectedVariantId?: string; // The variant ID to pre-select
  variantDetails?: {
    id: string;
    name: string;
    color?: string;
    storage?: string;
    ram?: string;
    size?: string;
    length?: string;
    material?: string;
  };
  colorOptions?: Array<{
    color?: string;
    colorHex?: string;
    image?: string;
    variantId: string;
  }>;
  discountPercentage?: number;
  priceRange?: string;
}

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact" | "featured";
  showQuickActions?: boolean;
  showAddToCart?: boolean;
  isOnWishlistPage?: boolean;
  className?: string;
  showPriceRange?: boolean;
}

export default function ProductCard({
  product,
  variant = "default",
  showQuickActions = true,
  showAddToCart = true,
  isOnWishlistPage = false,
  className = "",
  showPriceRange = false,
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

  // Check if this is a multi-variant product without a selected variant
  const isMultiVariantProduct = useMemo(() => {
    return (
      ((typeof product.variants === "number" && product.variants > 1) ||
        (product.colorOptions && product.colorOptions.length > 1)) &&
      !product.selectedVariantId
    );
  }, [product.variants, product.colorOptions, product.selectedVariantId]);

  // Disable wishlist for multi-variant products without selected variant
  const canAddToWishlist = !isMultiVariantProduct;

  // Price to display
  const displayPrice = useMemo(() => {
    if (product.price && product.price > 0) {
      return product.price;
    }
    return null;
  }, [product.price]);

  // Use discountPercentage from API if available, otherwise calculate
  const discountPercentage =
    product.discountPercentage ||
    (product.originalPrice && displayPrice
      ? Math.round(
          ((product.originalPrice - displayPrice) / product.originalPrice) * 100
        )
      : 0);

  // Generate product URL with variant parameter if needed
  const productUrl = useMemo(() => {
    let url = `/products/${product.slug || product.id}`;

    // Add variant parameter if this product was selected from wishlist with a specific variant
    if (product.selectedVariantId) {
      url += `?variant=${product.selectedVariantId}`;
    }

    return url;
  }, [product.slug, product.id, product.selectedVariantId]);

  // Check if product is in wishlist on component mount
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!session?.user || !canAddToWishlist) {
        setCheckingWishlist(false);
        return;
      }

      try {
        const response = await fetch("/api/wishlist");
        if (response.ok) {
          const data = await response.json();

          // Check for wishlist item - handle both variant-specific and product-only items
          const isInWishlist = data.items.some((item: any) => {
            if (product.selectedVariantId) {
              // If we have a specific variant, check for that exact variant
              return (
                item.productId === product.id &&
                item.productVariantId === product.selectedVariantId
              );
            } else {
              // Otherwise, check if product is in wishlist (any variant or no variant)
              return item.productId === product.id;
            }
          });

          setIsWishlisted(isInWishlist);
        }
      } catch (error) {
        console.error("Error checking wishlist status:", error);
      } finally {
        setCheckingWishlist(false);
      }
    };

    checkWishlistStatus();
  }, [session, product.id, product.selectedVariantId, canAddToWishlist]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent adding out of stock items or multi-variant products
    if (isOutOfStock || isMultiVariantProduct) {
      return;
    }

    if (!session?.user) {
      window.location.href = "/signin";
      return;
    }

    setIsLoading(true);

    try {
      // Determine which API endpoint to use based on whether we have variant info
      const apiEndpoint = product.selectedVariantId
        ? "/api/cart/variant"
        : "/api/cart";
      const requestBody = product.selectedVariantId
        ? { productVariantId: product.selectedVariantId, quantity: 1 }
        : { productId: product.id, quantity: 1 };

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
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
                productVariantId: product.selectedVariantId || null,
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

    if (!canAddToWishlist) {
      return;
    }

    try {
      const method = isWishlisted ? "DELETE" : "POST";
      const requestBody: any = {
        productId: product.id,
      };

      // Include variant ID if we have one
      if (product.selectedVariantId) {
        requestBody.productVariantId = product.selectedVariantId;
      }

      const response = await fetch("/api/wishlist", {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
        console.log("Wishlist updated:", data.message);
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      } else {
        console.error("Wishlist error:", data.error);
      }
    } catch (error) {
      console.error("Error updating wishlist:", error);
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
          <div className="absolute top-2 lg:top-3 left-2 lg:left-3 z-10 flex flex-col gap-1">
            {isOutOfStock && (
              <span className="bg-red-600 text-white text-[8px] lg:text-[10px] px-1.5 lg:px-2 py-0.5 rounded-full font-medium">
                OUT OF STOCK
              </span>
            )}
            {product.isNew && !isOutOfStock && (
              <span className="bg-black text-white text-[8px] lg:text-[10px] px-1.5 lg:px-2 py-0.5 rounded-full font-medium">
                NEW
              </span>
            )}
          </div>

          {/* Top right elements */}
          <div className="absolute top-2 lg:top-3 right-2 lg:right-3 z-10 flex flex-col items-end gap-1">
            {/* Discount badge */}
            {discountPercentage > 0 && !isOutOfStock && displayPrice && (
              <span className="bg-red-500 text-white text-[8px] lg:text-[10px] px-1.5 lg:px-2 py-0.5 rounded-full font-medium">
                -{discountPercentage}%
              </span>
            )}

            {/* Heart icon - only show if can add to wishlist */}
            {showQuickActions && session?.user && canAddToWishlist && (
              <button
                onClick={handleWishlistToggle}
                disabled={checkingWishlist}
                className="p-1.5 lg:p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:shadow-xl border border-white/30 transition-all duration-300 hover:scale-110 hover:bg-white/95 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 cursor-pointer disabled:opacity-50"
                title={
                  isWishlisted
                    ? "Remove from wishlist"
                    : isOutOfStock
                      ? "Add to wishlist - notify when available"
                      : "Add to wishlist"
                }
              >
                {checkingWishlist ? (
                  <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : isWishlisted ? (
                  <HeartIconSolid className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-red-500" />
                ) : (
                  <HeartIcon className="h-3 w-3 lg:h-3.5 lg:w-3.5 text-gray-600 hover:text-red-500" />
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

          {/* Color variants display */}
          {product.colorOptions &&
            product.colorOptions.length > 0 &&
            !isOutOfStock && (
              <div className="absolute bottom-2 lg:bottom-3 left-2 lg:left-3 flex gap-0.5 lg:gap-1">
                {product.colorOptions.slice(0, 4).map((colorOption, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 lg:w-4 lg:h-4 rounded-full border-2 border-white shadow-sm"
                    style={{
                      backgroundColor: colorOption.colorHex || "#6B7280",
                    }}
                    title={colorOption.color}
                  />
                ))}
                {product.colorOptions.length > 4 && (
                  <span className="text-[8px] lg:text-xs text-white bg-black/50 px-1 rounded">
                    +{product.colorOptions.length - 4}
                  </span>
                )}
              </div>
            )}

          {/* Quick Add to Cart - only show if in stock and not multi-variant without selection */}
          {showAddToCart &&
            session?.user &&
            !isOutOfStock &&
            !isMultiVariantProduct && (
              <div className="absolute inset-x-0 bottom-0 p-2 lg:p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm">
                <button
                  onClick={handleAddToCart}
                  disabled={isLoading}
                  className="w-full bg-black/90 backdrop-blur-md text-white py-2 lg:py-2.5 px-2 lg:px-3 rounded-lg text-[10px] lg:text-xs font-semibold hover:bg-black/95 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border border-white/20 cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-3 h-3 lg:w-3.5 lg:h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <ShoppingBagIcon className="h-3 w-3 lg:h-3.5 lg:w-3.5 mr-1 lg:mr-1.5" />
                      <span className="hidden sm:inline">Quick Add</span>
                      <span className="sm:hidden">Add</span>
                    </>
                  )}
                </button>
              </div>
            )}

          {/* For multi-variant products, show "More Options" button */}
          {showAddToCart &&
            session?.user &&
            !isOutOfStock &&
            isMultiVariantProduct && (
              <div className="absolute inset-x-0 bottom-0 p-2 lg:p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm">
                <div className="w-full bg-black backdrop-blur-md text-white py-2 lg:py-2.5 px-2 lg:px-3 rounded-lg text-[10px] lg:text-xs font-semibold hover:bg-slate-900 transition-all duration-300 flex items-center justify-center border border-white/20 cursor-pointer">
                  <span className="hidden sm:inline">More Options</span>
                  <span className="sm:hidden">Options</span>
                </div>
              </div>
            )}

          {/* Login prompt for non-authenticated users - only if in stock */}
          {showAddToCart && !session?.user && !isOutOfStock && (
            <div className="absolute inset-x-0 bottom-0 p-2 lg:p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm">
              <button
                onClick={() => (window.location.href = "/signin")}
                className="w-full bg-black/90 backdrop-blur-md text-white py-2 lg:py-2.5 px-2 lg:px-3 rounded-lg text-[10px] lg:text-xs font-semibold hover:bg-black/95 transition-all duration-300 flex items-center justify-center border border-white/20 cursor-pointer"
              >
                <span className="hidden sm:inline">Sign in to buy</span>
                <span className="sm:hidden">Sign in</span>
              </button>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className={variant === "compact" ? "p-2 lg:p-3" : "p-3 lg:p-4"}>
          <div className="space-y-1 lg:space-y-1.5">
            {/* Brand & Name */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {product.brand && (
                  <p className="text-[8px] lg:text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-0.5">
                    {product.brand}
                  </p>
                )}
                <h3
                  className={`${variant === "compact" ? "text-[10px] lg:text-xs" : "text-xs lg:text-sm"} font-semibold text-gray-900 line-clamp-2 group-hover:text-gray-700 transition-colors leading-tight ${
                    isOutOfStock ? "text-gray-500" : ""
                  }`}
                >
                  {product.name}
                </h3>

                {/* Variant count badge - show below product name */}
                {isMultiVariantProduct && (
                  <p className="text-[8px] lg:text-[10px] text-gray-600 font-medium mt-0.5">
                    {typeof product.variants === "number"
                      ? `${product.variants} Variants`
                      : "Multiple Variants"}
                  </p>
                )}

                {/* Show variant details as subtitle if available */}
                {product.variantDetails && (
                  <p className="text-[8px] lg:text-[10px] text-gray-500 mt-0.5">
                    {[
                      product.variantDetails.color,
                      product.variantDetails.storage,
                      product.variantDetails.ram,
                      product.variantDetails.size,
                      product.variantDetails.length,
                      product.variantDetails.material,
                    ]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                )}
              </div>
              {/* Featured badge next to product name */}
              {product.isFeatured && !isOutOfStock && (
                <span className="bg-blue-100 text-blue-700 text-[8px] lg:text-[10px] px-1.5 lg:px-2 py-0.5 rounded-full font-medium ml-1 lg:ml-2 flex-shrink-0">
                  Featured
                </span>
              )}
            </div>

            {/* Rating */}
            {product.rating && product.rating > 0 && (
              <div className="flex items-center space-x-0.5 lg:space-x-1">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`h-2 w-2 lg:h-2.5 lg:w-2.5 ${i < Math.floor(product.rating!) ? "text-yellow-400" : "text-gray-300"}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                {product.reviewCount && (
                  <span className="text-[8px] lg:text-[10px] text-gray-500 ml-0.5">
                    ({product.reviewCount})
                  </span>
                )}
              </div>
            )}

            {/* Stock status for low stock */}
            {!isOutOfStock &&
              product.stock !== undefined &&
              product.stock <= 5 &&
              product.stock > 0 && (
                <p className="text-[8px] lg:text-[10px] text-amber-600 font-medium">
                  Only {product.stock} left in stock
                </p>
              )}

            {/* Pricing */}
            <div className="flex items-center space-x-1 lg:space-x-1.5 pt-0.5">
              {displayPrice && displayPrice > 0 ? (
                <>
                  <span
                    className={`${variant === "compact" ? "text-xs lg:text-sm" : "text-sm lg:text-base"} font-bold ${
                      isOutOfStock ? "text-gray-500" : "text-gray-900"
                    }`}
                  >
                    {isMultiVariantProduct && "From "}
                    {formatPrice(displayPrice)}
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > displayPrice && (
                      <span
                        className={`text-[8px] lg:text-[10px] line-through ${
                          isOutOfStock ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                </>
              ) : (
                <span className="text-[10px] lg:text-sm font-medium text-slate-800">
                  Multiple options available
                </span>
              )}
            </div>

            {/* Conditional price range display */}
            {showPriceRange && (
              <p
                className={`text-[8px] lg:text-[10px] font-medium ${
                  isOutOfStock ? "text-gray-300" : "text-gray-400"
                }`}
              >
                {isOutOfStock
                  ? "Currently unavailable"
                  : product.priceRange || "From"}
              </p>
            )}

            {/* Description for featured variant */}
            {variant === "featured" && product.description && (
              <p
                className={`text-[10px] lg:text-xs line-clamp-2 mt-1 lg:mt-2 leading-relaxed ${
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
