/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useSession } from "next-auth/react";
import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard, {
  Product as ProductCardType,
} from "@/components/ui/ProductCard";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/buttonSidebar";

// Premium animation configurations - Apple-like smooth easing
const smoothTransition = { duration: 0.4 };
const fastTransition = { duration: 0.2 };
const slowTransition = { duration: 0.6 };

// Updated types based on your new Prisma schema
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories?: Subcategory[];
}

interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

interface Brand {
  id: string;
  name: string;
}

interface ProductVariant {
  id: string;
  variantName: string;
  price: number;
  comparePrice?: number;
  stock: number;
  color?: string;
  colorHex?: string;
  storage?: string;
  ram?: string;
  size?: string;
  thumbnailImage?: string;
  images: string[];
  isActive: boolean;
}

interface ColorOption {
  color?: string;
  colorHex?: string;
  image?: string;
  variantId: string;
}

interface DatabaseProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number; // Computed from variants
  maxPrice?: number;
  comparePrice?: number;
  priceRange: string;
  images: string[];
  brand?: Brand;
  category: Category;
  subcategory?: Subcategory;
  stock: number; // Computed total stock
  inStock: boolean;
  isActive: boolean;
  featured: boolean;
  newArrival: boolean;
  returnable: boolean;
  avgRating: number;
  reviewCount: number;
  discountPercentage: number;
  variantCount: number;
  colorOptions: ColorOption[];
  storageOptions: string[];
  ramOptions: string[];
  hasMultipleVariants: boolean;
  variants: ProductVariant[];
  specifications: Record<
    string,
    Array<{
      name: string;
      value: string;
      unit?: string;
      isHighlight: boolean;
    }>
  >;
  tags: string[];
  modelNumber?: string;
  views: number;
  sold: number;
  deliveryDays?: number;
  warranty?: string;
  weight?: string;
  dimensions?: string;
  createdAt: string;
  updatedAt: string;
}

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Newest First", value: "newest" },
  { label: "Best Rating", value: "rating" },
];

type ViewMode = "grid" | "list";

