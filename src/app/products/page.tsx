/* eslint-disable @typescript-eslint/no-explicit-any */
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

// Improved Dropdown Component
function SimpleDropdown({
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
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-left shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm"
      >
        <span className="block truncate">
          {selectedOption?.label || placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
          <ChevronUpDownIcon
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-20 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-lg py-1 max-h-60 overflow-auto">
            {optionsArray.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className="relative w-full px-3 py-2 text-left text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-150 flex items-center justify-between"
              >
                <span className="block truncate">{option.label}</span>
                {value === option.value && (
                  <CheckIcon className="h-4 w-4 text-gray-900" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Simple Price Range Component
function PriceRange({
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
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm text-gray-600">
        <span>{formatValue(value[0])}</span>
        <span>{formatValue(value[1])}</span>
      </div>

      <div className="relative">
        <div className="flex space-x-2">
          <input
            type="number"
            min={min}
            max={max}
            value={value[0]}
            onChange={(e) =>
              onChange([parseInt(e.target.value) || min, value[1]])
            }
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Min"
          />
          <input
            type="number"
            min={min}
            max={max}
            value={value[1]}
            onChange={(e) =>
              onChange([value[0], parseInt(e.target.value) || max])
            }
            className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="Max"
          />
        </div>
      </div>
    </div>
  );
}

// Simple Star Rating Component
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
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none transition-colors duration-150"
        >
          <StarIcon
            className={`h-5 w-5 ${
              star <= (hovered || rating)
                ? "text-yellow-400 fill-current"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

// Simple Button Component
function Button({
  onClick,
  variant = "default",
  size = "md",
  children,
  className = "",
  leftIcon,
  fullWidth = false,
  ...props
}: {
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  leftIcon?: React.ReactNode;
  fullWidth?: boolean;
  [key: string]: any;
}) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    default: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `.trim();

  return (
    <button onClick={onClick} className={classes} {...props}>
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
    </button>
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

      {/* Page Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl lg:text-4xl font-light text-gray-900 mb-4">
              Premium Electronics
            </h1>
            <p className="text-base text-gray-600 leading-relaxed">
              Discover carefully curated technology and innovation from the
              world&apos;s most trusted brands
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button onClick={clearFilters} variant="ghost" size="sm">
                    Clear ({activeFiltersCount})
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <SimpleDropdown
                    options={categories}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                  />
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <SimpleDropdown
                    options={brands}
                    value={selectedBrand}
                    onChange={setSelectedBrand}
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Price Range
                  </label>
                  <PriceRange
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <StarRating rating={minRating} onChange={setMinRating} />
                </div>

                {/* On Sale Toggle */}
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyOnSale}
                      onChange={(e) => setOnlyOnSale(e.target.checked)}
                      className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      On Sale Only
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Button
                  onClick={() => setShowFilters(true)}
                  variant="outline"
                  size="sm"
                  className="lg:hidden"
                  leftIcon={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
                >
                  Filters
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 px-1.5 py-0.5 bg-gray-900 text-white text-xs rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>

                <p className="text-sm text-gray-600">
                  {filteredProducts.length} products found
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <SimpleDropdown
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-48"
                />

                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Squares2X2Icon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <ListBulletIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div
              className={`grid gap-4 transition-all duration-300 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant={viewMode === "list" ? "compact" : "default"}
                />
              ))}
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Try adjusting your filters to see more results
                </p>
                <Button onClick={clearFilters} variant="default" size="sm">
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      {showFilters && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
          onClick={() => setShowFilters(false)}
        >
          <div
            className="w-80 h-full bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile filters content */}
              <div className="space-y-6">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <SimpleDropdown
                    options={categories}
                    value={selectedCategory}
                    onChange={setSelectedCategory}
                  />
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Brand
                  </label>
                  <SimpleDropdown
                    options={brands}
                    value={selectedBrand}
                    onChange={setSelectedBrand}
                  />
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range
                  </label>
                  <PriceRange
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <StarRating rating={minRating} onChange={setMinRating} />
                </div>

                {/* On Sale Toggle */}
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={onlyOnSale}
                      onChange={(e) => setOnlyOnSale(e.target.checked)}
                      className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      On Sale Only
                    </span>
                  </label>
                </div>

                {/* Apply Filters Button */}
                <Button
                  onClick={() => setShowFilters(false)}
                  variant="default"
                  size="sm"
                  fullWidth
                >
                  Apply Filters
                </Button>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button
                    onClick={() => {
                      clearFilters();
                      setShowFilters(false);
                    }}
                    variant="outline"
                    size="sm"
                    fullWidth
                  >
                    Clear All Filters ({activeFiltersCount})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
