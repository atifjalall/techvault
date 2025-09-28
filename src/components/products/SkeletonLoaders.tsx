import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function BreadcrumbSkeleton() {
  return (
    <div className="pt-8 px-4 pb-4">
      <div className="container mx-auto px-4">
        {/* Match the final animated state of motion.div */}
        <div className="opacity-100 translate-x-0">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Skeleton className="h-4 w-12" />
              </li>
              <li>
                <Skeleton className="h-4 w-1" />
              </li>
              <li>
                <Skeleton className="h-4 w-20" />
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </div>
  );
}

export function TopFilterSkeleton() {
  return (
    <Card className="border-0 shadow-sm backdrop-blur-xl bg-white/70 border border-white/50">
      <CardContent className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            <Skeleton className="h-[14px] w-[120px]" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-[140px] rounded-md" />
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FiltersSkeleton() {
  return (
    <div className="space-y-4">
      {/* Search Card */}
      <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-[14px] w-24" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="relative">
            <Skeleton className="h-9 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Categories Card */}
      <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-[14px] w-20" />
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div>
            <Skeleton className="h-3 w-20 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div>
            <Skeleton className="h-3 w-10 mb-2" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </CardContent>
      </Card>

      {/* Price Range Card */}
      <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-[14px] w-20" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <Skeleton className="h-[14px] w-4" />
              <Skeleton className="h-[14px] w-12" />
            </div>
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-full rounded-md" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options Card */}
      <Card className="border-0 shadow-sm bg-white border border-slate-200/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-[14px] w-16" />
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <label className="flex items-center cursor-pointer">
            <Skeleton className="h-3 w-3 rounded" />
            <Skeleton className="h-3 w-20 ml-2" />
          </label>
          <label className="flex items-center cursor-pointer">
            <Skeleton className="h-3 w-3 rounded" />
            <Skeleton className="h-3 w-24 ml-2" />
          </label>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="group relative bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden shadow-md border border-gray-100 transition-all duration-300 min-h-[320px]"
        >
          {/* Product Image */}
          <div className="relative aspect-square bg-gray-50 overflow-hidden">
            {/* Top left badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-8 rounded-full" />
            </div>

            {/* Top right badges */}
            <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5">
              <Skeleton className="h-4 w-10 rounded-full" />
              <Skeleton className="h-7 w-7 rounded-full" />
            </div>

            {/* Main image */}
            <Skeleton className="w-full h-full" />

            {/* Color variants at bottom */}
            <div className="absolute bottom-3 left-3 flex gap-1">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 min-h-[120px]">
            <div className="space-y-1.5">
              {/* Brand & Name with Featured badge */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1">
                  {/* Brand */}
                  <Skeleton className="h-[10px] w-12 mb-1 rounded-sm" />
                  {/* Product name */}
                  <Skeleton className="h-[14px] w-3/4 mb-0.5 rounded-sm" />
                </div>
                {/* Featured badge */}
                <Skeleton className="h-4 w-16 rounded-full ml-2 flex-shrink-0" />
              </div>

              {/* Variants */}
              <Skeleton className="h-[10px] w-20 rounded-sm" />

              {/* Rating */}
              <div className="flex items-center space-x-1 py-0.5">
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, starIndex) => (
                    <Skeleton
                      key={starIndex}
                      className="h-2.5 w-2.5 rounded-full"
                    />
                  ))}
                </div>
                <Skeleton className="h-[10px] w-8 rounded-sm" />
              </div>

              {/* Pricing */}
              <div className="flex items-center space-x-1.5 pt-0.5">
                <Skeleton className="h-[18px] w-16 rounded-sm" />
                <Skeleton className="h-[12px] w-12 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
