"use client";

import Link from "next/link";
import { HeartIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid } from "@heroicons/react/24/solid";
import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import ProductCard from '@/components/ui/ProductCard';


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
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            New Arrivals
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Fresh tech, just dropped. Discover the latest innovations in
            electronics and computing.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {newProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Link
            href="/products?filter=new"
            className="inline-flex items-center text-gray-900 font-medium hover:text-gray-600 transition-colors group"
          >
            View all new arrivals
            <svg
              className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform"
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
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
