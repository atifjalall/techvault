"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
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
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  StarIcon as StarIconSolid,
  CheckCircleIcon as CheckCircleIconSolid,
} from "@heroicons/react/24/solid";
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

// BULLETPROOF Portal-based Action Menu - FIXED TypeScript
function PortalActionMenu({
  product,
  onDelete,
  triggerRef,
}: {
  product: Product;
  onDelete: (id: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>; // FIXED: Added | null
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft;

      setPosition({
        top: rect.bottom + scrollTop + 8,
        left: rect.right + scrollLeft - 200, // 200px is menu width
      });
    }
  }, [isOpen, triggerRef]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleScroll() {
      if (isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [isOpen, triggerRef]);

  const menuContent = isOpen ? (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -10 }}
        transition={{ duration: 0.15 }}
        className="fixed bg-white rounded-xl shadow-2xl border border-gray-200 py-2 overflow-hidden"
        style={{
          top: position.top,
          left: position.left,
          width: "200px",
          zIndex: 99999, // Maximum z-index
        }}
      >
        {/* Arrow pointer */}
        <div
          className="absolute w-3 h-3 bg-white rotate-45 border-l border-t border-gray-200"
          style={{
            top: "-6px",
            right: "24px",
          }}
        />

        <div className="py-1">
          <Link
            href={`/products/${product.slug}`}
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
            onClick={() => setIsOpen(false)}
          >
            <EyeIcon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-600" />
            <span className="font-medium">View Product</span>
          </Link>

          <Link
            href={`/vendor/products/${product.id}/edit`}
            className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors group"
            onClick={() => setIsOpen(false)}
          >
            <PencilIcon className="w-4 h-4 mr-3 text-gray-400 group-hover:text-gray-600" />
            <span className="font-medium">Edit Product</span>
          </Link>

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={() => {
              onDelete(product.id);
              setIsOpen(false);
            }}
            className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors group"
          >
            <TrashIcon className="w-4 h-4 mr-3 text-red-400 group-hover:text-red-600" />
            <span className="font-medium">Delete Product</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  ) : null;

  return (
    <>
      <motion.button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-200"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <EllipsisVerticalIcon className="w-5 h-5" />
      </motion.button>

      {typeof window !== "undefined" &&
        createPortal(menuContent, document.body)}
    </>
  );
}

// Enhanced Status Badge Component
function StatusBadge({
  isActive,
  onToggle,
}: {
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.button
      onClick={onToggle}
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
        isActive
          ? "bg-green-100 text-green-800 hover:bg-green-200"
          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
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
    </motion.button>
  );
}

// Enhanced Stock Badge Component
function StockBadge({
  stock,
  lowStockAlert,
}: {
  stock: number;
  lowStockAlert: number;
}) {
  const getStockStatus = () => {
    if (stock === 0)
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-800",
        icon: XCircleIcon,
      };
    if (stock <= lowStockAlert)
      return {
        label: "Low Stock",
        color: "bg-yellow-100 text-yellow-800",
        icon: ExclamationTriangleIcon,
      };
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-800",
      icon: CheckCircleIcon,
    };
  };

  const status = getStockStatus();
  const Icon = status.icon;

  return (
    <div className="text-center">
      <div className="text-sm font-semibold text-gray-900 mb-1">{stock}</div>
      <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.label}
      </span>
    </div>
  );
}

