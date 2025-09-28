/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/buttonSidebar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ProductCard, {
  Product as ProductCardType,
} from "@/components/ui/ProductCard";
import Link from "next/link";

// Types
interface Category {
  id: string;
  name: string;
  slug: string;
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
  avgRating: number;
  reviewCount: number;
  discountPercentage: number;
  variantCount: number;
  hasMultipleVariants: boolean;
  [key: string]: any;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

// Transform function
function transformProduct(dbProduct: DatabaseProduct): ProductCardType {
  return {
    id: dbProduct.id,
    name: dbProduct.name || "Unnamed Product",
    brand: dbProduct.brand?.name,
    price: dbProduct.price || 0,
    originalPrice: dbProduct.comparePrice,
    image: dbProduct.images[0] || "/api/placeholder/400/400",
    images: dbProduct.images,
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
    discountPercentage: dbProduct.discountPercentage,
  };
}

// Import skeleton components
import {
  BreadcrumbSkeleton,
  TopFilterSkeleton,
  FiltersSkeleton,
  ProductGridSkeleton,
} from "@/components/products/SkeletonLoaders";

// Main Content Component
function ProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // State
  const [products, setProducts] = useState<DatabaseProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 12,
    totalCount: 0,
    totalPages: 0,
  });

  // Filters - Initialize from URL
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
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [onlyOnSale, setOnlyOnSale] = useState(
    searchParams.get("onlyOnSale") === "true"
  );
  const [onlyInStock, setOnlyInStock] = useState(
    searchParams.get("onlyInStock") === "true"
  );
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Get available subcategories
  const availableSubcategories = React.useMemo(() => {
    if (!selectedCategory) return [];
    const category = categories.find((c) => c.id === selectedCategory);
    return category?.subcategories || [];
  }, [selectedCategory, categories]);

  // Update URL function
  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (searchTerm) params.set("search", searchTerm);

    // Use category slug instead of ID
    if (selectedCategory) {
      const category = categories.find((c) => c.id === selectedCategory);
      if (category) {
        params.set("category", category.slug);
      }
    }

    // Use subcategory slug instead of ID
    if (selectedSubcategory) {
      const subcategory = availableSubcategories.find(
        (s) => s.id === selectedSubcategory
      );
      if (subcategory) {
        params.set("subcategory", subcategory.slug);
      }
    }

    // Use brand name as slug instead of ID
    if (selectedBrand) {
      const brand = brands.find((b) => b.id === selectedBrand);
      if (brand) {
        // Convert brand name to slug format (lowercase, replace spaces with hyphens)
        const brandSlug = brand.name.toLowerCase().replace(/\s+/g, "-");
        params.set("brand", brandSlug);
      }
    }

    if (sortBy && sortBy !== "featured") params.set("sort", sortBy);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (onlyOnSale) params.set("onlyOnSale", "true");
    if (onlyInStock) params.set("onlyInStock", "true");

    const newURL = `/products${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(newURL, { scroll: false });
  }, [
    searchTerm,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    sortBy,
    minPrice,
    maxPrice,
    onlyOnSale,
    onlyInStock,
    router,
    categories,
    availableSubcategories,
    brands,
  ]);

  // Redirect vendors
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (categories.length === 0 || brands.length === 0) return;

    const categoryParam = searchParams.get("category");
    const subcategoryParam = searchParams.get("subcategory");
    const brandParam = searchParams.get("brand");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const sale = searchParams.get("onlyOnSale");
    const stock = searchParams.get("onlyInStock");

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
    if (subcategoryParam) {
      // Get all subcategories from all categories
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
        // Also set the correct category if not already set
        if (!categoryParam) {
          setSelectedCategory(foundSubcategory.categoryId);
        }
      }
    }

    // Handle brand - support both ID and name/slug
    if (brandParam) {
      // Try to match by slug (name converted to slug format)
      const brandBySlug = brands.find(
        (b) => b.name.toLowerCase().replace(/\s+/g, "-") === brandParam
      );
      const brandById = brands.find((b) => b.id === brandParam);
      const foundBrand = brandBySlug || brandById;
      if (foundBrand) {
        setSelectedBrand(foundBrand.id);
      }
    }

    if (search) setSearchTerm(search);
    if (sort) setSortBy(sort);
    if (minPriceParam) setMinPrice(minPriceParam);
    if (maxPriceParam) setMaxPrice(maxPriceParam);
    if (sale === "true") setOnlyOnSale(true);
    if (stock === "true") setOnlyInStock(true);
  }, [searchParams, categories, brands]);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch("/api/categories"),
        fetch("/api/brands"),
      ]);

      const [categoriesData, brandsData] = await Promise.all([
        categoriesRes.json(),
        brandsRes.json(),
      ]);

      if (categoriesData?.success) {
        setCategories(categoriesData.categories || []);
      }

      if (brandsData?.success) {
        setBrands(brandsData.brands || []);
      }
    } catch (err) {
      setError("Failed to load filters");
      console.error("Error loading initial data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load products
  const loadProducts = useCallback(
    async (page: number = 1) => {
      setProductsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: pagination.limit.toString(),
        });

        // Add all filters to API call
        if (searchTerm) queryParams.set("search", searchTerm);
        if (selectedCategory) queryParams.set("category", selectedCategory);
        if (selectedSubcategory)
          queryParams.set("subcategory", selectedSubcategory);
        if (selectedBrand) queryParams.set("brand", selectedBrand);
        if (sortBy) queryParams.set("sort", sortBy);
        if (minPrice) queryParams.set("minPrice", minPrice);
        if (maxPrice) queryParams.set("maxPrice", maxPrice);
        if (onlyOnSale) queryParams.set("onlyOnSale", "true");
        if (onlyInStock) queryParams.set("onlyInStock", "true");

        console.log("API call with params:", queryParams.toString());

        const response = await fetch(`/api/products?${queryParams}`);
        const data = await response.json();

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
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    },
    [
      searchTerm,
      selectedCategory,
      selectedSubcategory,
      selectedBrand,
      sortBy,
      minPrice,
      maxPrice,
      onlyOnSale,
      onlyInStock,
      pagination.limit,
    ]
  );

  // Load initial data on mount
  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Load products when filters change + update URL
  useEffect(() => {
    if (!loading) {
      loadProducts(1);
      updateURL();
    }
  }, [
    searchTerm,
    selectedCategory,
    selectedSubcategory,
    selectedBrand,
    sortBy,
    minPrice,
    maxPrice,
    onlyOnSale,
    onlyInStock,
    loading,
    loadProducts,
    updateURL,
  ]);

  // Filter handlers with immediate state updates
  const handleFilterChange = (filterType: string, value: any) => {
    switch (filterType) {
      case "search":
        setSearchTerm(value);
        break;
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
      case "minPrice":
        setMinPrice(value);
        break;
      case "maxPrice":
        setMaxPrice(value);
        break;
      case "onlyOnSale":
        setOnlyOnSale(value);
        break;
      case "onlyInStock":
        setOnlyInStock(value);
        break;
    }
    // URL will be updated by the useEffect that watches these state changes
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
    setSortBy("featured");
    setMinPrice("");
    setMaxPrice("");
    setOnlyOnSale(false);
    setOnlyInStock(false);
  };

  const handlePageChange = (page: number) => {
    loadProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Count active filters
  const activeFiltersCount =
    [
      searchTerm,
      selectedCategory,
      selectedSubcategory,
      selectedBrand,
      minPrice,
      maxPrice,
    ].filter((f) => f && f !== "").length +
    (onlyOnSale ? 1 : 0) +
    (onlyInStock ? 1 : 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <BreadcrumbSkeleton />
        <div className="container mx-auto px-4 py-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-4 hidden lg:block sticky top-18 self-start">
              <FiltersSkeleton />
            </div>
            <div className="lg:col-span-3 space-y-4">
              <TopFilterSkeleton />
              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <Card className="border-0 shadow-sm backdrop-blur-xl bg-white/70 border border-white/50">
          <CardContent className="p-6">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-6 h-6 text-slate-400" />
            </div>
            <h1 className="text-base font-semibold text-slate-900 mb-1">
              {error}
            </h1>
            <p className="text-sm text-slate-600 mb-4">
              There was an error loading products. Please try again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="cursor-pointer bg-slate-900 hover:bg-slate-800 text-white"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header with Breadcrumb */}
      <div className="pt-8 px-4 pb-4">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="cursor-pointer">
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Products</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop Sidebar */}
          <div className="lg:col-span-1 space-y-4 hidden lg:block sticky top-18 self-start">
            {/* Search */}
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
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="pl-9 h-9 text-sm bg-white border-slate-200 focus:border-slate-400"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
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
                    <SelectTrigger className="w-full bg-white border-slate-200">
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

                {availableSubcategories.length > 0 && (
                  <div>
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
                      <SelectTrigger className="w-full bg-white border-slate-200">
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
                    <SelectTrigger className="w-full bg-white border-slate-200">
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
              </CardContent>
            </Card>

            {/* Price Range */}
            <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Price Range
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>€0</span>
                    <span>€5000</span>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) =>
                        handleFilterChange("minPrice", e.target.value)
                      }
                      className="h-8 text-xs bg-white border-slate-200 focus:border-slate-400"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) =>
                        handleFilterChange("maxPrice", e.target.value)
                      }
                      className="h-8 text-xs bg-white border-slate-200 focus:border-slate-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Options */}
            <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Options
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyOnSale}
                    onChange={(e) =>
                      handleFilterChange("onlyOnSale", e.target.checked)
                    }
                    className="h-3 w-3 text-slate-900 border-slate-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-xs text-slate-700">
                    On Sale Only
                  </span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) =>
                      handleFilterChange("onlyInStock", e.target.checked)
                    }
                    className="h-3 w-3 text-slate-900 border-slate-300 rounded cursor-pointer"
                  />
                  <span className="ml-2 text-xs text-slate-700">
                    In Stock Only
                  </span>
                </label>
              </CardContent>
            </Card>
          </div>

          {/* Mobile Filters */}
          <div className="lg:hidden space-y-4">
            <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
              <CardContent className="p-4">
                <div className="relative mb-3">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    className="pl-9 h-9 text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Select
                    value={selectedCategory || "all"}
                    onValueChange={(value) =>
                      handleFilterChange(
                        "category",
                        value === "all" ? "" : value
                      )
                    }
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Category" />
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
                  <Select
                    value={selectedBrand || "all"}
                    onValueChange={(value) =>
                      handleFilterChange("brand", value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Brand" />
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
                <div className="flex items-center justify-between">
                  <Button
                    onClick={() => setShowMobileFilters(true)}
                    variant="outline"
                    size="sm"
                    className="text-xs cursor-pointer"
                  >
                    <AdjustmentsHorizontalIcon className="w-3 h-3 mr-1" />
                    More Filters
                    {activeFiltersCount > 2 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {activeFiltersCount - 2}
                      </Badge>
                    )}
                  </Button>
                  {activeFiltersCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="text-xs cursor-pointer"
                    >
                      Clear ({activeFiltersCount})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {/* Top Bar */}
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
                        className="text-xs cursor-pointer"
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
                      <SelectTrigger className="w-40">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="wait">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 16, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.4, delay: index * 0.03 }}
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
              </div>
            ) : (
              <Card className="border-0 shadow-sm backdrop-blur-xl bg-white/70 border border-white/50">
                <CardContent className="p-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <MagnifyingGlassIcon className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-base font-medium text-slate-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                      {activeFiltersCount > 0
                        ? "Try adjusting your search or filters."
                        : "No products are currently available."}
                    </p>
                    {activeFiltersCount > 0 && (
                      <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="cursor-pointer"
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Modal */}
      <AnimatePresence>
        {showMobileFilters && (
          <motion.div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileFilters(false)}
          >
            <motion.div
              className="w-80 h-full bg-white shadow-2xl overflow-y-auto"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-slate-900">
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <XMarkIcon className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
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
                      <SelectTrigger className="w-full">
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

                  {availableSubcategories.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
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
                        <SelectTrigger className="w-full">
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
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
                      <SelectTrigger className="w-full">
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

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Price Range
                    </label>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>€0</span>
                        <span>€5000</span>
                      </div>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={minPrice}
                          onChange={(e) =>
                            handleFilterChange("minPrice", e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={maxPrice}
                          onChange={(e) =>
                            handleFilterChange("maxPrice", e.target.value)
                          }
                          className="h-8 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Options
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onlyOnSale}
                          onChange={(e) =>
                            handleFilterChange("onlyOnSale", e.target.checked)
                          }
                          className="h-4 w-4 text-slate-900 border-slate-300 rounded cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-slate-700">
                          On Sale Only
                        </span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onlyInStock}
                          onChange={(e) =>
                            handleFilterChange("onlyInStock", e.target.checked)
                          }
                          className="h-4 w-4 text-slate-900 border-slate-300 rounded cursor-pointer"
                        />
                        <span className="ml-2 text-sm text-slate-700">
                          In Stock Only
                        </span>
                      </label>
                    </div>
                  </div>

                  <Button
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full cursor-pointer bg-slate-900 hover:bg-slate-800 text-white"
                  >
                    Apply Filters
                  </Button>

                  {activeFiltersCount > 0 && (
                    <Button
                      onClick={() => {
                        clearFilters();
                        setShowMobileFilters(false);
                      }}
                      variant="outline"
                      className="w-full cursor-pointer"
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
    </div>
  );
}

// Main page component
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
          <BreadcrumbSkeleton />
          <div className="container mx-auto px-4 py-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-1 space-y-4 hidden lg:block sticky top-18 self-start">
                <FiltersSkeleton />
              </div>
              <div className="lg:col-span-3 space-y-4">
                <TopFilterSkeleton />
                <ProductGridSkeleton />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
