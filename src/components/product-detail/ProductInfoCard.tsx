"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  MinusIcon,
  PlusIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from "@heroicons/react/24/solid";
import { formatPrice } from "@/lib/utils";
import VariantSelector from "./VariantSelector";
import { Product, ProductVariant, Brand, Vendor } from "@/types/product";

interface ProductInfoCardProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  onVariantSelect: (variant: ProductVariant) => void;
  isWishlisted: boolean;
  onWishlistToggle: () => void;
  quantity: number;
  onQuantityChange: (action: "increase" | "decrease") => void;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

export default function ProductInfoCard({
  product,
  selectedVariant,
  onVariantSelect,
  isWishlisted,
  onWishlistToggle,
  quantity,
  onQuantityChange,
  onAddToCart,
  isAddingToCart,
}: ProductInfoCardProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleWishlistClick = () => {
    if (!session?.user) {
      router.push("/signin");
      return;
    }
    onWishlistToggle();
  };

  const handleAddToCartClick = () => {
    if (!session?.user) {
      router.push("/signin");
      return;
    }
    onAddToCart();
  };

  return (
    <div className="space-y-2 lg:space-y-4">
      {/* Brand, Name, and Rating */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {product.brand && (
          <p className="text-[10px] lg:text-xs font-medium text-slate-500 uppercase tracking-wide">
            {product.brand.name}
          </p>
        )}
        <h1 className="text-lg lg:text-2xl font-semibold text-slate-900 mt-1 leading-tight">
          {product.name}
        </h1>
        {product.modelNumber && (
          <p className="text-[10px] lg:text-xs text-slate-500 mt-1">
            Model: {product.modelNumber}
          </p>
        )}

        {/* Rating */}
        <div className="flex items-center space-x-1 lg:space-x-2 mt-1 lg:mt-2">
          <div className="flex items-center space-x-0.5 lg:space-x-1">
            {[...Array(5)].map((_, i) => (
              <StarIconSolid
                key={i}
                className={`w-3 h-3 lg:w-4 lg:h-4 ${
                  i < Math.floor(product.avgRating || 0)
                    ? "text-yellow-400"
                    : "text-slate-300"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] lg:text-sm text-slate-600">
            {product.reviewCount > 0
              ? `${product.avgRating.toFixed(1)} (${product.reviewCount} reviews)`
              : "No reviews yet"}
          </span>
        </div>

        {/* Vendor Info */}
        <div className="mt-2 lg:mt-3">
          <span className="text-[10px] lg:text-sm text-slate-600">
            Sold by:{" "}
          </span>
          {product.vendor.storeSlug ? (
            <a
              href={`/store/${product.vendor.storeSlug}`}
              className="text-sm font-medium text-slate-900 hover:text-slate-700 transition-colors cursor-pointer"
            >
              {product.vendor.storeName || product.vendor.name}
            </a>
          ) : (
            <span className="text-sm font-medium text-slate-900">
              {product.vendor.storeName || product.vendor.name}
            </span>
          )}
        </div>
      </motion.div>

      {/* Pricing */}
      <motion.div
        className="space-y-1"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <div className="flex items-center space-x-1 lg:space-x-2">
          <span className="text-lg lg:text-2xl font-bold text-slate-900">
            {selectedVariant
              ? formatPrice(selectedVariant.price)
              : product.maxPrice && product.maxPrice !== product.basePrice
                ? product.priceRange
                : formatPrice(product.basePrice)}
          </span>
          {selectedVariant?.comparePrice && (
            <span className="text-sm lg:text-lg text-slate-500 line-through">
              {formatPrice(selectedVariant.comparePrice)}
            </span>
          )}
          {selectedVariant && selectedVariant.discountPercentage > 0 && (
            <span className="text-[10px] lg:text-xs font-medium text-green-600 bg-green-50 px-1.5 lg:px-2 py-0.5 lg:py-1 rounded-full">
              Save {selectedVariant.discountPercentage}%
            </span>
          )}
        </div>
        <p className="text-[10px] lg:text-xs text-slate-600">
          Tax included.{" "}
          {product.deliveryDays && `Delivery in ${product.deliveryDays} days.`}
        </p>
      </motion.div>

      {/* Stock Status - Only show when out of stock */}
      {selectedVariant && !selectedVariant.inStock && (
        <motion.div
          className="bg-red-50 border border-red-200 rounded-lg p-2 lg:p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <p className="text-[10px] lg:text-sm font-medium text-red-600">
            Out of stock
          </p>
        </motion.div>
      )}

      {/* Variant Selection */}
      <motion.div
        className="space-y-2 lg:space-y-4 pt-1 lg:pt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <VariantSelector
          variants={product.variants}
          selectedVariant={selectedVariant}
          onVariantSelect={onVariantSelect}
          productImages={product.images}
          productName={product.name}
        />
      </motion.div>

      {/* Description */}
      {product.description && (
        <motion.div
          className="text-[10px] lg:text-sm text-slate-600 leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.45 }}
        >
          <p>{product.description}</p>
        </motion.div>
      )}

      {/* Quantity and Add to Cart - Only show when variant is selected */}
      {selectedVariant?.inStock && (
        <motion.div
          className="space-y-2 lg:space-y-3 pt-1 lg:pt-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.55 }}
        >
          <div className="flex items-center space-x-2 lg:space-x-3">
            <label className="text-[10px] lg:text-sm font-medium text-slate-700">
              Qty:
            </label>
            <div className="flex items-center border border-slate-300 rounded-lg">
              <motion.button
                onClick={() => onQuantityChange("decrease")}
                disabled={quantity <= 1}
                className="p-1.5 lg:p-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-l-lg cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <MinusIcon className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
              </motion.button>
              <span className="px-2 lg:px-3 py-1.5 lg:py-2 text-[10px] lg:text-sm font-medium text-slate-900 min-w-[2rem] lg:min-w-[3rem] text-center">
                {quantity}
              </span>
              <motion.button
                onClick={() => onQuantityChange("increase")}
                disabled={quantity >= (selectedVariant?.stock || 0)}
                className="p-1.5 lg:p-2 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed rounded-r-lg cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <PlusIcon className="w-2.5 h-2.5 lg:w-3 lg:h-3" />
              </motion.button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 lg:space-x-3">
            <motion.button
              onClick={handleAddToCartClick}
              disabled={!selectedVariant?.inStock || isAddingToCart}
              className="flex-1 bg-black text-white py-2 lg:py-2.5 px-3 lg:px-4 rounded-lg text-[10px] lg:text-sm font-medium hover:bg-gray-900 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1 lg:space-x-2 cursor-pointer"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {isAddingToCart ? (
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 bg-white rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 1, 0.5],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              ) : (
                <>
                  <ShoppingCartIcon className="w-4 h-4" />
                  <span>Add to Cart</span>
                </>
              )}
            </motion.button>

            <motion.button
              onClick={handleWishlistClick}
              disabled={!selectedVariant && product.variants.length > 0}
              className={`p-2 lg:p-2.5 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors cursor-pointer ${
                !selectedVariant && product.variants.length > 0
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={
                !selectedVariant && product.variants.length > 0
                  ? "Please select a variant first"
                  : isWishlisted
                    ? "Remove from wishlist"
                    : "Add to wishlist"
              }
            >
              {isWishlisted ? (
                <HeartIconSolid className="w-3 h-3 lg:w-4 lg:h-4 text-red-500" />
              ) : (
                <HeartIcon className="w-3 h-3 lg:w-4 lg:h-4" />
              )}
            </motion.button>

            <motion.button
              className="p-2 lg:p-2.5 border border-slate-300 rounded-lg hover:border-slate-400 transition-colors cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShareIcon className="w-3 h-3 lg:w-4 lg:h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Message when no variant selected */}
      {!selectedVariant && product.variants.length > 0 && (
        <motion.div
          className="bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.55 }}
        >
          <p className="text-[10px] lg:text-sm text-blue-700 font-medium">
            Please select a variant to add to cart
          </p>
          <p className="text-[10px] lg:text-xs text-blue-600 mt-1">
            Choose from available options above
          </p>
        </motion.div>
      )}

      {/* Features */}
      <motion.div
        className="grid grid-cols-3 gap-2 lg:gap-3 py-3 lg:py-4 border-t border-slate-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
      >
        <div className="text-center">
          <TruckIcon className="w-4 h-4 lg:w-5 lg:h-5 mx-auto text-slate-600 mb-1" />
          <p className="text-[10px] lg:text-xs font-medium text-slate-900">
            Free Shipping
          </p>
          <p className="text-[8px] lg:text-xs text-slate-500">
            Orders over €50
          </p>
        </div>
        <div className="text-center">
          <ArrowPathIcon className="w-4 h-4 lg:w-5 lg:h-5 mx-auto text-slate-600 mb-1" />
          <p className="text-xs font-medium text-slate-900">
            {product.returnable ? "30-Day Returns" : "Non-Returnable"}
          </p>
          <p className="text-xs text-slate-500">
            {product.returnable ? "Money back guarantee" : "Final sale"}
          </p>
        </div>
        <div className="text-center">
          <ShieldCheckIcon className="w-5 h-5 mx-auto text-slate-600 mb-1" />
          <p className="text-xs font-medium text-slate-900">Warranty</p>
          <p className="text-xs text-slate-500">
            {product.warranty || "1 year coverage"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
