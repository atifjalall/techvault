/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircleIcon,
  TruckIcon,
  EnvelopeIcon,
  PrinterIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon,
  MapPinIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";
import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function CheckoutSuccessPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-4 py-4"
      >
        {/* Breadcrumb Skeleton */}
        <div className="w-full pt-3 lg:pt-5 pb-2 lg:pb-4">
          <div className="flex items-center space-x-1.5 lg:space-x-2 ml-1 lg:ml-2">
            <Skeleton className="h-3 lg:h-4 w-10 lg:w-12" />
            <Skeleton className="h-3 lg:h-4 w-0.5 lg:w-1" />
            <Skeleton className="h-3 lg:h-4 w-12 lg:w-16" />
            <Skeleton className="h-3 lg:h-4 w-0.5 lg:w-1" />
            <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
            <Skeleton className="h-3 lg:h-4 w-0.5 lg:w-1" />
            <Skeleton className="h-3 lg:h-4 w-12 lg:w-16" />
          </div>
        </div>

        {/* Header Skeleton */}
        <div className="mb-3 lg:mb-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 lg:p-4 text-center">
              <Skeleton className="w-10 lg:w-12 h-10 lg:h-12 rounded-full mx-auto mb-2 lg:mb-3" />
              <Skeleton className="h-4 lg:h-5 w-40 lg:w-48 mx-auto mb-1.5 lg:mb-2" />
              <Skeleton className="h-3 lg:h-4 w-48 lg:w-64 mx-auto mb-1" />
              <Skeleton className="h-2.5 lg:h-3 w-24 lg:w-32 mx-auto" />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
          {/* Main content skeleton */}
          <div className="lg:col-span-2 space-y-3 lg:space-y-4">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2 lg:pb-3 px-3 lg:px-6 pt-3 lg:pt-6">
                <Skeleton className="h-3.5 lg:h-4 w-20 lg:w-24" />
              </CardHeader>
              <CardContent className="pt-0 px-3 lg:px-6 pb-3 lg:pb-6">
                <div className="space-y-2 lg:space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 lg:space-x-3 pb-2 lg:pb-3 border-b border-gray-200 last:border-b-0"
                    >
                      <Skeleton className="w-8 lg:w-10 h-8 lg:h-10 rounded-lg" />
                      <div className="flex-1">
                        <Skeleton className="h-2.5 lg:h-3 w-3/4 mb-1" />
                        <Skeleton className="h-2 lg:h-2 w-1/2 mb-0.5 lg:mb-1" />
                        <Skeleton className="h-1.5 lg:h-2 w-1/4" />
                      </div>
                      <Skeleton className="h-2.5 lg:h-3 w-14 lg:w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center mb-2 lg:mb-3">
                    <Skeleton className="w-3 lg:w-4 h-3 lg:h-4 mr-1.5 lg:mr-2" />
                    <Skeleton className="h-3 lg:h-4 w-20 lg:w-24" />
                  </div>
                  <div className="space-y-1.5 lg:space-y-2">
                    <Skeleton className="h-2.5 lg:h-3 w-full" />
                    <Skeleton className="h-2.5 lg:h-3 w-3/4" />
                    <Skeleton className="h-2.5 lg:h-3 w-2/3" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center mb-2 lg:mb-3">
                    <Skeleton className="w-3 lg:w-4 h-3 lg:h-4 mr-1.5 lg:mr-2" />
                    <Skeleton className="h-3 lg:h-4 w-20 lg:w-24" />
                  </div>
                  <div className="space-y-1.5 lg:space-y-2">
                    <Skeleton className="h-2.5 lg:h-3 w-full" />
                    <Skeleton className="h-2.5 lg:h-3 w-3/4" />
                    <Skeleton className="h-2.5 lg:h-3 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar skeleton */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-2 lg:pb-3 px-3 lg:px-6 pt-3 lg:pt-6">
                <Skeleton className="h-3.5 lg:h-4 w-16 lg:w-20" />
              </CardHeader>
              <CardContent className="pt-0 px-3 lg:px-6 pb-3 lg:pb-6">
                <div className="space-y-3 lg:space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-start space-x-2 lg:space-x-3"
                    >
                      <Skeleton className="w-5 lg:w-6 h-5 lg:h-6 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-2.5 lg:h-3 w-2/3 mb-0.5 lg:mb-1" />
                        <Skeleton className="h-2 lg:h-2 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5 lg:space-y-2 mt-4 lg:mt-6">
                  <Skeleton className="h-8 lg:h-9 w-full rounded-lg" />
                  <Skeleton className="h-8 lg:h-9 w-full rounded-lg" />
                  <Skeleton className="h-8 lg:h-9 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Updated types for variant support
