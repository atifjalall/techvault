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

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const savings = cartItems.reduce((sum, item) => {
    if (item.originalPrice) {
      return sum + (item.originalPrice - item.price) * item.quantity;
    }
    return sum;
  }, 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.19; // 19% VAT for Germany
  const total = subtotal + shipping + tax;

  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setIsLoading(id);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    setIsLoading(null);
  };

  const toggleWishlist = async (id: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id ? { ...item, isWishlisted: !item.isWishlisted } : item
      )
    );
  };

  const removeItem = async (id: number) => {
    setIsLoading(id);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    setCartItems((items) => items.filter((item) => item.id !== id));
    setIsLoading(null);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBagIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Your cart is empty
            </h1>
            <p className="text-gray-500 mb-8">
              Discover our latest tech and add items to your cart.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
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
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-4 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Continue Shopping
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-500 mt-1">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-gray-200 rounded-xl p-6"
                  >
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-24 h-24 bg-gray-50 rounded-lg overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                          <div className="w-12 h-12 bg-gray-300 rounded"></div>
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {item.name}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              {item.brand}
                            </p>
                            {item.variant && (
                              <p className="text-gray-400 text-sm mt-1">
                                {item.variant}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleWishlist(item.id)}
                              className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
                              title={
                                item.isWishlisted
                                  ? "Remove from wishlist"
                                  : "Add to wishlist"
                              }
                            >
                              {item.isWishlisted ? (
                                <HeartIconSolid className="w-5 h-5 text-red-500" />
                              ) : (
                                <HeartIcon className="w-5 h-5 text-gray-400 hover:text-red-500" />
                              )}
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              disabled={isLoading === item.id}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-gray-400 hover:text-red-500"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Stock Status */}
                            {item.inStock ? (
                              <span className="text-green-600 text-sm font-medium">
                                In Stock
                              </span>
                            ) : (
                              <span className="text-red-600 text-sm font-medium">
                                Out of Stock
                              </span>
                            )}

                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gray-200 rounded-lg">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                disabled={
                                  isLoading === item.id || item.quantity <= 1
                                }
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <MinusIcon className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                                {isLoading === item.id ? (
                                  <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto"></div>
                                ) : (
                                  item.quantity
                                )}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                disabled={
                                  isLoading === item.id || !item.inStock
                                }
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              >
                                <PlusIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                            {item.originalPrice && (
                              <div className="text-sm text-gray-500 line-through">
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
          <div className="lg:col-span-4">
            <div className="bg-gray-50 rounded-xl p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>

                {savings > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>You save</span>
                    <span className="font-medium">-{formatPrice(savings)}</span>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (VAT 19%)</span>
                  <span className="font-medium">{formatPrice(tax)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-4">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {shipping > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      {formatPrice(50 - subtotal)} away from free shipping
                    </span>
                    <TruckIcon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min((subtotal / 50) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button className="w-full bg-black text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors mb-4">
                Proceed to Checkout
              </button>

              {/* Trust Indicators */}
              <div className="space-y-2 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon className="w-4 h-4 text-green-500" />
                  <span>Secure SSL checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <TruckIcon className="w-4 h-4 text-blue-500" />
                  <span>Free shipping over €50</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-purple-500"
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
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
