"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BuildingStorefrontIcon,
  MapPinIcon,
  StarIcon,
  MagnifyingGlassIcon,
  CheckIcon,
  ClockIcon,
  TruckIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpDownIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
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
import ProductCard, { Product } from "@/components/ui/ProductCard";
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
const fastTransition = { duration: 0.2 };

// Types (keeping all existing types)
interface VendorStore {
  id: string;
  name: string;
  businessName: string;
  description: string;
  image: string;
  coverImage?: string;
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

// Enhanced Dropdown Component with design system consistency - REMOVED since we're using UI Select component

// Enhanced Skeleton Components matching cart page design
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
      {/* Search Products Card */}
      <Card className="shadow-sm bg-white border border-slate-200/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            <Skeleton className="h-9 w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Categories Card */}
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

      {/* Store Information Card */}
      <Card className="shadow-sm bg-white border border-slate-200/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-8" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-20" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-6" />
              </div>
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex justify-between items-center">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-10" />
            </div>
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

// Pagination Component with design system styling
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

// Vendor Store Header Component with design system styling
function VendorStoreHeader({ vendor }: { vendor: VendorStore }) {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

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
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                  <CheckIcon className="w-3 h-3 text-white" />
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

  const [vendor, setVendor] = useState<VendorStore | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

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

  const sortOptions = [
    { label: "Featured", value: "featured" },
    { label: "Newest First", value: "newest" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Best Rating", value: "rating" },
    { label: "Most Popular", value: "popular" },
  ];

  // Mock data with pagination (keeping all existing logic)
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mock vendor data
      const mockVendor: VendorStore = {
        id: params.storeId as string,
        name: "TechZone Electronics",
        businessName: "TechZone Electronics GmbH",
        description:
          "Premium electronics retailer specializing in cutting-edge smartphones, high-performance laptops, and professional audio equipment. Serving customers across Germany with exceptional products and customer service since 2020.",
        image: "/placeholder-store.jpg",
        location: "Berlin, Germany",
        rating: 4.8,
        totalReviews: 2847,
        totalProducts: 156,
        joinedDate: "2020-03-15",
        verified: true,
        responseTime: "< 1 hour",
        shippingTime: "1-2 days",
        returnPolicy: "14 days",
        categories: [
          "Smartphones",
          "Laptops",
          "Audio",
          "Tablets",
          "Accessories",
        ],
        followers: 12847,
      };

      // Mock categories
      const mockCategories: Category[] = [
        { id: "1", name: "Smartphones", count: 45 },
        { id: "2", name: "Laptops", count: 32 },
        { id: "3", name: "Audio", count: 28 },
        { id: "4", name: "Tablets", count: 18 },
        { id: "5", name: "Accessories", count: 33 },
      ];

      // Mock brands
      const mockBrands: Brand[] = [
        { id: "1", name: "Apple" },
        { id: "2", name: "Samsung" },
        { id: "3", name: "Dell" },
        { id: "4", name: "Sony" },
        { id: "5", name: "Lenovo" },
        { id: "6", name: "Google" },
      ];

      setVendor(mockVendor);
      setCategories(mockCategories);
      setBrands(mockBrands);
      setLoading(false);

      // Load first page of products
      loadProducts(1);
    };

    loadData();
  }, [params.storeId]);

  const loadProducts = async (page: number) => {
    setProductsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock products with pagination
    const allMockProducts: Product[] = Array.from({ length: 156 }, (_, i) => ({
      id: `product-${i + 1}`,
      name: `Premium ${["iPhone 15 Pro Max", "MacBook Air M3", "AirPods Pro 2", "iPad Air 11", "Samsung Galaxy S24 Ultra", "Dell XPS 13", "Sony WH-1000XM5", "Google Pixel 8 Pro"][i % 8]}`,
      brand: [
        "Apple",
        "Samsung",
        "Dell",
        "Sony",
        "Lenovo",
        "Google",
        "Microsoft",
        "HP",
      ][i % 8],
      price: Math.floor(Math.random() * 1000) + 200,
      originalPrice:
        Math.random() > 0.7
          ? Math.floor(Math.random() * 1200) + 300
          : undefined,
      image: "/placeholder-product.jpg",
      images: ["/placeholder-product.jpg"],
      rating: Number((4 + Math.random()).toFixed(1)),
      reviewCount: Math.floor(Math.random() * 500) + 50,
      stock: Math.floor(Math.random() * 100) + 1,
      category:
        categories[Math.floor(Math.random() * categories.length)]?.name ||
        "Electronics",
      slug: `product-${i + 1}`,
      isNew: Math.random() > 0.8,
      isFeatured: Math.random() > 0.7,
      isActive: Math.random() > 0.1,
    }));

    // Filter products
    const filteredProducts = allMockProducts.filter((product) => {
      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand &&
          product.brand.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        !selectedCategory || product.category === selectedCategory;
      const matchesBrand = !selectedBrand || product.brand === selectedBrand;
      return matchesSearch && matchesCategory && matchesBrand;
    });

    // Paginate
    const startIndex = (page - 1) * pagination.limit;
    const endIndex = startIndex + pagination.limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    setProducts(paginatedProducts);
    setPagination({
      page,
      limit: 12,
      totalCount: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / 12),
    });

    setProductsLoading(false);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    loadProducts(1); // Reset to first page
  };

  const handleFilterChange = (filterType: string, value: string) => {
    switch (filterType) {
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
      case "sort":
        setSortBy(value);
        break;
    }
    loadProducts(1); // Reset to first page
  };

  const handlePageChange = (page: number) => {
    loadProducts(page);
    // Scroll to top of products section
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
    setSortBy("newest");
    loadProducts(1);
  };

  // Category options
  const categoryOptions = [
    { label: "All Categories", value: "" },
    ...categories.map((cat) => ({ label: cat.name, value: cat.name })),
  ];

  // Subcategory options (mock for now)
  const subcategoryOptions = [
    { label: "All Subcategories", value: "" },
    ...(selectedCategory === "Smartphones"
      ? [
          { label: "iPhone", value: "iPhone" },
          { label: "Android", value: "Android" },
        ]
      : selectedCategory === "Laptops"
        ? [
            { label: "Gaming", value: "Gaming" },
            { label: "Business", value: "Business" },
            { label: "Ultrabooks", value: "Ultrabooks" },
          ]
        : []),
  ];

  // Brand options
  const brandOptions = [
    { label: "All Brands", value: "" },
    ...brands.map((brand) => ({ label: brand.name, value: brand.name })),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        {/* Breadcrumb Skeleton */}
        <Card className="border-0 shadow-sm backdrop-blur-xl bg-white/70 border-b border-white/50 rounded-none">
          <CardContent className="p-4">
            <div className="container mx-auto px-4">
              <div className="flex items-center space-x-2">
                <Skeleton className="h-4 w-12" />
                <span className="text-gray-400">/</span>
                <Skeleton className="h-4 w-16" />
                <span className="text-gray-400">/</span>
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vendor Header Skeleton */}
        <VendorHeaderSkeleton />

        {/* Main Content Skeleton */}
        <div className="container mx-auto px-4 py-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1 space-y-4 hidden lg:block sticky top-4 self-start">
              <FiltersSkeleton />
            </div>

            {/* Main Content Area Skeleton */}
            <div className="lg:col-span-3 space-y-4">
              {/* Top Filter Bar Skeleton */}
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

              {/* Products Grid Skeleton */}
              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!vendor) {
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
                Store Not Found
              </h1>
              <p className="text-sm text-slate-600 mb-4">
                The store you&apos;re looking for doesn&apos;t exist.
              </p>
              <Link
                href="/products"
                className="inline-flex items-center px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Browse All Products
              </Link>
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
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Hidden on mobile, shown on desktop */}
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

            {/* Categories, Subcategories & Brands - All in one component */}
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

                {/* Subcategory Select - Only show when category is selected */}
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
                        {selectedCategory === "Smartphones" && (
                          <>
                            <SelectItem value="iPhone">iPhone</SelectItem>
                            <SelectItem value="Android">Android</SelectItem>
                          </>
                        )}
                        {selectedCategory === "Laptops" && (
                          <>
                            <SelectItem value="Gaming">Gaming</SelectItem>
                            <SelectItem value="Business">Business</SelectItem>
                            <SelectItem value="Ultrabooks">
                              Ultrabooks
                            </SelectItem>
                          </>
                        )}
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

          {/* Mobile Filters - Shown only on mobile */}
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

                  {/* Subcategory Select - Only show when category is selected */}
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
                          {selectedCategory === "Smartphones" && (
                            <>
                              <SelectItem value="iPhone">iPhone</SelectItem>
                              <SelectItem value="Android">Android</SelectItem>
                            </>
                          )}
                          {selectedCategory === "Laptops" && (
                            <>
                              <SelectItem value="Gaming">Gaming</SelectItem>
                              <SelectItem value="Business">Business</SelectItem>
                              <SelectItem value="Ultrabooks">
                                Ultrabooks
                              </SelectItem>
                            </>
                          )}
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
            {/* Top Filter Bar - Clean horizontal layout */}
            <Card className="border-0 shadow-sm backdrop-blur-xl bg-white/70 border border-white/50">
              <CardContent className="px-4 py-0.5">
                <div className="flex items-center justify-between">
                  {/* Results Count */}
                  <div className="text-sm text-slate-600">
                    {pagination.totalCount} products found
                  </div>

                  {/* Sort Filter */}
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
                        <Skeleton className="h-2 w-16" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-3 w-3" />
                          <Skeleton className="h-3 w-8" />
                          <Skeleton className="h-3 w-8" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-6 w-6" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  <AnimatePresence mode="wait">
                    {products.map((product, index) => (
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
                    ))}
                  </AnimatePresence>
                </div>

                {/* Pagination */}
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
