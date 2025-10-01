/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  EyeIcon,
  ShoppingBagIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid,
  TruckIcon as TruckIconSolid,
  XCircleIcon as XCircleIconSolid,
} from "@heroicons/react/24/solid";

// UI Components
import Button from "@/components/ui/userButton";
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
import { Skeleton } from "@/components/ui/skeleton";

import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { motion } from "framer-motion";

// Updated interface with variant support
interface OrderItem {
  id: string;
  productId: string;
  variantId?: string | null;
  name: string;
  variantName?: string | null;
  brand?: string;
  image: string;
  slug: string;
  quantity: number;
  price: number;
  variantAttributes?: {
    color?: string;
    storage?: string;
    ram?: string;
    size?: string;
    material?: string;
  } | null;
  vendor: {
    name: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;

  // Enhanced tracking info
  trackingNumber?: string;
  shippingCarrier?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;

  // Payment info
  paymentStatus: string;
  paymentMethod?: string;
  priority: string;

  shippingAddress: any;
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  itemCount: number;
  vendorCount: number;
  deliveryEstimate: {
    status: string;
    message: string;
  };
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
}

// Enhanced Order Status Configuration
const ORDER_STATUSES = {
  PENDING: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: ClockIconSolid,
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: CheckCircleIconSolid,
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: ArrowPathIcon,
  },
  PACKAGING: {
    label: "Packaging",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: ArrowPathIcon,
  },
  READY_TO_SHIP: {
    label: "Ready to Ship",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: TruckIconSolid,
  },
  SHIPPED: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: TruckIconSolid,
  },
  IN_TRANSIT: {
    label: "In Transit",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    icon: TruckIconSolid,
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: TruckIconSolid,
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircleIconSolid,
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    icon: XCircleIconSolid,
  },
  REFUNDED: {
    label: "Refunded",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    icon: ExclamationTriangleIcon,
  },
};

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config = ORDER_STATUSES[status as keyof typeof ORDER_STATUSES];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      variant="default"
      className={`text-[8px] lg:text-xs h-4 lg:h-5 px-1 lg:px-2 ${config.color}`}
    >
      <Icon className="w-2 lg:w-3 h-2 lg:h-3 mr-0.5 lg:mr-1.5" />
      {config.label}
    </Badge>
  );
}

// Payment Status Badge
function PaymentStatusBadge({ status }: { status: string }) {
  const getColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
      case "PROCESSING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <Badge
      className={`${getColor(status)} font-medium text-[8px] lg:text-xs h-4 lg:h-5 px-1 lg:px-2`}
    >
      {status}
    </Badge>
  );
}

