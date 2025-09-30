"use client";

import { Skeleton } from "@/components/ui/skeleton";
import Footer from "@/components/layout/Footer";

export default function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="container mx-auto px-2 lg:px-4 py-4 lg:py-8 space-y-3 lg:space-y-6">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center space-x-1 lg:space-x-2">
          <Skeleton className="h-3 lg:h-4 w-8 lg:w-12" />
          <Skeleton className="h-3 lg:h-4 w-1" />
          <Skeleton className="h-3 lg:h-4 w-12 lg:w-20" />
          <Skeleton className="h-3 lg:h-4 w-1" />
          <Skeleton className="h-3 lg:h-4 w-16 lg:w-24" />
        </div>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Image Gallery Skeleton */}
          <div className="space-y-2 lg:space-y-3">
            <Skeleton className="aspect-square w-full rounded-xl" />
            <div className="flex space-x-1 lg:space-x-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="w-12 h-12 lg:w-16 lg:h-16 rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* Product Info Skeleton */}
          <div className="space-y-2 lg:space-y-4">
            <Skeleton className="h-3 lg:h-4 w-16 lg:w-20" />
            <Skeleton className="h-6 lg:h-8 w-3/4" />
            <div className="flex space-x-1 lg:space-x-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="w-3 h-3 lg:w-4 lg:h-4 rounded" />
              ))}
            </div>
            <Skeleton className="h-5 lg:h-6 w-1/3" />
            <Skeleton className="h-3 lg:h-4 w-full" />
            <Skeleton className="h-3 lg:h-4 w-2/3" />

            {/* Variant Options Skeleton */}
            <div className="space-y-2 lg:space-y-3 pt-2 lg:pt-4">
              <Skeleton className="h-3 lg:h-4 w-24 lg:w-32" />
              <div className="grid grid-cols-4 lg:grid-cols-3 gap-2 lg:gap-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </div>

            {/* Action Buttons Skeleton */}
            <div className="space-y-2 lg:space-y-3 pt-2 lg:pt-4">
              <Skeleton className="h-8 lg:h-10 w-full rounded-lg" />
              <Skeleton className="h-8 lg:h-10 w-full rounded-lg" />
            </div>

            {/* Features Skeleton */}
            <div className="grid grid-cols-3 gap-2 lg:gap-3 pt-3 lg:pt-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="text-center space-y-1 lg:space-y-2">
                  <Skeleton className="w-4 h-4 lg:w-5 lg:h-5 mx-auto" />
                  <Skeleton className="h-2 lg:h-3 w-12 lg:w-16 mx-auto" />
                  <Skeleton className="h-2 w-8 lg:w-12 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Tabs Skeleton */}
        <div className="space-y-3 lg:space-y-6 pt-4 lg:pt-8">
          {/* Tab Navigation Skeleton */}
          <div className="border-b border-slate-200">
            <div className="flex space-x-3 lg:space-x-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-3 lg:h-4 w-16 lg:w-20 mb-2 lg:mb-3"
                />
              ))}
            </div>
          </div>

          {/* Tab Content Skeleton */}
          <div className="space-y-2 lg:space-y-4">
            <Skeleton className="h-4 lg:h-6 w-32 lg:w-48" />
            <Skeleton className="h-3 lg:h-4 w-full" />
            <Skeleton className="h-3 lg:h-4 w-4/5" />
            <Skeleton className="h-3 lg:h-4 w-3/4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-4 pt-2 lg:pt-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-1 lg:space-y-2">
                  <Skeleton className="h-2 lg:h-3 w-20 lg:w-24" />
                  <Skeleton className="h-3 lg:h-4 w-28 lg:w-32" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
