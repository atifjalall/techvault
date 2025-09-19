/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ShoppingBagIcon,
  ArrowPathIcon,
  CurrencyEuroIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  XCircleIcon as XCircleIconSolid,
  ClockIcon as ClockIconSolid,
  TruckIcon as TruckIconSolid,
} from "@heroicons/react/24/solid";

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
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  total: number;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "refunded";
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
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
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
  };
}

// Order Status Configuration
const ORDER_STATUSES = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: ClockIconSolid,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircleIconSolid,
  },
  processing: {
    label: "Processing",
    color: "bg-violet-100 text-violet-800 border-violet-200",
    icon: ArrowPathIcon,
  },
  shipped: {
    label: "Shipped",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: TruckIconSolid,
  },
  delivered: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircleIconSolid,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    icon: XCircleIconSolid,
  },
  refunded: {
    label: "Refunded",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    icon: ExclamationTriangleIcon,
  },
};

// Payment Status Configuration
const PAYMENT_STATUSES = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-200",
  },
  paid: {
    label: "Paid",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  failed: {
    label: "Failed",
    color: "bg-rose-100 text-rose-800 border-rose-200",
  },
  refunded: {
    label: "Refunded",
    color: "bg-slate-100 text-slate-800 border-slate-200",
  },
};

// Status Badge Component
function StatusBadge({
  status,
  showIcon = true,
}: {
  status: string;
  showIcon?: boolean;
}) {
  const config = ORDER_STATUSES[status as keyof typeof ORDER_STATUSES];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`text-xs ${config.color}`}>
      {showIcon && <Icon className="w-3 h-3 mr-1.5" />}
      {config.label}
    </Badge>
  );
}

// Payment Status Badge Component
function PaymentStatusBadge({ status }: { status: string }) {
  const config = PAYMENT_STATUSES[status as keyof typeof PAYMENT_STATUSES];
  if (!config) return null;

  return (
    <Badge variant="outline" className={`text-xs ${config.color}`}>
      {config.label}
    </Badge>
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
      className="hover:bg-transparent p-0 h-auto font-semibold text-xs text-slate-600 uppercase tracking-wide"
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

// Loading Skeletons
function OrdersTableSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-white/80">
      <CardContent className="p-0">
        <div className="p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg"
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
  const router = useRouter();
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
        console.log("Orders API result:", result); // 🔍 Debugging

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
                status: newStatus as any,
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
    // The effect will trigger automatically due to state changes
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="border-0 shadow-sm bg-white/80">
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

          <OrdersTableSkeleton />
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
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-600">
              Manage and track your customer orders
            </p>
          </div>
        </div>

        {/* Stats Grid - Updated UI */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(stats.totalRevenue)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CurrencyEuroIcon className="h-5 w-5 text-emerald-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.totalOrders}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <ShoppingBagIcon className="h-5 w-5 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Pending Orders
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.pendingOrders}
                  </p>
                </div>
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                  <ClockIcon className="h-5 w-5 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-600">
                    Processing Orders
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.processingOrders}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <ArrowPathIcon className="h-5 w-5 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Search */}
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="search">Search Orders</Label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      placeholder="Search by order number, customer name..."
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={statusFilter || "all"}
                    onValueChange={(value) =>
                      setStatusFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Filter */}
                <div className="space-y-2">
                  <Label htmlFor="date">Date Range</Label>
                  <Select
                    value={dateFilter || "all"}
                    onValueChange={(value) =>
                      setDateFilter(value === "all" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Dates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Dates</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-slate-600">
                  {totalCount} orders found
                </p>
                <Button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white"
                >
                  Apply Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
          <CardContent className="p-0">
            {orders.length === 0 ? (
              <div className="p-12 text-center">
                <ShoppingBagIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No orders found
                </h3>
                <p className="text-slate-500">
                  Orders will appear here once customers start purchasing your
                  products
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead>
                      <SortButton
                        field="id"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Order
                      </SortButton>
                    </TableHead>
                    <TableHead>
                      <SortButton
                        field="customerName"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Customer
                      </SortButton>
                    </TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>
                      <SortButton
                        field="total"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Total
                      </SortButton>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>
                      <SortButton
                        field="createdAt"
                        currentSort={sortBy}
                        currentOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Date
                      </SortButton>
                    </TableHead>
                    <TableHead className="w-[50px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow
                      key={order.id}
                      className="hover:bg-slate-50/50 border-slate-100"
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {order.orderNumber}
                          </p>
                          <p className="text-xs text-slate-500">
                            ID: {order.id.slice(-8)}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-4 h-4 text-slate-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">
                              {order.customerName}
                            </p>
                            <p className="text-xs text-slate-500">
                              {order.customerEmail}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {order.items.slice(0, 2).map((item) => (
                            <div
                              key={item.id}
                              className="w-8 h-8 bg-slate-100 rounded border overflow-hidden"
                            >
                              <Image
                                src={item.productImage}
                                alt={item.productName}
                                width={32}
                                height={32}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <div className="w-8 h-8 bg-slate-200 rounded border flex items-center justify-center">
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

                      <TableCell>
                        <p className="font-bold text-slate-900 text-sm">
                          {formatPrice(order.totalAmount)}
                        </p>
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>

                      <TableCell>
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </TableCell>

                      <TableCell>
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

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-slate-100"
                            >
                              <EllipsisVerticalIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/vendor/orders/${order.id}`}>
                                <EyeIcon className="w-4 h-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuSeparator />

                            {getAvailableStatusActions(order.status).map(
                              (action) => (
                                <DropdownMenuItem
                                  key={action.value}
                                  onClick={() =>
                                    handleStatusUpdate(order.id, action.value)
                                  }
                                  disabled={updating === order.id}
                                  className="text-slate-600 focus:text-slate-900"
                                >
                                  <action.icon className="w-4 h-4 mr-2" />
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
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-700">
              Showing {(currentPage - 1) * 15 + 1} to{" "}
              {Math.min(currentPage * 15, totalCount)} of {totalCount} orders
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
                      variant={
                        currentPage === pageNumber ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-10 ${
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
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
