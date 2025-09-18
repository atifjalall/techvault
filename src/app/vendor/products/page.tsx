"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
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
  ClockIcon,
  XCircleIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from "@heroicons/react/24/solid";

// UI Components
import { Button } from "@/components/ui/buttonSidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

import { formatPrice } from "@/lib/utils";
import React from "react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  brand?: string;
  modelNumber?: string;
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
  _count: {
    reviews: number;
    cartItems: number;
  };
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
}

// Enhanced Stock Badge Component
function StockBadge({ stock, lowStockAlert }: { stock: number; lowStockAlert: number }) {
  const getStockStatus = () => {
    if (stock === 0) return { label: "Out of Stock", variant: "destructive" as const, icon: XCircleIcon };
    if (stock <= lowStockAlert) return { label: "Low Stock", variant: "secondary" as const, icon: ExclamationTriangleIcon };
    return { label: "In Stock", variant: "default" as const, icon: CheckCircleIcon };
  };

  const status = getStockStatus();
  const Icon = status.icon;

  return (
    <div className="text-center space-y-1">
      <div className="text-sm font-semibold text-gray-900">{stock}</div>
      <Badge variant={status.variant} className="text-xs">
        <Icon className="w-3 h-3 mr-1" />
        {status.label}
      </Badge>
    </div>
  );
}

// Status Badge Component
function StatusBadge({ isActive, onToggle }: { isActive: boolean; onToggle: () => void }) {
  return (
    <Button
      onClick={onToggle}
      variant="outline"
      size="sm"
      className={`text-xs transition-colors duration-200 ${
        isActive 
          ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100" 
          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
      }`}
    >
      {isActive ? (
        <>
          <CheckCircleIconSolid className="w-3 h-3 mr-1.5" />
          Active
        </>
      ) : (
        <>
          <ClockIcon className="w-3 h-3 mr-1.5" />
          Inactive
        </>
      )}
    </Button>
  );
}

