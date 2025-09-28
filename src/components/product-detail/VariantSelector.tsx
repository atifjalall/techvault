"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ProductVariant } from "@/types/product";

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onVariantSelect: (variant: ProductVariant) => void;
  productImages: string[];
  productName: string;
}

export default function VariantSelector({
  variants,
  selectedVariant,
  onVariantSelect,
  productImages,
  productName,
}: VariantSelectorProps) {
  if (!variants || variants.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Variant Grid */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700">
          Available Options:
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {variants.map((variant) => (
            <motion.button
              key={variant.id}
              onClick={() => onVariantSelect(variant)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                selectedVariant?.id === variant.id
                  ? "border-slate-900 ring-2 ring-slate-900 ring-offset-1"
                  : "border-slate-200 hover:border-slate-300"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={!variant.inStock}
            >
              <Image
                src={
                  variant.thumbnailImage ||
                  variant.images[0] ||
                  productImages[0] ||
                  "/api/placeholder/120/120"
                }
                alt={variant.variantName}
                fill
                className={`object-cover ${!variant.inStock ? "grayscale opacity-50" : ""}`}
                sizes="(max-width: 640px) 80px, (max-width: 768px) 100px, 120px"
                quality={90}
              />

              {/* Stock indicators */}
              {variant.inStock && variant.isLowStock && (
                <div className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></div>
              )}
              {!variant.inStock && (
                <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                  <XMarkIcon className="w-6 h-6 text-white" />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Selected Variant Details */}
      {selectedVariant && (
        <div className="space-y-3">
          {/* Color Display */}
          {selectedVariant.color && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Color:
              </label>
              <div className="flex items-center space-x-2">
                {selectedVariant.colorHex && (
                  <div
                    className="w-4 h-4 rounded-full border border-slate-300"
                    style={{ backgroundColor: selectedVariant.colorHex }}
                  />
                )}
                <span className="text-sm text-slate-900 font-medium">
                  {selectedVariant.color}
                </span>
              </div>
            </div>
          )}

          {/* Variant Details in Single Row */}
          {(selectedVariant.storage ||
            selectedVariant.ram ||
            selectedVariant.size) && (
            <div className="flex flex-wrap items-center gap-4">
              {selectedVariant.storage && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-700">
                    Storage:
                  </span>
                  <span className="inline-block bg-slate-100 text-slate-900 px-2 py-1 rounded-full text-xs font-medium">
                    {selectedVariant.storage}
                  </span>
                </div>
              )}

              {selectedVariant.ram && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-700">
                    Memory:
                  </span>
                  <span className="inline-block bg-slate-100 text-slate-900 px-2 py-1 rounded-full text-xs font-medium">
                    {selectedVariant.ram}
                  </span>
                </div>
              )}

              {selectedVariant.size && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-700">
                    Size:
                  </span>
                  <span className="inline-block bg-slate-100 text-slate-900 px-2 py-1 rounded-full text-xs font-medium">
                    {selectedVariant.size}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Material Display */}
          {selectedVariant.material && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Material:
              </label>
              <div className="text-sm text-slate-900 font-medium">
                {selectedVariant.material}
              </div>
            </div>
          )}

          {/* Stock Status */}
          {selectedVariant.isLowStock && selectedVariant.inStock && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm text-orange-700 font-medium">
                Only {selectedVariant.stock} left in stock
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
