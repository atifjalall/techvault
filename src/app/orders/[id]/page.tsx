/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeftIcon,
  TruckIcon,
  MapPinIcon,
  CalendarDaysIcon,
  CreditCardIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// UI Components
import { Button } from "@/components/ui/buttonSidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  brand?: string;
  image: string;
  slug: string;
  quantity: number;
  price: number;
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
    <Badge variant="outline" className={`text-sm ${config.color}`}>
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
    <Badge className={`${getColor(status)} font-medium text-xs px-2 py-1`}>
      {status}
    </Badge>
  );
}

// Delivery Estimate Component
function DeliveryEstimate({ estimate }: { estimate: any }) {
  const getIcon = () => {
    switch (estimate.status) {
      case "delivered":
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case "today":
      case "tomorrow":
        return <TruckIcon className="w-5 h-5 text-orange-600" />;
      default:
        return <ClockIcon className="w-5 h-5 text-blue-600" />;
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
    <div className={`flex items-center space-x-2 ${getTextColor()}`}>
      {getIcon()}
      <div>
        <p className="font-medium">{estimate.message}</p>
        {estimate.date && (
          <p className="text-sm opacity-75">
            {format(new Date(estimate.date), "MMM d, yyyy")}
          </p>
        )}
      </div>
    </div>
  );
}

// Loading Skeleton
function OrderDetailSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="flex space-x-4">
                        <Skeleton className="h-16 w-16" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
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
        <div className="container mx-auto px-4 py-6">
          <OrderDetailSkeleton />
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
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-32">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {error}
            </h3>
            <p className="text-gray-500 mb-6">
              The order you&apos;re looking for doesn&apos;t exist or you
              don&apos;t have access to it.
            </p>
            <Link href="/orders">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white">
                Back to Orders
              </Button>
            </Link>
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
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <Card
          className={`border-0 shadow-sm ${
            orderData.status === "CANCELLED" ? "bg-red-50 border-red-100" : ""
          }`}
        >
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Back Button */}
              <Link
                href="/orders"
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="w-4 h-4 mr-1" />
                Back to Orders
              </Link>

              {/* Cancelled Order Warning */}
              {orderData.status === "CANCELLED" && (
                <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <XCircleIcon className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-red-800">
                        Order Cancelled
                      </p>
                      <p className="text-sm text-red-700">
                        This order was cancelled and any payment has been
                        refunded.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Title */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Order #
                    {orderData.orderNumber?.slice(-8).toUpperCase() ||
                      orderData.id.slice(-8).toUpperCase()}
                  </h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <StatusBadge status={orderData.status} />
                    <PaymentStatusBadge status={orderData.paymentStatus} />
                    {orderData.priority !== "NORMAL" && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                        {orderData.priority} Priority
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-gray-500 mt-2">
                    <CalendarDaysIcon className="w-4 h-4" />
                    <span>
                      Placed on{" "}
                      {format(
                        new Date(orderData.createdAt),
                        "MMM d, yyyy 'at' h:mm a"
                      )}
                    </span>
                  </div>
                  {statusConfig && (
                    <p className="text-sm text-gray-600 mt-2">
                      {statusConfig.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {canCancelOrder && (
                    <Button
                      onClick={() => setShowCancelModal(true)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircleIcon className="w-4 h-4 mr-2" />
                      Cancel Order
                    </Button>
                  )}
                  <Button onClick={handlePrint} variant="outline" size="sm">
                    <PrinterIcon className="w-4 h-4 mr-2" />
                    Print
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orderData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-500">
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
                          <h3 className="font-medium text-gray-900">
                            {item.name}
                          </h3>
                          {item.brand && (
                            <p className="text-sm text-gray-600">
                              {item.brand}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            Sold by {item.vendor.name}
                          </p>
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatPrice(item.price)} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Tracking Information */}
            {(orderData.trackingNumber ||
              orderData.shippingCarrier ||
              orderData.estimatedDelivery) && (
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TruckIcon className="w-5 h-5 mr-2" />
                    Tracking Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {orderData.trackingNumber && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Tracking Number
                      </label>
                      <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                        {orderData.trackingNumber}
                      </p>
                    </div>
                  )}

                  {orderData.shippingCarrier && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
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
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MapPinIcon className="w-5 h-5 mr-2" />
                  Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="font-medium text-gray-900">
                    {orderData.shippingAddress.firstName}{" "}
                    {orderData.shippingAddress.lastName}
                  </p>
                  <p>{orderData.shippingAddress.address}</p>
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
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">
                      {formatPrice(orderData.totals.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">
                      {orderData.totals.shipping === 0
                        ? "Free"
                        : formatPrice(orderData.totals.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
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
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-gray-900">
                      {formatPrice(orderData.totals.total)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 space-y-2">
                  <div className="flex justify-between">
                    <span>Payment Method</span>
                    <span className="text-gray-900">
                      {orderData.paymentMethod || "Credit Card"}
                    </span>
                  </div>
                  {orderData.paymentIntentId && (
                    <div className="flex justify-between">
                      <span>Transaction ID</span>
                      <span className="text-gray-900 font-mono text-xs">
                        {orderData.paymentIntentId.slice(-8).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Payment Status</span>
                    <PaymentStatusBadge status={orderData.paymentStatus} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Timeline */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <ClockIcon className="w-5 h-5 mr-2" />
                  Order Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orderData.statusHistory?.length > 0 ? (
                    orderData.statusHistory.map((history, index) => (
                      <div
                        key={history.id}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">
                              {history.status.replace(/_/g, " ")}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(
                                new Date(history.createdAt),
                                "MMM d, h:mm a"
                              )}
                            </p>
                          </div>
                          {history.notes && (
                            <p className="text-xs text-gray-600 mt-1">
                              {history.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your order will be cancelled immediately
                and any payment will be refunded within 3-5 business days.
              </p>
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason("");
                }}
                variant="outline"
                className="flex-1"
                disabled={cancelling}
              >
                Keep Order
              </Button>
              <Button
                onClick={handleCancelOrder}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
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