// Enhanced Dropdown Component with smooth animations
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
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        transition={fastTransition}
        className="relative w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-left shadow-sm hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 text-sm cursor-pointer"
      >
        <span className="block truncate text-sm">
          {selectedOption?.label || placeholder}
        </span>
        <span className="absolute inset-y-0 right-0 flex items-center pr-2">
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={fastTransition}
          >
            <ChevronUpDownIcon className="h-4 w-4 text-gray-400" />
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
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={fastTransition}
              className="absolute z-20 mt-1 w-full bg-white shadow-lg border border-gray-200 rounded-lg py-1 max-h-60 overflow-auto"
            >
              {optionsArray.map((option, index) => (
                <motion.button
                  key={option.value}
                  type="button"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...fastTransition, delay: index * 0.02 }}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  whileHover={{ backgroundColor: "rgb(249 250 251)" }}
                  className="relative w-full px-3 py-2 text-left text-sm focus:outline-none transition-colors duration-150 flex items-center justify-between cursor-pointer"
                >
                  <span className="block truncate">{option.label}</span>
                  {value === option.value && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={fastTransition}
                    >
                      <CheckIcon className="h-4 w-4 text-gray-900" />
                    </motion.div>
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

// FIXED: Price Range Component with debounced updates to prevent page refresh
function PriceRange({
  min,
  max,
  value,
  onChange,
  formatValue = (val: number) => val.toString(),
}: {
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
}) {
  const [localMin, setLocalMin] = useState(value[0].toString());
  const [localMax, setLocalMax] = useState(value[1].toString());
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Update local state when value prop changes
  useEffect(() => {
    setLocalMin(value[0].toString());
    setLocalMax(value[1].toString());
    setDebouncedValue(value);
  }, [value]);

  // Debounce the onChange calls to prevent excessive URL updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only call onChange if the debounced value is different from the current value
      if (debouncedValue[0] !== value[0] || debouncedValue[1] !== value[1]) {
        onChange(debouncedValue);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [debouncedValue, onChange, value]);

  const handleMinChange = (inputValue: string) => {
    setLocalMin(inputValue);
    const numericValue = parseInt(inputValue) || min;
    const clampedValue = Math.max(
      min,
      Math.min(numericValue, debouncedValue[1])
    );
    setDebouncedValue([clampedValue, debouncedValue[1]]);
  };

  const handleMaxChange = (inputValue: string) => {
    setLocalMax(inputValue);
    const numericValue = parseInt(inputValue) || max;
    const clampedValue = Math.min(
      max,
      Math.max(numericValue, debouncedValue[0])
    );
    setDebouncedValue([debouncedValue[0], clampedValue]);
  };

  const handleMinBlur = () => {
    const numericValue = parseInt(localMin) || min;
    const clampedValue = Math.max(
      min,
      Math.min(numericValue, debouncedValue[1])
    );
    setLocalMin(clampedValue.toString());
    const newValue: [number, number] = [clampedValue, debouncedValue[1]];
    setDebouncedValue(newValue);
    // Immediate update on blur
    onChange(newValue);
  };

  const handleMaxBlur = () => {
    const numericValue = parseInt(localMax) || max;
    const clampedValue = Math.min(
      max,
      Math.max(numericValue, debouncedValue[0])
    );
    setLocalMax(clampedValue.toString());
    const newValue: [number, number] = [debouncedValue[0], clampedValue];
    setDebouncedValue(newValue);
    // Immediate update on blur
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <motion.div
        className="flex justify-between text-sm text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={smoothTransition}
      >
        <span>{formatValue(debouncedValue[0])}</span>
        <span>{formatValue(debouncedValue[1])}</span>
      </motion.div>

      <div className="relative">
        <div className="flex space-x-2">
          <motion.input
            type="number"
            min={min}
            max={max}
            value={localMin}
            onChange={(e) => handleMinChange(e.target.value)}
            onBlur={handleMinBlur}
            whileFocus={{ scale: 1.01 }}
            transition={fastTransition}
            className="w-full px-2 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
            placeholder={`Min (${min})`}
          />
          <motion.input
            type="number"
            min={min}
            max={max}
            value={localMax}
            onChange={(e) => handleMaxChange(e.target.value)}
            onBlur={handleMaxBlur}
            whileFocus={{ scale: 1.01 }}
            transition={fastTransition}
            className="w-full px-2 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
            placeholder={`Max (${max})`}
          />
        </div>
      </div>
    </div>
  );
}

// FIXED: Premium Star Rating Component
function StarRating({
  rating,
  onChange,
}: {
  rating: number;
  onChange: (rating: number) => void;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isActive = star <= (hovered || rating);
        return (
          <motion.button
            key={star}
            type="button"
            onClick={() => onChange(star === rating ? 0 : star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={fastTransition}
            className="focus:outline-none transition-all duration-200 cursor-pointer p-0.5 rounded"
          >
            <motion.div
              animate={{
                scale: isActive ? 1 : 0.9,
                opacity: isActive ? 1 : 0.4,
              }}
              transition={fastTransition}
            >
              <StarIcon
                className={`h-5 w-5 transition-all duration-200 ${
                  isActive
                    ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                    : "text-gray-300 hover:text-amber-200"
                }`}
              />
            </motion.div>
          </motion.button>
        );
      })}
      {rating > 0 && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={fastTransition}
          className="text-xs text-gray-600 ml-2"
        >
          {rating}+ stars
        </motion.span>
      )}
    </div>
  );
}

// Loading Skeleton Component
function ProductGridSkeleton({
  viewMode = "grid",
  showToolbar = true,
}: {
  viewMode?: ViewMode;
  showToolbar?: boolean;
}) {
  return (
    <>
      {showToolbar && (
        <motion.div
          className="mb-4 bg-white rounded-lg shadow-sm border border-gray-100 p-3"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fastTransition}
        >
          <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
        </motion.div>
      )}

      <div
        className={`${
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
            : "space-y-4"
        }`}
      >
        {[...Array(8)].map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...smoothTransition, delay: index * 0.05 }}
            className={`bg-white rounded-lg shadow-sm border border-gray-100 ${
              viewMode === "list"
                ? "flex items-center p-3 h-32"
                : "flex flex-col h-full p-4"
            }`}
          >
            {viewMode === "list" ? (
              <>
                <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0 animate-pulse"></div>
                <div className="flex-1 ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                </div>
              </>
            ) : (
              <>
                <div className="aspect-square bg-gray-200 rounded-lg mb-3 animate-pulse"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                  <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse mt-auto"></div>
                </div>
              </>
            )}
          </motion.div>
        ))}
      </div>
    </>
  );
}

function ProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-48 bg-gray-200 rounded-lg"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Transform function with safer fallbacks
function transformProduct(dbProduct: DatabaseProduct): ProductCardType {
  const price = dbProduct?.price || 0;
  const images = dbProduct?.images || [];
  const variants = dbProduct?.variants || [];

  return {
    id: dbProduct.id,
    name: dbProduct.name || "Unnamed Product",
    brand: dbProduct.brand?.name,
    price: price,
    originalPrice: dbProduct.comparePrice,
    image: images[0] || "/api/placeholder/400/400",
    images: images,
    variants: dbProduct.hasMultipleVariants
      ? `${dbProduct.variantCount} variants`
      : undefined,
    isNew: dbProduct.newArrival,
    isFeatured: dbProduct.featured,
    category: dbProduct.category?.name || "Electronics",
    rating: dbProduct.avgRating > 0 ? dbProduct.avgRating : undefined,
    reviewCount: dbProduct.reviewCount > 0 ? dbProduct.reviewCount : undefined,
    slug: dbProduct.slug || dbProduct.id,
    description: dbProduct.description,
    stock: dbProduct.stock,
    isActive: dbProduct.isActive,
    colorOptions: dbProduct.colorOptions || [],
    discountPercentage: dbProduct.discountPercentage,
    priceRange: dbProduct.hasMultipleVariants
      ? dbProduct.priceRange
      : undefined,
  };
}

