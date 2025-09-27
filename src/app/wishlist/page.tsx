"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  HeartIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  ShareIcon,
  FunnelIcon,
  ChevronUpDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import ProductCard from "@/components/ui/ProductCard";

// Dropdown Component
function SimpleDropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className = "",
}: {
  options: { label: string; value: string }[] | string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const optionsArray =
    typeof options[0] === "string"
      ? (options as string[]).map((opt) => ({ label: opt, value: opt }))
      : (options as { label: string; value: string }[]);

  const selectedOption = optionsArray.find((opt) => opt.value === value);

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-left shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm cursor-pointer"
      >
        <span className="block truncate">
          {selectedOption?.label || placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-lg py-1 max-h-60 overflow-auto">
            {optionsArray.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="relative w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150 flex items-center justify-between cursor-pointer"
              >
                <span className="block truncate">{option.label}</span>
                {value === option.value && (
                  <CheckIcon className="h-4 w-4 text-gray-900" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Loading Skeleton Component
function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        >
          <div className="aspect-square bg-gray-200 animate-pulse"></div>
          <div className="p-4 space-y-3">
            <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WishlistPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const {
    items: wishlistItems,
    loading,
    error,
    removeFromWishlist,
  } = useWishlist();
  const [cartLoading, setCartLoading] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, session, router]);

  // Don't render content for vendors
  if (session?.user?.role === "VENDOR") {
    return null;
  }

  // Get unique categories from actual data
  const categories = [
    "all",
    ...Array.from(new Set(wishlistItems.map((item) => item.category))),
  ];

  const categoryOptions = categories.map((category) => ({
    label: category === "all" ? "All Categories" : category,
    value: category,
  }));

  const sortOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Price: Low to High", value: "price-low" },
    { label: "Price: High to Low", value: "price-high" },
    { label: "Name A-Z", value: "name" },
  ];

  // Filter and sort items
  const filteredItems = wishlistItems
    .filter(
      (item) => selectedCategory === "all" || item.category === selectedCategory
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
          );
        case "oldest":
          return (
            new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime()
          );
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

  const moveAllToCart = async () => {
    if (!session?.user) {
      window.location.href = "/signin";
      return;
    }

    const inStockItems = wishlistItems.filter((item) => item.inStock);

    if (inStockItems.length === 0) {
      alert("No items in stock to add to cart");
      return;
    }

    setCartLoading("all");

    try {
      // Add all in-stock items to cart with proper variant handling
      const addToCartPromises = inStockItems.map((item) => {
        // Type-safe access to potentially undefined properties
        const hasVariant = "productVariantId" in item && item.productVariantId;

        if (hasVariant) {
          // Use variant cart API if variant exists
          return fetch("/api/cart/variant", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productVariantId: item.productVariantId,
              quantity: 1,
            }),
          });
        } else {
          // Fallback to regular cart API
          return fetch("/api/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: item.productId,
              quantity: 1,
            }),
          });
        }
      });

      const cartResponses = await Promise.all(addToCartPromises);
      const cartSuccessful = cartResponses.every((response) => response.ok);

      if (cartSuccessful) {
        // Remove all successfully added items from wishlist with proper variant handling
        const removeFromWishlistPromises = inStockItems.map((item) => {
          const hasVariant =
            "productVariantId" in item && item.productVariantId;

          return fetch("/api/wishlist", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId: item.productId,
              productVariantId: hasVariant ? item.productVariantId : null,
            }),
          });
        });

        await Promise.all(removeFromWishlistPromises);

        console.log("All items moved to cart and removed from wishlist");
        // Trigger both cart and wishlist updates
        window.dispatchEvent(new CustomEvent("cartUpdated"));
        window.dispatchEvent(new CustomEvent("wishlistUpdated"));
      } else {
        alert("Some items could not be added to cart");
      }
    } catch (error) {
      console.error("Error moving items to cart:", error);
      alert("Failed to move items to cart. Please try again.");
    } finally {
      setCartLoading(null);
    }
  };

  // Show loading state while session is being checked or wishlist is loading
  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-3 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <WishlistSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  // Show sign-in prompt only when session is confirmed to be unavailable
  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Sign in to view your wishlist
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Create an account or sign in to save items you love for later.
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Sign In
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <WishlistSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-10 h-10 text-red-500" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Error loading wishlist
            </h1>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show empty state
  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeartIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h1>
            <p className="text-sm text-gray-500 mb-6">
              Save items you love for later by clicking the heart icon.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Start Shopping
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-4 text-sm cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Continue Shopping
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-500 mt-1 text-xs">
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1 ? "item" : "items"} saved
              </p>
            </div>

            <div className="flex items-center gap-3">
              {wishlistItems.some((item) => item.inStock) && (
                <button
                  onClick={moveAllToCart}
                  disabled={cartLoading === "all"}
                  className="inline-flex items-center px-3 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {cartLoading === "all" ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <ShoppingBagIcon className="w-4 h-4 mr-2" />
                  )}
                  Add All to Cart
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        {wishlistItems.length > 1 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Category:
                </span>
                <SimpleDropdown
                  options={categoryOptions}
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  className="w-52"
                />
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Sort by:
                </span>
                <SimpleDropdown
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-48"
                />
              </div>
            </div>
          </div>
        )}

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex"
              >
                <ProductCard
                  product={{
                    id: item.productId,
                    name: item.name,
                    brand: item.brand,
                    price: item.price,
                    originalPrice: item.originalPrice,
                    image: item.image,
                    category: item.category,
                    rating: item.rating,
                    reviewCount: item.reviewCount,
                    slug: item.slug,
                    isNew: false,
                    isFeatured: false,
                    // Safe variant handling - only pass if properties exist
                    selectedVariantId:
                      "productVariantId" in item
                        ? item.productVariantId
                        : undefined,
                    variantDetails:
                      "variant" in item ? item.variant : undefined,
                  }}
                  variant="default"
                  showQuickActions={true}
                  showAddToCart={item.inStock}
                  isOnWishlistPage={true}
                  className="h-full w-full flex flex-col"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State for Filtered Results */}
        {filteredItems.length === 0 && wishlistItems.length > 0 && (
          <div className="text-center py-12">
            <FunnelIcon className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-900 mb-2">
              No items match your filters
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Try adjusting your category or sort preferences.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSortBy("newest");
              }}
              className="text-sm text-black font-medium hover:text-gray-700 transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
