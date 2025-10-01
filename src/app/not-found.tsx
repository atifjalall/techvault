"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  HomeIcon,
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      setIsRedirecting(true);
      router.push("/");
    }
  }, [countdown, router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="max-w-2xl w-full text-center">
        {/* Animated 404 Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-50 border border-gray-200">
            <ExclamationTriangleIcon className="w-12 h-12 text-gray-400" />
          </div>
        </motion.div>

        {/* 404 Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-6xl font-bold text-gray-900 mb-3">404</h1>
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            Page Not Found
          </h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto mb-8">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Redirecting you to home in {countdown} seconds.
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-xs mx-auto mb-8"
        >
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-gray-900"
            />
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors cursor-pointer group"
          >
            <HomeIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Back to Home
          </Link>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-5 py-2 bg-white text-gray-900 text-sm font-medium rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <ShoppingBagIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
            View Products
          </Link>
        </motion.div>

        {/* Helpful Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-100"
        >
          <p className="text-xs text-gray-500 mb-4">Popular searches:</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/products/smartphones"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              <MagnifyingGlassIcon className="w-3.5 h-3.5" />
              Smartphones
            </Link>
            <Link
              href="/products/laptops"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              <MagnifyingGlassIcon className="w-3.5 h-3.5" />
              Laptops
            </Link>
            <Link
              href="/products/audio"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              <MagnifyingGlassIcon className="w-3.5 h-3.5" />
              Audio
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              Contact
            </Link>
          </div>
        </motion.div>

        {/* Redirecting Indicator */}
        {isRedirecting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 text-xs text-gray-500"
          >
            Redirecting...
          </motion.div>
        )}
      </div>
    </div>
  );
}
