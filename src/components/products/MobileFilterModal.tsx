/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/buttonSidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StarRating, PriceRange } from "./FilterComponents";

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
}

interface FilterState {
  selectedCategory: string;
  selectedSubcategory: string;
  selectedBrand: string;
  priceRange: [number, number];
  minRating: number;
  onlyOnSale: boolean;
  onlyInStock: boolean;
}

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  brands: Brand[];
  availableSubcategories: Subcategory[];
  filters: FilterState;
  onFilterChange: (filterType: string, value: any) => void;
  onClearFilters: () => void;
  activeFiltersCount: number;
  maxPrice: number;
}

export function MobileFilterModal({
  isOpen,
  onClose,
  categories,
  brands,
  availableSubcategories,
  filters,
  onFilterChange,
  onClearFilters,
  activeFiltersCount,
  maxPrice,
}: MobileFilterModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="w-80 h-full bg-white shadow-2xl overflow-y-auto"
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-slate-900">Filters</h3>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.05, rotate: 90 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  <XMarkIcon className="w-5 h-5 text-slate-600" />
                </motion.button>
              </div>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Category
                  </label>
                  <Select
                    value={filters.selectedCategory || "all"}
                    onValueChange={(value) =>
                      onFilterChange("category", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full bg-white border-slate-200 focus:border-slate-400">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategory */}
                {availableSubcategories.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Subcategory
                    </label>
                    <Select
                      value={filters.selectedSubcategory || "all"}
                      onValueChange={(value) =>
                        onFilterChange(
                          "subcategory",
                          value === "all" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger className="w-full bg-white border-slate-200 focus:border-slate-400">
                        <SelectValue placeholder="All Subcategories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subcategories</SelectItem>
                        {availableSubcategories.map((subcategory) => (
                          <SelectItem
                            key={subcategory.id}
                            value={subcategory.id}
                          >
                            {subcategory.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Brand */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Brand
                  </label>
                  <Select
                    value={filters.selectedBrand || "all"}
                    onValueChange={(value) =>
                      onFilterChange("brand", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full bg-white border-slate-200 focus:border-slate-400">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Price Range
                  </label>
                  <PriceRange
                    min={0}
                    max={maxPrice}
                    value={filters.priceRange}
                    onChange={(value) => onFilterChange("priceRange", value)}
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Minimum Rating
                  </label>
                  <StarRating
                    rating={filters.minRating}
                    onChange={(value) => onFilterChange("minRating", value)}
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.onlyOnSale}
                      onChange={(e) =>
                        onFilterChange("onlyOnSale", e.target.checked)
                      }
                      className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      On Sale Only
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.onlyInStock}
                      onChange={(e) =>
                        onFilterChange("onlyInStock", e.target.checked)
                      }
                      className="h-4 w-4 text-slate-900 focus:ring-slate-900 border-slate-300 rounded cursor-pointer"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      In Stock Only
                    </span>
                  </label>
                </div>

                {/* Apply Filters Button */}
                <Button
                  onClick={onClose}
                  variant="default"
                  size="sm"
                  className="w-full text-sm px-4 py-3 cursor-pointer bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Apply Filters
                </Button>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    onClick={() => {
                      onClearFilters();
                      onClose();
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full text-sm px-4 py-3 cursor-pointer"
                  >
                    Clear All Filters ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
