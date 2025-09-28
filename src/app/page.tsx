"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Footer from "@/components/layout/Footer";
import HeroCarousel from "@/components/home/HeroCarousel";
import NewArrivals from "@/components/home/NewArrivals";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Block vendors from accessing store homepage
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "VENDOR") {
      router.replace("/vendor/dashboard");
    }
  }, [status, session, router]);

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        {/* Main Content Skeleton */}
        <main>
          {/* Hero Carousel Skeleton */}
          <section className="relative h-[60vh] min-h-[400px] bg-gray-50">
            <div className="absolute inset-0">
              <Skeleton className="w-full h-full" />
            </div>
            {/* Hero overlay content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-4 px-4">
                <Skeleton className="h-12 w-80 mx-auto" />
                <Skeleton className="h-6 w-96 mx-auto" />
                <Skeleton className="h-12 w-40 mx-auto rounded-lg" />
              </div>
            </div>
            {/* Carousel indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="w-3 h-3 rounded-full" />
              ))}
            </div>
          </section>

          {/* New Arrivals Skeleton */}
          <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-12">
                <Skeleton className="h-8 w-48 mx-auto mb-4" />
                <Skeleton className="h-5 w-80 mx-auto" />
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="aspect-square w-full rounded-lg" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-full" />
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((j) => (
                          <Skeleton key={j} className="w-3 h-3 rounded-full" />
                        ))}
                        <Skeleton className="h-3 w-8 ml-2" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Categories Skeleton */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Section Header */}
              <div className="text-center mb-12">
                <Skeleton className="h-8 w-56 mx-auto mb-4" />
                <Skeleton className="h-5 w-72 mx-auto" />
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="text-center space-y-3">
                    <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                    <Skeleton className="h-4 w-20 mx-auto" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Trust Indicators Skeleton */}
          <section className="py-10 bg-white border-t border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="w-10 h-10 rounded-full mx-auto" />
                    <Skeleton className="h-4 w-24 mx-auto" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Newsletter Skeleton */}
          <section className="relative py-16 bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5">
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                  backgroundSize: "40px 40px",
                }}
              ></div>
            </div>

            {/* Gradient Orbs */}
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
            <div
              className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
              style={{ animationDelay: "1s" }}
            ></div>

            <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              {/* Badge */}
              <Skeleton className="h-6 w-48 mx-auto mb-4 rounded-full bg-white/10" />

              {/* Main Heading */}
              <div className="mb-4 space-y-2">
                <Skeleton className="h-8 w-64 mx-auto bg-white/10" />
                <Skeleton className="h-8 w-32 mx-auto bg-white/10" />
              </div>

              {/* Subheading */}
              <div className="mb-8 space-y-2">
                <Skeleton className="h-4 w-80 mx-auto bg-white/10" />
                <Skeleton className="h-4 w-64 mx-auto bg-white/10" />
              </div>

              {/* Email Form */}
              <div className="relative max-w-md mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20"></div>
                <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-1.5 border border-white/20">
                  <div className="flex flex-col sm:flex-row gap-1.5">
                    <Skeleton className="flex-1 h-12 rounded-lg bg-white/10" />
                    <Skeleton className="h-12 w-24 rounded-lg bg-white/90" />
                  </div>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="w-3 h-3 mr-1.5 bg-white/10" />
                    <Skeleton className="h-3 w-32 bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        {/* Footer Skeleton */}
        <footer className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-5 w-24 bg-white/10" />
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((j) => (
                      <Skeleton key={j} className="h-4 w-20 bg-white/10" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center">
              <Skeleton className="h-4 w-64 mx-auto bg-white/10" />
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Don't render store content for vendors
  if (session?.user?.role === "VENDOR") {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main>
        {/* Hero Carousel Section */}
        <HeroCarousel />

        {/* New Arrivals Section */}
        <NewArrivals />

        {/* Featured Categories Section */}
        <FeaturedCategories />

        {/* Trust Indicators Section */}
        <section className="py-10 bg-white border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                {
                  icon: (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  ),
                  title: "Free Shipping",
                  subtitle: "Orders over €50",
                },
                {
                  icon: (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  ),
                  title: "2 Year Warranty",
                  subtitle: "All electronics",
                },
                {
                  icon: (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                  ),
                  title: "Secure Payment",
                  subtitle: "SSL encryption",
                },
                {
                  icon: (
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 109.75 9.75A9.75 9.75 0 0012 2.25z"
                      />
                    </svg>
                  ),
                  title: "24/7 Support",
                  subtitle: "Expert service",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -3 }}
                  className="space-y-2 cursor-pointer"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="w-10 h-10 bg-black rounded-full flex items-center justify-center mx-auto"
                  >
                    {item.icon}
                  </motion.div>
                  <h3 className="font-medium text-sm text-gray-900">
                    {item.title}
                  </h3>
                  <p className="text-xs text-gray-600">{item.subtitle}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Compact Newsletter Section */}
        <section className="relative py-16 bg-gradient-to-br from-gray-900 via-black to-gray-800 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
                backgroundSize: "40px 40px",
              }}
            ></div>
          </div>

          {/* Gradient Orbs */}
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
          <div
            className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-xs font-medium mb-4 border border-white/20"
            >
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              50,000+ tech enthusiasts joined
            </motion.div>

            {/* Main Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight"
            >
              Stay Ahead of
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                Tech Trends
              </span>
            </motion.h2>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-sm text-gray-300 mb-8 max-w-xl mx-auto"
            >
              Get exclusive access to new products, special deals, and tech
              insights delivered to your inbox.
            </motion.p>

            {/* Email Form */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative max-w-md mx-auto mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-xl p-1.5 border border-white/20">
                <div className="flex flex-col sm:flex-row gap-1.5">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent backdrop-blur-sm transition-all duration-300"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-3 bg-white text-black font-medium text-sm rounded-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
                  >
                    Subscribe
                  </motion.button>
                </div>
              </div>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 text-gray-400 text-xs"
            >
              {[
                "No spam, unsubscribe anytime",
                "Weekly exclusive deals",
                "Early access to sales",
              ].map((text, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center cursor-pointer"
                >
                  <svg
                    className="w-3 h-3 text-green-400 mr-1.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {text}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
