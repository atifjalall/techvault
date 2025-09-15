"use client";
import { useState, useMemo } from "react";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
  ChevronUpDownIcon,
  CheckIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Mock product data
const mockProducts = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    brand: "Apple",
    price: 1199.99,
    originalPrice: 1299.99,
    image: "/api/placeholder/300/300",
    category: "Smartphones",
    rating: 4.8,
    reviewCount: 2847,
    isNew: true,
    isFeatured: true,
    slug: "iphone-15-pro-max",
    description:
      "The most advanced iPhone with titanium design and A17 Pro chip",
  },
  {
    id: 2,
    name: "MacBook Pro 16-inch M3",
    brand: "Apple",
    price: 2499.99,
    originalPrice: 2699.99,
    image: "/api/placeholder/300/300",
    category: "Laptops",
    rating: 4.9,
    reviewCount: 1523,
    isNew: true,
    slug: "macbook-pro-16-m3",
    description: "Professional laptop with M3 chip for ultimate performance",
  },
  {
    id: 3,
    name: "Sony WH-1000XM5",
    brand: "Sony",
    price: 299.99,
    originalPrice: 399.99,
    image: "/api/placeholder/300/300",
    category: "Audio",
    rating: 4.7,
    reviewCount: 3921,
    slug: "sony-wh-1000xm5",
    description: "Industry-leading noise canceling wireless headphones",
  },
  {
    id: 4,
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    price: 1099.99,
    originalPrice: 1199.99,
    image: "/api/placeholder/300/300",
    category: "Smartphones",
    rating: 4.6,
    reviewCount: 2156,
    isNew: true,
    slug: "samsung-galaxy-s24-ultra",
    description: "Ultimate Android flagship with S Pen and 200MP camera",
  },
  {
    id: 5,
    name: "Dell XPS 13 Plus",
    brand: "Dell",
    price: 1299.99,
    originalPrice: 1499.99,
    image: "/api/placeholder/300/300",
    category: "Laptops",
    rating: 4.5,
    reviewCount: 892,
    slug: "dell-xps-13-plus",
    description: "Premium ultrabook with InfinityEdge display",
  },
  {
    id: 6,
    name: "AirPods Pro 2nd Gen",
    brand: "Apple",
    price: 199.99,
    originalPrice: 249.99,
    image: "/api/placeholder/300/300",
    category: "Audio",
    rating: 4.8,
    reviewCount: 4127,
    isFeatured: true,
    slug: "airpods-pro-2nd-gen",
    description: "Active noise cancellation with adaptive transparency",
  },
  {
    id: 7,
    name: "iPad Pro 12.9-inch M2",
    brand: "Apple",
    price: 999.99,
    originalPrice: 1099.99,
    image: "/api/placeholder/300/300",
    category: "Tablets",
    rating: 4.7,
    reviewCount: 1834,
    slug: "ipad-pro-12-9-m2",
    description:
      "Most advanced iPad with M2 chip and Liquid Retina XDR display",
  },
  {
    id: 8,
    name: "Logitech MX Master 3S",
    brand: "Logitech",
    price: 89.99,
    originalPrice: 99.99,
    image: "/api/placeholder/300/300",
    category: "Accessories",
    rating: 4.6,
    reviewCount: 2743,
    slug: "logitech-mx-master-3s",
    description: "Advanced wireless mouse for productivity and creativity",
  },
];

const categories = [
  "All Products",
  "Smartphones",
  "Laptops",
  "Audio",
  "Tablets",
  "Gaming",
  "Accessories",
];

const brands = [
  "All Brands",
  "Apple",
  "Samsung",
  "Sony",
  "Dell",
  "Microsoft",
  "Logitech",
];

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest First", value: "newest" },
  { label: "Best Rating", value: "rating" },
];

type ViewMode = "grid" | "list";