export default function VendorProductsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [sortBy, setSortBy] = useState("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // FIXED: Refs for action menu triggers with proper TypeScript typing
  const actionButtonRefs = useRef<{
    [key: string]: React.RefObject<HTMLButtonElement | null>;
  }>({});

  // Initialize refs for all products at component mount
  useEffect(() => {
    const newRefs: { [key: string]: React.RefObject<HTMLButtonElement | null> } = {};
    products.forEach((product) => {
      if (!actionButtonRefs.current[product.id]) {
        newRefs[product.id] = React.createRef<HTMLButtonElement>();
        actionButtonRefs.current[product.id] = newRefs[product.id];
      }
    });
  }, [products]);

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
  }, [
    currentPage,
    searchTerm,
    selectedCategory,
    statusFilter,
    sortBy,
    sortOrder,
  ]);

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

  const handleStatusToggle = async (
    productId: string,
    currentStatus: boolean
  ) => {
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

  const SortButton = ({
    field,
    children,
  }: {
    field: string;
    children: React.ReactNode;
  }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 hover:text-gray-900 transition-colors group"
    >
      <span>{children}</span>
      {sortBy === field && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-black"
        >
          {sortOrder === "asc" ? (
            <ArrowUpIcon className="w-3 h-3" />
          ) : (
            <ArrowDownIcon className="w-3 h-3" />
          )}
        </motion.div>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
              <p className="text-gray-600 mt-2">
                Manage your product inventory and listings
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link
                href="/vendor/products/add"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Product
              </Link>
            </motion.div>
          </div>

          {/* Enhanced Stats */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {[
              {
                label: "Total Products",
                value: totalCount,
                icon: PhotoIcon,
                color: "blue",
                change: "+12%",
              },
              {
                label: "Active",
                value: products.filter((p) => p.isActive).length,
                icon: CheckCircleIcon,
                color: "green",
                change: "+5%",
              },
              {
                label: "Low Stock",
                value: products.filter(
                  (p) => p.stock <= p.lowStockAlert && p.stock > 0
                ).length,
                icon: ExclamationTriangleIcon,
                color: "yellow",
                change: "-2%",
              },
              {
                label: "Out of Stock",
                value: products.filter((p) => p.stock === 0).length,
                icon: XCircleIcon,
                color: "red",
                change: "-8%",
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <p
                      className={`text-xs font-medium mt-1 ${
                        stat.change.startsWith("+")
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {stat.change} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-${stat.color}-100`}>
                    <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Enhanced Filters */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-200"
                    placeholder="Search by name, brand, or model..."
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent appearance-none bg-white transition-all duration-200"
                  >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDownIcon className="h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {totalCount} products found
              </div>
              <motion.button
                type="submit"
                className="px-6 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Apply Filters
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Enhanced Products Table */}
        <motion.div
          className="bg-white rounded-xl border border-gray-200 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ overflow: "visible" }} // FORCE VISIBLE OVERFLOW
        >
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500 font-medium">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <motion.div
              className="p-12 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <PhotoIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-500 mb-6">
                Start by adding your first product to get started
              </p>
              <Link
                href="/vendor/products/add"
                className="inline-flex items-center px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Your First Product
              </Link>
            </motion.div>
          ) : (
            <div style={{ overflow: "visible" }}>
              {" "}
              {/* FORCE VISIBLE OVERFLOW */}
              {/* Table Header */}
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  <div className="col-span-4">
                    <SortButton field="name">Product</SortButton>
                  </div>
                  <div className="col-span-2">Category</div>
                  <div className="col-span-1">
                    <SortButton field="price">Price</SortButton>
                  </div>
                  <div className="col-span-1">
                    <SortButton field="stock">Stock</SortButton>
                  </div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">
                    <SortButton field="created">Created</SortButton>
                  </div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>
              {/* Table Body */}
              <div
                className="divide-y divide-gray-200"
                style={{ overflow: "visible" }}
              >
                <AnimatePresence>
                  {products.map((product, index) => {
                    const discount = getDiscountPercentage(
                      product.price,
                      product.comparePrice
                    );

                    // Ensure we have a ref for this product
                    if (!actionButtonRefs.current[product.id]) {
                      actionButtonRefs.current[product.id] = React.createRef<HTMLButtonElement>();
                    }

                    return (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="px-6 py-4 hover:bg-gray-50 transition-all duration-200 group"
                        style={{ position: "relative", overflow: "visible" }} // FORCE VISIBLE OVERFLOW
                      >
                        <div className="grid grid-cols-12 gap-4 items-center">
                          {/* Product */}
                          <div className="col-span-4">
                            <div className="flex items-center space-x-4">
                              <div className="flex-shrink-0 w-14 h-14">
                                {product.images.length > 0 ? (
                                  <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    width={56}
                                    height={56}
                                    className="w-14 h-14 object-cover rounded-xl border border-gray-200"
                                  />
                                ) : (
                                  <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                                    <PhotoIcon className="w-7 h-7 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-gray-900 truncate">
                                  {product.name}
                                </h3>
                                <div className="flex items-center space-x-2 mt-1">
                                  {product.brand && (
                                    <span className="text-xs text-gray-500">
                                      {product.brand}
                                    </span>
                                  )}
                                  {product.modelNumber && (
                                    <span className="text-xs text-gray-400">
                                      #{product.modelNumber}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 mt-1">
                                  {product.featured && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <StarIconSolid className="w-3 h-3 mr-1" />
                                      Featured
                                    </span>
                                  )}
                                  {product._count.reviews > 0 && (
                                    <div className="flex items-center text-xs text-gray-500">
                                      <StarIcon className="w-3 h-3 mr-1" />
                                      {product._count.reviews} reviews
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Category */}
                          <div className="col-span-2">
                            <span className="text-sm font-medium text-gray-900">
                              {product.category.name}
                            </span>
                          </div>

                          {/* Price */}
                          <div className="col-span-1">
                            <div className="text-sm font-bold text-gray-900">
                              {formatPrice(product.price)}
                            </div>
                            {product.comparePrice && discount > 0 && (
                              <>
                                <div className="text-xs text-green-600 font-semibold">
                                  {discount}% off
                                </div>
                              </>
                            )}
                          </div>

                          {/* Stock */}
                          <div className="col-span-1">
                            <StockBadge
                              stock={product.stock}
                              lowStockAlert={product.lowStockAlert}
                            />
                          </div>

                          {/* Status */}
                          <div className="col-span-1">
                            <StatusBadge
                              isActive={product.isActive}
                              onToggle={() =>
                                handleStatusToggle(product.id, product.isActive)
                              }
                            />
                          </div>

                          {/* Created */}
                          <div className="col-span-2">
                            <div className="text-sm font-medium text-gray-900">
                              {new Date(product.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(product.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </div>
                          </div>

                          {/* Actions - BULLETPROOF PORTAL VERSION */}
                          <div
                            className="col-span-1"
                            style={{ position: "relative", zIndex: 1 }}
                          >
                            <PortalActionMenu
                              product={product}
                              onDelete={(id) => {
                                setProductToDelete(id);
                                setShowDeleteModal(true);
                              }}
                              triggerRef={actionButtonRefs.current[product.id]}
                            />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>

        {/* Enhanced Pagination */}
        {totalPages > 1 && (
          <motion.div
            className="mt-8 flex items-center justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="text-sm text-gray-700 font-medium">
              Showing {(currentPage - 1) * 10 + 1} to{" "}
              {Math.min(currentPage * 10, totalCount)} of {totalCount} products
            </div>

            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: currentPage === 1 ? 1 : 1.02 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.98 }}
              >
                Previous
              </motion.button>

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
                    <motion.button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                        currentPage === pageNumber
                          ? "bg-black text-white shadow-lg"
                          : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {pageNumber}
                    </motion.button>
                  );
                })}
              </div>

              <motion.button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.02 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.98 }}
              >
                Next
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Enhanced Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full flex items-center justify-center p-4"
              style={{ zIndex: 99999 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
              >
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <TrashIcon className="h-8 w-8 text-red-600" />
                  </div>

                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Delete Product
                  </h3>

                  <p className="text-gray-500 mb-6">
                    Are you sure you want to delete this product? This action
                    cannot be undone and will permanently remove the product
                    from your store.
                  </p>

                  <div className="flex items-center justify-center space-x-3">
                    <motion.button
                      onClick={() => {
                        setShowDeleteModal(false);
                        setProductToDelete(null);
                      }}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      onClick={() =>
                        productToDelete && handleDeleteProduct(productToDelete)
                      }
                      className="px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Delete Product
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
