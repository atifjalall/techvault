/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  TruckIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { motion } from "framer-motion";

// UI Components
import Button from "@/components/ui/userButton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";

// Updated OrderItem interface with variant support
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

interface OrderDetails {
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

  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    total: number;
  };
  statusHistory: Array<{
    id: string;
    status: string;
    notes?: string;
    changedBy?: string;
    createdAt: string;
  }>;
  itemCount: number;
  vendorCount: number;
  deliveryEstimate: {
    status: string;
    message: string;
    date?: string;
  };
}

// Enhanced Order Status Configuration
const ORDER_STATUSES = {
  PENDING: {
    label: "Order Placed",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    description:
      "We've received your order and are preparing it for processing.",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Your order has been confirmed and is being prepared.",
  },
  PROCESSING: {
    label: "Processing",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Your order is being prepared and will be shipped soon.",
  },
  PACKAGING: {
    label: "Packaging",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    description: "Your items are being carefully packaged for shipment.",
  },
  READY_TO_SHIP: {
    label: "Ready to Ship",
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    description:
      "Your order is ready and waiting for pickup by our shipping partner.",
  },
  SHIPPED: {
    label: "Shipped",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Your order has been shipped and is on its way to you.",
  },
  IN_TRANSIT: {
    label: "In Transit",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Your package is moving through our shipping network.",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    description: "Your package is out for delivery and should arrive today.",
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    description: "Your order has been successfully delivered.",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-rose-100 text-rose-800 border-rose-200",
    description: "This order has been cancelled.",
  },
  REFUNDED: {
    label: "Refunded",
    color: "bg-slate-100 text-slate-800 border-slate-200",
    description: "This order has been refunded.",
  },
};

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const config = ORDER_STATUSES[status as keyof typeof ORDER_STATUSES];
  if (!config) return null;

  return (
    <Badge
      variant="default"
      className={`text-[8px] lg:text-xs h-4 lg:h-5 px-1 lg:px-2 ${config.color}`}
    >
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

// Delivery Estimate Component
function DeliveryEstimate({ estimate }: { estimate: any }) {
  const getIcon = () => {
    switch (estimate.status) {
      case "delivered":
        return (
          <CheckCircleIcon className="w-3 lg:w-4 h-3 lg:h-4 text-green-600" />
        );
      case "today":
      case "tomorrow":
        return <TruckIcon className="w-3 lg:w-4 h-3 lg:h-4 text-orange-600" />;
      default:
        return <ClockIcon className="w-3 lg:w-4 h-3 lg:h-4 text-blue-600" />;
    }
  };

  const getTextColor = () => {
    switch (estimate.status) {
      case "delivered":
        return "text-green-700";
      case "today":
      case "tomorrow":
        return "text-orange-700";
      default:
        return "text-blue-700";
    }
  };

  return (
    <div
      className={`flex items-center space-x-1 lg:space-x-2 ${getTextColor()}`}
    >
      {getIcon()}
      <div>
        <p className="text-xs lg:text-sm font-medium">{estimate.message}</p>
        {estimate.date && (
          <p className="text-[10px] lg:text-xs opacity-75">
            {format(new Date(estimate.date), "MMM d, yyyy")}
          </p>
        )}
      </div>
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
    <div className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-3 border border-gray-100 rounded-lg">
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
          className="block hover:text-gray-700 transition-colors cursor-pointer"
        >
          <h3 className="text-xs lg:text-sm font-medium text-gray-900 truncate">
            {displayName}
          </h3>
          <div className="flex items-center space-x-1 lg:space-x-2 text-[10px] lg:text-xs text-gray-500">
            {item.brand && <span className="truncate">{item.brand}</span>}
            {item.brand && <span className="hidden sm:inline">•</span>}
            <span className="truncate">Sold by {item.vendor.name}</span>
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
        <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5 lg:mt-1">
          Quantity: {item.quantity}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs lg:text-sm font-medium text-gray-900">
          {formatPrice(item.price * item.quantity)}
        </p>
        <p className="text-[10px] lg:text-xs text-gray-500">
          {formatPrice(item.price)} each
        </p>
      </div>
    </div>
  );
}

// Loading Skeleton
function OrderDetailSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center space-x-1 lg:space-x-2">
        <Skeleton className="h-3 lg:h-4 w-8 lg:w-12" />
        <Skeleton className="h-3 lg:h-4 w-1" />
        <Skeleton className="h-3 lg:h-4 w-12 lg:w-20" />
        <Skeleton className="h-3 lg:h-4 w-1" />
        <Skeleton className="h-3 lg:h-4 w-16 lg:w-24" />
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="flex items-center space-x-2 lg:space-x-3 p-2 lg:p-0"
                      >
                        {/* Image - matches ProductDisplay w-8 lg:w-12 h-8 lg:h-12 */}
                        <Skeleton className="h-8 w-8 lg:h-12 lg:w-12 rounded-lg" />

                        {/* Text block: title, vendor/variant, quantity */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <Skeleton className="h-4 w-3/5 lg:w-2/3" />
                          <Skeleton className="h-3 w-1/2 lg:w-1/3" />
                          <Skeleton className="h-3 w-24 lg:w-28" />
                        </div>

                        {/* Price block: total and per-item */}
                        <div className="flex-shrink-0 text-right space-y-1">
                          <Skeleton className="h-4 w-16 lg:w-20" />
                          <Skeleton className="h-3 w-12 lg:w-14" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4 sm:space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
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

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [orderData, setOrderData] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin");
    }
  }, [status, router]);

  // Load order data
  useEffect(() => {
    const loadOrder = async () => {
      if (!session?.user || !orderId) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${orderId}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Order not found");
          }
          throw new Error("Failed to fetch order details");
        }

        const result = await response.json();

        if (result.success) {
          setOrderData(result.order);
        } else {
          throw new Error("Failed to load order details");
        }
      } catch (error) {
        console.error("Error loading order:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load order"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadOrder();
    }
  }, [session, orderId]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, session, router]);

  // Don't render content for vendors
  if (session?.user?.role === "VENDOR") {
    return null;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleCancelOrder = async () => {
    if (!orderData || cancelling) return;

    try {
      setCancelling(true);

      const response = await fetch(`/api/orders/${orderData.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: cancelReason || "Customer requested cancellation",
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setOrderData((prev) =>
          prev ? { ...prev, status: "CANCELLED" } : null
        );
        setShowCancelModal(false);
        setCancelReason("");
        alert("Order cancelled successfully");
      } else {
        alert(result.message || result.error || "Failed to cancel order");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      alert("Failed to cancel order. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  // Check if order can be cancelled
  const canCancelOrder =
    orderData &&
    ["PENDING", "CONFIRMED", "PROCESSING"].includes(orderData.status);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="pt-4 lg:pt-8 px-2 lg:px-4 pb-2 lg:pb-4">
          <div className="container mx-auto px-2 lg:px-4">
            <OrderDetailSkeleton />
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="text-center py-16 sm:py-32">
            <ExclamationTriangleIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              {error}
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mb-6">
              The order you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have access to it.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  const statusConfig =
    ORDER_STATUSES[orderData.status as keyof typeof ORDER_STATUSES];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-4 lg:pt-8 px-2 lg:px-4 pb-2 lg:pb-4">
        <div className="container mx-auto px-2 lg:px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Breadcrumb>
              <BreadcrumbList className="text-[10px] lg:text-sm">
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/"
                      className="cursor-pointer text-[10px] lg:text-sm hover:text-slate-900"
                    >
                      Home
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-[10px] lg:text-sm" />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link
                      href="/orders"
                      className="cursor-pointer text-[10px] lg:text-sm hover:text-slate-900"
                    >
                      Orders
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="text-[10px] lg:text-sm" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-[10px] lg:text-sm font-medium">
                    {orderData.orderNumber}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>
        </div>
      </div>
      <div className="container mx-auto px-2 lg:px-4 py-2 lg:py-6 space-y-2 lg:space-y-6">
        {/* Header */}
        <Card
          className={`border-0 shadow-sm ${
            orderData.status === "CANCELLED" ? "bg-red-50 border-red-100" : ""
          }`}
        >
          <CardContent className="p-3 lg:p-6">
            <div className="space-y-2 lg:space-y-4">
              {/* Cancelled Order Warning */}
              {orderData.status === "CANCELLED" && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-2 lg:p-4">
                  <div className="flex items-center space-x-1 lg:space-x-2">
                    <XCircleIcon className="w-3 lg:w-5 h-3 lg:h-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs lg:text-sm font-medium text-red-800">
                        Order Cancelled
                      </p>
                      <p className="text-[10px] lg:text-xs text-red-700">
                        This order was cancelled and any payment has been
                        refunded.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Title */}
              <div className="flex flex-col space-y-2 lg:space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm lg:text-xl font-bold text-gray-900 truncate">
                    Order #
                    {orderData.orderNumber?.slice(-8).toUpperCase() ||
                      orderData.id.slice(-8).toUpperCase()}
                  </h1>
                  <div className="flex flex-wrap items-center gap-1 lg:gap-2 mt-1 lg:mt-2">
                    <StatusBadge status={orderData.status} />
                    <PaymentStatusBadge status={orderData.paymentStatus} />
                    {orderData.priority !== "NORMAL" && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-[8px] lg:text-xs h-4 lg:h-5 px-1 lg:px-2">
                        {orderData.priority}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col space-y-0.5 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-3 lg:space-x-4 text-xs lg:text-sm text-gray-500 mt-1 lg:mt-2">
                    <div className="flex items-center space-x-0.5 lg:space-x-1">
                      <CalendarDaysIcon className="w-3 lg:w-4 h-3 lg:h-4" />
                      <span>
                        {format(new Date(orderData.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex items-center space-x-0.5 lg:space-x-1">
                      <ShoppingBagIcon className="w-3 lg:w-4 h-3 lg:h-4" />
                      <span>{orderData.itemCount} items</span>
                      {orderData.vendorCount > 1 && (
                        <span className="hidden sm:inline">
                          from {orderData.vendorCount} vendors
                        </span>
                      )}
                    </div>
                  </div>
                  {statusConfig && (
                    <p className="text-xs lg:text-sm text-gray-600 mt-1 lg:mt-2">
                      {statusConfig.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-1 lg:space-x-2">
                  {canCancelOrder && (
                    <Button
                      onClick={() => setShowCancelModal(true)}
                      variant="destructive"
                      size="sm"
                      className="text-[10px] lg:text-sm h-7 lg:h-8 px-2 lg:px-3"
                    >
                      <XCircleIcon className="w-3 lg:w-4 h-3 lg:h-4 mr-0.5 lg:mr-1" />
                      Cancel Order
                    </Button>
                  )}
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-[10px] lg:text-sm h-7 lg:h-8 px-2 lg:px-3"
                  >
                    <PrinterIcon className="w-3 lg:w-4 h-3 lg:h-4 mr-0.5 lg:mr-1" />
                    Print
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-3">
                  {orderData.items.map((item) => (
                    <ProductDisplay key={item.id} item={item} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tracking Information */}
            {(orderData.trackingNumber ||
              orderData.shippingCarrier ||
              orderData.estimatedDelivery) && (
              <Card className="border-0 shadow-sm">
                <CardHeader className="p-3 lg:p-6 pb-2 lg:pb-3">
                  <CardTitle className="text-sm lg:text-lg flex items-center">
                    <TruckIcon className="w-3 lg:w-5 h-3 lg:h-5 mr-1 lg:mr-2" />
                    Tracking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 lg:p-6 pt-0 space-y-2 lg:space-y-4">
                  {orderData.trackingNumber && (
                    <div>
                      <label className="text-xs lg:text-sm font-medium text-gray-600">
                        Tracking Number
                      </label>
                      <p className="text-xs lg:text-sm text-gray-900 font-mono bg-gray-50 p-1.5 lg:p-2 rounded break-all">
                        {orderData.trackingNumber}
                      </p>
                    </div>
                  )}

                  {orderData.shippingCarrier && (
                    <div>
                      <label className="text-xs lg:text-sm font-medium text-gray-600">
                        Shipping Carrier
                      </label>
                      <p className="text-sm text-gray-900">
                        {orderData.shippingCarrier}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Delivery Estimate
                    </label>
                    <div className="mt-2">
                      <DeliveryEstimate estimate={orderData.deliveryEstimate} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Shipping Address */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <MapPinIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xs lg:text-sm text-gray-600 space-y-0.5 lg:space-y-1">
                  <p className="font-medium text-gray-900">
                    {orderData.shippingAddress.firstName}{" "}
                    {orderData.shippingAddress.lastName}
                  </p>
                  <p className="break-words">
                    {orderData.shippingAddress.address}
                  </p>
                  <p>
                    {orderData.shippingAddress.city},{" "}
                    {orderData.shippingAddress.postalCode}
                  </p>
                  <p>{orderData.shippingAddress.country}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Order Summary */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-3">
                <CardTitle className="text-base sm:text-lg">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-1.5 lg:space-y-3">
                  <div className="flex justify-between text-xs lg:text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      {formatPrice(orderData.totals.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs lg:text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {orderData.totals.shipping === 0
                        ? "Free"
                        : formatPrice(orderData.totals.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs lg:text-sm">
                    <span className="text-gray-600">Tax (19% VAT)</span>
                    <span className="text-gray-900">
                      {formatPrice(orderData.totals.tax)}
                    </span>
                  </div>
                  {orderData.totals.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-green-600">
                        -{formatPrice(orderData.totals.discount)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold text-sm lg:text-base text-gray-900">
                      Total
                    </span>
                    <span className="font-bold text-sm lg:text-lg text-gray-900">
                      {formatPrice(orderData.totals.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <CreditCardIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-xs lg:text-sm text-gray-600 space-y-1 lg:space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="text-gray-900">
                      {orderData.paymentMethod || "Credit Card"}
                    </span>
                  </div>
                  {orderData.paymentIntentId && (
                    <div className="flex justify-between">
                      <span>Transaction ID</span>
                      <span className="text-gray-900 font-mono text-[10px] lg:text-xs break-all">
                        {orderData.paymentIntentId.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span>Payment Status</span>
                    <PaymentStatusBadge status={orderData.paymentStatus} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <ClockIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-2 lg:space-y-3">
                  {orderData.statusHistory?.length > 0 ? (
                    orderData.statusHistory.map((history) => (
                      <div
                        key={history.id}
                        className="flex items-start space-x-2 lg:space-x-3"
                      >
                        <div className="w-1.5 lg:w-2 h-1.5 lg:h-2 bg-blue-500 rounded-full mt-1.5 lg:mt-2 flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-[10px] lg:text-xs text-gray-500">
                              {format(
                                new Date(history.createdAt),
                                "MMM d, h:mm a"
                              )}
                            </p>
                          </div>
                          {history.notes && (
                            <p className="text-[10px] lg:text-xs text-gray-600 mt-0.5 lg:mt-1 break-words">
                              {history.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs lg:text-sm text-gray-500">
                      No timeline information available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                <XCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Cancel Order
                </h3>
                <p className="text-sm text-gray-600">
                  Are you sure you want to cancel this order?
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for cancellation (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Please let us know why you're cancelling..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                rows={3}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your order will be cancelled immediately
                and any payment will be refunded within 3-5 business days.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                variant="outline"
                className="flex-1 cursor-pointer text-xs lg:text-sm h-8 lg:h-10"
                disabled={cancelling}
              >
                Keep Order
              </Button>
              <Button
                onClick={handleCancelOrder}
                variant="destructive"
                className="text-xs lg:text-sm h-8 lg:h-10"
                disabled={cancelling}
              >
                {cancelling ? "Cancelling..." : "Cancel Order"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