// Delivery Status Component
function DeliveryStatus({
  estimate,
  carrier,
}: {
  estimate: any;
  carrier?: string;
}) {
  const getIcon = () => {
    switch (estimate.status) {
      case "delivered":
        return <CheckCircleIcon className="w-4 h-4 text-green-600" />;
      case "today":
      case "tomorrow":
        return <TruckIcon className="w-4 h-4 text-orange-600" />;
      case "shipped":
        return <TruckIcon className="w-4 h-4 text-purple-600" />;
      default:
        return <ClockIcon className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <div className="flex items-center space-x-1 text-xs">
      {getIcon()}
      <span className="truncate">{estimate.message}</span>
      {carrier && estimate.status === "shipped" && (
        <span className="text-gray-500 hidden sm:inline">via {carrier}</span>
      )}
    </div>
  );
}

// Enhanced Product Display Component with Variant Support
function ProductDisplay({ item }: { item: OrderItem }) {
  const displayName = item.variantName
    ? `${item.name} - ${item.variantName}`
    : item.name;

  const variantDetails = [];
  if (item.variantAttributes?.color) {
    variantDetails.push(`Color: ${item.variantAttributes.color}`);
  }
  if (item.variantAttributes?.storage) {
    variantDetails.push(`Storage: ${item.variantAttributes.storage}`);
  }
  if (item.variantAttributes?.ram) {
    variantDetails.push(`RAM: ${item.variantAttributes.ram}`);
  }
  if (item.variantAttributes?.size) {
    variantDetails.push(`Size: ${item.variantAttributes.size}`);
  }
  if (item.variantAttributes?.material) {
    variantDetails.push(`Material: ${item.variantAttributes.material}`);
  }

  return (
    <div className="flex items-center space-x-2 lg:space-x-4">
      <div className="w-8 lg:w-12 h-8 lg:h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
        {item.image ? (
          <Image
            src={item.image}
            alt={displayName}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-[8px] lg:text-xs font-medium text-gray-500">
              {item.name.substring(0, 2).toUpperCase()}
            </span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.slug}`}
          className="block hover:text-gray-700"
        >
          <p className="text-xs lg:text-sm font-medium text-gray-900 truncate">
            {displayName}
          </p>
          <div className="flex items-center space-x-1 lg:space-x-2 text-[10px] lg:text-xs text-gray-500">
            {item.brand && <span className="truncate">{item.brand}</span>}
            {item.brand && <span className="hidden sm:inline">•</span>}
            <span className="hidden sm:inline truncate">
              Sold by {item.vendor.name}
            </span>
          </div>
          {variantDetails.length > 0 && (
            <div className="text-[10px] lg:text-xs text-gray-500 mt-0.5 lg:mt-1 truncate">
              {variantDetails.slice(0, 2).join(" • ")}
              {variantDetails.length > 2 && (
                <span className="hidden sm:inline">
                  {" "}
                  • {variantDetails.slice(2).join(" • ")}
                </span>
              )}
            </div>
          )}
        </Link>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs lg:text-sm font-medium text-gray-900">
          {formatPrice(item.price * item.quantity)}
        </p>
        <p className="text-[10px] lg:text-xs text-gray-500">
          Qty: {item.quantity}
        </p>
      </div>
    </div>
  );
}

// Loading Skeleton
function OrdersPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-4 sm:space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="w-full pt-3 lg:pt-5 pb-2 lg:pb-4">
          <div className="flex items-center space-x-1.5 lg:space-x-2 ml-1 lg:ml-2">
            <Skeleton className="h-3 lg:h-4 w-10 lg:w-12" />
            <Skeleton className="h-3 lg:h-4 w-0.5 lg:w-1" />
            <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
          </div>
        </div>
        {/* Header Skeleton */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <Skeleton className="h-6 sm:h-8 w-32 sm:w-48" />
              <Skeleton className="h-4 w-64 sm:w-96" />
            </div>
          </CardContent>
        </Card>

        {/* Filters Skeleton */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:md:grid-cols-3">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          </CardContent>
        </Card>

        {/* Orders Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24 sm:w-32" />
                      <Skeleton className="h-4 sm:h-6 w-32 sm:w-48" />
                    </div>
                    <Skeleton className="h-6 w-16 sm:w-20" />
                  </div>
                  <div className="flex space-x-3 sm:space-x-4">
                    <Skeleton className="h-12 w-12 sm:h-16 sm:w-16" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48 sm:w-64" />
                      <Skeleton className="h-4 w-24 sm:w-32" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomerOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Load orders data
  useEffect(() => {
    const loadOrders = async () => {
      if (!session?.user) return;

      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: "10",
        });

        if (statusFilter !== "all") params.append("status", statusFilter);

        const response = await fetch(`/api/orders?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch orders");
        }

        const result: OrdersResponse = await response.json();

        if (result.success) {
          setOrders(result.orders || []);
          setTotalPages(result.pagination?.totalPages ?? 1);
          setTotalCount(result.pagination?.totalCount ?? 0);
        } else {
          throw new Error("Failed to load orders");
        }
      } catch (error) {
        console.error("Error loading orders:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load orders"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadOrders();
    }
  }, [session, currentPage, statusFilter]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, session, router]);

  // Enhanced filter for variants
  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    return (
      order.id.toLowerCase().includes(query) ||
      order.orderNumber?.toLowerCase().includes(query) ||
      order.trackingNumber?.toLowerCase().includes(query) ||
      order.items.some(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.variantName?.toLowerCase().includes(query) ||
          item.brand?.toLowerCase().includes(query) ||
          Object.values(item.variantAttributes || {}).some((attr) =>
            attr?.toLowerCase().includes(query)
          )
      )
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the filter above
  };

  // Don't render content for vendors
  if (session?.user?.role === "VENDOR") {
    return null;
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <OrdersPageSkeleton />
        </div>
        <Footer />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null; // Will redirect
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="text-center py-16 sm:py-32">
            <ExclamationTriangleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Unable to load orders
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Breadcrumb */}
      <div className="pt-4 lg:pt-8 px-2 lg:px-4 pb-2 lg:pb-4">
        <div className="container mx-auto px-2 lg:px-4">
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
                  <BreadcrumbPage>Orders</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>
        </div>
      </div>
      <div className="container mx-auto px-2 lg:px-4 py-2 lg:py-6 space-y-2 lg:space-y-6">
        {/* Header */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 lg:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
              <div>
                <h1 className="text-sm lg:text-2xl font-bold text-gray-900">
                  My Orders
                </h1>
                <p className="text-xs lg:text-base text-gray-600 mt-0.5 lg:mt-1">
                  Track and manage your purchase history
                </p>
              </div>
              <div className="flex items-center space-x-1 lg:space-x-2 text-xs lg:text-sm text-gray-500">
                <ShoppingBagIcon className="w-3 lg:w-4 h-3 lg:h-4" />
                <span>{totalCount} orders total</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-3 lg:p-6">
            <form onSubmit={handleSearch} className="space-y-2 lg:space-y-4">
              <div className="grid grid-cols-1 gap-2 lg:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Search */}
                <div className="space-y-1 lg:space-y-2 sm:col-span-2 lg:col-span-1">
                  <Label htmlFor="search" className="text-xs lg:text-sm">
                    Search Orders
                  </Label>
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-2 lg:left-3 top-1/2 transform -translate-y-1/2 h-3 lg:h-4 w-3 lg:w-4 text-gray-400" />
                    <Input
                      id="search"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 lg:pl-10 text-xs lg:text-sm h-7 lg:h-10"
                      placeholder="Search by order ID, product..."
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-1 lg:space-y-2">
                  <Label htmlFor="status" className="text-xs lg:text-sm">
                    Status
                  </Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="text-xs lg:text-sm h-8 lg:h-10">
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

                {/* Actions */}
                <div className="space-y-1 lg:space-y-2">
                  <Label className="invisible text-xs lg:text-sm">
                    Actions
                  </Label>
                  <Button
                    type="submit"
                    className="w-full text-xs lg:text-sm h-8 lg:h-10"
                    variant="default"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-6 lg:p-12 text-center">
              <ShoppingBagIcon className="w-10 lg:w-16 h-10 lg:h-16 text-gray-300 mx-auto mb-3 lg:mb-4" />
              <h3 className="text-sm lg:text-xl font-semibold text-gray-900 mb-1 lg:mb-2">
                No orders found
              </h3>
              <p className="text-xs lg:text-base text-gray-500 mb-4 lg:mb-6">
                You haven&apos;t placed any orders yet or no orders match your
                filters.
              </p>
              <Link href="/products">
                <Button className="bg-gray-900 hover:bg-gray-800 text-white text-xs lg:text-sm h-8 lg:h-10 px-3 lg:px-4">
                  Start Shopping
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card
                key={order.id}
                className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
                  order.status === "CANCELLED" ? "opacity-75 bg-gray-50" : ""
                }`}
              >
                <CardContent className="p-3 lg:p-6">
                  <div className="space-y-2 lg:space-y-4">
                    {/* Order Header */}
                    <div className="flex flex-col space-y-2 lg:space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                      <div className="space-y-1 lg:space-y-2">
                        <div className="flex flex-wrap items-center gap-1 lg:gap-2">
                          <h3
                            className={`font-semibold text-xs lg:text-base ${
                              order.status === "CANCELLED"
                                ? "text-gray-600"
                                : "text-gray-900"
                            }`}
                          >
                            Order #
                            {order.orderNumber?.slice(-8).toUpperCase() ||
                              order.id.slice(-8).toUpperCase()}
                          </h3>
                          <StatusBadge status={order.status} />
                          <PaymentStatusBadge status={order.paymentStatus} />
                          {order.priority !== "NORMAL" && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-[8px] lg:text-xs h-4 lg:h-5 px-1 lg:px-2">
                              {order.priority}
                            </Badge>
                          )}
                          {order.status === "CANCELLED" && (
                            <span className="text-[8px] lg:text-xs text-gray-500 bg-gray-100 px-1 lg:px-2 py-0.5 lg:py-1 rounded">
                              Refund Processed
                            </span>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-0.5 sm:space-y-0 sm:space-x-3 lg:space-x-4 text-[10px] lg:text-sm text-gray-500">
                          <div className="flex items-center space-x-0.5 lg:space-x-1">
                            <CalendarDaysIcon className="w-2.5 lg:w-4 h-2.5 lg:h-4" />
                            <span>
                              {format(new Date(order.createdAt), "MMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center space-x-0.5 lg:space-x-1">
                            <ShoppingBagIcon className="w-2.5 lg:w-4 h-2.5 lg:h-4" />
                            <span>{order.itemCount} items</span>
                            {order.vendorCount > 1 && (
                              <span className="hidden sm:inline">
                                from {order.vendorCount} vendors
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-0.5 lg:space-x-1">
                            <CreditCardIcon className="w-2.5 lg:w-4 h-2.5 lg:h-4" />
                            <span className="font-medium">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <Link href={`/orders/${order.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-[10px] lg:text-xs cursor-pointer w-full sm:w-auto h-8 lg:h-10 px-2 lg:px-3"
                          >
                            <EyeIcon className="w-2.5 lg:w-4 h-2.5 lg:h-4 mr-0.5 lg:mr-1" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* Tracking Info */}
                    {(order.trackingNumber ||
                      order.shippingCarrier ||
                      order.deliveryEstimate.status !== "unknown") && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                          <DeliveryStatus
                            estimate={order.deliveryEstimate}
                            carrier={order.shippingCarrier}
                          />
                          {order.trackingNumber && (
                            <div className="text-xs text-gray-600">
                              <span className="font-medium">Tracking:</span>{" "}
                              <span className="font-mono break-all sm:break-normal">
                                {order.trackingNumber}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Order Items Preview with Variant Support */}
                    <div className="space-y-2 lg:space-y-3">
                      {order.items.slice(0, 2).map((item) => (
                        <ProductDisplay key={item.id} item={item} />
                      ))}

                      {order.items.length > 2 && (
                        <div className="text-center py-1 lg:py-2">
                          <p className="text-xs lg:text-sm text-gray-500">
                            +{order.items.length - 2} more items
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                      <div className="pt-2 lg:pt-3 border-t border-gray-100">
                        <div className="flex items-start space-x-1 lg:space-x-2">
                          <MapPinIcon className="w-3 lg:w-4 h-3 lg:h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs lg:text-sm text-gray-600 min-w-0">
                            <p className="font-medium text-xs lg:text-sm">
                              Delivery Address:
                            </p>
                            <p className="truncate">
                              {order.shippingAddress.firstName}{" "}
                              {order.shippingAddress.lastName}
                            </p>
                            <p className="break-words">
                              {order.shippingAddress.address},{" "}
                              {order.shippingAddress.city}{" "}
                              {order.shippingAddress.postalCode}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-700 text-center sm:text-left">
              Showing {(currentPage - 1) * 10 + 1} to{" "}
              {Math.min(currentPage * 10, totalCount)} of {totalCount} orders
            </p>

            <div className="flex items-center justify-center sm:justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="text-sm"
              >
                Previous
              </Button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNumber}
                      variant={
                        currentPage === pageNumber ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`w-8 text-sm ${
                        currentPage === pageNumber
                          ? "bg-gray-900 hover:bg-gray-800 text-white"
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
                className="text-sm"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
