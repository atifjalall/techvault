"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartIcon,
  ShoppingBagIcon,
  TrashIcon,
  ArrowLeftIcon,
  ShareIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";

// Mock wishlist items (replace with actual state management)
const mockWishlistItems = [
  {
    id: 1,
    name: "Wireless Gaming Headset Pro",
    brand: "AudioTech",
    price: 189.99,
    originalPrice: 249.99,
    image: "/api/placeholder/300/300",
    category: "Audio",
    inStock: true,
    rating: 4.5,
    reviewCount: 128,
    dateAdded: "2024-01-15",
  },
  {
    id: 2,
    name: 'UltraSlim Laptop 15"',
    brand: "TechFlow",
    price: 1299.99,
    originalPrice: 1499.99,
    image: "/api/placeholder/300/300",
    category: "Computing",
    inStock: true,
    rating: 4.8,
    reviewCount: 89,
    dateAdded: "2024-01-10",
  },
  {
    id: 3,
    name: "Smart Fitness Watch",
    brand: "HealthTech",
    price: 299.99,
    originalPrice: 399.99,
    image: "/api/placeholder/300/300",
    category: "Wearables",
    inStock: false,
    rating: 4.3,
    reviewCount: 56,
    dateAdded: "2024-01-08",
  },
  {
    id: 4,
    name: "Mechanical Gaming Keyboard",
    brand: "GameForce",
    price: 159.99,
    originalPrice: 199.99,
    image: "/api/placeholder/300/300",
    category: "Gaming",
    inStock: true,
    rating: 4.6,
    reviewCount: 234,
    dateAdded: "2024-01-05",
  },
  {
    id: 5,
    name: "Portable Bluetooth Speaker",
    brand: "SoundWave",
    price: 89.99,
    originalPrice: 119.99,
    image: "/api/placeholder/300/300",
    category: "Audio",
    inStock: true,
    rating: 4.2,
    reviewCount: 167,
    dateAdded: "2024-01-03",
  },
];

interface WishlistItem {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
  reviewCount: number;
  dateAdded: string;
}

export default function WishlistPage() {
  const [wishlistItems, setWishlistItems] =
    useState<WishlistItem[]>(mockWishlistItems);
  const [isLoading, setIsLoading] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");

  // Get unique categories
  const categories = [
    "all",
    ...Array.from(new Set(wishlistItems.map((item) => item.category))),
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

  const removeFromWishlist = async (id: number) => {
    setIsLoading(id);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 300));

    setWishlistItems((items) => items.filter((item) => item.id !== id));
    setIsLoading(null);
  };

  const addToCart = async (id: number) => {
    setIsLoading(id);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setIsLoading(null);
    // Add actual cart logic here
  };

  const moveAllToCart = async () => {
    const inStockItems = wishlistItems.filter((item) => item.inStock);
    // Add logic to move all in-stock items to cart
    console.log("Moving to cart:", inStockItems);
  };

  if (wishlistItems.length === 0) {
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
              <HeartIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">
              Your wishlist is empty
            </h1>
            <p className="text-gray-500 mb-8">
              Save items you love for later by clicking the heart icon.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
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
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-gray-500 hover:text-gray-700 transition-colors mb-4 text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Continue Shopping
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
              <p className="text-gray-500 mt-1">
                {wishlistItems.length}{" "}
                {wishlistItems.length === 1 ? "item" : "items"} saved
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <ShareIcon className="w-4 h-4 mr-2" />
                Share List
              </button>

              {wishlistItems.some((item) => item.inStock) && (
                <button
                  onClick={moveAllToCart}
                  className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  <ShoppingBagIcon className="w-4 h-4 mr-2" />
                  Add All to Cart
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                Category:
              </span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Sort by:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
              >
                {/* Product Image */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  {/* Stock Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    {item.inStock ? (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        In Stock
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {/* Remove from Wishlist */}
                  <div className="absolute top-3 right-3 z-10">
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      disabled={isLoading === item.id}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                      title="Remove from wishlist"
                    >
                      <HeartIconSolid className="w-4 h-4 text-red-500" />
                    </button>
                  </div>

                  {/* Product Image Placeholder */}
                  <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="w-16 h-16 bg-white rounded-xl shadow-sm mx-auto mb-2 flex items-center justify-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-lg"></div>
                      </div>
                      <p className="text-xs font-medium">{item.category}</p>
                    </div>
                  </div>

                  {/* Quick Add Overlay */}
                  {item.inStock && (
                    <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/50 to-transparent">
                      <button
                        onClick={() => addToCart(item.id)}
                        disabled={isLoading === item.id}
                        className="w-full bg-black/90 backdrop-blur-sm text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-black transition-colors flex items-center justify-center"
                      >
                        {isLoading === item.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <ShoppingBagIcon className="w-4 h-4 mr-2" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="mb-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                      {item.brand}
                    </p>
                    <h3 className="font-semibold text-gray-900 line-clamp-2 leading-snug">
                      {item.name}
                    </h3>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-3.5 w-3.5 ${i < Math.floor(item.rating) ? "text-yellow-400" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      ({item.reviewCount})
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">
                      {formatPrice(item.price)}
                    </span>
                    {item.originalPrice && item.originalPrice > item.price && (
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(item.originalPrice)}
                      </span>
                    )}
                  </div>

                  {/* Date Added */}
                  <p className="text-xs text-gray-400 mt-2">
                    Added {new Date(item.dateAdded).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State for Filtered Results */}
        {filteredItems.length === 0 && wishlistItems.length > 0 && (
          <div className="text-center py-12">
            <FunnelIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No items match your filters
            </h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your category or sort preferences.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSortBy("newest");
              }}
              className="text-black font-medium hover:text-gray-700 transition-colors"
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
