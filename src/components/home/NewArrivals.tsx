"use client";

import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useState } from "react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/utils";
import ProductCard from "@/components/ui/ProductCard";

const newProducts = [
  {
    id: 1,
    name: "Wireless Gaming Headset Pro",
    brand: "AudioTech",
    price: 189.99,
    originalPrice: 249.99,
    image: "/api/placeholder/300/300",
    variants: "3 colors",
    isNew: true,
    category: "Audio",
    slug: "wireless-gaming-headset-pro",
  },
  {
    id: 2,
    name: 'UltraSlim Laptop 15"',
    brand: "TechFlow",
    price: 1299.99,
    originalPrice: 1499.99,
    image: "/api/placeholder/300/300",
    variants: "2 configurations",
    isNew: true,
    category: "Computing",
    slug: "ultraslim-laptop-15",
  },
  {
    id: 3,
    name: "Smart Fitness Watch",
    brand: "HealthTech",
    price: 299.99,
    originalPrice: 399.99,
    image: "/api/placeholder/300/300",
    variants: "4 colors",
    isNew: true,
    category: "Wearables",
    slug: "smart-fitness-watch",
  },
  {
    id: 4,
    name: "Mechanical Gaming Keyboard",
    brand: "GameForce",
    price: 159.99,
    originalPrice: 199.99,
    image: "/api/placeholder/300/300",
    variants: "3 switch types",
    isNew: true,
    category: "Gaming",
    slug: "mechanical-gaming-keyboard",
  },
  {
    id: 5,
    name: "Portable Bluetooth Speaker",
    brand: "SoundWave",
    price: 89.99,
    originalPrice: 119.99,
    image: "/api/placeholder/300/300",
    variants: "5 colors",
    isNew: true,
    category: "Audio",
    slug: "portable-bluetooth-speaker",
  },
  {
    id: 6,
    name: "Wireless Charging Stand",
    brand: "PowerUp",
    price: 49.99,
    originalPrice: 69.99,
    image: "/api/placeholder/300/300",
    variants: "2 colors",
    isNew: true,
    category: "Accessories",
    slug: "wireless-charging-stand",
  },
  {
    id: 7,
    name: "4K Webcam Pro",
    brand: "StreamTech",
    price: 199.99,
    originalPrice: 249.99,
    image: "/api/placeholder/300/300",
    variants: "1 model",
    isNew: true,
    category: "Computing",
    slug: "4k-webcam-pro",
  },
  {
    id: 8,
    name: "Premium Noise-Canceling Earbuds",
    brand: "AudioElite",
    price: 249.99,
    originalPrice: 299.99,
    image: "/api/placeholder/300/300",
    variants: "3 colors",
    isNew: true,
    category: "Audio",
    slug: "premium-noise-canceling-earbuds",
  },
];

interface ProductCardProps {
  product: (typeof newProducts)[0];
}

export default function NewArrivals() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-12"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4"
          >
            New Arrivals
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Fresh tech, just dropped. Discover the latest innovations in
            electronics and computing.
          </motion.p>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {newProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="text-center"
        >
          <Link
            href="/products?filter=new"
            className="inline-flex items-center text-gray-900 font-medium hover:text-gray-600 transition-colors group cursor-pointer"
          >
            View all new arrivals
            <motion.svg
              whileHover={{ x: 2 }}
              className="ml-2 h-4 w-4 transition-transform"
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
