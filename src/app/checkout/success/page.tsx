"use client";

import { useEffect, useState } from "react";
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
} from "@heroicons/react/24/outline";
import Navbar from "@/components/layout/Navbar";

// Mock order data
const orderData = {
  orderNumber: "TV-2024-001234",
  orderDate: new Date().toLocaleDateString("de-DE"),
  estimatedDelivery: new Date(
    Date.now() + 3 * 24 * 60 * 60 * 1000
  ).toLocaleDateString("de-DE"),
  total: 1399.98,
  paymentMethod: "**** **** **** 4242",
  shippingAddress: {
    name: "John Doe",
    address: "Hauptstraße 123",
    city: "Berlin",
    postalCode: "10115",
    country: "Germany",
  },
  items: [
    {
      id: 1,
      name: "iPhone 15 Pro Max",
      brand: "Apple",
      price: 1199.99,
      quantity: 1,
      image: "/api/placeholder/80/80",
    },
    {
      id: 2,
      name: "AirPods Pro 2nd Gen",
      brand: "Apple",
      price: 199.99,
      quantity: 1,
      image: "/api/placeholder/80/80",
    },
  ],
};

export default function CheckoutSuccessPage() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    // Clear cart from localStorage or state management
    // clearCart();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <Navbar />

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{
                y: -100,
                x: Math.random() * window.innerWidth,
                rotate: 0,
                opacity: 1,
              }}
              animate={{
                y: window.innerHeight + 100,
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
            Thank you for your purchase, {orderData.shippingAddress.name}!
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-slate-500"
          >
            Order #{orderData.orderNumber}
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
                    <div className="w-12 h-12 bg-slate-100 rounded-lg"></div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 text-xs">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-600">{item.brand}</p>
                      <p className="text-xs text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900 text-xs">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                ))}

                <div className="border-t border-slate-200/50 pt-3">
                  <div className="flex justify-between items-center">
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
                    {orderData.shippingAddress.name}
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
                  <p className="text-xs">{orderData.paymentMethod}</p>
                  <p className="text-xs text-emerald-600 mt-2">
                    ✓ Payment Successful
                  </p>
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
                      {orderData.estimatedDelivery}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Free standard shipping
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
                  href={`/orders/${orderData.orderNumber}`}
                  className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg font-medium text-xs text-center block hover:bg-slate-800 transition-all shadow-lg"
                >
                  Track Order
                </Link>

                <button className="w-full bg-white/60 backdrop-blur-sm text-slate-700 py-2.5 px-4 rounded-lg font-medium text-xs border border-slate-200/50 hover:bg-white/80 transition-all flex items-center justify-center space-x-1.5">
                  <PrinterIcon className="w-3 h-3" />
                  <span>Print Receipt</span>
                </button>

                <button className="w-full bg-white/60 backdrop-blur-sm text-slate-700 py-2.5 px-4 rounded-lg font-medium text-xs border border-slate-200/50 hover:bg-white/80 transition-all flex items-center justify-center space-x-1.5">
                  <ArrowDownTrayIcon className="w-3 h-3" />
                  <span>Download Invoice</span>
                </button>
              </div>

              {/* Continue Shopping */}
              <div className="mt-4 pt-4 border-t border-slate-200/50">
                <Link
                  href="/products"
                  className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium text-xs text-center block hover:bg-blue-700 transition-all shadow-lg"
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
                className="px-4 py-2.5 bg-slate-900 text-white rounded-lg font-medium text-xs hover:bg-slate-800 transition-all"
              >
                Contact Support
              </Link>
              <Link
                href="/faq"
                className="px-4 py-2.5 bg-white/60 backdrop-blur-sm text-slate-700 rounded-lg font-medium text-xs border border-slate-200/50 hover:bg-white/80 transition-all"
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
