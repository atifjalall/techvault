"use client";

import { useState, useEffect } from "react";
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
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon,
  HeartIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import { useWishlist } from "@/hooks/useWishlist";

interface CartItem {
  id: string;
  productId: string;
  name: string;
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-4">
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl p-4"
          >
            <div className="flex gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="lg:col-span-1">
        <div className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl p-4">
          <div className="space-y-3">
            <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
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

  // Fetch cart data
  const fetchCart = async () => {
    if (!session?.user) {
      setCartData({ items: [], count: 0, subtotal: 0 });
      setLoading(false);
      return;
    }

    try {
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
    fetchCart();
  }, [session]);

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

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don't render content for vendors
  if (session?.user?.role === "VENDOR") {
    return null;
  }

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity: newQuantity,
        }),
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart data
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update quantity");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert("Failed to update quantity");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const handleWishlistToggle = async (productId: string) => {
    try {
      await toggleWishlist(productId);
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      alert("Failed to update wishlist");
    }
  };

  const removeItem = async (productId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        await fetchCart(); // Refresh cart data
      } else {
        const data = await response.json();
        alert(data.error || "Failed to remove item");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert("Failed to remove item");
    } finally {
      setUpdatingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
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

    try {
      // Remove all out of stock items
      const promises = outOfStockItems.map((item) =>
        fetch("/api/cart", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId: item.productId }),
        })
      );

      await Promise.all(promises);
      await fetchCart(); // Refresh cart
      setShowOutOfStockModal(false);

      // Proceed to checkout after a brief delay
      setTimeout(() => {
        window.location.href = "/checkout";
      }, 300);
    } catch (error) {
      console.error("Error removing out of stock items:", error);
      alert("Failed to remove out of stock items");
    }
  };

  // Show sign-in prompt for non-authenticated users
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-12 h-12 backdrop-blur-xl bg-white/70 border border-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-6 h-6 text-slate-400" />
            </div>
            <h1 className="text-base font-semibold text-slate-900 mb-1">
              Sign in to view your cart
            </h1>
            <p className="text-sm text-slate-500 mb-4">
              Create an account or sign in to save items in your cart.
            </p>
            <Link
              href="/signin"
              className="inline-flex items-center px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded w-48 mb-3 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-32 mb-1 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <CartSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-12 h-12 backdrop-blur-xl bg-red-50/70 border border-red-200/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
            </div>
            <h1 className="text-base font-semibold text-slate-900 mb-1">
              Error loading cart
            </h1>
            <p className="text-sm text-slate-500 mb-4">{error}</p>
            <button
              onClick={fetchCart}
              className="inline-flex items-center px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Show empty cart
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-12 h-12 backdrop-blur-xl bg-white/70 border border-white/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBagIcon className="w-6 h-6 text-slate-400" />
            </div>
            <h1 className="text-base font-semibold text-slate-900 mb-1">
              Your cart is empty
            </h1>
            <p className="text-sm text-slate-500 mb-4">
              Discover our latest tech and add items to your cart.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  // Calculate totals
  const inStockItems = cartData.items.filter((item) => item.stock > 0);
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

  const outOfStockItems = cartData.items.filter((item) => item.stock <= 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors mb-3 text-sm group cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
            Continue Shopping
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {cartData.items.length}{" "}
            {cartData.items.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <AnimatePresence>
                {cartData.items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98, x: -50, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    whileHover={{ scale: 1.005 }}
                    className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-shadow duration-200"
                  >
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <Link
                        href={`/products/${item.slug}`}
                        className="flex-shrink-0"
                      >
                        <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                              <span className="text-xs font-bold text-slate-400">
                                {item.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link href={`/products/${item.slug}`}>
                              <h3 className="font-medium text-slate-900 text-sm leading-tight hover:text-slate-700 transition-colors">
                                {item.name}
                              </h3>
                            </Link>
                            {item.brand && (
                              <p className="text-slate-600 text-xs">
                                {item.brand}
                              </p>
                            )}
                            <p className="text-slate-500 text-xs mt-0.5">
                              {item.category}
                            </p>
                          </div>

                          <div className="flex items-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() =>
                                handleWishlistToggle(item.productId)
                              }
                              className="p-1 hover:bg-white/50 rounded-lg transition-colors cursor-pointer"
                              title={
                                isInWishlist(item.productId)
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                            >
                              <motion.div
                                initial={{ scale: 1 }}
                                animate={{
                                  scale: isInWishlist(item.productId) ? 1.1 : 1,
                                }}
                                transition={{ duration: 0.15 }}
                              >
                                {isInWishlist(item.productId) ? (
                                  <HeartIconSolid className="w-3.5 h-3.5 text-red-500" />
                                ) : (
                                  <HeartIcon className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                                )}
                              </motion.div>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.productId)}
                              disabled={updatingItems.has(item.productId)}
                              className="p-1 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500 disabled:opacity-50 cursor-pointer"
                            >
                              {updatingItems.has(item.productId) ? (
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
                            <div className="flex items-center border border-slate-200/70 rounded-lg bg-white/50 backdrop-blur-sm">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                disabled={
                                  item.quantity <= 1 ||
                                  updatingItems.has(item.productId)
                                }
                                className="p-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg cursor-pointer"
                              >
                                <MinusIcon className="w-3 h-3" />
                              </motion.button>
                              <div className="px-2.5 py-1.5 text-xs font-medium min-w-[2rem] text-center bg-white/20">
                                {updatingItems.has(item.productId) ? (
                                  <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto" />
                                ) : (
                                  item.quantity
                                )}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                disabled={
                                  item.stock <= item.quantity ||
                                  updatingItems.has(item.productId)
                                }
                                className="p-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg cursor-pointer"
                              >
                                <PlusIcon className="w-3 h-3" />
                              </motion.button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <motion.div
                              key={`price-${item.id}-${item.quantity}`}
                              initial={{ scale: 1.1, opacity: 0.7 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.2 }}
                              className="text-sm font-semibold text-slate-900"
                            >
                              {formatPrice(item.price * item.quantity)}
                            </motion.div>
                            {item.originalPrice && (
                              <div className="text-xs text-slate-500 line-through">
                                {formatPrice(
                                  item.originalPrice * item.quantity
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="backdrop-blur-xl bg-white/70 border border-white/50 rounded-2xl p-4 sticky top-24 shadow-xl"
            >
              <h2 className="text-sm font-semibold text-slate-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="font-medium text-slate-900">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span>You save</span>
                    <span className="font-medium">-{formatPrice(savings)}</span>
                  </div>
                )}

                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-emerald-600">Free</span>
                    ) : (
                      <span className="text-slate-900">
                        {formatPrice(shipping)}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Tax (VAT 19%)</span>
                  <span className="font-medium text-slate-900">
                    {formatPrice(tax)}
                  </span>
                </div>

                <div className="border-t border-slate-200/50 pt-2 mt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-900 text-sm">
                      Total
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {shipping > 0 && (
                <div className="mb-4 p-2.5 backdrop-blur-md bg-blue-50/80 border border-blue-200/50 rounded-lg">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-blue-900">
                      {formatPrice(50 - subtotal)} away from free shipping
                    </span>
                    <TruckIcon className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="w-full bg-blue-200/50 rounded-full h-1">
                    <div
                      className="bg-blue-600 h-1 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min((subtotal / 50) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={inStockItems.length === 0}
                className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors mb-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {inStockItems.length === 0
                  ? "No items available"
                  : "Proceed to Checkout"}
              </button>

              {/* Trust Indicators */}
              <div className="space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-2.5 h-2.5 text-emerald-500" />
                  <span>Secure SSL checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <TruckIcon className="w-2.5 h-2.5 text-blue-500" />
                  <span>Free shipping over €50</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-2.5 h-2.5 text-purple-500"
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
              </div>
            </motion.div>
          </div>
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
                <div className="text-center">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ExclamationTriangleIcon className="w-6 h-6 text-slate-600" />
                  </div>

                  <h3 className="text-base font-semibold text-slate-900 mb-2">
                    Items Unavailable
                  </h3>

                  <p className="text-sm text-slate-600 mb-4">
                    Some items in your cart are out of stock. Remove them to
                    continue with checkout.
                  </p>

                  <div className="text-left mb-6">
                    <p className="text-xs font-medium text-slate-700 mb-2">
                      Items to remove:
                    </p>
                    {outOfStockItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 py-1"
                      >
                        <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                        <span className="text-xs text-slate-600">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowOutOfStockModal(false)}
                      className="flex-1 px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRemoveOutOfStockItems}
                      className="flex-1 px-4 py-2.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      Remove & Checkout
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
}
