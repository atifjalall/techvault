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
} from "@heroicons/react/24/outline";
import { Suspense } from "react";

function CheckoutSuccessPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
// Types
interface OrderItem {
  id: string;
  productId: string;
  name: string;
  brand?: string;
  image: string;
  slug: string;
  quantity: number;
  price: number;
}

interface OrderData {
  id: string;
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
  const [showConfetti, setShowConfetti] = useState(false);

  // Fetch order data
  const fetchOrderData = async () => {
    if (!orderId || !session?.user) {
      setError("Order ID not found or user not authenticated");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`);

      if (response.ok) {
        const data = await response.json();
        setOrderData(data.order);
        setShowConfetti(true);
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch order details");
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

  const formatOrderNumber = (orderId: string) => {
    return `TV-${orderId.slice(-8).toUpperCase()}`;
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-8 text-center">
              <div className="w-8 h-8 border-4 border-slate-300 border-t-slate-900 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-slate-600">Loading order details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-8 text-center max-w-md"
            >
              <ExclamationTriangleIcon className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-slate-900 mb-2">
                Order Not Found
              </h2>
              <p className="text-sm text-slate-600 mb-4">
                {error || "We couldn't find the order details."}
              </p>
              <div className="space-y-3">
                <Link
                  href="/orders"
                  className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg font-medium text-sm hover:bg-slate-800 transition-all block cursor-pointer"
                >
                  View My Orders
                </Link>
                <Link
                  href="/products"
                  className="w-full bg-white/60 text-slate-700 py-2.5 px-4 rounded-lg font-medium text-sm border border-slate-200/50 hover:bg-white/80 transition-all block cursor-pointer"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                y: -100,
                x:
                  Math.random() *
                  (typeof window !== "undefined" ? window.innerWidth : 1200),
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y:
                  (typeof window !== "undefined" ? window.innerHeight : 800) +
                  100,
                rotate: 360,
                opacity: 0,
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
                ease: "linear",
              }}
              className={`absolute w-3 h-3 ${
                [
                  "bg-green-400",
                  "bg-blue-400",
                  "bg-purple-400",
                  "bg-pink-400",
                  "bg-yellow-400",
                ][Math.floor(Math.random() * 5)]
              } rounded-full`}
            />
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
          >
            <CheckCircleIcon className="w-8 h-8 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl font-bold text-slate-900 mb-2"
          >
            Order Confirmed!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-slate-600 mb-1"
          >
            Thank you for your purchase, {orderData.shippingAddress.firstName}{" "}
            {orderData.shippingAddress.lastName}!
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-slate-500"
          >
            Order #{formatOrderNumber(orderData.id)}
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-6"
            >
              <h2 className="text-base font-semibold text-slate-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-3 pb-3 border-b border-slate-200/50 last:border-b-0"
                  >
                    <div className="w-12 h-12 bg-slate-100 rounded-lg overflow-hidden">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-200"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 text-xs">
                        {item.name}
                      </h3>
                      {item.brand && (
                        <p className="text-xs text-slate-600">{item.brand}</p>
                      )}
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900 text-xs">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}

                {/* Order Totals */}
                <div className="space-y-1 pt-3 border-t border-slate-200/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Subtotal</span>
                    <span className="text-slate-900">
                      {formatPrice(orderData.totals.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Shipping</span>
                    <span className="text-slate-900">
                      {orderData.totals.shipping === 0
                        ? "Free"
                        : formatPrice(orderData.totals.shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Tax (VAT 19%)</span>
                    <span className="text-slate-900">
                      {formatPrice(orderData.totals.tax)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200/50">
                    <span className="text-sm font-semibold text-slate-900">
                      Total
                    </span>
                    <span className="text-base font-bold text-slate-900">
                      {formatPrice(orderData.total)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Shipping & Payment Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Shipping Address */}
              <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-4">
                <div className="flex items-center mb-3">
                  <MapPinIcon className="w-4 h-4 text-slate-600 mr-2" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Shipping Address
                  </h3>
                </div>
                <div className="text-slate-700 space-y-0.5">
                  <p className="font-medium text-xs">
                    {orderData.shippingAddress.firstName}{" "}
                    {orderData.shippingAddress.lastName}
                  </p>
                  <p className="text-xs">{orderData.shippingAddress.address}</p>
                  <p className="text-xs">
                    {orderData.shippingAddress.city},{" "}
                    {orderData.shippingAddress.postalCode}
                  </p>
                  <p className="text-xs">{orderData.shippingAddress.country}</p>
                </div>
              </div>

              {/* Payment Method */}
              <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-4">
                <div className="flex items-center mb-3">
                  <CreditCardIcon className="w-4 h-4 text-slate-600 mr-2" />
                  <h3 className="text-sm font-semibold text-slate-900">
                    Payment Method
                  </h3>
                </div>
                <div className="text-slate-700">
                  <p className="font-medium text-xs">Credit Card</p>
                  <p className="text-xs">{getPaymentMethodDisplay()}</p>
                  <p className="text-xs text-emerald-600 mt-2">
                    ✓ Payment Successful
                  </p>
                  {orderData.paymentIntentId && (
                    <p className="text-xs text-slate-500 mt-1">
                      Payment ID: {orderData.paymentIntentId}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Next Steps */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
              className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-4 sticky top-24"
            >
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                What&apos;s Next?
              </h3>

              <div className="space-y-4">
                {/* Delivery Info */}
                <div className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <TruckIcon className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-xs">
                      Estimated Delivery
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {getEstimatedDelivery()}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {orderData.totals.shipping === 0
                        ? "Free standard shipping"
                        : "Standard shipping"}
                    </p>
                  </div>
                </div>

                {/* Email Confirmation */}
                <div className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <EnvelopeIcon className="w-3 h-3 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-xs">
                      Order Confirmation
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Check your email for order details and tracking
                      information.
                    </p>
                  </div>
                </div>

                {/* Order Tracking */}
                <div className="flex items-start space-x-2.5">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CalendarDaysIcon className="w-3 h-3 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900 text-xs">
                      Track Your Order
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      You&apos;ll receive tracking details once your order
                      ships.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 mt-6 pt-4 border-t border-slate-200/50">
                <Link
                  href={`/orders`}
                  className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg font-medium text-xs text-center block hover:bg-slate-800 transition-all shadow-lg cursor-pointer"
                >
                  View Order Details
                </Link>

                <button className="w-full bg-white/60 backdrop-blur-sm text-slate-700 py-2.5 px-4 rounded-lg font-medium text-xs border border-slate-200/50 hover:bg-white/80 transition-all flex items-center justify-center space-x-1.5 cursor-pointer">
                  <PrinterIcon className="w-3 h-3" />
                  <span>Print Receipt</span>
                </button>

                <button className="w-full bg-white/60 backdrop-blur-sm text-slate-700 py-2.5 px-4 rounded-lg font-medium text-xs border border-slate-200/50 hover:bg-white/80 transition-all flex items-center justify-center space-x-1.5 cursor-pointer">
                  <ArrowDownTrayIcon className="w-3 h-3" />
                  <span>Download Invoice</span>
                </button>
              </div>

              {/* Continue Shopping */}
              <div className="mt-4 pt-4 border-t border-slate-200/50">
                <Link
                  href="/products"
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-xs text-center block hover:bg-blue-700 transition-all shadow-lg cursor-pointer"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mt-8 text-center"
        >
          <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Need Help with Your Order?
            </h3>
            <p className="text-xs text-slate-600 mb-4">
              Our customer support team is here to help you with any questions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/support"
                className="px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800 transition-all cursor-pointer"
              >
                Contact Support
              </Link>
              <Link
                href="/faq"
                className="px-4 py-2.5 bg-white/60 backdrop-blur-sm text-slate-700 rounded-lg font-medium text-xs border border-slate-200/50 hover:bg-white/80 transition-all cursor-pointer"
              >
                View FAQ
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
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
