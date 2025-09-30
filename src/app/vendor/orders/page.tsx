/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  CurrencyEuroIcon,
  UserIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { formatPrice } from "@/lib/utils";

interface OrderItem {
  id: string;
  type: "regular" | "variant";
  productId: string;
  variantId?: string | null;
  productName: string;
  variantName?: string | null;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
  variantDetails?: {
    color?: string;
    storage?: string;
    ram?: string;
    size?: string;
    material?: string;
  } | null;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status: string;
  totalAmount: number;
  shippingAmount: number;
  taxAmount: number;
  items: OrderItem[];
  shippingAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  paymentStatus: string;
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  notes?: string;
  priority?: string;
}

interface OrdersResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  stats: {
    totalRevenue: number;
    pendingOrders: number;
    processingOrders: number;
    completedOrders: number;
    totalOrders: number;
    averageOrderValue: number;
    revenueGrowth: number;
    orderGrowth: number;
    pendingGrowth: number;
    processingGrowth: number;
  };
}

// Mobile-responsive Stats Card Component with ultra-compact design
function StatCard({
  title,
  value,
  icon: Icon,
  change,
  iconColor,
  bgColor,
  subtitle,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  change: number;
  iconColor: string;
  bgColor: string;
  subtitle?: string;
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
              {subtitle && (
                <p className="text-[9px] sm:text-xs text-gray-500 truncate">
                  {subtitle}
                </p>
              )}
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
                  {Math.abs(change).toFixed(1)}%
                </span>
                <span className="text-[8px] sm:text-xs text-gray-500 hidden sm:inline">
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

// Status Badge Component using your Badge component with icons
function StatusBadge({ status }: { status: string }) {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "pending";
      case "confirmed":
        return "confirmed";
      case "processing":
        return "processing";
      case "shipped":
        return "shipped";
      case "delivered":
        return "delivered";
      case "cancelled":
        return "cancelled";
      case "refunded":
        return "refunded";
      default:
        return "default";
    }
  };

  return (
    <Badge variant={getStatusVariant(status)} size="sm" icon="auto">
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

// Payment Status Badge Component using your Badge component with icons
function PaymentStatusBadge({ status }: { status: string }) {
  const getPaymentVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "payment_pending";
      case "completed":
        return "payment_completed";
      case "processing":
        return "payment_processing";
      case "failed":
        return "payment_failed";
      case "refunded":
        return "refunded";
      case "cancelled":
        return "payment_cancelled";
      default:
        return "default";
    }
  };

  const getPaymentLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "Paid";
      case "processing":
        return "Processing";
      case "failed":
        return "Failed";
      case "refunded":
        return "Refunded";
      case "cancelled":
        return "Cancelled";
      case "pending":
      default:
        return "Pending";
    }
  };

  return (
    <Badge variant={getPaymentVariant(status)} size="sm" icon="auto">
      {getPaymentLabel(status)}
    </Badge>
  );
}