interface OrderItem {
  id: string;
  type: "product" | "variant";
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  brand?: string;
  image: string;
  slug: string;
  quantity: number;
  price: number;
  variantSnapshot?: any; // Store variant details at time of order
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
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
  items: OrderItem[];
  totals: {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
  };
}

function CheckoutSuccessPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order data with variant support
  const fetchOrderData = async () => {
    if (!orderId || !session?.user) {
      setError("Order ID not found or user not authenticated");
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching order with ID:", orderId);
      const response = await fetch(`/api/orders/${orderId}`);

      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Full API response:", data);

        // Check if order data exists
        if (!data.order) {
          console.error("No order found in response:", data);
          setError("Order data not found in response");
          setLoading(false);
          return;
        }

        // Transform the API response to match our expected format
        const transformedOrder = {
          id: data.order.id,
          orderNumber: data.order.orderNumber || data.order.id,
          status: data.order.status,
          total: data.order.total,
          shippingAddress: data.order.shippingAddress,
          paymentIntentId: data.order.paymentIntentId,
          createdAt: data.order.createdAt,
          items: data.order.items || [],
          totals: data.order.totals || {
            subtotal: data.order.subtotal || 0,
            shipping: data.order.shippingCost || 0,
            tax: data.order.taxAmount || 0,
            total: data.order.total || 0,
          },
        };

        console.log("Transformed order:", transformedOrder);
        setOrderData(transformedOrder);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error("API Error Response:", response.status, errorData);
        setError(
          errorData.error ||
            `API returned ${response.status}: Failed to fetch order details`
        );
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (status === "authenticated") {
      fetchOrderData();
    }
  }, [status, session, orderId, router]);

  useEffect(() => {
    // Clear cart update event
    if (orderData) {
      window.dispatchEvent(new CustomEvent("cartUpdated"));
    }
  }, [orderData]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, session, router]);

  // Don't render content for vendors
  if (session?.user?.role === "VENDOR") {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  const formatOrderNumber = (orderNumber: string) => {
    return `TV-${orderNumber.slice(-8).toUpperCase()}`;
  };

  const getEstimatedDelivery = () => {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3); // 3 days from now
    return deliveryDate.toLocaleDateString("de-DE");
  };

  const getPaymentMethodDisplay = () => {
    if (orderData?.paymentIntentId?.startsWith("pi_mock_")) {
      return "**** **** **** 4242";
    }
    return "**** **** **** ••••";
  };

  // Show loading state with skeleton
  if (loading) {
    return <CheckoutSuccessPageSkeleton />;
  }

  // Error state
  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-3 lg:px-4 py-8 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto text-center"
          >
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4 lg:p-6">
                <div className="w-10 lg:w-12 h-10 lg:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4">
                  <ExclamationTriangleIcon className="w-5 lg:w-6 h-5 lg:h-6 text-red-500" />
                </div>
                <h1 className="text-sm lg:text-base font-semibold text-gray-900 mb-1">
                  Order Not Found
                </h1>
                <p className="text-xs lg:text-sm text-gray-600 mb-3 lg:mb-4">
                  {error || "We couldn't find the order details."}
                </p>
                <div className="space-y-2">
                  <Link
                    href="/orders"
                    className="inline-flex items-center px-3 lg:px-4 py-2 bg-gray-900 text-white text-xs lg:text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
                  >
                    View My Orders
                  </Link>
                  <div>
                    <Link
                      href="/products"
                      className="inline-flex items-center px-3 lg:px-4 py-2 bg-white text-gray-700 text-xs lg:text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
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
                  <BreadcrumbLink asChild>
                    <Link href="/cart" className="cursor-pointer">
                      Cart
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/checkout" className="cursor-pointer">
                      Checkout
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Success</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="container mx-auto px-3 lg:px-4 py-3 lg:py-4 space-y-3 lg:space-y-4"
      >
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 lg:p-4 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-10 lg:w-12 h-10 lg:h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2 lg:mb-3"
              >
                <CheckCircleIcon className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-base lg:text-lg font-bold text-gray-900 mb-1"
              >
                Order Confirmed!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="text-xs lg:text-sm text-gray-600 mb-1"
              >
                Thank you for your purchase,{" "}
                {orderData.shippingAddress.firstName}{" "}
                {orderData.shippingAddress.lastName}!
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="text-[10px] lg:text-xs text-gray-500"
              >
                Order #{formatOrderNumber(orderData.orderNumber)}
              </motion.p>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
          {/* Order Details - Main Content */}
          <div className="lg:col-span-2 space-y-3 lg:space-y-4">
            {/* Order Summary with Variant Support */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-2 lg:pb-3 px-3 lg:px-6 pt-3 lg:pt-6">
                  <CardTitle className="text-sm lg:text-base">
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 px-3 lg:px-6 pb-3 lg:pb-6">
                  <div className="space-y-2 lg:space-y-3">
                    {orderData.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center space-x-2 lg:space-x-3 pb-2 lg:pb-3 border-b border-gray-200 last:border-b-0"
                      >
                        <div className="w-8 lg:w-10 h-8 lg:h-10 bg-gray-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-xs lg:text-sm">
                            {item.variantName
                              ? `${item.name} - ${item.variantName}`
                              : item.name}
                          </h3>
                          {item.brand && (
                            <p className="text-[10px] lg:text-xs text-gray-600">
                              {item.brand}
                            </p>
                          )}
                          <p className="text-[10px] lg:text-xs text-gray-500">
                            Qty: {item.quantity}
                          </p>

                          {/* Show variant details if available */}
                          {item.variantSnapshot && (
                            <div className="text-[10px] lg:text-xs text-gray-500 mt-0.5 lg:mt-1">
                              {item.variantSnapshot.color && (
                                <span className="mr-2">
                                  Color: {item.variantSnapshot.color}
                                </span>
                              )}
                              {item.variantSnapshot.storage && (
                                <span className="mr-2">
                                  Storage: {item.variantSnapshot.storage}
                                </span>
                              )}
                              {item.variantSnapshot.size && (
                                <span className="mr-2">
                                  Size: {item.variantSnapshot.size}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <p className="font-semibold text-gray-900 text-xs lg:text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}

                    {/* Order Totals */}
                    <div className="space-y-1.5 lg:space-y-2 pt-2 lg:pt-3 border-t border-gray-200">
                      <div className="flex justify-between text-[10px] lg:text-xs">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="text-gray-900">
                          {formatPrice(orderData.totals.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] lg:text-xs">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-gray-900">
                          {orderData.totals.shipping === 0
                            ? "Free"
                            : formatPrice(orderData.totals.shipping)}
                        </span>
                      </div>
                      <div className="flex justify-between text-[10px] lg:text-xs">
                        <span className="text-gray-600">Tax (VAT 19%)</span>
                        <span className="text-gray-900">
                          {formatPrice(orderData.totals.tax)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pt-1.5 lg:pt-2 border-t border-gray-200">
                        <span className="text-xs lg:text-sm font-semibold text-gray-900">
                          Total
                        </span>
                        <span className="text-sm lg:text-base font-bold text-gray-900">
                          {formatPrice(orderData.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Shipping & Payment Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4"
            >
              {/* Shipping Address */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center mb-2 lg:mb-3">
                    <MapPinIcon className="w-3 lg:w-4 h-3 lg:h-4 text-gray-600 mr-1.5 lg:mr-2" />
                    <h3 className="text-xs lg:text-sm font-semibold text-gray-900">
                      Shipping Address
                    </h3>
                  </div>
                  <div className="text-gray-700 space-y-0.5 lg:space-y-1">
                    <p className="font-medium text-[10px] lg:text-xs">
                      {orderData.shippingAddress.firstName}{" "}
                      {orderData.shippingAddress.lastName}
                    </p>
                    <p className="text-[10px] lg:text-xs">
                      {orderData.shippingAddress.address}
                    </p>
                    <p className="text-[10px] lg:text-xs">
                      {orderData.shippingAddress.city},{" "}
                      {orderData.shippingAddress.postalCode}
                    </p>
                    <p className="text-[10px] lg:text-xs">
                      {orderData.shippingAddress.country}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-3 lg:p-4">
                  <div className="flex items-center mb-2 lg:mb-3">
                    <CreditCardIcon className="w-3 lg:w-4 h-3 lg:h-4 text-gray-600 mr-1.5 lg:mr-2" />
                    <h3 className="text-xs lg:text-sm font-semibold text-gray-900">
                      Payment Method
                    </h3>
                  </div>
                  <div className="text-gray-700">
                    <p className="font-medium text-[10px] lg:text-xs">
                      Credit Card
                    </p>
                    <p className="text-[10px] lg:text-xs">
                      {getPaymentMethodDisplay()}
                    </p>
                    <p className="text-[10px] lg:text-xs text-green-600 mt-1.5 lg:mt-2">
                      ✓ Payment Successful
                    </p>
                    {orderData.paymentIntentId && (
                      <p className="text-[10px] lg:text-xs text-gray-500 mt-1">
                        Payment ID: {orderData.paymentIntentId}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar - Next Steps */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-1"
          >
            <Card className="border-0 shadow-sm sticky top-24">
              <CardHeader className="pb-2 lg:pb-3 px-3 lg:px-6 pt-3 lg:pt-6">
                <CardTitle className="text-sm lg:text-base">
                  What&apos;s Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 px-3 lg:px-6 pb-3 lg:pb-6">
                <div className="space-y-3 lg:space-y-4">
                  {/* Delivery Info */}
                  <div className="flex items-start space-x-2 lg:space-x-3">
                    <div className="w-5 lg:w-6 h-5 lg:h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <TruckIcon className="w-2.5 lg:w-3 h-2.5 lg:h-3 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-[10px] lg:text-xs">
                        Estimated Delivery
                      </h4>
                      <p className="text-[10px] lg:text-xs text-gray-600 mt-0.5 lg:mt-1">
                        {getEstimatedDelivery()}
                      </p>
                      <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5 lg:mt-1">
                        {orderData.totals.shipping === 0
                          ? "Free standard shipping"
                          : "Standard shipping"}
                      </p>
                    </div>
                  </div>

                  {/* Email Confirmation */}
                  <div className="flex items-start space-x-2 lg:space-x-3">
                    <div className="w-5 lg:w-6 h-5 lg:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <EnvelopeIcon className="w-2.5 lg:w-3 h-2.5 lg:h-3 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-[10px] lg:text-xs">
                        Order Confirmation
                      </h4>
                      <p className="text-[10px] lg:text-xs text-gray-600 mt-0.5 lg:mt-1">
                        Check your email for order details and tracking
                        information.
                      </p>
                    </div>
                  </div>

                  {/* Order Tracking */}
                  <div className="flex items-start space-x-2 lg:space-x-3">
                    <div className="w-5 lg:w-6 h-5 lg:h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CalendarDaysIcon className="w-2.5 lg:w-3 h-2.5 lg:h-3 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 text-[10px] lg:text-xs">
                        Track Your Order
                      </h4>
                      <p className="text-[10px] lg:text-xs text-gray-600 mt-0.5 lg:mt-1">
                        You&apos;ll receive tracking details once your order
                        ships.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-1.5 lg:space-y-2 mt-4 lg:mt-6 pt-3 lg:pt-4 border-t border-gray-200">
                  <Link
                    href={`/orders`}
                    className="w-full bg-gray-900 text-white py-2 lg:py-2.5 px-3 lg:px-4 rounded-lg font-medium text-[10px] lg:text-xs text-center block hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    View Order Details
                  </Link>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-white text-gray-700 py-2 lg:py-2.5 px-3 lg:px-4 rounded-lg font-medium text-[10px] lg:text-xs border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center space-x-1.5 lg:space-x-2 cursor-pointer"
                  >
                    <PrinterIcon className="w-2.5 lg:w-3 h-2.5 lg:h-3" />
                    <span>Print Receipt</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full bg-white text-gray-700 py-2 lg:py-2.5 px-3 lg:px-4 rounded-lg font-medium text-[10px] lg:text-xs border border-gray-200 hover:bg-gray-50 transition-all flex items-center justify-center space-x-1.5 lg:space-x-2 cursor-pointer"
                  >
                    <ArrowDownTrayIcon className="w-2.5 lg:w-3 h-2.5 lg:h-3" />
                    <span>Download Invoice</span>
                  </motion.button>
                </div>

                {/* Continue Shopping */}
                <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-200">
                  <Link
                    href="/products"
                    className="w-full bg-gray-900 text-white py-2 lg:py-2.5 px-3 lg:px-4 rounded-lg font-medium text-[10px] lg:text-xs text-center block hover:bg-gray-800 transition-all cursor-pointer"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 lg:p-6 text-center">
              <h3 className="text-xs lg:text-sm font-semibold text-gray-900 mb-1.5 lg:mb-2">
                Need Help with Your Order?
              </h3>
              <p className="text-[10px] lg:text-xs text-gray-600 mb-3 lg:mb-4">
                Our customer support team is here to help you with any
                questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 justify-center">
                <Link
                  href="/support"
                  className="px-3 lg:px-4 py-2 lg:py-2.5 bg-gray-900 text-white rounded-lg font-medium text-[10px] lg:text-xs hover:bg-gray-800 transition-all cursor-pointer"
                >
                  Contact Support
                </Link>
                <Link
                  href="/faq"
                  className="px-3 lg:px-4 py-2 lg:py-2.5 bg-white text-gray-700 rounded-lg font-medium text-[10px] lg:text-xs border border-gray-200 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  View FAQ
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<CheckoutSuccessPageSkeleton />}>
      <CheckoutSuccessPageContent />
    </Suspense>
  );
}
