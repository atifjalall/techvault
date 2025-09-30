"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ProductSpecification } from "@/types/product";

interface ProductTabsSectionProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    specifications: ProductSpecification[];
    weight: string | null;
    dimensions: string | null;
    tags: string[];
  };
  selectedVariant?: {
    material: string | null;
    storage: string | null;
    ram: string | null;
    size: string | null;
  } | null;
  selectedTab: string;
  onTabChange: (tab: string) => void;
}

export default function ProductTabsSection({
  product,
  selectedVariant,
  selectedTab,
  onTabChange,
}: ProductTabsSectionProps) {
  return (
    <motion.div
      className="space-y-3 lg:space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.7 }}
    >
      {/* Tab Navigation */}
      <div className="border-b border-slate-200">
        <nav className="-mb-px flex space-x-3 lg:space-x-6">
          {["description", "specifications", "reviews"].map((tab) => (
            <motion.button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`py-2 lg:py-3 px-1 border-b-2 text-[10px] lg:text-sm font-medium capitalize transition-colors cursor-pointer ${
                selectedTab === tab
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {tab}
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        <AnimatePresence mode="wait">
          {selectedTab === "description" && (
            <motion.div
              className="w-full"
              key="description"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-sm lg:text-lg font-medium text-slate-900 mb-2 lg:mb-3">
                Product Description
              </h3>
              <div className="prose prose-sm prose-slate max-w-none w-full">
                <p className="text-[10px] lg:text-slate-600 mb-3 lg:mb-4 leading-relaxed">
                  {product.description || "No detailed description available."}
                </p>

                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-4 mt-3 lg:mt-6 w-full">
                  {product.weight && (
                    <div className="flex justify-between">
                      <span className="text-[10px] lg:text-sm font-medium text-slate-900">
                        Weight:
                      </span>
                      <span className="text-[10px] lg:text-sm text-slate-600">
                        {product.weight}
                      </span>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-[10px] lg:text-sm font-medium text-slate-900">
                        Dimensions:
                      </span>
                      <span className="text-[10px] lg:text-sm text-slate-600">
                        {product.dimensions}
                      </span>
                    </div>
                  )}
                  {selectedVariant?.material && (
                    <div className="flex justify-between">
                      <span className="text-[10px] lg:text-sm font-medium text-slate-900">
                        Material:
                      </span>
                      <span className="text-[10px] lg:text-sm text-slate-600">
                        {selectedVariant.material}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {product.tags.length > 0 && (
                  <div className="mt-6 w-full">
                    <h4 className="text-base font-medium text-slate-900 mb-2">
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {selectedTab === "specifications" && (
            <motion.div
              className="w-full"
              key="specifications"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-sm lg:text-lg font-medium text-slate-900 mb-2 lg:mb-3">
                Technical Specifications
              </h3>

              {/* Selected Variant Specifications */}
              {selectedVariant && (
                <div className="bg-slate-50 rounded-lg p-3 lg:p-4 mb-3 lg:mb-6 w-full">
                  <h4 className="text-[10px] lg:text-base font-medium text-slate-900 mb-2 lg:mb-3">
                    Selected Configuration
                  </h4>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-2 lg:gap-x-4 gap-y-2 lg:gap-y-3 w-full">
                    {selectedVariant.storage && (
                      <motion.div
                        className="border-b border-slate-200 pb-2 last:border-b-0"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <dt className="text-[10px] lg:text-xs font-medium text-slate-600 uppercase tracking-wide">
                          Storage
                        </dt>
                        <dd className="text-[10px] lg:text-sm text-slate-900 mt-1">
                          {selectedVariant.storage}
                        </dd>
                      </motion.div>
                    )}

                    {selectedVariant.ram && (
                      <motion.div
                        className="border-b border-slate-200 pb-2 last:border-b-0"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.05 }}
                      >
                        <dt className="text-[10px] lg:text-xs font-medium text-slate-600 uppercase tracking-wide">
                          RAM
                        </dt>
                        <dd className="text-[10px] lg:text-sm text-slate-900 mt-1">
                          {selectedVariant.ram}
                        </dd>
                      </motion.div>
                    )}

                    {selectedVariant.size && (
                      <motion.div
                        className="border-b border-slate-200 pb-2 last:border-b-0"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                      >
                        <dt className="text-[10px] lg:text-xs font-medium text-slate-600 uppercase tracking-wide">
                          Screen Size
                        </dt>
                        <dd className="text-[10px] lg:text-sm text-slate-900 mt-1">
                          {selectedVariant.size}
                        </dd>
                      </motion.div>
                    )}
                  </dl>
                </div>
              )}

              {/* Product Specifications */}
              {product.specifications.length > 0 ? (
                <div className="space-y-3 lg:space-y-6 w-full">
                  {product.specifications.map((specGroup, groupIndex) => (
                    <div
                      key={groupIndex}
                      className="bg-slate-50 rounded-lg p-3 lg:p-4 w-full"
                    >
                      <h4 className="text-[10px] lg:text-base font-medium text-slate-900 mb-2 lg:mb-3">
                        {specGroup.category}
                      </h4>
                      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-2 lg:gap-x-4 gap-y-2 lg:gap-y-3 w-full">
                        {specGroup.specs.map((spec, index) => (
                          <motion.div
                            key={index}
                            className="border-b border-slate-200 pb-2 last:border-b-0"
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.2,
                              delay: index * 0.05,
                            }}
                          >
                            <dt className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                              {spec.name}
                            </dt>
                            <dd className="text-sm text-slate-900 mt-1">
                              {spec.value}
                              {spec.unit && ` ${spec.unit}`}
                            </dd>
                          </motion.div>
                        ))}
                      </dl>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-lg p-4 lg:p-6 text-center w-full">
                  <p className="text-slate-600 text-[10px] lg:text-sm">
                    No specifications available for this product.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