// Mobile Order Card Component with ultra-compact design
function MobileOrderCard({
  order,
  onStatusUpdate,
  updating,
  getAvailableStatusActions,
}: {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  updating: string | null;
  getAvailableStatusActions: (
    status: string
  ) => { value: string; label: string; icon: React.ElementType }[];
}) {
  return (
    <Card className="border-0 shadow-sm bg-white mb-2">
      <CardContent className="p-2">
        <div className="space-y-2">
          {/* Header Row */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-[11px] font-medium text-gray-900 truncate">
                {order.orderNumber}
              </h3>
              <p className="text-[9px] text-gray-500 truncate">
                ID: {order.id.slice(-8)}
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
                  <EllipsisVerticalIcon className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/vendor/orders/${order.id}`}
                    className="cursor-pointer text-[11px] py-1"
                  >
                    <EyeIcon className="w-3 h-3 mr-1" />
                    View Details
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {getAvailableStatusActions(order.status).map((action) => (
                  <DropdownMenuItem
                    key={action.value}
                    onClick={() => onStatusUpdate(order.id, action.value)}
                    disabled={updating === order.id}
                    className="text-slate-600 focus:text-slate-900 cursor-pointer text-[11px] py-1"
                  >
                    <action.icon className="w-3 h-3 mr-1" />
                    {updating === order.id ? "Updating..." : action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Customer & Items Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-3 h-3 text-gray-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-900 truncate">
                  {order.customerName}
                </p>
                <p className="text-[8px] text-gray-500 truncate">
                  {order.customerEmail}
                </p>
              </div>
            </div>

            {/* Items preview */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              {order.items.slice(0, 2).map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="w-6 h-6 bg-gray-100 rounded border overflow-hidden flex-shrink-0"
                >
                  <Image
                    src={item.productImage}
                    alt={item.productName}
                    width={24}
                    height={24}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "/products/default.jpg";
                    }}
                  />
                </div>
              ))}
              {order.items.length > 2 && (
                <div className="w-6 h-6 bg-gray-200 rounded border flex items-center justify-center flex-shrink-0">
                  <span className="text-[8px] font-medium text-gray-600">
                    +{order.items.length - 2}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Status & Payment Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1.5">
              <StatusBadge status={order.status} />
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>

            <div className="text-right">
              <p className="text-[11px] font-bold text-gray-900">
                {formatPrice(order.totalAmount)}
              </p>
              <p className="text-[8px] text-gray-500">
                {order.items.length} items
              </p>
            </div>
          </div>

          {/* Date Row */}
          <div className="text-center">
            <p className="text-[9px] text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              at{" "}
              {new Date(order.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile skeleton for order loading
function MobileOrdersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white">
          <CardContent className="p-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-2 w-16" />
                </div>
                <Skeleton className="w-5 h-5 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-2.5 w-20" />
                  <Skeleton className="h-2 w-28" />
                </div>
                <div className="flex space-x-1">
                  <Skeleton className="w-6 h-6 rounded" />
                  <Skeleton className="w-6 h-6 rounded" />
                </div>
              </div>
              <div className="flex justify-between">
                <div className="flex space-x-1">
                  <Skeleton className="h-4 w-12 rounded-full" />
                  <Skeleton className="h-4 w-10 rounded-full" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-2 w-10" />
                </div>
              </div>
              <Skeleton className="h-2 w-32 mx-auto" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
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

// Mobile-responsive Loading Skeletons
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

function OrdersTableSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-0">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-40" />
                </div>
                <div className="flex space-x-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function VendorOrdersPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || ""
  );
  const [dateFilter, setDateFilter] = useState(searchParams.get("date") || "");
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    revenueGrowth: 0,
    orderGrowth: 0,
    pendingGrowth: 0,
    processingGrowth: 0,
  });
  const [updating, setUpdating] = useState<string | null>(null);

  // Load orders data
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "15",
          sort: sortBy,
          order: sortOrder,
        });

        if (searchTerm) params.append("search", searchTerm);
        if (statusFilter) params.append("status", statusFilter);
        if (dateFilter) params.append("date", dateFilter);

        const response = await fetch(`/api/vendor/orders?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch orders data");
        }

        const result: OrdersResponse = await response.json();

        if (result.success) {
          setOrders(result.orders || []);
          setTotalPages(result.pagination?.totalPages ?? 1);
          setTotalCount(result.pagination?.totalCount ?? 0);
          setStats({
            totalRevenue: result.stats?.totalRevenue || 0,
            pendingOrders: result.stats?.pendingOrders || 0,
            processingOrders: result.stats?.processingOrders || 0,
            completedOrders: result.stats?.completedOrders || 0,
            totalOrders: result.stats?.totalOrders || 0,
            averageOrderValue: result.stats?.averageOrderValue || 0,
            revenueGrowth: result.stats?.revenueGrowth || 0,
            orderGrowth: result.stats?.orderGrowth || 0,
            pendingGrowth: result.stats?.pendingGrowth || 0,
            processingGrowth: result.stats?.processingGrowth || 0,
          });
        } else {
          throw new Error("Failed to load orders data");
        }
      } catch (error) {
        console.error("Error loading orders:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load orders data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadOrders();
    }
  }, [
    session,
    currentPage,
    sortBy,
    sortOrder,
    searchTerm,
    statusFilter,
    dateFilter,
  ]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(orderId);

      const response = await fetch("/api/vendor/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      // Update local state
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: newStatus,
                updatedAt: new Date().toISOString(),
              }
            : order
        )
      );
    } catch (error) {
      console.error("Error updating order status:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const getAvailableStatusActions = (currentStatus: string) => {
    const actions: { value: string; label: string; icon: React.ElementType }[] =
      [];

    if (currentStatus === "pending") {
      actions.push(
        { value: "confirmed", label: "Confirm Order", icon: CheckCircleIcon },
        { value: "processing", label: "Start Processing", icon: ArrowPathIcon },
        { value: "cancelled", label: "Cancel Order", icon: XCircleIcon }
      );
    }

    if (currentStatus === "confirmed") {
      actions.push(
        { value: "processing", label: "Start Processing", icon: ArrowPathIcon },
        { value: "cancelled", label: "Cancel Order", icon: XCircleIcon }
      );
    }

    if (currentStatus === "processing") {
      actions.push({
        value: "shipped",
        label: "Mark as Shipped",
        icon: TruckIcon,
      });
    }

    if (currentStatus === "shipped") {
      actions.push({
        value: "delivered",
        label: "Mark as Delivered",
        icon: CheckCircleIcon,
      });
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <StatsSkeleton />

          {/* Filters */}
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mobile/Desktop Skeleton Display */}
          <div className="block lg:hidden">
            <MobileOrdersSkeleton />
          </div>
          <div className="hidden lg:block">
            <OrdersTableSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
        <div className="text-center py-32">
          <ExclamationTriangleIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Unable to load orders
          </h3>
          <p className="text-slate-500 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-2 sm:p-6 space-y-3 sm:space-y-6">
        {/* Mobile-optimized Header */}
        <div className="flex items-start sm:items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-gray-900">
              Orders
            </h1>
            <p className="text-[10px] sm:text-sm text-gray-600 truncate">
              Manage and track your customer orders
            </p>
          </div>
        </div>

        {/* Mobile-optimized Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4"
        >
          <StatCard
            title="Total Revenue"
            value={formatPrice(stats.totalRevenue)}
            change={stats.revenueGrowth}
            icon={CurrencyEuroIcon}
            iconColor="text-emerald-600"
            bgColor="bg-emerald-50"
          />

          <StatCard
            title="Total Orders"
            value={stats.totalOrders}
            change={stats.orderGrowth}
            icon={ShoppingBagIcon}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
          />

          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            change={stats.pendingGrowth}
            icon={ClockIcon}
            iconColor="text-amber-600"
            bgColor="bg-amber-50"
          />

          <StatCard
            title="Processing Orders"
            value={stats.processingOrders}
            change={stats.processingGrowth}
            icon={ArrowPathIcon}
            iconColor="text-purple-600"
            bgColor="bg-purple-50"
          />
        </motion.div>

        {/* Mobile-optimized Filters */}
        <Card className="border-0 shadow-sm bg-white">
          <CardContent className="p-2 sm:p-6">
            <form onSubmit={handleSearch} className="space-y-2 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                {/* Search */}
                <div className="sm:col-span-2 md:col-span-2 space-y-1 sm:space-y-2">
                  <Label
                    htmlFor="search"
                    className="text-[9px] sm:text-xs font-medium text-gray-700"
                  >
                    Search Orders
                  </Label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-slate-400" />
                    <Input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-7 sm:pl-10 h-7 sm:h-9 text-[11px] sm:text-sm"
                      placeholder="Search orders..."
                    />
                  </div>
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
                        value="pending"
                        className="text-[11px] sm:text-sm"
                      >
                        Pending
                      </SelectItem>
                      <SelectItem
                        value="confirmed"
                        className="text-[11px] sm:text-sm"
                      >
                        Confirmed
                      </SelectItem>
                      <SelectItem
                        value="processing"
                        className="text-[11px] sm:text-sm"
                      >
                        Processing
                      </SelectItem>
                      <SelectItem
                        value="shipped"
                        className="text-[11px] sm:text-sm"
                      >
                        Shipped
                      </SelectItem>
                      <SelectItem
                        value="delivered"
                        className="text-[11px] sm:text-sm"
                      >
                        Delivered
                      </SelectItem>
                      <SelectItem
                        value="cancelled"
                        className="text-[11px] sm:text-sm"
                      >
                        Cancelled
                      </SelectItem>
                      <SelectItem
                        value="refunded"
                        className="text-[11px] sm:text-sm"
                      >
                        Refunded
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filter */}
                <div className="space-y-1 sm:space-y-2">
                  <Label
                    htmlFor="date"
                    className="text-[9px] sm:text-xs font-medium text-gray-700"
                  >
                    Date Range
                  </Label>
                  <Select
                    value={dateFilter || "all"}
                    onValueChange={(value) =>
                      setDateFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger className="h-7 sm:h-9 text-[11px] sm:text-sm">
                      <SelectValue placeholder="All Dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="all"
                        className="text-[11px] sm:text-sm"
                      >
                        All Dates
                      </SelectItem>
                      <SelectItem
                        value="today"
                        className="text-[11px] sm:text-sm"
                      >
                        Today
                      </SelectItem>
                      <SelectItem
                        value="week"
                        className="text-[11px] sm:text-sm"
                      >
                        This Week
                      </SelectItem>
                      <SelectItem
                        value="month"
                        className="text-[11px] sm:text-sm"
                      >
                        This Month
                      </SelectItem>
                      <SelectItem
                        value="quarter"
                        className="text-[11px] sm:text-sm"
                      >
                        This Quarter
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 sm:pt-4 border-t border-gray-100">
                <p className="text-[9px] sm:text-xs text-gray-600">
                  {totalCount} orders found
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

        {/* Orders Display - Mobile Cards / Desktop Table */}
        {orders.length === 0 ? (
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6 sm:p-12 text-center">
              <ShoppingBagIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-3 sm:mb-4" />
              <h3 className="text-sm sm:text-xl font-semibold text-slate-900 mb-1 sm:mb-2">
                No orders found
              </h3>
              <p className="text-[11px] sm:text-base text-slate-500">
                Orders will appear here once customers start purchasing your
                products
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Mobile Order Cards - Only visible on mobile */}
            <div className="block lg:hidden">
              {orders.map((order) => (
                <MobileOrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                  updating={updating}
                  getAvailableStatusActions={getAvailableStatusActions}
                />
              ))}
            </div>

            {/* Desktop Table - Only visible on desktop (unchanged) */}
            <div className="hidden lg:block">
              <Card className="border-0 shadow-sm bg-white">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="h-10 text-left pl-4">
                          <SortButton
                            field="id"
                            currentSort={sortBy}
                            currentOrder={sortOrder}
                            onSort={handleSort}
                          >
                            Order
                          </SortButton>
                        </TableHead>
                        <TableHead className="h-10 text-left pl-4">
                          <SortButton
                            field="customerName"
                            currentSort={sortBy}
                            currentOrder={sortOrder}
                            onSort={handleSort}
                          >
                            Customer
                          </SortButton>
                        </TableHead>
                        <TableHead className="h-10 text-left pl-4">
                          Items
                        </TableHead>
                        <TableHead className="h-10 text-left pl-4">
                          <SortButton
                            field="total"
                            currentSort={sortBy}
                            currentOrder={sortOrder}
                            onSort={handleSort}
                          >
                            Total
                          </SortButton>
                        </TableHead>
                        <TableHead className="h-10 text-center">
                          Status
                        </TableHead>
                        <TableHead className="h-10 text-center">
                          Payment
                        </TableHead>
                        <TableHead className="h-10 text-left pl-4">
                          <SortButton
                            field="createdAt"
                            currentSort={sortBy}
                            currentOrder={sortOrder}
                            onSort={handleSort}
                          >
                            Date
                          </SortButton>
                        </TableHead>
                        <TableHead className="w-[50px] h-10 text-center">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow
                          key={order.id}
                          className="hover:bg-slate-50/50 border-slate-100"
                        >
                          {/* Order Column */}
                          <TableCell className="py-3 text-left pl-4">
                            <div>
                              <p className="font-medium text-slate-900 text-sm">
                                {order.orderNumber}
                              </p>
                              <p className="text-xs text-slate-500">
                                ID: {order.id.slice(-8)}
                              </p>
                            </div>
                          </TableCell>

                          {/* Customer Column */}
                          <TableCell className="py-3 text-left pl-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <UserIcon className="w-4 h-4 text-slate-600" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-900 text-sm truncate">
                                  {order.customerName}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {order.customerEmail}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Items Column */}
                          <TableCell className="py-3 text-left pl-4">
                            <div className="flex items-center space-x-2">
                              {order.items.slice(0, 2).map((item, index) => (
                                <div
                                  key={`${item.id}-${index}`}
                                  className="w-8 h-8 bg-slate-100 rounded border overflow-hidden flex-shrink-0"
                                >
                                  <Image
                                    src={item.productImage}
                                    alt={`${item.productName}${
                                      item.variantName
                                        ? ` - ${item.variantName}`
                                        : ""
                                    }`}
                                    width={32}
                                    height={32}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src =
                                        "/products/default.jpg";
                                    }}
                                  />
                                </div>
                              ))}
                              {order.items.length > 2 && (
                                <div className="w-8 h-8 bg-slate-200 rounded border flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-medium text-slate-600">
                                    +{order.items.length - 2}
                                  </span>
                                </div>
                              )}
                              <span className="text-sm text-slate-600">
                                ({order.items.length} items)
                              </span>
                            </div>
                          </TableCell>

                          {/* Total Column */}
                          <TableCell className="py-3 text-left pl-4">
                            <p className="font-bold text-slate-900 text-sm">
                              {formatPrice(order.totalAmount)}
                            </p>
                          </TableCell>

                          {/* Status Column */}
                          <TableCell className="py-3 text-center">
                            <StatusBadge status={order.status} />
                          </TableCell>

                          {/* Payment Column */}
                          <TableCell className="py-3 text-center">
                            <PaymentStatusBadge status={order.paymentStatus} />
                          </TableCell>

                          {/* Date Column */}
                          <TableCell className="py-3 text-left pl-4">
                            <div>
                              <p className="font-medium text-slate-900 text-sm">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                              <p className="text-xs text-slate-500">
                                {new Date(order.createdAt).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </TableCell>

                          {/* Actions Column */}
                          <TableCell className="py-3 text-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 w-7 p-0 hover:bg-slate-100 cursor-pointer"
                                >
                                  <EllipsisVerticalIcon className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link
                                    href={`/vendor/orders/${order.id}`}
                                    className="cursor-pointer"
                                  >
                                    <EyeIcon className="w-3 h-3 mr-2" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {getAvailableStatusActions(order.status).map(
                                  (action) => (
                                    <DropdownMenuItem
                                      key={action.value}
                                      onClick={() =>
                                        handleStatusUpdate(
                                          order.id,
                                          action.value
                                        )
                                      }
                                      disabled={updating === order.id}
                                      className="text-slate-600 focus:text-slate-900 cursor-pointer"
                                    >
                                      <action.icon className="w-3 h-3 mr-2" />
                                      {updating === order.id
                                        ? "Updating..."
                                        : action.label}
                                    </DropdownMenuItem>
                                  )
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
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
              <p className="text-[9px] text-slate-700 text-center">
                Page {currentPage} of {totalPages} ({totalCount} orders)
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
                <span className="text-[9px] text-slate-500 px-1">
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
              <p className="text-xs text-slate-700">
                Showing {(currentPage - 1) * 15 + 1} to{" "}
                {Math.min(currentPage * 15, totalCount)} of {totalCount} orders
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
    </div>
  );
}
