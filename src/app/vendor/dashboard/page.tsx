"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingBagIcon,
  CurrencyEuroIcon,
  ChartBarIcon,
  EyeIcon,
  PlusIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TruckIcon,
  UsersIcon,
  Cog6ToothIcon,
  CreditCardIcon,
} from "@heroicons/react/24/outline";

// UI Components
import { Button } from "@/components/ui/buttonSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import { formatPrice } from "@/lib/utils";

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalViews: number;
  revenueChange: number;
  ordersChange: number;
  productsChange: number;
  viewsChange: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  product: string;
  amount: number;
  status: "delivered" | "shipped" | "processing" | "pending";
  date: string;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  views: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  topProducts: TopProduct[];
}

// Clean Stat Card Component
function StatCard({
  title,
  value,
  change,
  icon: Icon,
  delay = 0,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  delay?: number;
}) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-300">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                {value}
              </p>
              <div
                className={`flex items-center text-sm font-medium ${
                  isPositive ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                {isPositive ? (
                  <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                )}
                {isPositive ? "+" : ""}
                {change.toFixed(1)}%
                <span className="text-slate-400 ml-1 text-xs">
                  vs last month
                </span>
              </div>
            </div>
            <div className="p-3 bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600 rounded-xl shadow-sm">
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Status components
function getStatusIcon(status: string) {
  switch (status) {
    case "delivered":
      return <CheckCircleIcon className="w-4 h-4 text-emerald-500" />;
    case "shipped":
      return <TruckIcon className="w-4 h-4 text-blue-500" />;
    case "processing":
      return <ClockIcon className="w-4 h-4 text-amber-500" />;
    case "pending":
      return <ExclamationTriangleIcon className="w-4 h-4 text-slate-500" />;
    default:
      return <ClockIcon className="w-4 h-4 text-slate-500" />;
  }
}

function getStatusVariant(status: string) {
  switch (status) {
    case "delivered":
      return "default";
    case "shipped":
      return "secondary";
    case "processing":
      return "outline";
    case "pending":
      return "secondary";
    default:
      return "secondary";
  }
}

// Loading Skeletons
function StatsSkeletons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-11 w-11 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function OrdersTableSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
              <div className="space-y-2 text-right">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ProductsSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <Skeleton className="h-6 w-28" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-4 bg-slate-50/50 rounded-lg">
              <Skeleton className="h-4 w-full mb-3" />
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-10" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function VendorDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/vendor/dashboard");

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || "Failed to load dashboard data");
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadDashboardData();
    }
  }, [session]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          <StatsSkeletons />

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-3">
              <OrdersTableSkeleton />
            </div>
            <div>
              <ProductsSkeleton />
            </div>
          </div>

          {/* Quick Actions Skeleton */}
          <Card className="border-0 shadow-sm bg-white/80">
            <CardHeader className="pb-3">
              <Skeleton className="h-6 w-28" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center p-4 border border-slate-200 rounded-lg"
                  >
                    <Skeleton className="h-6 w-6 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
        <div className="text-center py-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ExclamationTriangleIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Unable to load dashboard
            </h3>
            <p className="text-slate-500 mb-6">
              {error || "Failed to load dashboard data"}
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Try Again
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Welcome back, {session?.user?.name} • {formatTime(currentTime)}
            </p>
          </div>
          <Button
            asChild
            className="bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Link href="/vendor/products/add">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Revenue"
            value={formatPrice(data.stats.totalRevenue)}
            change={data.stats.revenueChange}
            icon={CurrencyEuroIcon}
            delay={0}
          />
          <StatCard
            title="Total Orders"
            value={data.stats.totalOrders.toString()}
            change={data.stats.ordersChange}
            icon={ShoppingBagIcon}
            delay={0.05}
          />
          <StatCard
            title="Total Products"
            value={data.stats.totalProducts.toString()}
            change={data.stats.productsChange}
            icon={ChartBarIcon}
            delay={0.1}
          />
          <StatCard
            title="Product Views"
            value={data.stats.totalViews.toString()}
            change={data.stats.viewsChange}
            icon={EyeIcon}
            delay={0.15}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="xl:col-span-3"
          >
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Recent Orders
                  </CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href="/vendor/orders"
                      className="text-slate-600 hover:text-slate-900 text-sm"
                    >
                      View all →
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {data.recentOrders.length > 0 ? (
                  <div className="space-y-3">
                    {data.recentOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center mb-2 space-x-3">
                            <span className="text-sm font-medium text-slate-900">
                              {order.id}
                            </span>
                            <Badge
                              variant={getStatusVariant(order.status)}
                              className="text-xs"
                            >
                              {getStatusIcon(order.status)}
                              <span className="ml-1 capitalize">
                                {order.status}
                              </span>
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 mb-1">
                            {order.customer}
                          </p>
                          <p className="text-sm text-slate-500 truncate">
                            {order.product}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-900">
                            {formatPrice(order.amount)}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(order.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingBagIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No recent orders</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Top Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {data.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {data.topProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-sm font-medium text-slate-900 line-clamp-2 flex-1">
                            {product.name}
                          </h3>
                          <Badge variant="outline" className="text-xs ml-2">
                            #{index + 1}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div>
                            <p className="text-slate-500 mb-1">Sales</p>
                            <p className="font-semibold text-slate-900">
                              {product.sales}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 mb-1">Revenue</p>
                            <p className="font-semibold text-slate-900">
                              {formatPrice(product.revenue)}
                            </p>
                          </div>
                          <div>
                            <p className="text-slate-500 mb-1">Views</p>
                            <p className="font-semibold text-slate-900">
                              {product.views}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChartBarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">No products yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  {
                    name: "Add Product",
                    href: "/vendor/products/add",
                    icon: PlusIcon,
                  },
                  {
                    name: "View Orders",
                    href: "/vendor/orders",
                    icon: ShoppingBagIcon,
                  },
                  {
                    name: "Customers",
                    href: "/vendor/customers",
                    icon: UsersIcon,
                  },
                  {
                    name: "Wallet",
                    href: "/vendor/wallet",
                    icon: CreditCardIcon,
                  },
                ].map((action) => (
                  <Button
                    key={action.name}
                    variant="outline"
                    asChild
                    className="h-auto flex flex-col items-center p-4 bg-slate-50/50 border-slate-200 hover:bg-slate-100/50 hover:border-slate-300 transition-colors"
                  >
                    <Link href={action.href}>
                      <action.icon className="w-5 h-5 text-slate-600 mb-2" />
                      <span className="text-sm font-medium text-slate-900">
                        {action.name}
                      </span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
