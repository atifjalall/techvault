"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  SparklesIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";

const featuredCategories = [
  {
    id: 1,
    name: "Gaming",
    description: "Level up your gameplay with premium gaming gear",
    href: "/products?category=gaming",
    image: "/products/gaming.jpg",
    className: "lg:col-span-1 lg:row-span-2 min-h-[300px] lg:min-h-[400px]",
    accent: "bg-red-500",
    gradient: "from-red-500/20 to-red-600/30",
  },
  {
    id: 2,
    name: "Audio",
    description: "Premium sound systems and headphones",
    href: "/products?category=audio",
    image: "/products/audio.jpg",
    className: "lg:col-span-1 min-h-[150px] lg:min-h-[190px]",
    accent: "bg-blue-500",
    gradient: "from-blue-500/20 to-blue-600/30",
  },
  {
    id: 3,
    name: "Computing",
    description: "Professional laptops and workstation setups",
    href: "/products?category=computing",
    image: "/products/computing.jpg",
    className: "lg:col-span-1 min-h-[150px] lg:min-h-[190px]",
    accent: "bg-green-500",
    gradient: "from-green-500/20 to-green-600/30",
  },
];

const quickCategories = [
  {
    name: "Earbuds",
    href: "/products?category=audio&subcategory=earbuds",
    icon: SparklesIcon,
    count: "Audio",
  },
  {
    name: "Laptops",
    href: "/products?category=computing&subcategory=laptops",
    icon: ComputerDesktopIcon,
    count: "Computing",
  },
  {
    name: "Smartphones",
    href: "/products?category=electronics&subcategory=smartphones",
    icon: DevicePhoneMobileIcon,
    count: "Electronics",
  },
  {
    name: "Consoles",
    href: "/products?category=gaming&subcategory=consoles",
    icon: RocketLaunchIcon,
    count: "Gaming",
  },
];

interface CategoryCardProps {
  category: (typeof featuredCategories)[0];
  index: number;
}

function CategoryCard({ category, index }: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: "easeOut",
      }}
      whileHover={{
        scale: 1.01,
        y: -4,
      }}
      className={`${category.className}`}
    >
      <Link
        href={category.href}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 text-white block h-full shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer"
      >
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-900">
            <div className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          </div>
        </div>

        {/* Premium Gradient Overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-80 group-hover:opacity-90 transition-all duration-500`}
        />

        {/* Glass Morphism Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent group-hover:from-black/70 transition-all duration-500" />

        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
              backgroundSize: "30px 30px",
            }}
          />
        </div>

        {/* Content */}
        <div className="relative h-full p-4 lg:p-6 flex flex-col justify-end">
          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="absolute top-3 right-3 lg:top-4 lg:right-4"
          >
            <div
              className={`w-2 h-2 ${category.accent} rounded-full shadow-lg`}
            >
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [1, 0, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className={`w-full h-full ${category.accent} rounded-full`}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
            className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300"
          >
            <motion.h3 className="text-lg lg:text-2xl xl:text-3xl font-bold mb-1 lg:mb-2 leading-tight">
              {category.name}
            </motion.h3>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="text-white/80 text-xs lg:text-sm mb-2 lg:mb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 leading-relaxed"
            >
              {category.description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              className="inline-flex items-center text-white text-xs lg:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 delay-200"
            >
              <span className="mr-2">Shop Now</span>
              <motion.svg
                whileHover={{ x: 4 }}
                className="w-4 h-4 transform translate-x-0 group-hover:translate-x-2 transition-transform duration-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </motion.svg>
            </motion.div>
          </motion.div>
        </div>

        {/* Premium Shimmer Effect */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700">
          <motion.div
            initial={{ x: "-100%" }}
            whileHover={{ x: "100%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          />
        </div>
      </Link>
    </motion.div>
  );
}

interface QuickCategoryProps {
  category: (typeof quickCategories)[0];
  index: number;
}

function QuickCategoryCard({ category, index }: QuickCategoryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
    >
      <Link
        href={category.href}
        className="group bg-white rounded-lg lg:rounded-xl p-3 lg:p-4 text-center hover:shadow-sm transition-all duration-300 border border-gray-100/60 hover:border-gray-200/80 block cursor-pointer"
      >
        <motion.div
          whileHover={{ scale: 1.02, y: -1 }}
          className="w-7 h-7 lg:w-9 lg:h-9 bg-gray-900 rounded-md lg:rounded-lg flex items-center justify-center mx-auto mb-1.5 lg:mb-2 group-hover:bg-gray-800 transition-colors duration-300"
        >
          <category.icon className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
        </motion.div>

        <h3 className="font-semibold text-gray-900 text-xs lg:text-sm mb-0.5 lg:mb-1 group-hover:text-gray-700 transition-colors">
          {category.name}
        </h3>

        <p className="text-[10px] lg:text-xs text-gray-500 font-medium">
          {category.count}
        </p>
      </Link>
    </motion.div>
  );
}

export default function FeaturedCategories() {
  return (
    <section className="py-8 lg:py-16 bg-gradient-to-br from-slate-50/50 via-white to-slate-50/30 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #000 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Match Wishlist Container Width */}
      <div className="container mx-auto px-3 lg:px-4 relative">
        {/* Premium Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-6 lg:mb-12"
        >
          {/* Premium Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center px-2 py-1 lg:px-3 lg:py-1.5 bg-slate-100 rounded-full text-slate-700 text-[10px] lg:text-xs font-medium mb-2 lg:mb-4 border border-slate-200/50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-1.5 lg:mr-2 flex items-center justify-center"
            >
              <div className="w-0.5 h-0.5 lg:w-1 lg:h-1 bg-white rounded-full" />
            </motion.div>
            Featured Collections
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl lg:text-3xl xl:text-4xl font-bold text-slate-900 mb-2 lg:mb-4 leading-tight"
          >
            Premium{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Categories
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xs lg:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Explore our curated collections of premium electronics and tech
            essentials, handpicked for quality and innovation.
          </motion.p>
        </motion.div>

        {/* Main Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-12">
          {featuredCategories.map((category, index) => (
            <CategoryCard key={category.id} category={category} index={index} />
          ))}
        </div>

        {/* Quick Access Categories */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6 lg:mb-12"
        >
          <div className="text-center mb-4 lg:mb-8">
            <h3 className="text-lg lg:text-xl font-bold text-slate-900 mb-1 lg:mb-2">
              Quick Access
            </h3>
            <p className="text-xs lg:text-sm text-slate-600">
              Browse by popular product categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4">
            {quickCategories.map((category, index) => (
              <QuickCategoryCard
                key={category.name}
                category={category}
                index={index}
              />
            ))}
          </div>
        </motion.div>

        {/* Premium View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Link
            href="/products"
            className="group relative inline-flex items-center justify-center px-6 py-2.5 lg:px-8 lg:py-3 bg-slate-900 text-white text-xs lg:text-sm font-semibold rounded-lg lg:rounded-xl hover:bg-slate-800 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer overflow-hidden"
          >
            {/* Background Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

            <span className="relative">View All Products</span>

            <motion.svg
              whileHover={{ x: 4 }}
              className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </motion.svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