// Custom Dropdown Component
function CustomDropdown({
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
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-left shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="block truncate text-sm">
          {selectedOption?.label || placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-3">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
          </motion.div>
        </span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute z-20 mt-2 w-full bg-white shadow-xl border border-gray-200 rounded-xl py-2 max-h-60 overflow-auto"
            >
              {optionsArray.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className="relative w-full px-4 py-3 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                >
                  <span className="block truncate">{option.label}</span>
                  {value === option.value && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-y-0 right-0 flex items-center pr-4"
                    >
                      <CheckIcon className="h-4 w-4 text-black" />
                    </motion.span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Custom Range Slider Component
function RangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  formatValue = (val: number) => val.toString(),
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  step?: number;
  formatValue?: (value: number) => string;
}) {
  const [isDragging, setIsDragging] = useState<number | null>(null);

  const handleMouseDown = (index: number) => {
    setIsDragging(index);
  };

  const handleMouseUp = () => {
    setIsDragging(null);
  };

  const minPercent = ((value[0] - min) / (max - min)) * 100;
  const maxPercent = ((value[1] - min) / (max - min)) * 100;

  return (
    <div className="px-1">
      <div className="flex justify-between text-sm text-gray-600 mb-4">
        <span>{formatValue(value[0])}</span>
        <span>{formatValue(value[1])}</span>
      </div>

      <div className="relative h-2 bg-gray-200 rounded-full">
        {/* Range Track */}
        <motion.div
          className="absolute h-2 bg-black rounded-full"
          style={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
          animate={{
            left: `${minPercent}%`,
            right: `${100 - maxPercent}%`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />

        {/* Min Thumb */}
        <motion.div
          className="absolute w-5 h-5 bg-white border-2 border-black rounded-full shadow-lg cursor-pointer -mt-1.5"
          style={{ left: `${minPercent}%`, marginLeft: "-10px" }}
          whileHover={{ scale: 1.1 }}
          whileDrag={{ scale: 1.2 }}
          animate={{
            scale: isDragging === 0 ? 1.2 : 1,
            boxShadow:
              isDragging === 0
                ? "0 10px 25px rgba(0,0,0,0.15)"
                : "0 4px 15px rgba(0,0,0,0.1)",
          }}
          onMouseDown={() => handleMouseDown(0)}
          onMouseUp={handleMouseUp}
        />

        {/* Max Thumb */}
        <motion.div
          className="absolute w-5 h-5 bg-white border-2 border-black rounded-full shadow-lg cursor-pointer -mt-1.5"
          style={{ left: `${maxPercent}%`, marginLeft: "-10px" }}
          whileHover={{ scale: 1.1 }}
          whileDrag={{ scale: 1.2 }}
          animate={{
            scale: isDragging === 1 ? 1.2 : 1,
            boxShadow:
              isDragging === 1
                ? "0 10px 25px rgba(0,0,0,0.15)"
                : "0 4px 15px rgba(0,0,0,0.1)",
          }}
          onMouseDown={() => handleMouseDown(1)}
          onMouseUp={handleMouseUp}
        />

        {/* Hidden inputs for actual functionality */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onChange([parseInt(e.target.value), value[1]])}
          className="absolute w-full h-2 opacity-0 cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => onChange([value[0], parseInt(e.target.value)])}
          className="absolute w-full h-2 opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}

// Star Rating Component
function StarRating({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <StarIcon
            className={`h-5 w-5 transition-colors duration-150 ${
              star <= (hovered || rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        </motion.button>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Products");
  const [selectedBrand, setSelectedBrand] = useState("All Brands");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [onlyOnSale, setOnlyOnSale] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = mockProducts.filter((product) => {
      if (
        searchQuery &&
        !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.brand.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      if (
        selectedCategory !== "All Products" &&
        product.category !== selectedCategory
      ) {
        return false;
      }

      if (selectedBrand !== "All Brands" && product.brand !== selectedBrand) {
        return false;
      }

      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      if (onlyOnSale && !product.originalPrice) {
        return false;
      }

      if (product.rating && product.rating < minRating) {
        return false;
      }

      return true;
    });

    // Sort products
    switch (sortBy) {
      case "price-asc":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      case "featured":
      default:
        filtered.sort(
          (a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
        );
        break;
    }

    return filtered;
  }, [
    searchQuery,
    selectedCategory,
    selectedBrand,
    priceRange,
    sortBy,
    onlyOnSale,
    minRating,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All Products");
    setSelectedBrand("All Brands");
    setPriceRange([0, 3000]);
    setOnlyOnSale(false);
    setMinRating(0);
    setSortBy("featured");
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory !== "All Products",
    selectedBrand !== "All Brands",
    priceRange[0] > 0 || priceRange[1] < 3000,
    onlyOnSale,
    minRating > 0,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Elegant Page Header */}
      <motion.div
        className="bg-white border-b border-gray-100"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center max-w-3xl mx-auto">
            <motion.h1
              className="text-4xl lg:text-5xl font-light text-gray-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Premium Electronics
            </motion.h1>
            <motion.p
              className="text-lg text-gray-600 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover carefully curated technology and innovation from the
              world&apos;s most trusted brands
            </motion.p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Elegant Sidebar Filters */}
          <motion.div
            className="hidden lg:block w-80 flex-shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sticky top-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-medium text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <motion.button
                    onClick={clearFilters}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear ({activeFiltersCount})
                  </motion.button>
                )}
              </div>

              <div className="space-y-8">
                {/* Elegant Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Search
                  </label>
                  <div className="relative">
                    <motion.div
                      className="absolute left-4 top-1/2 transform -translate-y-1/2"
                      animate={{
                        scale: searchQuery ? 1.1 : 1,
                        color: searchQuery ? "#000" : "#9CA3AF",
                      }}
                    >
                      <MagnifyingGlassIcon className="w-5 h-5" />
                    </motion.div>
                    <motion.input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                      whileFocus={{ scale: 1.01 }}
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Category
                  </label>
                  <CustomDropdown
                    options={categories}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                  />
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Brand
                  </label>
                  <CustomDropdown
                    options={brands}
                    value={selectedBrand}
                    onChange={setSelectedBrand}
                  />
                </div>

                {/* Price Range Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Price Range
                  </label>
                  <RangeSlider
                    min={0}
                    max={3000}
                    value={priceRange}
                    onChange={setPriceRange}
                    step={50}
                    formatValue={(val) => `€${val}`}
                  />
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Minimum Rating
                  </label>
                  <StarRating rating={minRating} onChange={setMinRating} />
                </div>

                {/* On Sale Toggle */}
                <div>
                  <motion.label
                    className="flex items-center cursor-pointer"
                    whileHover={{ x: 2 }}
                  >
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={onlyOnSale}
                        onChange={(e) => setOnlyOnSale(e.target.checked)}
                        className="sr-only"
                      />
                      <motion.div
                        className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                          onlyOnSale ? "bg-black" : "bg-gray-200"
                        }`}
                        animate={{
                          backgroundColor: onlyOnSale ? "#000" : "#E5E7EB",
                        }}
                      >
                        <motion.div
                          className="w-5 h-5 bg-white rounded-full shadow-sm"
                          animate={{
                            x: onlyOnSale ? 28 : 2,
                            y: 2,
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 30,
                          }}
                        />
                      </motion.div>
                    </div>
                    <span className="ml-3 text-sm text-gray-700">
                      On Sale Only
                    </span>
                  </motion.label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Elegant Toolbar */}
            <motion.div
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <motion.button
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center px-4 py-2 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <AdjustmentsHorizontalIcon className="w-5 h-5 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <motion.span
                      className="ml-2 px-2 py-1 bg-black text-white text-xs rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      {activeFiltersCount}
                    </motion.span>
                  )}
                </motion.button>

                <motion.p
                  className="text-sm text-gray-600"
                  key={filteredProducts.length}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {filteredProducts.length} products found
                </motion.p>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <CustomDropdown
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-48"
                />

                {/* View Toggle */}
                <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                  <motion.button
                    onClick={() => setViewMode("grid")}
                    className={`p-3 transition-colors ${
                      viewMode === "grid"
                        ? "bg-black text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Squares2X2Icon className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode("list")}
                    className={`p-3 transition-colors ${
                      viewMode === "list"
                        ? "bg-black text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ListBulletIcon className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Products Grid with Stagger Animation */}
            <motion.div
              layout
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.1,
                      layout: { duration: 0.3 },
                    }}
                    whileHover={{ y: -5 }}
                  >
                    <ProductCard
                      product={product}
                      variant={viewMode === "list" ? "compact" : "default"}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Elegant Empty State */}
            {filteredProducts.length === 0 && (
              <motion.div
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center"
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                >
                  <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                </motion.div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters to see more results
                </p>
                <motion.button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear All Filters
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Compact Mobile Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-72 h-full bg-white shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                  <motion.button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Mobile filters content */}
                <div className="space-y-5">
                  {/* Search */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <CustomDropdown
                      options={categories}
                      value={selectedCategory}
                      onChange={setSelectedCategory}
                    />
                  </div>

                  {/* Brand Filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <CustomDropdown
                      options={brands}
                      value={selectedBrand}
                      onChange={setSelectedBrand}
                    />
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-3">
                      Price Range
                    </label>
                    <RangeSlider
                      min={0}
                      max={3000}
                      value={priceRange}
                      onChange={setPriceRange}
                      step={50}
                      formatValue={(val) => `€${val}`}
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <StarRating rating={minRating} onChange={setMinRating} />
                  </div>

                  {/* On Sale Toggle */}
                  <div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={onlyOnSale}
                          onChange={(e) => setOnlyOnSale(e.target.checked)}
                          className="sr-only"
                        />
                        <motion.div
                          className={`w-9 h-5 rounded-full transition-colors duration-200 ${
                            onlyOnSale ? "bg-black" : "bg-gray-200"
                          }`}
                          animate={{
                            backgroundColor: onlyOnSale ? "#000" : "#E5E7EB",
                          }}
                        >
                          <motion.div
                            className="w-4 h-4 bg-white rounded-full shadow-sm"
                            animate={{
                              x: onlyOnSale ? 20 : 1,
                              y: 1,
                            }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 30,
                            }}
                          />
                        </motion.div>
                      </div>
                      <span className="ml-2 text-xs text-gray-700">
                        On Sale Only
                      </span>
                    </label>
                  </div>

                  {/* Apply Filters Button */}
                  <motion.button
                    onClick={() => setShowFilters(false)}
                    className="w-full bg-black text-white py-3 rounded-lg font-medium text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Apply Filters
                  </motion.button>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <motion.button
                      onClick={() => {
                        clearFilters();
                        setShowFilters(false);
                      }}
                      className="w-full border border-gray-200 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Clear All Filters ({activeFiltersCount})
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
