"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
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
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";

// Mock cart items (replace with actual cart state management)
const mockCartItems = [
  {
    id: 1,
    name: "Wireless Gaming Headset Pro",
    brand: "AudioTech",
    price: 189.99,
    originalPrice: 249.99,
    image: "/api/placeholder/300/300",
    quantity: 2,
    variant: "Black",
    inStock: true,
    isWishlisted: true,
  },
  {
    id: 2,
    name: 'UltraSlim Laptop 15"',
    brand: "TechFlow",
    price: 1299.99,
    originalPrice: 1499.99,
    image: "/api/placeholder/300/300",
    quantity: 1,
    variant: "Space Gray, 512GB",
    inStock: true,
    isWishlisted: false,
  },
  {
    id: 3,
    name: "Smart Fitness Watch",
    brand: "HealthTech",
    price: 299.99,
    originalPrice: 399.99,
    image: "/api/placeholder/300/300",
    quantity: 1,
    variant: "Blue",
    inStock: false,
    isWishlisted: false,
  },
];

interface CartItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  variant?: string;
  inStock: boolean;
  isWishlisted?: boolean;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [showOutOfStockModal, setShowOutOfStockModal] = useState(false);

  // Calculate totals (only for in-stock items)
  const inStockItems = cartItems.filter((item) => item.inStock);
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

  const outOfStockItems = cartItems.filter((item) => !item.inStock);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const toggleWishlist = (id: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isWishlisted: !item.isWishlisted } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const handleCheckout = () => {
    if (outOfStockItems.length > 0) {
      setShowOutOfStockModal(true);
    } else {
      // Proceed to checkout
      window.location.href = "/checkout";
    }
  };

  const handleRemoveOutOfStockItems = () => {
    setCartItems((items) => items.filter((item) => item.inStock));
    setShowOutOfStockModal(false);
    // Proceed to checkout after removing items
    setTimeout(() => {
      window.location.href = "/checkout";
    }, 300);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <Navbar />

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
              href="/"
              className="inline-flex items-center px-4 py-2.5 bg-slate-900 text-white text-xs font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Continue Shopping
            </Link>
          </motion.div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors mb-3 text-sm group"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
            Continue Shopping
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">
            Shopping Cart
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
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
                      <div className="flex-shrink-0 w-16 h-16 bg-slate-100 rounded-lg overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                          <div className="w-8 h-8 bg-slate-300 rounded"></div>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-slate-900 text-sm leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-slate-600 text-xs">
                              {item.brand}
                            </p>
                            {item.variant && (
                              <p className="text-slate-500 text-xs mt-0.5">
                                {item.variant}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleWishlist(item.id)}
                              className="p-1 hover:bg-white/50 rounded-lg transition-colors"
                              title={
                                item.isWishlisted
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                            >
                              <motion.div
                                initial={{ scale: 1 }}
                                animate={{ scale: item.isWishlisted ? 1.1 : 1 }}
                                transition={{ duration: 0.15 }}
                              >
                                {item.isWishlisted ? (
                                  <HeartIconSolid className="w-3.5 h-3.5 text-red-500" />
                                ) : (
                                  <HeartIcon className="w-3.5 h-3.5 text-slate-400 hover:text-red-500" />
                                )}
                              </motion.div>
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeItem(item.id)}
                              disabled={isLoading === item.id}
                              className="p-1 hover:bg-red-50 rounded-lg transition-colors text-slate-400 hover:text-red-500"
                            >
                              <TrashIcon className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {/* Stock Status */}
                            {item.inStock ? (
                              <span className="text-emerald-600 text-xs font-medium">
                                In Stock
                              </span>
                            ) : (
                              <span className="text-slate-600 text-xs font-medium">
                                Out of Stock
                              </span>
                            )}

                            {/* Quantity Controls */}
                            <div className="flex items-center border border-slate-200/70 rounded-lg bg-white/50 backdrop-blur-sm">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={item.quantity <= 1}
                                className="p-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-l-lg"
                              >
                                <MinusIcon className="w-3 h-3" />
                              </motion.button>
                              <div className="px-2.5 py-1.5 text-xs font-medium min-w-[2rem] text-center bg-white/20">
                                {item.quantity}
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={!item.inStock}
                                className="p-1.5 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
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
                className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors mb-3 shadow-lg hover:shadow-xl cursor-pointer"
              >
                Proceed to Checkout
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
                      className="flex-1 px-4 py-2.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRemoveOutOfStockItems}
                      className="flex-1 px-4 py-2.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
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
