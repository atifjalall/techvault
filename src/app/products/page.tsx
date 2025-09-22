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

// Types based on your Prisma schema
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  subcategories: Subcategory[];
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

interface DatabaseProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  brand?: Brand;
  category: Category;
  subcategory?: Subcategory;
  stock: number;
  isActive: boolean;
  featured: boolean;
  newArrival: boolean;
  reviews: { rating: number }[];
  _count: {
    reviews: number;
  };
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

// Price Range Component with simple validation
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

  // Update local values when props change
  useEffect(() => {
    setLocalMin(value[0].toString());
    setLocalMax(value[1].toString());
  }, [value]);

  const handleMinChange = (inputValue: string) => {
    // Allow empty string for deletion
    if (inputValue === "") {
      setLocalMin("");
      return;
    }

    // Only allow numbers
    const numericValue = inputValue.replace(/[^0-9]/g, "");
    setLocalMin(numericValue);

    const num = parseInt(numericValue) || min;
    const clampedValue = Math.max(min, Math.min(num, value[1]));
    onChange([clampedValue, value[1]]);
  };

  const handleMaxChange = (inputValue: string) => {
    // Allow empty string for deletion
    if (inputValue === "") {
      setLocalMax("");
      return;
    }

    // Only allow numbers
    const numericValue = inputValue.replace(/[^0-9]/g, "");
    setLocalMax(numericValue);

    const num = parseInt(numericValue) || max;
    const clampedValue = Math.min(max, Math.max(num, value[0]));
    onChange([value[0], clampedValue]);
  };

  const handleMinBlur = () => {
    if (localMin === "" || parseInt(localMin) < min) {
      setLocalMin(min.toString());
      onChange([min, value[1]]);
    }
  };

  const handleMaxBlur = () => {
    if (
      localMax === "" ||
      parseInt(localMax) > max ||
      parseInt(localMax) < value[0]
    ) {
      const correctedValue = Math.min(
        max,
        Math.max(value[0], parseInt(localMax) || max)
      );
      setLocalMax(correctedValue.toString());
      onChange([value[0], correctedValue]);
    }
  };

  return (
    <div className="space-y-3">
      <motion.div
        className="flex justify-between text-sm text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={smoothTransition}
      >
        <span>{formatValue(value[0])}</span>
        <span>{formatValue(value[1])}</span>
      </motion.div>

      <div className="relative">
        <div className="flex space-x-2">
          <motion.input
            type="text"
            value={localMin}
            onChange={(e) => handleMinChange(e.target.value)}
            onBlur={handleMinBlur}
            whileFocus={{ scale: 1.01 }}
            transition={fastTransition}
            className="w-full px-2 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
            placeholder="Min"
          />
          <motion.input
            type="text"
            value={localMax}
            onChange={(e) => handleMaxChange(e.target.value)}
            onBlur={handleMaxBlur}
            whileFocus={{ scale: 1.01 }}
            transition={fastTransition}
            className="w-full px-2 py-2 text-sm border border-gray-200 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
            placeholder="Max"
          />
        </div>
      </div>
    </div>
  );
}

// Star Rating Component with refined animations
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
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={fastTransition}
          className="focus:outline-none transition-colors duration-150 cursor-pointer"
        >
          <motion.div
            animate={{
              color: star <= (hovered || rating) ? "#fbbf24" : "#d1d5db",
              fill: star <= (hovered || rating) ? "#fbbf24" : "none",
            }}
            transition={fastTransition}
          >
            <StarIcon className="h-5 w-5" />
          </motion.div>
        </motion.button>
      ))}
    </div>
  );
}