// Stats Card Component
function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  variant = "default" 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  change: string;
  variant?: "default" | "success" | "warning" | "destructive";
}) {
  const variantStyles = {
    default: "bg-blue-50 text-blue-600",
    success: "bg-green-50 text-green-600", 
    warning: "bg-yellow-50 text-yellow-600",
    destructive: "bg-red-50 text-red-600"
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className={`text-xs font-medium ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
              {change} from last month
            </p>
          </div>
          <div className={`p-3 rounded-xl ${variantStyles[variant]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Sort Button Component
function SortButton({ 
  field, 
  currentSort, 
  currentOrder, 
  onSort, 
  children 
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
      className="hover:bg-transparent p-0 h-auto font-semibold text-xs text-gray-600 uppercase tracking-wide"
    >
      <span className="flex items-center space-x-1">
        <span>{children}</span>
        {currentSort === field && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-blue-600"
          >
            {currentOrder === "asc" ? (
              <ArrowUpIcon className="w-3 h-3" />
            ) : (
              <ArrowDownIcon className="w-3 h-3" />
            )}
          </motion.div>
        )}
      </span>
    </Button>
  );
}

export default function VendorProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Load categories
  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Error loading categories:", err));
  }, []);

  // Load products
  useEffect(() => {
    loadProducts();
  }, [currentPage, searchTerm, selectedCategory, statusFilter, sortBy, sortOrder]);

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
      if (selectedCategory) params.append("category", selectedCategory);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/vendor/products?${params}`);
      const data: ProductsResponse = await response.json();

      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const handleStatusToggle = async (productId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      if (response.ok) {
        loadProducts();
      }
    } catch (error) {
      console.error("Error updating product status:", error);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`/api/vendor/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setProductToDelete(null);
        loadProducts();
      }
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  const getDiscountPercentage = (price: number, comparePrice?: number) => {
    if (!comparePrice || comparePrice <= price) return 0;
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600 mt-1">Manage your product inventory and listings</p>
        </div>
        <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link href="/vendor/products/add">
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Products"
          value={totalCount}
          icon={PhotoIcon}
          change="+12%"
          variant="default"
        />
        <StatsCard
          title="Active Products"
          value={products.filter((p) => p.isActive).length}
          icon={CheckCircleIcon}
          change="+5%"
          variant="success"
        />
        <StatsCard
          title="Low Stock"
          value={products.filter((p) => p.stock <= p.lowStockAlert && p.stock > 0).length}
          icon={ExclamationTriangleIcon}
          change="-2%"
          variant="warning"
        />
        <StatsCard
          title="Out of Stock"
          value={products.filter((p) => p.stock === 0).length}
          icon={XCircleIcon}
          change="-8%"
          variant="destructive"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="search">Search Products</Label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    placeholder="Search by name, brand, or model..."
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={selectedCategory || "all"} onValueChange={(value) => setSelectedCategory(value === "all" ? "" : value)}>
                  <SelectTrigger>
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
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <p className="text-sm text-gray-600">{totalCount} products found</p>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Apply Filters</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center space-y-4">
              <Skeleton className="h-12 w-12 rounded-full mx-auto" />
              <Skeleton className="h-4 w-48 mx-auto" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-12 text-center">
              <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 mb-6">Start by adding your first product to get started</p>
              <Button asChild>
                <Link href="/vendor/products/add" className="bg-blue-600 hover:bg-blue-700 text-white inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors">
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Your First Product
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px]">
                    <SortButton field="name" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                      Product
                    </SortButton>
                  </TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>
                    <SortButton field="price" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                      Price
                    </SortButton>
                  </TableHead>
                  <TableHead>
                    <SortButton field="stock" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                      Stock
                    </SortButton>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <SortButton field="created" currentSort={sortBy} currentOrder={sortOrder} onSort={handleSort}>
                      Created
                    </SortButton>
                  </TableHead>
                  <TableHead className="w-[50px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                  {products.map((product, index) => {
                    const discount = getDiscountPercentage(product.price, product.comparePrice);

                    return (
                      <TableRow key={product.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-12 h-12">
                              {product.images.length > 0 ? (
                                <Image
                                  src={product.images[0]}
                                  alt={product.name}
                                  width={48}
                                  height={48}
                                  className="w-12 h-12 object-cover rounded-lg border"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border">
                                  <PhotoIcon className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                {product.brand && (
                                  <span className="text-xs text-gray-500">{product.brand}</span>
                                )}
                                {product.modelNumber && (
                                  <span className="text-xs text-gray-400">#{product.modelNumber}</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                {product.featured && (
                                  <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                    <StarIconSolid className="w-3 h-3 mr-1" />
                                    Featured
                                  </Badge>
                                )}
                                {product._count.reviews > 0 && (
                                  <span className="text-xs text-gray-500 flex items-center">
                                    <StarIcon className="w-3 h-3 mr-1" />
                                    {product._count.reviews} reviews
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span className="font-medium text-gray-900">{product.category.name}</span>
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="font-bold text-gray-900">{formatPrice(product.price)}</div>
                            {product.comparePrice && discount > 0 && (
                              <div className="text-xs text-blue-600 font-semibold">{discount}% off</div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <StockBadge stock={product.stock} lowStockAlert={product.lowStockAlert} />
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            isActive={product.isActive}
                            onToggle={() => handleStatusToggle(product.id, product.isActive)}
                          />
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="font-medium text-gray-900">
                              {new Date(product.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(product.createdAt).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                                <EllipsisVerticalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/products/${product.slug}`}>
                                  <EyeIcon className="w-4 h-4 mr-2" />
                                  View Product
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/vendor/products/${product.id}/edit`}>
                                  <PencilIcon className="w-4 h-4 mr-2" />
                                  Edit Product
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600 focus:text-red-600"
                                onClick={() => {
                                  setProductToDelete(product.id);
                                  setShowDeleteModal(true);
                                }}
                              >
                                <TrashIcon className="w-4 h-4 mr-2" />
                                Delete Product
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {(currentPage - 1) * 10 + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} products
          </p>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
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
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="w-10"
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
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this product? This action cannot be undone and will permanently remove the product from your store.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => productToDelete && handleDeleteProduct(productToDelete)}
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}