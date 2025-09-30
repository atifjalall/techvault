"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ProductCard from "@/components/ui/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  id: string;
  name: string;
  slug: string;
  brand?: string | { id: string; name: string };
  basePrice: number;
  images: string[];
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  newArrival: boolean;
  featured: boolean;
  variants: Array<{
    id: string;
    variantName: string;
    price: number;
    comparePrice?: number;
    stock: number;
    color?: string;
    colorHex?: string;
    images: string[];
  }>;
}

// Loading Skeleton Component
function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-100 overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-2 sm:p-3 lg:p-4 space-y-2 lg:space-y-3">
        <Skeleton className="h-2 lg:h-3 w-1/4" />
        <Skeleton className="h-3 lg:h-4 w-full" />
        <Skeleton className="h-2 lg:h-3 w-2/3" />
        <Skeleton className="h-4 lg:h-5 w-1/3" />
      </div>
    </div>
  );
}

export default function NewArrivals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);

        // Fetch products from dedicated new arrivals API
        const response = await fetch("/api/new-arrivals?limit=8");

        if (!response.ok) {
          throw new Error("Failed to fetch new arrivals");
        }

        const data = await response.json();

        if (data.success && data.products) {
          setProducts(data.products);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching new arrivals:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  // Transform API products to ProductCard format
  const transformedProducts = products
    .map((product) => {
      // Handle case where variants might be empty
      if (!product.variants || product.variants.length === 0) {
        return null;
      }

      const cheapestVariant = product.variants.reduce((prev, curr) =>
        Number(curr.price) < Number(prev.price) ? curr : prev
      );

      const hasDiscount =
        cheapestVariant.comparePrice &&
        Number(cheapestVariant.comparePrice) > Number(cheapestVariant.price);

      // Extract brand name if it's an object
      const brandName =
        typeof product.brand === "object" && product.brand
          ? product.brand.name
          : typeof product.brand === "string"
            ? product.brand
            : undefined;

      // Extract category name safely
      const categoryName = product.category?.name || undefined;

      return {
        id: product.id,
        name: product.name,
        brand: brandName,
        price: Number(cheapestVariant.price),
        originalPrice: hasDiscount
          ? Number(cheapestVariant.comparePrice)
          : undefined,
        image:
          product.images[0] ||
          cheapestVariant.images[0] ||
          "/api/placeholder/300/300",
        category: categoryName,
        slug: product.slug,
        isNew: product.newArrival,
        isFeatured: product.featured,
        // Pass variant count as a number for proper multi-variant detection
        variants:
          product.variants.length > 1 ? product.variants.length : undefined,
      };
    })
    .filter(
      (product): product is NonNullable<typeof product> => product !== null
    );

  return (
    <section className="py-12 lg:py-16 bg-white">
      {/* Match container width with other sections */}
      <div className="container mx-auto px-3 lg:px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-center mb-8 lg:mb-12"
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
            className="text-sm text-gray-600 max-w-2xl mx-auto"
          >
            Fresh tech, just dropped. Discover the latest innovations in
            electronics and computing.
          </motion.p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
            {[...Array(8)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-gray-900 font-medium hover:text-gray-600 transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && transformedProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-gray-600 mb-4">
              No new arrivals at the moment. Check back soon!
            </p>
            <Link
              href="/products"
              className="text-sm text-gray-900 font-medium hover:text-gray-600 transition-colors cursor-pointer"
            >
              Browse All Products
            </Link>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && transformedProducts.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8 lg:mb-12">
              {transformedProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.05,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="flex h-full" // ✅ Add this
                >
                  <ProductCard
                    product={product}
                    variant="compact"
                    className="h-full w-full flex flex-col" // ✅ Add this
                  />
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
                href="/products?newArrival=true"
                className="inline-flex items-center text-gray-900 text-sm font-medium hover:text-gray-600 transition-colors group cursor-pointer"
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
          </>
        )}
      </div>
    </section>
  );
}