function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // State
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [sortBy, setSortBy] = useState("featured");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [onlyOnSale, setOnlyOnSale] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [onlyInStock, setOnlyInStock] = useState(false);

  // Redirect vendors to dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, session, router]);

  // Initialize filters from URL params - handle both slugs and IDs
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const subcategoryParam = searchParams.get("subcategory");
    const brandParam = searchParams.get("brand");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sale = searchParams.get("sale") || searchParams.get("onlyOnSale");
    const stock = searchParams.get("stock");
    const rating = searchParams.get("rating");

    // Handle category - support both ID and slug
    if (categoryParam) {
      const categoryBySlug = categories.find((c) => c.slug === categoryParam);
      const categoryById = categories.find((c) => c.id === categoryParam);
      const foundCategory = categoryBySlug || categoryById;
      if (foundCategory) {
        setSelectedCategory(foundCategory.id);
      }
    }

    // Handle subcategory - support both ID and slug
    if (subcategoryParam && categories.length > 0) {
      // First find all subcategories from all categories
      const allSubcategories = categories.flatMap(
        (cat) => cat.subcategories || []
      );
      const subcategoryBySlug = allSubcategories.find(
        (s) => s.slug === subcategoryParam
      );
      const subcategoryById = allSubcategories.find(
        (s) => s.id === subcategoryParam
      );
      const foundSubcategory = subcategoryBySlug || subcategoryById;
      if (foundSubcategory) {
        setSelectedSubcategory(foundSubcategory.id);
      }
    }

    // Handle brand - support both ID and name
    if (brandParam) {
      const brandByName = brands.find(
        (b) => b.name.toLowerCase().replace(/\s+/g, "-") === brandParam
      );
      const brandById = brands.find((b) => b.id === brandParam);
      const foundBrand = brandByName || brandById;
      if (foundBrand) {
        setSelectedBrand(foundBrand.id);
      }
    }

    if (search) setSearchQuery(search);
    if (sort) setSortBy(sort);

    // Only set price range from URL if both min and max are provided
    if (minPrice && maxPrice) {
      setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
    }

    if (sale === "true") setOnlyOnSale(true);
    if (stock === "true") setOnlyInStock(true);
    if (rating) setMinRating(parseInt(rating));
  }, [searchParams, categories, brands]);

  // FIXED: Update URL when filters change - use category slug instead of ID
  const updateURL = (newParams: Record<string, string | number | boolean>) => {
    const params = new URLSearchParams();

    // Always include current search params first
    searchParams.forEach((value, key) => {
      params.set(key, value);
    });

    // Update with new params
    Object.entries(newParams).forEach(([key, value]) => {
      if (
        value === "" ||
        value === false ||
        value === 0 ||
        value === null ||
        value === undefined
      ) {
        params.delete(key);
      } else {
        // Use category slug instead of ID for better URLs
        if (key === "category" && value && typeof value === "string") {
          const category = categories.find((c) => c.id === value);
          if (category) {
            params.set(key, category.slug);
          } else {
            params.set(key, value.toString());
          }
        } else if (
          key === "subcategory" &&
          value &&
          typeof value === "string"
        ) {
          const subcategory = availableSubcategories.find(
            (s) => s.id === value
          );
          if (subcategory) {
            params.set(key, subcategory.slug);
          } else {
            params.set(key, value.toString());
          }
        } else if (key === "brand" && value && typeof value === "string") {
          const brand = brands.find((b) => b.id === value);
          if (brand) {
            params.set(key, brand.name.toLowerCase().replace(/\s+/g, "-"));
          } else {
            params.set(key, value.toString());
          }
        } else {
          params.set(key, value.toString());
        }
      }
    });

    // Handle special cases
    if (!searchQuery && !newParams.search) params.delete("search");
    if (!selectedCategory && !newParams.category) {
      params.delete("category");
      params.delete("subcategory"); // Clear subcategory when category is cleared
    }
    if (!selectedSubcategory && !newParams.subcategory)
      params.delete("subcategory");
    if (!selectedBrand && !newParams.brand) params.delete("brand");
    if (sortBy === "featured" && !newParams.sort) params.delete("sort");
    if (!onlyOnSale && !newParams.onlyOnSale) params.delete("sale");
    if (!onlyInStock && !newParams.onlyInStock) params.delete("stock");
    if (minRating === 0 && !newParams.minRating) params.delete("rating");

    // Update price range properly - but don't auto-update unless explicitly changed
    function isNumberTuple(value: unknown): value is [number, number] {
      return (
        Array.isArray(value) &&
        value.length === 2 &&
        typeof value[0] === "number" &&
        typeof value[1] === "number"
      );
    }

    if (isNumberTuple(newParams.priceRange)) {
      const [min, max] = newParams.priceRange;
      params.set("minPrice", min.toString());
      params.set("maxPrice", max.toString());
    }

    // Remove priceRange from params as we use minPrice/maxPrice instead
    params.delete("priceRange");

    const newUrl = params.toString()
      ? `/products?${params.toString()}`
      : "/products";
    router.push(newUrl, { scroll: false });
  };

  // FIXED: Handle filter changes with proper URL updates - prevent auto price range updates
  const handleFilterChange = async (filterUpdates: Record<string, any>) => {
    setFilterLoading(true);

    // Apply filter updates to state
    Object.entries(filterUpdates).forEach(([key, value]) => {
      switch (key) {
        case "category":
          setSelectedCategory(value);
          if (value !== selectedCategory) {
            setSelectedSubcategory(""); // Reset subcategory when category changes
            filterUpdates.subcategory = ""; // Also clear in URL
          }
          break;
        case "subcategory":
          setSelectedSubcategory(value);
          break;
        case "brand":
          setSelectedBrand(value);
          break;
        case "search":
          setSearchQuery(value);
          break;
        case "sort":
          setSortBy(value);
          break;
        case "priceRange":
          setPriceRange(value);
          break;
        case "onlyOnSale":
          setOnlyOnSale(value);
          break;
        case "onlyInStock":
          setOnlyInStock(value);
          break;
        case "minRating":
          setMinRating(value);
          break;
      }
    });

    // Update URL with all current filter states - but don't include priceRange unless explicitly changed
    const urlParams: Record<string, any> = {
      category:
        filterUpdates.category !== undefined
          ? filterUpdates.category
          : selectedCategory,
      subcategory:
        filterUpdates.subcategory !== undefined
          ? filterUpdates.subcategory
          : selectedSubcategory,
      brand:
        filterUpdates.brand !== undefined ? filterUpdates.brand : selectedBrand,
      search:
        filterUpdates.search !== undefined ? filterUpdates.search : searchQuery,
      sort: filterUpdates.sort !== undefined ? filterUpdates.sort : sortBy,
      onlyOnSale:
        filterUpdates.onlyOnSale !== undefined
          ? filterUpdates.onlyOnSale
          : onlyOnSale,
      onlyInStock:
        filterUpdates.onlyInStock !== undefined
          ? filterUpdates.onlyInStock
          : onlyInStock,
      minRating:
        filterUpdates.minRating !== undefined
          ? filterUpdates.minRating
          : minRating,
    };

    // Only include priceRange in URL if it was explicitly changed in this update
    if (filterUpdates.priceRange !== undefined) {
      urlParams.priceRange = filterUpdates.priceRange;
    }

    updateURL(urlParams);

    // Simulate filter processing time for smooth UX
    setTimeout(() => {
      setFilterLoading(false);
    }, 300);
  };

  // Data fetching with better error handling
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("🔄 Starting data fetch...");

        const fetchPromises = [
          fetch("/api/categories").then((res) => (res.ok ? res.json() : null)),
          fetch("/api/brands").then((res) => (res.ok ? res.json() : null)),
          fetch("/api/products").then((res) => (res.ok ? res.json() : null)),
        ];

        const [categoriesData, brandsData, productsData] =
          await Promise.all(fetchPromises);

        // Handle categories
        if (categoriesData?.success && categoriesData.categories) {
          console.log(
            "✅ Categories fetched:",
            categoriesData.categories.length
          );
          setCategories(categoriesData.categories);
        }

        // Handle brands
        if (brandsData?.success && brandsData.brands) {
          console.log("✅ Brands fetched:", brandsData.brands.length);
          setBrands(brandsData.brands);
        }

        // Handle products - Better validation and fallbacks
        if (productsData?.success && Array.isArray(productsData.products)) {
          const validProducts = productsData.products.filter(
            (p: any) =>
              p && p.id && p.name && typeof p.price === "number" && p.price >= 0
          );

          console.log("✅ Valid products:", validProducts.length);
          setProducts(validProducts);

          // Set price range based on actual product data with safety checks
          if (validProducts.length > 0) {
            const prices = validProducts
              .map((p: DatabaseProduct) => p.price)
              .filter(
                (price: number) => typeof price === "number" && price > 0
              );

            if (prices.length > 0) {
              const minPrice = Math.floor(Math.min(...prices));
              const maxPrice = Math.ceil(Math.max(...prices));

              // Only set price range if not already set from URL params
              if (
                !searchParams.get("minPrice") &&
                !searchParams.get("maxPrice")
              ) {
                setPriceRange([0, maxPrice]);
              }

              console.log(
                `💰 Price range available: €${minPrice} - €${maxPrice}`
              );
            }
          }
        } else {
          console.warn("⚠️ No valid products found");
          setProducts([]);
        }
      } catch (error) {
        console.error("❌ Error in fetchData:", error);
        setProducts([]);
        setCategories([]);
        setBrands([]);
      } finally {
        console.log("✅ Data fetch complete");
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  // Get available subcategories based on selected category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const category = categories.find((c) => c.id === selectedCategory);
    return category?.subcategories || [];
  }, [selectedCategory, categories]);

  // FIXED: Clear filters with proper price range reset
  const clearFilters = () => {
    console.log("🧹 Clearing all filters");
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
    setOnlyOnSale(false);
    setMinRating(0);
    setOnlyInStock(false);
    setSortBy("featured");

    // Reset price range to full range
    if (products.length > 0) {
      const prices = products.map((p) => p.price).filter((p) => p > 0);
      if (prices.length > 0) {
        const maxPrice = Math.ceil(Math.max(...prices));
        setPriceRange([0, maxPrice]);
      } else {
        setPriceRange([0, 5000]);
      }
    } else {
      setPriceRange([0, 5000]);
    }

    // Clear URL params
    router.push("/products", { scroll: false });
  };

  // Count active filters
  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    priceRange[0] > 0 ||
      (products.length > 0 &&
        priceRange[1] < Math.max(...products.map((p) => p.price))),
    onlyOnSale,
    minRating > 0,
    onlyInStock,
  ].filter(Boolean).length;

  // Filter and sort products with safer operations
  const filteredProducts = useMemo(() => {
    console.log("🔍 Filtering products:", {
      totalProducts: products.length,
      searchQuery,
      selectedCategory,
      selectedBrand,
      priceRange,
      onlyOnSale,
      onlyInStock,
      minRating,
    });

    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }

    const filtered = products.filter((product) => {
      // Safety check
      if (!product || !product.name) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const productName = (product.name || "").toLowerCase();
        const brandName = (product.brand?.name || "").toLowerCase();
        const description = (product.description || "").toLowerCase();

        if (
          !productName.includes(query) &&
          !brandName.includes(query) &&
          !description.includes(query)
        ) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory && product.category?.id !== selectedCategory) {
        return false;
      }

      // Subcategory filter
      if (
        selectedSubcategory &&
        product.subcategory?.id !== selectedSubcategory
      ) {
        return false;
      }

      // Brand filter
      if (selectedBrand && product.brand?.id !== selectedBrand) {
        return false;
      }

      // Price range filter - safer range checking
      const productPrice = product.price || 0;
      if (productPrice < priceRange[0] || productPrice > priceRange[1]) {
        return false;
      }

      // On sale filter
      if (onlyOnSale && !product.comparePrice) {
        return false;
      }

      // Stock filter
      if (onlyInStock && (product.stock || 0) <= 0) {
        return false;
      }

      // Rating filter
      if (minRating > 0 && (product.avgRating || 0) < minRating) {
        return false;
      }

      // Only show active products
      return product.isActive !== false;
    });

    console.log("📊 Filtered results:", filtered.length);

    // Sort products
    const sortedProducts = [...filtered];
    switch (sortBy) {
      case "price-asc":
        sortedProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        sortedProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "rating":
        sortedProducts.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0));
        break;
      case "newest":
        sortedProducts.sort(
          (a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0)
        );
        break;
      case "featured":
      default:
        sortedProducts.sort(
          (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
        );
        break;
    }

    return sortedProducts;
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    priceRange,
    sortBy,
    onlyOnSale,
    minRating,
    onlyInStock,
  ]);

  // Create category options for dropdown
  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...categories.map((cat) => ({ label: cat.name, value: cat.id })),
  ];

  // Create subcategory options for dropdown
  const subcategoryOptions = [
    { label: "All Subcategories", value: "" },
    ...availableSubcategories.map((sub) => ({
      label: sub.name,
      value: sub.id,
    })),
  ];

  // Create brand options for dropdown
  const brandOptions = [
    { label: "All Brands", value: "" },
    ...brands.map((brand) => ({ label: brand.name, value: brand.id })),
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
          <div className="relative backdrop-blur-sm border-b border-white/20">
            <div className="container mx-auto px-4 py-8">
              <div className="text-center max-w-2xl mx-auto">
                <div className="h-8 bg-gray-200 rounded-lg mb-2 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-6">
            {/* Sidebar Skeleton */}
            <div className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="flex-1">
              <ProductGridSkeleton showToolbar={true} />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Authentication loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render content for vendors
  if (session?.user?.role === "VENDOR") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with smooth entrance */}
      <motion.div
        className="relative overflow-hidden"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={slowTransition}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>
        <div className="relative backdrop-blur-sm border-b border-white/20">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              className="text-center max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smoothTransition, delay: 0.2 }}
            >
              <h1 className="text-2xl lg:text-3xl font-light text-gray-800 mb-2 tracking-wide">
                Premium Electronics
              </h1>
              <p className="text-sm text-gray-600 leading-relaxed">
                Discover carefully curated technology from the world&apos;s most
                trusted brands
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <motion.div
            className="hidden lg:block w-64 flex-shrink-0"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...smoothTransition, delay: 0.3 }}
          >
            <div className="sticky top-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium text-gray-900">
                    Filters
                  </h3>
                  {activeFiltersCount > 0 && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={fastTransition}
                    >
                      <Button
                        onClick={clearFilters}
                        variant="ghost"
                        size="sm"
                        className="text-xs px-2 py-1 cursor-pointer"
                      >
                        Clear ({activeFiltersCount})
                      </Button>
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Search */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...smoothTransition, delay: 0.4 }}
                  >
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <motion.div
                        className="absolute left-2 top-1/2 transform -translate-y-1/2"
                        whileHover={{ scale: 1.05 }}
                        transition={fastTransition}
                      >
                        <MagnifyingGlassIcon className="w-3 h-3 text-gray-400" />
                      </motion.div>
                      <motion.input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) =>
                          handleFilterChange({ search: e.target.value })
                        }
                        whileFocus={{ scale: 1.01 }}
                        transition={fastTransition}
                        className="w-full pl-8 pr-2 py-2 text-xs border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </motion.div>

                  {/* Category Filter */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...smoothTransition, delay: 0.5 }}
                  >
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <SimpleDropdown
                      options={categoryOptions}
                      value={selectedCategory}
                      onChange={(value) =>
                        handleFilterChange({ category: value })
                      }
                    />
                  </motion.div>

                  {/* Subcategory Filter - Only show when category is selected */}
                  <AnimatePresence>
                    {availableSubcategories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -16 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -16 }}
                        transition={{ ...smoothTransition, delay: 0.6 }}
                      >
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                          Subcategory
                        </label>
                        <SimpleDropdown
                          options={subcategoryOptions}
                          value={selectedSubcategory}
                          onChange={(value) =>
                            handleFilterChange({ subcategory: value })
                          }
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Brand Filter */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...smoothTransition, delay: 0.7 }}
                  >
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <SimpleDropdown
                      options={brandOptions}
                      value={selectedBrand}
                      onChange={(value) => handleFilterChange({ brand: value })}
                    />
                  </motion.div>

                  {/* Price Range */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...smoothTransition, delay: 0.8 }}
                  >
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Price Range
                    </label>
                    <PriceRange
                      min={0}
                      max={
                        products.length > 0
                          ? Math.ceil(
                              Math.max(
                                ...products
                                  .map((p) => p.price)
                                  .filter((p) => p > 0)
                              )
                            )
                          : 5000
                      }
                      value={priceRange}
                      onChange={(value) =>
                        handleFilterChange({ priceRange: value })
                      }
                      formatValue={(val) => `€${val}`}
                    />
                  </motion.div>

                  {/* Rating Filter */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...smoothTransition, delay: 0.9 }}
                  >
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Minimum Rating
                    </label>
                    <StarRating
                      rating={minRating}
                      onChange={(value) =>
                        handleFilterChange({ minRating: value })
                      }
                    />
                  </motion.div>

                  {/* Additional Filters */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...smoothTransition, delay: 1.0 }}
                    className="space-y-3"
                  >
                    <motion.label
                      className="flex items-center cursor-pointer"
                      whileHover={{ x: 2 }}
                      transition={fastTransition}
                    >
                      <motion.input
                        type="checkbox"
                        checked={onlyOnSale}
                        onChange={(e) =>
                          handleFilterChange({ onlyOnSale: e.target.checked })
                        }
                        whileTap={{ scale: 0.95 }}
                        transition={fastTransition}
                        className="h-3 w-3 text-gray-900 focus:ring-gray-900 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-2 text-xs text-gray-700">
                        On Sale Only
                      </span>
                    </motion.label>

                    <motion.label
                      className="flex items-center cursor-pointer"
                      whileHover={{ x: 2 }}
                      transition={fastTransition}
                    >
                      <motion.input
                        type="checkbox"
                        checked={onlyInStock}
                        onChange={(e) =>
                          handleFilterChange({ onlyInStock: e.target.checked })
                        }
                        whileTap={{ scale: 0.95 }}
                        transition={fastTransition}
                        className="h-3 w-3 text-gray-900 focus:ring-gray-900 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-2 text-xs text-gray-700">
                        In Stock Only
                      </span>
                    </motion.label>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <motion.div
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 mb-4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...smoothTransition, delay: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={fastTransition}
                  >
                    <Button
                      onClick={() => setShowFilters(true)}
                      variant="outline"
                      size="sm"
                      className="lg:hidden text-xs px-2 py-1 cursor-pointer"
                    >
                      <AdjustmentsHorizontalIcon className="w-3 h-3 mr-1" />
                      Filters
                      {activeFiltersCount > 0 && (
                        <motion.span
                          className="ml-1 px-1.5 py-0.5 bg-gray-900 text-white text-xs rounded-full"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={fastTransition}
                        >
                          {activeFiltersCount}
                        </motion.span>
                      )}
                    </Button>
                  </motion.div>

                  <motion.p
                    className="text-xs font-medium text-gray-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ ...smoothTransition, delay: 0.5 }}
                  >
                    {filteredProducts.length} products found
                  </motion.p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Sort Dropdown */}
                  <SimpleDropdown
                    options={sortOptions}
                    value={sortBy}
                    onChange={(value) => handleFilterChange({ sort: value })}
                    className="w-40"
                  />

                  {/* View Toggle */}
                  <motion.div
                    className="flex bg-gray-100 rounded-md p-0.5"
                    whileHover={{ scale: 1.01 }}
                    transition={fastTransition}
                  >
                    <motion.button
                      onClick={() => setViewMode("grid")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={fastTransition}
                      className={`p-1.5 rounded transition-all duration-200 cursor-pointer ${
                        viewMode === "grid"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <Squares2X2Icon className="w-3 h-3" />
                    </motion.button>
                    <motion.button
                      onClick={() => setViewMode("list")}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={fastTransition}
                      className={`p-1.5 rounded transition-all duration-200 cursor-pointer ${
                        viewMode === "list"
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <ListBulletIcon className="w-3 h-3" />
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* Products Grid/List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ ...smoothTransition, delay: 0.6 }}
            >
              {/* Show skeleton loading during filter changes */}
              {filterLoading ? (
                <ProductGridSkeleton viewMode={viewMode} showToolbar={false} />
              ) : filteredProducts.length > 0 ? (
                viewMode === "grid" ? (
                  <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    <AnimatePresence mode="wait">
                      {filteredProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 16, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{
                            ...smoothTransition,
                            delay: index * 0.03,
                          }}
                          whileHover={{ y: -1, scale: 1.01 }}
                          className="flex h-full"
                        >
                          <ProductCard
                            product={transformProduct(product)}
                            variant="default"
                            showQuickActions={true}
                            showAddToCart={true}
                            className="h-full w-full flex flex-col"
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div className="space-y-4">
                    <AnimatePresence mode="wait">
                      {filteredProducts.map((product, index) => (
                        <motion.div
                          key={product.id}
                          initial={{ opacity: 0, y: 16, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.96 }}
                          transition={{
                            ...smoothTransition,
                            delay: index * 0.03,
                          }}
                          whileHover={{ y: -1, scale: 1.01 }}
                          className="w-full"
                        >
                          <ProductCard
                            product={transformProduct(product)}
                            variant="compact"
                            showQuickActions={true}
                            showAddToCart={true}
                            className="w-full"
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )
              ) : (
                /* Empty State */
                <motion.div
                  className="text-center py-12"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...smoothTransition, delay: 0.3 }}
                >
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 max-w-sm mx-auto">
                    <motion.div
                      className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center"
                      initial={{ rotate: -5 }}
                      animate={{ rotate: 0 }}
                      transition={smoothTransition}
                    >
                      <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
                    </motion.div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {products.length === 0
                        ? "No products are currently available. Please check back later."
                        : "Try adjusting your filters to discover more products"}
                    </p>
                    {activeFiltersCount > 0 && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={fastTransition}
                      >
                        <Button
                          onClick={clearFilters}
                          variant="default"
                          size="sm"
                          className="text-sm px-6 py-2 cursor-pointer"
                        >
                          Clear All Filters
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fastTransition}
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              className="w-80 h-full bg-white shadow-2xl overflow-y-auto"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={smoothTransition}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                  <motion.button
                    onClick={() => setShowFilters(false)}
                    whileHover={{ scale: 1.05, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    transition={fastTransition}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="w-5 h-5 text-gray-600" />
                  </motion.button>
                </div>

                {/* Mobile filter content - same as desktop but with mobile styling */}
                <div className="space-y-6">
                  {/* Mobile Search */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Search
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) =>
                          handleFilterChange({ search: e.target.value })
                        }
                        className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Mobile Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Category
                    </label>
                    <SimpleDropdown
                      options={categoryOptions}
                      value={selectedCategory}
                      onChange={(value) =>
                        handleFilterChange({ category: value })
                      }
                    />
                  </div>

                  {/* Mobile Subcategory */}
                  {availableSubcategories.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Subcategory
                      </label>
                      <SimpleDropdown
                        options={subcategoryOptions}
                        value={selectedSubcategory}
                        onChange={(value) =>
                          handleFilterChange({ subcategory: value })
                        }
                      />
                    </div>
                  )}

                  {/* Mobile Brand */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Brand
                    </label>
                    <SimpleDropdown
                      options={brandOptions}
                      value={selectedBrand}
                      onChange={(value) => handleFilterChange({ brand: value })}
                    />
                  </div>

                  {/* Mobile Price Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Price Range
                    </label>
                    <PriceRange
                      min={0}
                      max={
                        products.length > 0
                          ? Math.ceil(
                              Math.max(
                                ...products
                                  .map((p) => p.price)
                                  .filter((p) => p > 0)
                              )
                            )
                          : 5000
                      }
                      value={priceRange}
                      onChange={(value) =>
                        handleFilterChange({ priceRange: value })
                      }
                      formatValue={(val) => `€${val}`}
                    />
                  </div>

                  {/* Mobile Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Minimum Rating
                    </label>
                    <StarRating
                      rating={minRating}
                      onChange={(value) =>
                        handleFilterChange({ minRating: value })
                      }
                    />
                  </div>

                  {/* Mobile Toggles */}
                  <div className="space-y-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlyOnSale}
                        onChange={(e) =>
                          handleFilterChange({ onlyOnSale: e.target.checked })
                        }
                        className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        On Sale Only
                      </span>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onlyInStock}
                        onChange={(e) =>
                          handleFilterChange({ onlyInStock: e.target.checked })
                        }
                        className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        In Stock Only
                      </span>
                    </label>
                  </div>

                  {/* Apply Filters Button */}
                  <Button
                    onClick={() => setShowFilters(false)}
                    variant="default"
                    size="sm"
                    className="w-full text-sm px-4 py-3 cursor-pointer"
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

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsPageContent />
    </Suspense>
  );
}

///ok version
