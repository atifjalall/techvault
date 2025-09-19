"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
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
  EyeIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CubeIcon,
  FunnelIcon,
  CurrencyEuroIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

// UI Components
import { Button } from "@/components/ui/buttonSidebar";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  brand?: string;
  stock: number;
  lowStockAlert: number;
  isActive: boolean;
  featured: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  _count?: {
    reviews: number;
    cartItems: number;
    orderItems: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductsResponse {
  success: boolean;
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  categories: Category[];
}

// Stats Card Component - matching customers page
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
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600">{title}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <div className="flex items-center space-x-1">
                {isPositive ? (
                  <ArrowUpIcon className="h-3 w-3 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>
            <div
              className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Sort Button Component - matching customers page
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
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
          </div>
        )}
      </span>
    </Button>
  );
}

// Loading Skeletons - matching customers page
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="w-10 h-10 rounded-lg" />
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

// Product Row Component
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
  const stockStatus =
    product.stock === 0
      ? {
          label: "Out of Stock",
          color: "bg-red-100 text-red-800 border-red-200",
        }
      : product.stock <= product.lowStockAlert
        ? {
            label: "Low Stock",
            color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          }
        : {
            label: "In Stock",
            color: "bg-green-100 text-green-800 border-green-200",
          };

  const formatPrice = (price: number | string) =>
    `€${Number(price).toFixed(2)}`;

  return (
    <TableRow className="hover:bg-gray-50/50 border-b border-gray-50">
      {/* Product Info */}
      <TableCell className="py-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
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
              {product.brand} • {product.category.name}
            </p>
            {product.featured && (
              <div className="flex items-center mt-1">
                <StarIconSolid className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-yellow-600 ml-1">Featured</span>
              </div>
            )}
          </div>
        </div>
      </TableCell>

      {/* Price */}
      <TableCell className="py-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {formatPrice(product.price)}
          </p>
          {product.comparePrice && (
            <p className="text-xs text-gray-500 line-through">
              {formatPrice(product.comparePrice)}
            </p>
          )}
        </div>
      </TableCell>

      {/* Stock */}
      <TableCell className="py-3">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">{product.stock}</p>
          <div className="mt-1">
            <Badge className={`text-xs px-2 py-0.5 ${stockStatus.color}`}>
              {stockStatus.label}
            </Badge>
          </div>
        </div>
      </TableCell>

      {/* Status */}
      <TableCell className="py-3">
        <button
          onClick={() => onToggleStatus(product)}
          className="cursor-pointer"
        >
          <Badge
            className={`text-xs px-2 py-0.5 ${
              product.isActive 
                ? "bg-green-100 text-green-800 border-green-200" 
                : "bg-red-100 text-red-800 border-red-200"
            }`}
          >
            {product.isActive ? "Active" : "Draft"}
          </Badge>
        </button>
      </TableCell>

      {/* Sales */}
      <TableCell className="py-3">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-900">
            {product._count?.orderItems || 0}
          </p>
          <p className="text-xs text-gray-500">sold</p>
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-100 cursor-pointer"
            >
              <EllipsisVerticalIcon className="h-3 w-3" />
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
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link href={`/products/${product.slug}`} target="_blank">
                <EyeIcon className="h-3 w-3 mr-2" />
                View
              </Link>
            </DropdownMenuItem>
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

export default function VendorProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Stats state
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

  // Load products and stats
  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "10",
        sort: sortBy,
        order: sortOrder,
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

      // Load stats
      const statsResponse = await fetch("/api/vendor/products?limit=1000");
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          const allProducts = statsData.products;
          const totalProducts = allProducts.length;
          const activeProducts = allProducts.filter(
            (p: Product) => p.isActive
          ).length;
          const lowStockItems = allProducts.filter(
            (p: Product) => p.stock <= p.lowStockAlert
          ).length;
          const totalValue = allProducts.reduce(
            (sum: number, p: Product) => sum + Number(p.price) * p.stock,
            0
          );

          setStats({
            totalProducts,
            activeProducts,
            lowStockItems,
            totalValue,
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
      <div className="p-6 space-y-6">
        {/* Header - matching customers page style */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Products</h1>
            <p className="text-sm text-gray-600">
              Manage and track your product inventory
            </p>
          </div>
          <Button
            asChild
            className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
          >
            <Link href="/vendor/products/add">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats Grid - matching customers page style */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
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

        {/* Filters - matching customers page style */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2 space-y-2">
                  <Label
                    htmlFor="search"
                    className="text-xs font-medium text-gray-700"
                  >
                    Search Products
                  </Label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-9 text-sm"
                      placeholder="Search by name, brand, or category..."
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <Label
                    htmlFor="category"
                    className="text-xs font-medium text-gray-700"
                  >
                    Category
                  </Label>
                  <Select
                    value={categoryFilter || "all"}
                    onValueChange={(value) =>
                      setCategoryFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
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

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="text-xs font-medium text-gray-700"
                  >
                    Status
                  </Label>
                  <Select
                    value={statusFilter || "all"}
                    onValueChange={(value) =>
                      setStatusFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">
                  {totalCount} products found
                </p>
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white h-8 px-4 text-xs cursor-pointer"
                >
                  Apply Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Products Table */}
        {loading ? (
          <TableSkeleton />
        ) : !products || products.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-12 text-center">
              <CubeIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                No products found
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {searchTerm || categoryFilter || statusFilter
                  ? "Try adjusting your filters or search terms"
                  : "Get started by creating your first product"}
              </p>
              <Button
                asChild
                className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
              >
                <Link href="/vendor/products/add">
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-gray-100">
                    <TableHead className="h-10">
                      <SortButton
                        field="name"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Product
                      </SortButton>
                    </TableHead>
                    <TableHead className="h-10">
                      <SortButton
                        field="price"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Price
                      </SortButton>
                    </TableHead>
                    <TableHead className="h-10">
                      <SortButton
                        field="stock"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Stock
                      </SortButton>
                    </TableHead>
                    <TableHead className="h-10">Status</TableHead>
                    <TableHead className="h-10">Sales</TableHead>
                    <TableHead className="w-[50px] h-10">Actions</TableHead>
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
        )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-600">
            Showing {(currentPage - 1) * 20 + 1} to{" "}
            {Math.min(currentPage * 20, totalCount)} of {totalCount} products
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="cursor-pointer"
            >
              Previous
            </Button>
            <span className="text-xs text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="cursor-pointer"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Delete Product</DialogTitle>
            <DialogDescription className="text-xs">
              Are you sure you want to delete &quot;{productToDelete?.name}
              &quot;? This action cannot be undone.
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
    </div>
  );
}
