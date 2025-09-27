/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";
import {
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ShoppingBagIcon,
  ArrowLeftIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Updated interface to match your cart API response
interface CartItem {
  id: string;
  type: "product" | "variant";
  productId: string;
  variantId: string | null;
  name: string;
  variantName: string | null;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  stock: number;
  slug: string;
  category: string;
  dateAdded: string;
}

interface CartData {
  items: CartItem[];
  count: number;
  subtotal: number;
}

// Loading Skeleton Component
function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        {[...Array(3)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {/* Product Image Skeleton */}
                  <Skeleton className="w-16 h-16 rounded-lg flex-shrink-0" />

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    {/* Header row with title and action buttons */}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-3/4 mb-1" />
                        <Skeleton className="h-3 w-1/2 mb-1" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Skeleton className="w-6 h-6 rounded" />
                        <Skeleton className="w-6 h-6 rounded" />
                      </div>
                    </div>

                    {/* Bottom row with stock, quantity, and price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Stock status */}
                        <Skeleton className="h-3 w-20" />
                        {/* Quantity controls */}
                        <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                          <Skeleton className="w-6 h-6 rounded-l-lg" />
                          <Skeleton className="w-8 h-6" />
                          <Skeleton className="w-6 h-6 rounded-r-lg" />
                        </div>
                      </div>
                      {/* Price */}
                      <div className="text-right">
                        <Skeleton className="h-4 w-16 mb-1" />
                        <Skeleton className="h-3 w-12" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Order Summary Skeleton */}
      <div className="lg:col-span-1">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Price breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-18" />
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-10" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>

                {/* Checkout button */}
                <Skeleton className="h-10 w-full rounded-lg" />

                {/* Trust indicators */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3 h-3" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3 h-3" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3 h-3" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Loading skeleton for quantity controls
function QuantityControlSkeleton() {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg bg-white">
      <div className="p-1.5 rounded-l-lg">
        <Skeleton className="w-3 h-3" />
      </div>
      <div className="px-2.5 py-1.5 min-w-[2rem] text-center">
        <Skeleton className="w-4 h-4 mx-auto" />
      </div>
      <div className="p-1.5 rounded-r-lg">
        <Skeleton className="w-3 h-3" />
      </div>
    </div>
  );
}

export default function CartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);
  const [processingWishlist, setProcessingWishlist] = useState<Set<string>>(
    new Set()
  );

  // Use the correct wishlist checking for cart items with your current hook
  const isCartItemInWishlist = useCallback(
    (item: CartItem) => {
      if (item.type === "variant" && item.variantId) {
        // For variant items, check the SPECIFIC variant
        return isInWishlist(item.productId, item.variantId);
      } else {
        // For regular products, check with NO variant ID to avoid variant confusion
        return isInWishlist(item.productId, undefined);
      }
    },
    [isInWishlist]
  );

  // Fetch cart data
  const fetchCart = async () => {
    if (!session?.user) {
      setCartData({ items: [], count: 0, subtotal: 0 });
      setLoading(false);
      return;
    }

    try {
      setLoading(true); // Ensure loading is true when fetching
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setCartData(data);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch cart");
      }
    } catch (err) {
      setError("Failed to fetch cart");
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load cart on component mount and session change
  useEffect(() => {
    if (session) {
      fetchCart();
    } else if (status === "unauthenticated") {
      // Only set to not loading when we're definitely unauthenticated
      setCartData({ items: [], count: 0, subtotal: 0 });
      setLoading(false);
    }
    // Keep loading true if session is still loading
  }, [session, status]);

  // Listen for cart update events from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };

    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => {
      window.removeEventListener("cartUpdated", handleCartUpdate);
    };
  }, []);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, session, router]);

  // Show loading state - this should show skeleton until we have definitive data
  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4 py-4"
        >
          <div className="mb-4">
            <Skeleton className="h-6 w-48 mb-3" />
            <Skeleton className="h-5 w-32 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          <CartSkeleton />
        </motion.div>
        <Footer />
      </div>
    );
  }

  // Don't render content for vendors
  if (session?.user?.role === "VENDOR") {
    return null;
  }

  const updateQuantity = async (item: CartItem, newQuantity: number) => {
    // Validation
    if (newQuantity < 1) {
      setError("Quantity must be at least 1");
      return;
    }

    if (newQuantity > item.stock) {
      setError(`Only ${item.stock} items available in stock`);
      return;
    }

    const itemKey = item.variantId || item.productId;
    setUpdatingItems((prev) => new Set(prev).add(itemKey));
    setError(null);

    try {
      let response;

      if (item.type === "variant" && item.variantId) {
        // Update variant cart item
        response = await fetch("/api/cart/variant", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productVariantId: item.variantId,
            quantity: newQuantity,
          }),
        });
      } else {
        // Update regular product cart item
        response = await fetch("/api/cart", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: item.productId,
            quantity: newQuantity,
          }),
        });
      }

      if (response.ok) {
        await fetchCart(); // Refresh cart data
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      setError("Failed to update quantity. Please try again.");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleWishlistToggle = async (item: CartItem) => {
    if (!session?.user) {
      router.push("/signin");
      return;
    }

    const itemKey = item.variantId || item.productId;
    setProcessingWishlist((prev) => new Set(prev).add(itemKey));

    try {
      if (item.type === "variant" && item.variantId) {
        // Handle variant wishlist toggle
        await toggleWishlist(item.productId, item.variantId);
      } else {
        // Handle regular product wishlist toggle
        await toggleWishlist(item.productId);
      }

      // Trigger global wishlist update event
      window.dispatchEvent(new CustomEvent("wishlistUpdated"));
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update wishlist. Please try again."
      );
    } finally {
      setProcessingWishlist((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const removeItem = async (item: CartItem) => {
    const itemKey = item.variantId || item.productId;
    setUpdatingItems((prev) => new Set(prev).add(itemKey));
    setError(null);

    try {
      let response;

      if (item.type === "variant" && item.variantId) {
        // Remove variant from cart
        response = await fetch("/api/cart/variant", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productVariantId: item.variantId }),
        });
      } else {
        // Remove regular product from cart
        response = await fetch("/api/cart", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: item.productId }),
        });
      }

      if (response.ok) {
        await fetchCart(); // Refresh cart data
      } else {
        const data = await response.json();
        setError(data.error || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      setError("Failed to remove item. Please try again.");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(itemKey);
        return newSet;
      });
    }
  };

  const handleCheckout = () => {
    if (!session?.user) {
      window.location.href = "/signin";
      return;
    }

    const outOfStockItems =
      cartData?.items.filter((item) => item.stock <= 0) || [];

    if (outOfStockItems.length > 0) {
      setShowOutOfStockModal(true);
    } else {
      window.location.href = "/checkout";
    }
  };

  const handleRemoveOutOfStockItems = async () => {
    const outOfStockItems =
      cartData?.items.filter((item) => item.stock <= 0) || [];

    setError(null);

    try {
      // Remove all out of stock items with proper variant handling
      const promises = outOfStockItems.map((item) => {
        if (item.type === "variant" && item.variantId) {
          return fetch("/api/cart/variant", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ productVariantId: item.variantId }),
          });
        } else {
          return fetch("/api/cart", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ productId: item.productId }),
          });
        }
      });

      await Promise.all(promises);
      await fetchCart(); // Refresh cart
      setShowOutOfStockModal(false);

      // Proceed to checkout after a brief delay
      setTimeout(() => {
        window.location.href = "/checkout";
      }, 300);
    } catch (error) {
      console.error("Error removing out of stock items:", error);
      setError("Failed to remove out of stock items. Please try again.");
    }
  };

  // Show sign-in prompt for non-authenticated users
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                </div>
                <h1 className="text-base font-semibold text-gray-900 mb-1">
                  Sign in to view your cart
                </h1>
                <p className="text-sm text-gray-600 mb-4">
                  Create an account or sign in to save items in your cart.
                </p>
                <Link
                  href="/signin"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Sign In
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                </div>
                <h1 className="text-base font-semibold text-gray-900 mb-1">
                  Error loading cart
                </h1>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <div className="space-y-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <button
                      onClick={() => {
                        setError(null);
                        fetchCart();
                      }}
                      className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                    >
                      Try Again
                    </button>
                  </motion.div>
                  <div>
                    <Link
                      href="/products"
                      className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show empty cart only when we're authenticated, not loading, and definitely have no items
  if (session?.user && !loading && cartData && cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBagIcon className="w-6 h-6 text-gray-400" />
                </div>
                <h1 className="text-base font-semibold text-gray-900 mb-1">
                  Your cart is empty
                </h1>
                <p className="text-sm text-gray-600 mb-4">
                  Discover our latest tech and add items to your cart.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  Continue Shopping
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate totals - only if cartData exists and has items
  const inStockItems = cartData?.items.filter((item) => item.stock > 0) || [];
  const subtotal = inStockItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const savings = inStockItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.19; // 19% VAT for Germany
  const total = subtotal + shipping + tax;

  const outOfStockItems =
    cartData?.items.filter((item) => item.stock <= 0) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-4 space-y-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Link
                  href="/products"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors mb-2 cursor-pointer"
                >
                  <motion.div
                    whileHover={{ x: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <ArrowLeftIcon className="w-4 h-4 mr-1" />
                  </motion.div>
                  Continue Shopping
                </Link>
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-lg font-bold text-gray-900"
                >
                  Shopping Cart
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-sm text-gray-600 mt-1"
                >
                  {cartData?.items.length || 0}{" "}
                  {(cartData?.items.length || 0) === 1 ? "item" : "items"}
                </motion.p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <ExclamationTriangleIcon className="w-4 h-4 text-red-600 mr-2" />
                      <p className="text-sm text-red-700 font-medium">
                        {error}
                      </p>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cart Items */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <AnimatePresence>
                {cartData?.items.map((item, index) => {
                  const itemKey = item.variantId || item.productId;
                  const isUpdating = updatingItems.has(itemKey);
                  const isWishlistProcessing = processingWishlist.has(itemKey);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20, height: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="border-0 shadow-sm">
                        <CardContent className="p-4">
                          <div className="flex gap-3">
                            {/* Product Image */}
                            <Link
                              href={`/products/${item.slug}${item.variantId ? `?variant=${item.variantId}` : ""}`}
                              className="flex-shrink-0"
                            >
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden"
                              >
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-400">
                                      {item.name.substring(0, 2).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                              </motion.div>
                            </Link>

                            {/* Product Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <Link
                                    href={`/products/${item.slug}${item.variantId ? `?variant=${item.variantId}` : ""}`}
                                  >
                                    <h3 className="font-medium text-gray-900 text-sm leading-tight hover:text-gray-700 transition-colors cursor-pointer">
                                      {item.variantName
                                        ? `${item.name} - ${item.variantName}`
                                        : item.name}
                                    </h3>
                                  </Link>
                                  {item.brand && (
                                    <p className="text-gray-600 text-xs">
                                      {item.brand}
                                    </p>
                                  )}
                                  <p className="text-gray-500 text-xs mt-0.5">
                                    {item.category}
                                  </p>
                                </div>

                                <div className="flex items-center gap-1">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleWishlistToggle(item)}
                                    disabled={isWishlistProcessing}
                                    className="p-1 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                    title={
                                      isCartItemInWishlist(item)
                                        ? "Remove from wishlist"
                                        : "Add to wishlist"
                                    }
                                  >
                                    {isWishlistProcessing ? (
                                      <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <motion.div
                                        initial={{ scale: 1 }}
                                        animate={{
                                          scale: isCartItemInWishlist(item)
                                            ? 1.1
                                            : 1,
                                        }}
                                        transition={{ duration: 0.15 }}
                                      >
                                        {isCartItemInWishlist(item) ? (
                                          <HeartIconSolid className="w-3.5 h-3.5 text-red-500" />
                                        ) : (
                                          <HeartIcon className="w-3.5 h-3.5 text-gray-400 hover:text-red-500" />
                                        )}
                                      </motion.div>
                                    )}
                                  </motion.button>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => removeItem(item)}
                                    disabled={isUpdating}
                                    className="p-1 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500 disabled:opacity-50 cursor-pointer"
                                  >
                                    {isUpdating ? (
                                      <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      <TrashIcon className="w-3.5 h-3.5" />
                                    )}
                                  </motion.button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {/* Stock Status */}
                                  {item.stock > 0 ? (
                                    <span className="text-emerald-600 text-xs font-medium">
                                      In Stock ({item.stock} left)
                                    </span>
                                  ) : (
                                    <span className="text-red-600 text-xs font-medium">
                                      Out of Stock
                                    </span>
                                  )}

                                  {/* Quantity Controls */}
                                  {isUpdating ? (
                                    <QuantityControlSkeleton />
                                  ) : (
                                    <div className="flex items-center border border-gray-300 rounded-lg bg-white">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                          updateQuantity(
                                            item,
                                            item.quantity - 1
                                          )
                                        }
                                        disabled={
                                          item.quantity <= 1 || isUpdating
                                        }
                                        className="p-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg cursor-pointer"
                                      >
                                        <MinusIcon className="w-3 h-3" />
                                      </motion.button>
                                      <div className="px-2.5 py-1.5 text-xs font-medium min-w-[2rem] text-center">
                                        {item.quantity}
                                      </div>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() =>
                                          updateQuantity(
                                            item,
                                            item.quantity + 1
                                          )
                                        }
                                        disabled={
                                          item.stock <= item.quantity ||
                                          isUpdating
                                        }
                                        className="p-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg cursor-pointer"
                                      >
                                        <PlusIcon className="w-3 h-3" />
                                      </motion.button>
                                    </div>
                                  )}
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                  <motion.div
                                    key={`price-${item.id}-${item.quantity}`}
                                    initial={{ scale: 1.1, opacity: 0.7 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="text-sm font-semibold text-gray-900"
                                  >
                                    {formatPrice(item.price * item.quantity)}
                                  </motion.div>
                                  {item.originalPrice && (
                                    <div className="text-xs text-gray-500 line-through">
                                      {formatPrice(
                                        item.originalPrice * item.quantity
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <Card className="border-0 shadow-sm sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(subtotal)}
                    </span>
                  </div>

                  {savings > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600">
                      <span>You save</span>
                      <span className="font-medium">
                        -{formatPrice(savings)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">
                      {shipping === 0 ? (
                        <span className="text-emerald-600">Free</span>
                      ) : (
                        <span className="text-gray-900">
                          {formatPrice(shipping)}
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Tax (VAT 19%)</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(tax)}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-2 mt-3">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900 text-sm">
                        Total
                      </span>
                      <span className="text-base font-bold text-gray-900">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Free Shipping Progress */}
                {shipping > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-900">
                        {formatPrice(50 - subtotal)} away from free shipping
                      </span>
                      <TruckIcon className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-1">
                      <motion.div
                        className="bg-blue-600 h-1 rounded-full"
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min((subtotal / 50) * 100, 100)}%`,
                        }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Checkout Button */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={handleCheckout}
                    disabled={inStockItems.length === 0}
                    className="w-full bg-gray-900 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors mb-3 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {inStockItems.length === 0
                      ? "No items available"
                      : "Proceed to Checkout"}
                  </button>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="space-y-2 text-xs text-gray-500"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="w-3 h-3 text-emerald-500" />
                    <span>Secure SSL checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TruckIcon className="w-3 h-3 text-blue-500" />
                    <span>Free shipping over €50</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-3 h-3 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>30-day returns</span>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Out of Stock Modal */}
        <AnimatePresence>
          {showOutOfStockModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowOutOfStockModal(false)}
              />
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
              >
                <Card className="border-0 shadow-none">
                  <CardContent className="p-0">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ExclamationTriangleIcon className="w-6 h-6 text-gray-600" />
                      </div>

                      <h3 className="text-base font-semibold text-gray-900 mb-2">
                        Items Unavailable
                      </h3>

                      <p className="text-sm text-gray-600 mb-4">
                        Some items in your cart are out of stock. Remove them to
                        continue with checkout.
                      </p>

                      <div className="text-left mb-6">
                        <p className="text-xs font-medium text-gray-700 mb-2">
                          Items to remove:
                        </p>
                        {outOfStockItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 py-1"
                          >
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                            <span className="text-xs text-gray-600">
                              {item.variantName
                                ? `${item.name} - ${item.variantName}`
                                : item.name}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <button
                            onClick={() => setShowOutOfStockModal(false)}
                            className="flex-1 px-4 py-2.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <button
                            onClick={handleRemoveOutOfStockItems}
                            className="flex-1 px-4 py-2.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                          >
                            Remove & Checkout
                          </button>
                        </motion.div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <Footer />
    </div>
  );
}