// Loading Skeleton Component for both initial load and filter changes
function ProductGridSkeleton({
  viewMode = "grid",
  showToolbar = true,
}: {
  viewMode?: ViewMode;
  showToolbar?: boolean;
}) {
  return (
    <>
      {/* Premium Bar Skeleton - only show during initial load */}
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

      {/* Products Grid Skeleton */}
      <div
        className={`${
          viewMode === "grid"
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
            : "space-y-4"
        }`}
        style={{ gridAutoRows: viewMode === "grid" ? "1fr" : "auto" }}
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
                : "flex flex-col h-full"
            }`}
          >
            {viewMode === "list" ? (
              // List view skeleton
              <>
                <div className="w-12 h-12 bg-gray-200 rounded-md flex-shrink-0 animate-pulse"></div>
                <div className="flex-1 ml-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              </>
            ) : (
              // Grid view skeleton - matches ProductCard structure
              <>
                {/* Image area */}
                <div className="aspect-square bg-gray-200 rounded-lg mb-3 animate-pulse relative">
                  <div className="absolute top-2 left-2 w-8 h-4 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="absolute top-2 right-2 w-6 h-6 bg-gray-300 rounded-full animate-pulse"></div>
                </div>

                {/* Content area */}
                <div className="p-4 flex-1 flex flex-col space-y-2">
                  {/* Brand */}
                  <div className="h-3 bg-gray-200 rounded w-1/3 animate-pulse"></div>

                  {/* Product name */}
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>

                  {/* Rating */}
                  <div className="flex space-x-1 my-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="w-2.5 h-2.5 bg-gray-200 rounded-full animate-pulse"
                      ></div>
                    ))}
                  </div>

                  {/* Price */}
                  <div className="flex items-center space-x-2 mt-auto">
                    <div className="h-5 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                  </div>

                  {/* From label */}
                  <div className="h-3 bg-gray-200 rounded w-8 animate-pulse"></div>

                  {/* Button */}
                  <div className="h-10 bg-gray-200 rounded-lg mt-3 animate-pulse"></div>
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

function transformProduct(dbProduct: DatabaseProduct): ProductCardType {
  const avgRating =
    dbProduct.reviews.length > 0
      ? dbProduct.reviews.reduce((sum, review) => sum + review.rating, 0) /
        dbProduct.reviews.length
      : 0;

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    brand: dbProduct.brand?.name,
    price: dbProduct.price,
    originalPrice: dbProduct.comparePrice,
    image: dbProduct.images[0] || "/api/placeholder/400/400",
    images: dbProduct.images,
    variants:
      dbProduct.images.length > 1
        ? `${dbProduct.images.length} images`
        : undefined,
    isNew: dbProduct.newArrival,
    isFeatured: dbProduct.featured,
    category: dbProduct.category.name,
    rating: avgRating > 0 ? avgRating : undefined,
    reviewCount:
      dbProduct._count.reviews > 0 ? dbProduct._count.reviews : undefined,
    slug: dbProduct.slug, // Ensure this is always present
    description: dbProduct.description,
    stock: dbProduct.stock,
    isActive: dbProduct.isActive,
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

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, session, router]);
  // Initialize filters from URL params
  useEffect(() => {
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sale = searchParams.get("sale") || searchParams.get("onlyOnSale");
    const stock = searchParams.get("stock");
    const rating = searchParams.get("rating");

    if (category) setSelectedCategory(category);
    if (subcategory) setSelectedSubcategory(subcategory);
    if (brand) setSelectedBrand(brand);
    if (search) setSearchQuery(search);
    if (sort) setSortBy(sort);
    if (minPrice && maxPrice)
      setPriceRange([parseInt(minPrice), parseInt(maxPrice)]);
    if (sale === "true") setOnlyOnSale(true);
    if (stock === "true") setOnlyInStock(true);
    if (rating) setMinRating(parseInt(rating));
  }, [searchParams]);

  // Update URL when filters change
  const updateURL = (newParams: Record<string, string | number | boolean>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "" || value === false || value === 0) {
        params.delete(key);
      } else {
        params.set(key, value.toString());
      }
    });

    // Clean up empty params
    if (!searchQuery) params.delete("search");
    if (!selectedCategory) params.delete("category");
    if (!selectedSubcategory) params.delete("subcategory");
    if (!selectedBrand) params.delete("brand");
    if (sortBy === "featured") params.delete("sort");
    if (!onlyOnSale) {
      params.delete("sale");
      params.delete("onlyOnSale");
    }
    if (!onlyInStock) params.delete("stock");
    if (minRating === 0) params.delete("rating");

    router.push(`/products?${params.toString()}`, { scroll: false });
  };

  // Handle filter changes with loading state
  const handleFilterChange = async (filterUpdates: Record<string, any>) => {
    setFilterLoading(true);

    // Apply filter updates
    Object.entries(filterUpdates).forEach(([key, value]) => {
      switch (key) {
        case "category":
          setSelectedCategory(value);
          setSelectedSubcategory(""); // Reset subcategory when category changes
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

    // Update URL
    updateURL(filterUpdates);

    // Simulate filter processing time for smooth UX
    setTimeout(() => {
      setFilterLoading(false);
    }, 300);
  };

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories with subcategories
        try {
          const categoriesRes = await fetch("/api/categories");
          if (categoriesRes.ok) {
            const categoriesData = await categoriesRes.json();
            if (categoriesData.success) {
              setCategories(categoriesData.categories);
            }
          }
        } catch (error) {
          console.error("Error fetching categories:", error);
        }

        // Fetch brands
        try {
          const brandsRes = await fetch("/api/brands");
          if (brandsRes.ok) {
            const brandsData = await brandsRes.json();
            if (brandsData.success) {
              setBrands(brandsData.brands);
            }
          }
        } catch (error) {
          console.error("Error fetching brands:", error);
        }

        // Fetch products
        try {
          const productsRes = await fetch("/api/products");
          if (productsRes.ok) {
            const productsData = await productsRes.json();
            if (productsData.success && productsData.products.length > 0) {
              setProducts(productsData.products);

              // Set initial price range based on actual product prices
              const prices = productsData.products.map(
                (p: DatabaseProduct) => p.price
              );
              const minPrice = Math.floor(Math.min(...prices));
              const maxPrice = Math.ceil(Math.max(...prices));
              setPriceRange([minPrice, maxPrice]);
            } else {
              // No products found, set default price range
              setPriceRange([0, 5000]);
            }
          } else {
            console.warn("Products API endpoint not found, using empty state");
            setPriceRange([0, 5000]);
          }
        } catch (error) {
          console.error("Error fetching products:", error);
          // Set default price range when API fails
          setPriceRange([0, 5000]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get available subcategories based on selected category
  const availableSubcategories = useMemo(() => {
    if (!selectedCategory) return [];
    const category = categories.find((c) => c.id === selectedCategory);
    return category?.subcategories || [];
  }, [selectedCategory, categories]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
    if (products.length > 0) {
      const prices = products.map((p) => p.price);
      setPriceRange([
        Math.floor(Math.min(...prices)),
        Math.ceil(Math.max(...prices)),
      ]);
    }
    setOnlyOnSale(false);
    setMinRating(0);
    setOnlyInStock(false);
    setSortBy("featured");

    // Clear URL params
    router.push("/products", { scroll: false });
  };

  const activeFiltersCount = [
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    products.length > 0 &&
      (priceRange[0] > Math.min(...products.map((p) => p.price)) ||
        priceRange[1] < Math.max(...products.map((p) => p.price))),
    onlyOnSale,
    minRating > 0,
    onlyInStock,
  ].filter(Boolean).length;

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !product.name.toLowerCase().includes(query) &&
          !product.brand?.name.toLowerCase().includes(query) &&
          !product.description?.toLowerCase().includes(query)
        ) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory && product.category.id !== selectedCategory) {
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

      // Price range filter
      if (product.price < priceRange[0] || product.price > priceRange[1]) {
        return false;
      }

      // On sale filter
      if (onlyOnSale && !product.comparePrice) {
        return false;
      }

      // Stock filter
      if (onlyInStock && product.stock <= 0) {
        return false;
      }

      // Rating filter
      if (minRating > 0) {
        const avgRating =
          product.reviews.length > 0
            ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
              product.reviews.length
            : 0;
        if (avgRating < minRating) {
          return false;
        }
      }

      // Only show active products
      return product.isActive;
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
        filtered.sort((a, b) => {
          const aRating =
            a.reviews.length > 0
              ? a.reviews.reduce((sum, review) => sum + review.rating, 0) /
                a.reviews.length
              : 0;
          const bRating =
            b.reviews.length > 0
              ? b.reviews.reduce((sum, review) => sum + review.rating, 0) /
                b.reviews.length
              : 0;
          return bRating - aRating;
        });
        break;
      case "newest":
        filtered.sort(
          (a, b) => (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0)
        );
        break;
      case "featured":
      default:
        filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
        break;
    }

    return filtered;
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

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-black rounded-full animate-spin"></div>
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
                          ? Math.ceil(Math.max(...products.map((p) => p.price)))
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
              ) : viewMode === "grid" ? (
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6"
                  style={{ gridAutoRows: "1fr" }}
                >
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
                        className="flex"
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
              )}
            </motion.div>

            {/* Empty State */}
            {filteredProducts.length === 0 && !filterLoading && (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...smoothTransition, delay: 0.3 }}
              >
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 max-w-sm mx-auto">
                  <motion.div
                    className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center"
                    initial={{ rotate: -5 }}
                    animate={{ rotate: 0 }}
                    transition={smoothTransition}
                  >
                    <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
                  </motion.div>
                  <h3 className="text-base font-medium text-gray-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-xs text-gray-600 mb-4">
                    Try adjusting your filters to discover more products
                  </p>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={fastTransition}
                  >
                    <Button
                      onClick={clearFilters}
                      variant="default"
                      size="sm"
                      className="text-xs px-4 py-1.5 cursor-pointer"
                    >
                      Clear All Filters
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
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

                <div className="space-y-6">
                  {/* Mobile Search */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...smoothTransition, delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Search
                    </label>
                    <div className="relative">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <motion.input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) =>
                          handleFilterChange({ search: e.target.value })
                        }
                        whileFocus={{ scale: 1.01 }}
                        transition={fastTransition}
                        className="w-full pl-10 pr-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                      />
                    </div>
                  </motion.div>

                  {/* Mobile Category */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...smoothTransition, delay: 0.2 }}
                  >
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
                  </motion.div>

                  {/* Mobile Subcategory - Only show when category is selected */}
                  <AnimatePresence>
                    {availableSubcategories.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, x: -16 }}
                        animate={{ opacity: 1, height: "auto", x: 0 }}
                        exit={{ opacity: 0, height: 0, x: -16 }}
                        transition={{ ...smoothTransition, delay: 0.3 }}
                      >
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
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mobile Brand */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...smoothTransition, delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Brand
                    </label>
                    <SimpleDropdown
                      options={brandOptions}
                      value={selectedBrand}
                      onChange={(value) => handleFilterChange({ brand: value })}
                    />
                  </motion.div>

                  {/* Mobile Price Range */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...smoothTransition, delay: 0.5 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Price Range
                    </label>
                    <PriceRange
                      min={0}
                      max={
                        products.length > 0
                          ? Math.ceil(Math.max(...products.map((p) => p.price)))
                          : 5000
                      }
                      value={priceRange}
                      onChange={(value) =>
                        handleFilterChange({ priceRange: value })
                      }
                      formatValue={(val) => `€${val}`}
                    />
                  </motion.div>

                  {/* Mobile Rating */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...smoothTransition, delay: 0.6 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Minimum Rating
                    </label>
                    <StarRating
                      rating={minRating}
                      onChange={(value) =>
                        handleFilterChange({ minRating: value })
                      }
                    />
                  </motion.div>

                  {/* Mobile Toggles */}
                  <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...smoothTransition, delay: 0.7 }}
                    className="space-y-4"
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
                        className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-gray-700">
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
                        className="h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded cursor-pointer"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        In Stock Only
                      </span>
                    </motion.label>
                  </motion.div>

                  {/* Apply Filters Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ ...smoothTransition, delay: 0.8 }}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      onClick={() => setShowFilters(false)}
                      variant="default"
                      size="sm"
                      className="w-full text-sm px-4 py-3 cursor-pointer"
                    >
                      Apply Filters
                    </Button>
                  </motion.div>

                  {/* Clear Filters */}
                  {activeFiltersCount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...smoothTransition, delay: 0.9 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
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
                    </motion.div>
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
