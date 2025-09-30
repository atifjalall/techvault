// File: src/app/vendor/products/page.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  CubeIcon,
  FunnelIcon,
  CurrencyEuroIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// UI Components
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

// UPDATED: Interface matching new variant-based schema
interface ProductVariant {
  id: string;
  variantName: string;
  price: number;
  comparePrice?: number;
  stock: number;
  lowStockAlert: number;
  color?: string;
  colorHex?: string;
  storage?: string;
  ram?: string;
  size?: string;
  isActive: boolean;
  images: string[];
  thumbnailImage?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number; // Computed from variants
  totalStock: number; // Computed from variants
  images: string[];
  brand?: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  isActive: boolean;
  featured: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  variants: ProductVariant[]; // NEW: Array of variants
  stockInfo?: {
    totalStock: number;
    activeVariants: number;
    totalVariants: number;
    hasLowStock: boolean;
    hasOutOfStock: boolean;
    priceRange: {
      min: number;
      max: number;
    };
  };
  _count?: {
    reviews: number;
    variants: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

// Stats Card Component with mobile-responsive ultra-small text
function StatCard({
  title,
  value,
  icon: Icon,
  change,
  iconColor,
  bgColor,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  change: number;
  iconColor: string;
  bgColor: string;
}) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">
                {title}
              </p>
              <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
                {value}
              </p>
              <div className="flex items-center space-x-0.5 sm:space-x-1">
                {isPositive ? (
                  <ArrowTrendingUpIcon className="h-2 w-2 sm:h-3 sm:w-3 text-green-500 flex-shrink-0" />
                ) : (
                  <ArrowTrendingDownIcon className="h-2 w-2 sm:h-3 sm:w-3 text-red-500 flex-shrink-0" />
                )}
                <span
                  className={`text-[9px] sm:text-xs font-medium ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
                <span className="text-[7px] sm:text-xs text-gray-500 hidden sm:inline">
                  vs last month
                </span>
              </div>
            </div>
            <div
              className={`w-7 h-7 sm:w-10 sm:h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0 ml-1 sm:ml-0`}
            >
              <Icon className={`h-3 w-3 sm:h-5 sm:w-5 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Sort Button Component
function SortButton({
  field,
  currentSort,
  currentOrder,
  onSort,
  children,
}: {
  field: string;
  currentSort: string;
  currentOrder: "asc" | "desc";
  onSort: (field: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onSort(field)}
      className="hover:bg-transparent p-0 h-auto font-semibold text-xs text-slate-600 uppercase tracking-wide cursor-pointer"
    >
      <span className="flex items-center space-x-1">
        <span>{children}</span>
        {currentSort === field && (
          <div className="text-slate-900">
            {currentOrder === "asc" ? (
              <ArrowTrendingUpIcon className="w-3 h-3" />
            ) : (
              <ArrowTrendingDownIcon className="w-3 h-3" />
            )}
          </div>
        )}
      </span>
    </Button>
  );
}

// Loading Skeletons with mobile optimization
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 sm:space-y-2 flex-1">
                <Skeleton className="h-2 sm:h-3 w-14 sm:w-20" />
                <Skeleton className="h-4 sm:h-6 w-10 sm:w-16" />
                <Skeleton className="h-2 sm:h-3 w-16 sm:w-32" />
              </div>
              <Skeleton className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-0">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
              <div className="flex space-x-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile Product Card Component with ultra-compact design
function MobileProductCard({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}) {
  // Calculate stock status from variants
  const activeVariants = product.variants.filter((v) => v.isActive);
  const totalStock =
    product.totalStock || activeVariants.reduce((sum, v) => sum + v.stock, 0);
  const lowStockThreshold = 10;

  // Get price range from variants
  const prices = activeVariants.map((v) => v.price);
  const minPrice =
    prices.length > 0 ? Math.min(...prices) : product.basePrice || 0;
  const maxPrice =
    prices.length > 0 ? Math.max(...prices) : product.basePrice || 0;

  const formatPrice = (price: number) => `€${Number(price).toFixed(2)}`;

  // Get primary product image
  const primaryImage =
    product.images?.[0] ||
    activeVariants.find((v) => v.thumbnailImage)?.thumbnailImage ||
    activeVariants.find((v) => v.images?.length > 0)?.images[0];

  return (
    <Card className="border-0 shadow-sm bg-white mb-2">
      <CardContent className="p-2">
        <div className="flex items-start space-x-2">
          {/* Product Image */}
          <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={product.name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PhotoIcon className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="text-[12px] font-medium text-gray-900 truncate leading-tight">
                  {product.name}
                </h3>
                <p className="text-[10px] text-gray-500 truncate">
                  {product.brand?.name} • {product.category.name}
                </p>
              </div>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-gray-100 flex-shrink-0 ml-1"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onEdit(product.id)}
                    className="text-[11px] py-1"
                  >
                    <PencilIcon className="h-3 w-3 mr-1" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onToggleStatus(product)}
                    className="text-[11px] py-1"
                  >
                    {product.isActive ? (
                      <>
                        <XCircleIcon className="h-3 w-3 mr-1" />
                        Deactivate
                      </>
                    ) : (
                      <>
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Activate
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(product)}
                    className="text-red-600 text-[11px] py-1"
                  >
                    <TrashIcon className="h-3 w-3 mr-1" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Price and Stock Row */}
            <div className="flex items-center justify-between mb-1">
              <div>
                {minPrice === maxPrice ? (
                  <p className="text-[12px] font-semibold text-gray-900">
                    {formatPrice(minPrice)}
                  </p>
                ) : (
                  <p className="text-[12px] font-semibold text-gray-900">
                    {formatPrice(minPrice)}-{formatPrice(maxPrice)}
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-[12px] font-medium text-gray-900">
                  {totalStock}
                </p>
                <p className="text-[9px] text-gray-500">units</p>
              </div>
            </div>

            {/* Status and Badges Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {/* Stock Status Badge */}
                {totalStock === 0 ? (
                  <Badge
                    variant="out_of_stock"
                    className="text-[9px] px-1.5 py-0.5 h-5"
                  >
                    Out
                  </Badge>
                ) : totalStock <= lowStockThreshold ? (
                  <Badge
                    variant="high"
                    className="text-[9px] px-1.5 py-0.5 h-5"
                  >
                    Low
                  </Badge>
                ) : (
                  <Badge
                    variant="active"
                    className="text-[9px] px-1.5 py-0.5 h-5"
                  >
                    Stock
                  </Badge>
                )}

                {/* Product Status */}
                <button onClick={() => onToggleStatus(product)}>
                  <Badge
                    variant={product.isActive ? "active" : "inactive"}
                    className="text-[9px] px-1.5 py-0.5 h-5"
                  >
                    {product.isActive ? "Active" : "Draft"}
                  </Badge>
                </button>
              </div>

              <div className="flex items-center space-x-2 text-[9px] text-gray-500">
                {product.featured && (
                  <div className="flex items-center">
                    <StarIconSolid className="h-2 w-2 text-yellow-400 mr-0.5" />
                    <span>★</span>
                  </div>
                )}
                {product.variants.length > 1 && (
                  <span>{product.variants.length}v</span>
                )}
                <span>{product._count?.reviews || 0}r</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile skeleton for product loading
function MobileProductsSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white">
          <CardContent className="p-2">
            <div className="flex items-start space-x-2">
              <Skeleton className="w-10 h-10 rounded-md flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex justify-between">
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-20" />
                  </div>
                  <Skeleton className="w-5 h-5 rounded" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex justify-between">
                  <div className="flex space-x-1">
                    <Skeleton className="h-4 w-10 rounded-full" />
                    <Skeleton className="h-4 w-12 rounded-full" />
                  </div>
                  <Skeleton className="h-2 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// UPDATED: Product Row Component for variant-based products with fixed alignment and ICONS
function ProductRow({
  product,
  onEdit,
  onDelete,
  onToggleStatus,
}: {
  product: Product;
  onEdit: (id: string) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}) {
  // Calculate stock status from variants
  const activeVariants = product.variants.filter((v) => v.isActive);
  const totalStock =
    product.totalStock || activeVariants.reduce((sum, v) => sum + v.stock, 0);
  const lowStockThreshold = 10; // You can make this configurable

  // Get price range from variants
  const prices = activeVariants.map((v) => v.price);
  const minPrice =
    prices.length > 0 ? Math.min(...prices) : product.basePrice || 0;
  const maxPrice =
    prices.length > 0 ? Math.max(...prices) : product.basePrice || 0;

  const formatPrice = (price: number) => `€${Number(price).toFixed(2)}`;

  // Get primary product image (from product or first variant)
  const primaryImage =
    product.images?.[0] ||
    activeVariants.find((v) => v.thumbnailImage)?.thumbnailImage ||
    activeVariants.find((v) => v.images?.length > 0)?.images[0];

  return (
    <TableRow className="hover:bg-gray-50/50 border-b border-gray-50">
      {/* Product Info - Left aligned */}
      <TableCell className="py-3 text-left pl-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={product.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PhotoIcon className="h-4 w-4 text-gray-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {product.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {product.brand?.name} • {product.category.name}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              {product.featured && (
                <div className="flex items-center">
                  <StarIconSolid className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs text-yellow-600 ml-1">Featured</span>
                </div>
              )}
              {product.variants.length > 1 && (
                <span className="text-xs text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                  {product.variants.length} variants
                </span>
              )}
            </div>
          </div>
        </div>
      </TableCell>

      {/* Price - Left aligned */}
      <TableCell className="py-3 text-left pl-4">
        <div>
          {minPrice === maxPrice ? (
            <p className="text-sm font-semibold text-gray-900">
              {formatPrice(minPrice)}
            </p>
          ) : (
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {formatPrice(minPrice)} - {formatPrice(maxPrice)}
              </p>
              <p className="text-xs text-gray-500">Price range</p>
            </div>
          )}
        </div>
      </TableCell>

      {/* Stock - Center aligned with ICONS */}
      <TableCell className="py-3 text-center">
        <div className="inline-flex flex-col items-center space-y-1">
          <span className="text-sm font-medium text-gray-900">
            {totalStock}
          </span>
          {/* UPDATED: Stock status badges with icons */}
          {totalStock === 0 ? (
            <Badge variant="out_of_stock" size="sm" icon="auto">
              Out of Stock
            </Badge>
          ) : totalStock <= lowStockThreshold ? (
            <Badge variant="high" size="sm" icon="auto">
              Low Stock
            </Badge>
          ) : (
            <Badge variant="active" size="sm" icon="auto">
              In Stock
            </Badge>
          )}
          {product.variants.length > 1 && (
            <span className="text-xs text-gray-400">
              across {activeVariants.length} variants
            </span>
          )}
        </div>
      </TableCell>

      {/* Status - Center aligned with ICONS */}
      <TableCell className="py-3 text-center">
        <button
          onClick={() => onToggleStatus(product)}
          className="cursor-pointer"
        >
          {/* UPDATED: Product status badges with icons */}
          <Badge
            variant={product.isActive ? "active" : "inactive"}
            size="sm"
            icon="auto"
          >
            {product.isActive ? "Active" : "Draft"}
          </Badge>
        </button>
      </TableCell>

      {/* Reviews - Center aligned */}
      <TableCell className="py-3 text-center">
        <div className="inline-flex flex-col items-center">
          <span className="text-sm font-medium text-gray-900">
            {product._count?.reviews || 0}
          </span>
          <span className="text-xs text-gray-500">reviews</span>
        </div>
      </TableCell>

      {/* Actions - Center aligned */}
      <TableCell className="py-3 text-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-100 cursor-pointer"
            >
              <EllipsisVerticalIcon className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onEdit(product.id)}
              className="cursor-pointer"
            >
              <PencilIcon className="h-3 w-3 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              asChild
              className="cursor-pointer"
            ></DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggleStatus(product)}
              className="cursor-pointer"
            >
              {product.isActive ? (
                <>
                  <XCircleIcon className="h-3 w-3 mr-2" />
                  Deactivate
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-3 w-3 mr-2" />
                  Activate
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(product)}
              className="text-red-600 cursor-pointer"
            >
              <TrashIcon className="h-3 w-3 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

// Loading skeleton for Suspense fallback
function VendorProductsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
          </div>
          <div className="h-9 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* Stats Skeleton */}
        <StatsSkeleton />

        {/* Filters Skeleton */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                    <div className="h-9 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table Skeleton */}
        <TableSkeleton />
      </div>
    </div>
  );
}

// Main content component that uses useSearchParams
function VendorProductsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Stats state - UPDATED for variant-based calculations
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStockItems: 0,
    totalValue: 0,
  });

  // Filters
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [categoryFilter, setCategoryFilter] = useState(
    searchParams.get("category") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get("sortBy") || "createdAt"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // UPDATED: Load products and stats with variant support
  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sortBy: sortBy,
        sortOrder: sortOrder,
      });

      if (searchTerm) params.append("search", searchTerm);
      if (categoryFilter) params.append("category", categoryFilter);
      if (statusFilter) params.append("status", statusFilter);

      const [productsResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/vendor/products?${params}`),
        fetch("/api/categories"),
      ]);

      if (productsResponse.ok) {
        const data = await productsResponse.json();
        if (data.success) {
          console.log("📦 Loaded products:", data.products.length);
          setProducts(data.products);
          setTotalCount(data.pagination.totalCount);
          setTotalPages(data.pagination.totalPages);
        }
      }

      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        if (categoriesData.success) {
          setCategories(categoriesData.categories);
        }
      }

      // UPDATED: Load stats with variant-based calculations
      const statsResponse = await fetch("/api/vendor/products?limit=1000");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          const allProducts = statsData.products;
          const totalProducts = allProducts.length;
          const activeProducts = allProducts.filter(
            (p: Product) => p.isActive
          ).length;

          // Calculate low stock items based on total stock
          const lowStockItems = allProducts.filter((p: Product) => {
            const totalStock = p.totalStock || 0;
            return totalStock <= 10; // Low stock threshold
          }).length;

          // Calculate total inventory value from all variants
          const totalValue = allProducts.reduce((sum: number, p: Product) => {
            const productValue = p.variants
              .filter((v) => v.isActive)
              .reduce((variantSum, v) => variantSum + v.price * v.stock, 0);
            return sum + productValue;
          }, 0);

          setStats({
            totalProducts,
            activeProducts,
            lowStockItems,
            totalValue,
          });

          console.log("📊 Stats calculated:", {
            totalProducts,
            activeProducts,
            lowStockItems,
            totalValue: totalValue.toFixed(2),
          });
        }
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    searchTerm,
    categoryFilter,
    statusFilter,
    sortBy,
    sortOrder,
  ]);

  // Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const handleEdit = (productId: string) => {
    router.push(`/vendor/products/${productId}/edit`);
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(
        `/api/vendor/products/${productToDelete.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await loadProducts();
        setShowDeleteModal(false);
        setProductToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const handleToggleStatus = async (product: Product) => {
    try {
      const response = await fetch(`/api/vendor/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      if (response.ok) {
        await loadProducts();
      }
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-2 sm:p-6 space-y-3 sm:space-y-6">
        {/* Mobile-optimized Header */}
        <div className="flex items-start sm:items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-gray-900">
              Products
            </h1>
            <p className="text-[10px] sm:text-sm text-gray-600 truncate">
              Manage your product inventory with variant support
            </p>
          </div>
          <Button
            asChild
            size="sm"
            variant="active"
            className="flex-shrink-0 ml-2 h-7 sm:h-8"
          >
            <Link href="/vendor/products/add">
              <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1.5" />
              <span className="hidden sm:inline text-xs sm:text-sm">
                Add Product
              </span>
            </Link>
          </Button>
        </div>

        {/* Mobile-optimized Stats Grid */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4"
          >
            <StatCard
              title="Total Products"
              value={stats.totalProducts}
              change={12.5}
              icon={CubeIcon}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />
            <StatCard
              title="Active Products"
              value={stats.activeProducts}
              change={8.3}
              icon={CheckCircleIcon}
              iconColor="text-green-600"
              bgColor="bg-green-50"
            />
            <StatCard
              title="Low Stock Items"
              value={stats.lowStockItems}
              change={-5.2}
              icon={ExclamationTriangleIcon}
              iconColor="text-orange-600"
              bgColor="bg-orange-50"
            />
            <StatCard
              title="Inventory Value"
              value={`€${stats.totalValue.toFixed(0)}`}
              change={15.7}
              icon={CurrencyEuroIcon}
              iconColor="text-purple-600"
              bgColor="bg-purple-50"
            />
          </motion.div>
        )}

        {/* Mobile-optimized Filters */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-2 sm:p-4">
            <form onSubmit={handleSearch} className="space-y-2 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                {/* Search */}
                <div className="sm:col-span-2 md:col-span-2 space-y-1 sm:space-y-2">
                  <Label
                    htmlFor="search"
                    className="text-[9px] sm:text-xs font-medium text-gray-700"
                  >
                    Search Products
                  </Label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-7 sm:pl-10 h-7 sm:h-9 text-[11px] sm:text-sm"
                      placeholder="Search by name, brand..."
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-1 sm:space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-[9px] sm:text-xs font-medium text-gray-700"
                  >
                    Category
                  </Label>
                  <Select
                    value={categoryFilter || "all"}
                    onValueChange={(value) =>
                      setCategoryFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-7 sm:h-9 text-[11px] sm:text-sm">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="all"
                        className="text-[11px] sm:text-sm"
                      >
                        All Categories
                      </SelectItem>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id}
                          className="text-[11px] sm:text-sm"
                        >
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-1 sm:space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-[9px] sm:text-xs font-medium text-gray-700"
                  >
                    Status
                  </Label>
                  <Select
                    value={statusFilter || "all"}
                    onValueChange={(value) =>
                      setStatusFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-7 sm:h-9 text-[11px] sm:text-sm">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="all"
                        className="text-[11px] sm:text-sm"
                      >
                        All Status
                      </SelectItem>
                      <SelectItem
                        value="active"
                        className="text-[11px] sm:text-sm"
                      >
                        Active
                      </SelectItem>
                      <SelectItem
                        value="draft"
                        className="text-[11px] sm:text-sm"
                      >
                        Draft
                      </SelectItem>
                      <SelectItem
                        value="lowstock"
                        className="text-[11px] sm:text-sm"
                      >
                        Low Stock
                      </SelectItem>
                      <SelectItem
                        value="outofstock"
                        className="text-[11px] sm:text-sm"
                      >
                        Out of Stock
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-gray-100">
                <p className="text-[9px] sm:text-xs text-gray-600">
                  {totalCount} products found
                </p>
                <Button
                  variant="active"
                  className="text-blue-700 h-6 sm:h-8 text-[10px] sm:text-sm px-2 sm:px-3"
                >
                  <FunnelIcon className="text-current h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                  Apply Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Products Display - Mobile Cards / Desktop Table */}
        {loading ? (
          <>
            {/* Mobile Loading */}
            <div className="block lg:hidden">
              <MobileProductsSkeleton />
            </div>
            {/* Desktop Loading */}
            <div className="hidden lg:block">
              <TableSkeleton />
            </div>
          </>
        ) : !products || products.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-12 text-center">
              <CubeIcon className="w-8 h-8 sm:w-12 sm:h-12 text-gray-300 mx-auto mb-2 sm:mb-3" />
              <h3 className="text-[11px] sm:text-sm font-semibold text-gray-900 mb-1">
                No products found
              </h3>
              <p className="text-[9px] sm:text-xs text-gray-500 mb-3 sm:mb-4">
                {searchTerm || categoryFilter || statusFilter
                  ? "Try adjusting your filters or search terms"
                  : "Get started by creating your first product"}
              </p>
              <Button
                asChild
                size="sm"
                variant="active"
                className="h-6 sm:h-8 text-[10px] sm:text-sm"
              >
                <Link href="/vendor/products/add">
                  <PlusIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                  <span className="hidden sm:inline">Add Product</span>
                  <span className="sm:hidden">Add</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Product Cards - Only visible on mobile */}
            <div className="block lg:hidden">
              {products.map((product) => (
                <MobileProductCard
                  key={product.id}
                  product={product}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggleStatus={handleToggleStatus}
                />
              ))}
            </div>

            {/* Desktop Table - Only visible on desktop (unchanged) */}
            <div className="hidden lg:block">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-b border-gray-100">
                        <TableHead className="h-10 text-left pl-4">
                          <SortButton
                            field="name"
                            currentSort={sortBy}
                            currentOrder={sortOrder}
                            onSort={handleSort}
                          >
                            Product
                          </SortButton>
                        </TableHead>
                        <TableHead className="h-10 text-left pl-4">
                          <SortButton
                            field="basePrice"
                            currentSort={sortBy}
                            currentOrder={sortOrder}
                            onSort={handleSort}
                          >
                            Price
                          </SortButton>
                        </TableHead>
                        <TableHead className="h-10 text-center">
                          <SortButton
                            field="totalStock"
                            currentSort={sortBy}
                            currentOrder={sortOrder}
                            onSort={handleSort}
                          >
                            Stock
                          </SortButton>
                        </TableHead>
                        <TableHead className="h-10 text-center">
                          Status
                        </TableHead>
                        <TableHead className="h-10 text-center">
                          Reviews
                        </TableHead>
                        <TableHead className="w-[50px] h-10 text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <ProductRow
                          key={product.id}
                          product={product}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onToggleStatus={handleToggleStatus}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Mobile-optimized Pagination */}
        {totalPages > 1 && (
          <>
            {/* Mobile Pagination - Ultra compact */}
            <div className="flex flex-col space-y-2 sm:hidden">
              <p className="text-[9px] text-gray-700 text-center">
                Page {currentPage} of {totalPages} ({totalCount} items)
              </p>
              <div className="flex items-center justify-center space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-6 px-2 text-[9px]"
                >
                  Prev
                </Button>
                <span className="text-[9px] text-gray-500 px-1">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-6 px-2 text-[9px]"
                >
                  Next
                </Button>
              </div>
            </div>

            {/* Desktop Pagination - Unchanged */}
            <div className="hidden sm:flex items-center justify-between">
              <p className="text-xs text-gray-700">
                Showing {(currentPage - 1) * 10 + 1} to{" "}
                {Math.min(currentPage * 10, totalCount)} of {totalCount}{" "}
                products
              </p>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 px-3 text-xs cursor-pointer"
                >
                  Previous
                </Button>

                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 7) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 4) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = currentPage - 3 + i;
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={
                          currentPage === pageNumber ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className={`w-8 h-8 text-xs cursor-pointer ${
                          currentPage === pageNumber
                            ? "bg-slate-900 hover:bg-slate-800 text-white"
                            : ""
                        }`}
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 text-xs cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Delete Product</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete &quot;{productToDelete?.name}
              &quot;? This will also delete all variants and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              className="cursor-pointer"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Main page export with Suspense wrapper
export default function VendorProductsPage() {
  return (
    <Suspense fallback={<VendorProductsPageSkeleton />}>
      <VendorProductsPageContent />
    </Suspense>
  );
}
