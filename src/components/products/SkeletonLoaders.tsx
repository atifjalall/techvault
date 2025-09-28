import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FiltersSkeleton() {
  return (
    <div className="space-y-4">
      <Card className="shadow-sm bg-white border border-slate-200/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="pt-0">
          <Skeleton className="h-9 w-full" />
        </CardContent>
      </Card>

      <Card className="shadow-sm bg-white border border-slate-200/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div>
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-9 w-full" />
          </div>
          <div>
            <Skeleton className="h-3 w-12 mb-2" />
            <Skeleton className="h-9 w-full" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm bg-white border border-slate-200/50">
        <CardHeader className="pb-3">
          <Skeleton className="h-4 w-20" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: 9 }).map((_, i) => (
        <Card
          key={i}
          className="overflow-hidden group backdrop-blur-xl bg-white/70 border border-white/50"
        >
          <div className="aspect-square relative">
            <Skeleton className="w-full h-full" />
          </div>
          <CardContent className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-8" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-6 w-6 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
