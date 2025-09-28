// src/app/store/[storeId]/page.tsx - Customer-facing vendor store page
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  StarIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  TruckIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { CheckBadgeIcon as CheckBadgeIconSolid } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/buttonSidebar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductCard from "@/components/ui/ProductCard";

// Define Product interface locally to match ProductCard expectations
interface Product {
  id: string | number;
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  variants?: string | number;
  isNew?: boolean;
  isFeatured?: boolean;
  category?: string;
  rating?: number;
  reviewCount?: number;
  slug: string;
  description?: string;
  stock?: number;
  isActive?: boolean;
}
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

// Animation configurations
const smoothTransition = { duration: 0.4 };

// Types
interface VendorStore {
  id: string;
  name: string;
  businessName: string;
  description: string;
  image: string;
  location: string;
  rating: number;
  totalReviews: number;
  totalProducts: number;
  joinedDate: string;
  verified: boolean;
  responseTime: string;
  shippingTime: string;
  returnPolicy: string;
  categories: string[];
  followers: number;
}

interface Category {
  id: string;
  name: string;
  count: number;
}

interface Brand {
  id: string;
  name: string;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

interface ApiResponse {
  success: boolean;
  vendor?: VendorStore;
  categories?: Category[];
  brands?: Brand[];
  error?: string;
}

interface ProductsResponse {
  success: boolean;
  products?: Product[];
  pagination?: Pagination;
  error?: string;
}

// Skeleton Components
function VendorHeaderSkeleton() {
  return (
    <div className="backdrop-blur-xl bg-white/70 border-b border-white/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          <div className="flex items-start gap-4 flex-1">
            <Skeleton className="w-20 h-20 rounded-full flex-shrink-0" />
            <div className="flex-1 min-w-0 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-20" />
                </div>
                <Skeleton className="h-4 w-32" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-4 w-full max-w-md" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
          <div className="flex-shrink-0">
            <div className="grid grid-cols-3 gap-3">
              <Skeleton className="h-16 w-20" />
              <Skeleton className="h-16 w-20" />
              <Skeleton className="h-16 w-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="shadow-sm bg-white border border-slate-200/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>

      <Card className="shadow-sm bg-white border border-slate-200/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div>
            <Skeleton className="h-3 w-12 mb-2" />
            <Skeleton className="h-9 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm bg-white border border-slate-200/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card
          key={i}
          className="overflow-hidden group backdrop-blur-xl bg-white/70 border border-white/50"
        >
          <div className="aspect-square relative">
            <Skeleton className="w-full h-full" />
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Pagination Component
function Pagination({
  currentPage,
  totalPages,
  totalCount,
  itemsPerPage,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalCount);

  const getVisiblePages = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots.filter(
      (page, index, array) => array.indexOf(page) === index
    );
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-slate-600">
        Showing {startItem} to {endItem} of {totalCount} products
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 px-3 text-xs cursor-pointer backdrop-blur-xl bg-white/70 border-white/50"
        >
          <ChevronLeftIcon className="w-3 h-3 mr-1" />
          Previous
        </Button>

        <div className="flex space-x-1">
          {getVisiblePages().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="px-2 text-slate-400">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`w-8 h-8 text-xs cursor-pointer ${
                    currentPage === page
                      ? "bg-slate-900 hover:bg-slate-800 text-white"
                      : "backdrop-blur-xl bg-white/70 border-white/50"
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 px-3 text-xs cursor-pointer backdrop-blur-xl bg-white/70 border-white/50"
        >
          Next
          <ChevronRightIcon className="w-3 h-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// Vendor Store Header Component
function VendorStoreHeader({ vendor }: { vendor: VendorStore }) {
  return (
    <div className="backdrop-blur-xl bg-white/70 border-b border-white/50">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6">
          {/* Vendor Info */}
          <div className="flex items-start gap-4 flex-1">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-white shadow-sm">
                <Image
                  src={vendor.image || "/placeholder-store.jpg"}
                  alt={vendor.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              </div>
              {vendor.verified && (
                <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center">
                  <CheckBadgeIconSolid className="w-5 h-5 text-blue-500" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-lg font-semibold text-slate-900 truncate">
                      {vendor.businessName || vendor.name}
                    </h1>
                    <Badge
                      variant="secondary"
                      className="text-xs flex-shrink-0"
                    >
                      Official Store
                    </Badge>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
                    <MapPinIcon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{vendor.location}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm mb-2">
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{vendor.rating}</span>
                      <span className="text-slate-500">
                        ({vendor.totalReviews.toLocaleString()})
                      </span>
                    </div>
                    <div className="text-slate-500">
                      {vendor.totalProducts} products
                    </div>
                    <div className="text-slate-500">
                      {vendor.followers.toLocaleString()} followers
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-2">
                    {vendor.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  <span>
                    Joined {new Date(vendor.joinedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <ChatBubbleBottomCenterTextIcon className="w-3 h-3" />
                  <span>Usually responds in {vendor.responseTime}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Store Stats */}
          <div className="flex-shrink-0">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center gap-1 px-3 py-2 backdrop-blur-xl bg-white/50 border border-white/30 rounded-lg min-w-[70px]">
                <ClockIcon className="w-4 h-4 text-slate-400" />
                <div className="text-center">
                  <div className="text-xs font-medium text-slate-900">
                    Response
                  </div>
                  <div className="text-xs text-slate-500">
                    {vendor.responseTime}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 px-3 py-2 backdrop-blur-xl bg-white/50 border border-white/30 rounded-lg min-w-[70px]">
                <TruckIcon className="w-4 h-4 text-slate-400" />
                <div className="text-center">
                  <div className="text-xs font-medium text-slate-900">
                    Shipping
                  </div>
                  <div className="text-xs text-slate-500">
                    {vendor.shippingTime}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 px-3 py-2 backdrop-blur-xl bg-white/50 border border-white/30 rounded-lg min-w-[70px]">
                <ShieldCheckIcon className="w-4 h-4 text-slate-400" />
                <div className="text-center">
                  <div className="text-xs font-medium text-slate-900">
                    Returns
                  </div>
                  <div className="text-xs text-slate-500">
                    {vendor.returnPolicy}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Content Component
function VendorStoreContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Debug log
  console.log("Component render - params:", params.storeId);

  const [vendor, setVendor] = useState<VendorStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debug log for state
  console.log("Component state:", {
    loading,
    vendor: !!vendor,
    error,
    productsLoading,
  });

  // Pagination
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    searchParams.get("subcategory") || ""
  );
  const [selectedBrand, setSelectedBrand] = useState(
    searchParams.get("brand") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");

  // Fetch vendor data
  const loadVendorData = useCallback(async () => {
    console.log("1. Starting loadVendorData for:", params.storeId);
    setLoading(true);
    setError(null);

    try {
      console.log("2. About to fetch vendor data");
      const response = await fetch(`/api/store/${params.storeId}`);
      const data: ApiResponse = await response.json();

      console.log("3. Vendor data received:", data.success);

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch vendor data");
      }

      if (data.success && data.vendor) {
        console.log("4. Setting vendor data");
        setVendor(data.vendor);
        setCategories(data.categories || []);
        setBrands(data.brands || []);
        console.log("5. Vendor data set successfully");
      } else {
        throw new Error("Vendor not found");
      }
    } catch (err) {
      console.log("6. Error occurred:", err);
      setError(err instanceof Error ? err.message : "Failed to load vendor");
    } finally {
      console.log("7. Setting loading to false");
      setLoading(false);
    }
  }, [params.storeId]);

  // Fetch products
  const loadProducts = useCallback(
    async (page: number) => {
      console.log("1. Starting loadProducts for page:", page);
      setProductsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
          ...(searchTerm && { search: searchTerm }),
          ...(selectedCategory && { category: selectedCategory }),
          ...(selectedSubcategory && { subcategory: selectedSubcategory }),
          ...(selectedBrand && { brand: selectedBrand }),
          ...(sortBy && { sort: sortBy }),
        });

        console.log("2. About to fetch products");
        const response = await fetch(
          `/api/store/${params.storeId}/products?${queryParams}`
        );
        const data: ProductsResponse = await response.json();

        console.log(
          "3. Products data received:",
          data.success,
          "products count:",
          data.products?.length
        );

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch products");
        }

        if (data.success) {
          setProducts(data.products || []);
          setPagination(
            data.pagination || {
              page: 1,
              limit: 12,
              totalCount: 0,
              totalPages: 0,
            }
          );
          console.log("4. Products set successfully");
        }
      } catch (err) {
        console.log("5. Products error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
        setProducts([]);
      } finally {
        console.log("6. Setting productsLoading to false");
        setProductsLoading(false);
      }
    },
    [
      params.storeId,
      searchTerm,
      selectedCategory,
      selectedSubcategory,
      selectedBrand,
      sortBy,
      pagination.limit,
    ]
  );

  // Load vendor data on mount
  useEffect(() => {
    console.log("useEffect: loadVendorData triggered");
    if (params.storeId) {
      loadVendorData();
    }
  }, [params.storeId, loadVendorData]);

  // Fetch subcategories when category changes
  const loadSubcategories = useCallback(
    async (categoryName: string) => {
      if (!categoryName) {
        setSubcategories([]);
        return;
      }

      try {
        console.log("Loading subcategories for category:", categoryName);
        const response = await fetch(
          `/api/store/${params.storeId}/subcategories?category=${encodeURIComponent(categoryName)}`
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setSubcategories(data.subcategories || []);
          console.log("Subcategories loaded:", data.subcategories?.length);
        }
      } catch (err) {
        console.error("Error loading subcategories:", err);
        setSubcategories([]);
      }
    },
    [params.storeId]
  );

  // Load subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadSubcategories(selectedCategory);
    } else {
      setSubcategories([]);
      setSelectedSubcategory(""); // Clear subcategory when no category selected
    }
  }, [selectedCategory, loadSubcategories]);

  // Load products when vendor is ready
  useEffect(() => {
    console.log("useEffect: loadProducts triggered - vendor exists:", !!vendor);
    if (vendor) {
      console.log("Loading products because vendor is ready");
      loadProducts(1);
    }
  }, [vendor, loadProducts]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
      case "category":
        setSelectedCategory(value);
        setSelectedSubcategory("");
        break;
      case "subcategory":
        setSelectedSubcategory(value);
        break;
      case "brand":
        setSelectedBrand(value);
        break;
      case "sort":
        setSortBy(value);
        break;
    }
  };

  const handlePageChange = (page: number) => {
    loadProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
    setSortBy("newest");
  };

  // Dynamic subcategory options from database
  const subcategoryOptions = [
    { label: "All Subcategories", value: "" },
    ...subcategories.map((sub) => ({ label: sub.name, value: sub.name })),
  ];

  // Debug final render state
  console.log(
    "About to render - loading:",
    loading,
    "vendor:",
    !!vendor,
    "error:",
    error
  );

  if (loading) {
    console.log("Rendering loading state");
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        {/* Breadcrumb Skeleton */}
        <Card className="border-0 shadow-sm backdrop-blur-xl bg-white/70 border-b border-white/50 rounded-none">
          <CardContent className="p-4">
            <div className="container mx-auto px-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-1" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-1" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>

        <VendorHeaderSkeleton />

        <div className="container mx-auto px-4 py-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4 hidden lg:block sticky top-4 self-start">
              <FiltersSkeleton />
            </div>
            <div className="lg:col-span-3 space-y-4">
              <Card className="border-0 shadow-sm backdrop-blur-xl bg-white/70 border border-white/50">
                <CardContent className="px-4 py-3">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !vendor) {
    console.log("Rendering error state");
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto text-center"
        >
          <Card className="border-0 shadow-sm backdrop-blur-xl bg-white/70 border border-white/50">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BuildingStorefrontIcon className="w-6 h-6 text-slate-400" />
              </div>
              <h1 className="text-base font-semibold text-slate-900 mb-1">
                {error || "Store Not Found"}
              </h1>
              <p className="text-sm text-slate-600 mb-4">
                {error === "Store not found" || error === "Vendor not found"
                  ? "The store you're looking for doesn't exist."
                  : "There was an error loading the store. Please try again."}
              </p>
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => window.location.reload()}
                  className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Retry
                </Button>
                <Link
                  href="/products"
                  className="inline-flex items-center px-4 py-2 bg-slate-100 text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Browse All Products
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Count active filters
  const activeFiltersCount = [
    searchTerm,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
  ].filter(Boolean).length;

  console.log("Rendering main content");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header with Breadcrumb */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-0 shadow-sm backdrop-blur-xl bg-white/70 border-b border-white/50 rounded-none">
          <CardContent className="p-4">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbPage>{vendor.businessName}</BreadcrumbPage>
                  </BreadcrumbList>
                </Breadcrumb>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vendor Header */}
      <VendorStoreHeader vendor={vendor} />

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-4 space-y-4"
      >
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 space-y-4 hidden lg:block sticky top-18 self-start"
          >
            {/* Search Products */}
            <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Search Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search in store..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 h-9 text-sm bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories & Brands */}
            <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Category Select */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Category
                  </label>
                  <Select
                    value={selectedCategory || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "category",
                        value === "all" ? "" : value
                      )
                    }
                  >
                    <SelectTrigger className="w-full bg-white border-slate-200 focus:border-slate-400">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name} ({category.count})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subcategory Select */}
                {selectedCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Subcategory
                    </label>
                    <Select
                      value={selectedSubcategory || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(
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
                        {subcategoryOptions.slice(1).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}

                {/* Brand Select */}
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-2">
                    Brand
                  </label>
                  <Select
                    value={selectedBrand || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("brand", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="w-full bg-white border-slate-200 focus:border-slate-400">
                      <SelectValue placeholder="All Brands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Brands</SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.name}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Store Information */}
            <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Store Information
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Total Products</span>
                    <span className="font-medium text-slate-900">
                      {vendor.totalProducts}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Store Rating</span>
                    <div className="flex items-center gap-1">
                      <StarIcon className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium text-slate-900">
                        {vendor.rating}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Followers</span>
                    <span className="font-medium text-slate-900">
                      {vendor.followers.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Member Since</span>
                    <span className="font-medium text-slate-900">
                      {new Date(vendor.joinedDate).getFullYear()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mobile Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:hidden space-y-4"
          >
            {/* Mobile Search */}
            <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
              <CardContent className="p-4">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search in store..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-9 h-9 text-sm bg-white border-slate-200 focus:border-slate-400 focus:ring-slate-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mobile Filters Row */}
            <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Category
                    </label>
                    <Select
                      value={selectedCategory || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "category",
                          value === "all" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger className="w-full bg-white border-slate-200 focus:border-slate-400">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name} ({category.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedCategory && (
                    <motion.div
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <label className="block text-xs font-medium text-slate-700 mb-2">
                        Subcategory
                      </label>
                      <Select
                        value={selectedSubcategory || "all"}
                        onValueChange={(value) =>
                          handleFilterChange(
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
                          {subcategoryOptions.slice(1).map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-2">
                      Brand
                    </label>
                    <Select
                      value={selectedBrand || "all"}
                      onValueChange={(value) =>
                        handleFilterChange(
                          "brand",
                          value === "all" ? "" : value
                        )
                      }
                    >
                      <SelectTrigger className="w-full bg-white border-slate-200 focus:border-slate-400">
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.name}>
                            {brand.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3 space-y-4"
          >
            {/* Top Filter Bar */}
            <Card className="border-0 shadow-sm backdrop-blur-xl bg-white/70 border border-white/50">
              <CardContent className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600">
                    {pagination.totalCount} products found
                  </div>

                  <div className="flex items-center gap-2">
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearFilters}
                        className="text-xs px-3 py-1.5 cursor-pointer backdrop-blur-xl bg-white/70 border-white/50 hover:bg-white/80"
                      >
                        Clear Filters ({activeFiltersCount})
                      </Button>
                    )}
                    <Select
                      value={sortBy}
                      onValueChange={(value) =>
                        handleFilterChange("sort", value)
                      }
                    >
                      <SelectTrigger className="w-40 backdrop-blur-xl bg-white/70 border-white/50">
                        <SelectValue placeholder="Featured" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="price-asc">
                          Price: Low to High
                        </SelectItem>
                        <SelectItem value="price-desc">
                          Price: High to Low
                        </SelectItem>
                        <SelectItem value="rating">Best Rating</SelectItem>
                        <SelectItem value="popular">Most Popular</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products Grid */}
            {productsLoading ? (
              <ProductGridSkeleton />
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence mode="wait">
                    {products.map((product, index) => {
                      // Validate product data before rendering
                      if (!product.id || typeof product.name !== "string") {
                        console.warn("Invalid product data:", product);
                        return null;
                      }

                      return (
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
                            product={product}
                            variant="default"
                            showQuickActions={true}
                            showAddToCart={true}
                            className="h-full w-full flex flex-col"
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-6">
                    <Card className="border-0 shadow-sm backdrop-blur-xl bg-white/70 border border-white/50">
                      <CardContent className="p-4">
                        <Pagination
                          currentPage={pagination.page}
                          totalPages={pagination.totalPages}
                          totalCount={pagination.totalCount}
                          itemsPerPage={pagination.limit}
                          onPageChange={handlePageChange}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </>
            ) : (
              <Card className="border-0 shadow-sm backdrop-blur-xl bg-white/70 border border-white/50">
                <CardContent className="p-8">
                  <div className="text-center">
                    <motion.div
                      className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center"
                      initial={{ rotate: -5 }}
                      animate={{ rotate: 0 }}
                      transition={smoothTransition}
                    >
                      <BuildingStorefrontIcon className="w-8 h-8 text-slate-400" />
                    </motion.div>
                    <h3 className="text-base font-medium text-slate-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {searchTerm || selectedCategory || selectedBrand
                        ? "Try adjusting your search or filters."
                        : "This store doesn't have any products yet."}
                    </p>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="cursor-pointer backdrop-blur-xl bg-white/70 border-white/50"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function VendorStorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
          <VendorHeaderSkeleton />
          <div className="container mx-auto px-4 py-4 space-y-4">
            <FiltersSkeleton />
            <div className="mt-8">
              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      }
    >
      <VendorStoreContent />
    </Suspense>
  );
}
