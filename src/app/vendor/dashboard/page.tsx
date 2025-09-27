"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import {
  EyeIcon,
  CurrencyEuroIcon,
  ShoppingBagIcon,
  CubeIcon,
  PlusIcon,
  ChevronRightIcon,
  ShoppingCartIcon,
  Squares2X2Icon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/Button1";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalVariants: number;
    productViews: number;
    revenueChange: number;
    ordersChange: number;
    productsChange: number;
    viewsChange: number;
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    sold: number;
    revenue: number;
  }>;
}

// Clean Mobile Stat Card
function MobileStatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  bgColor,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-full">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
        <div className="flex items-center space-x-1">
          {isPositive ? (
            <ArrowTrendingUpIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          ) : (
            <ArrowTrendingDownIcon className="w-3 h-3 text-red-500 flex-shrink-0" />
          )}
          <span
            className={`text-xs font-semibold ${
              isPositive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {change.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-gray-500 leading-tight">
          {title}
        </p>
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
      </div>
    </div>
  );
}

// Desktop Stat Card (unchanged)
function DesktopStatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  bgColor,
}: {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}) {
  const isPositive = change >= 0;

  return (
    <Card className="border-0 shadow-sm bg-white transition-all duration-200 h-full">
      <CardContent className="p-5">
        <div className="flex items-start justify-between h-full">
          <div className="space-y-2 flex-1">
            <p className="text-xs font-medium text-gray-600 leading-none">
              {title}
            </p>
            <p className="text-lg font-bold text-gray-900 leading-none">
              {value}
            </p>
            <div className="flex items-center space-x-1.5">
              {isPositive ? (
                <ArrowTrendingUpIcon className="w-3 h-3 text-emerald-500" />
              ) : (
                <ArrowTrendingDownIcon className="w-3 h-3 text-red-500" />
              )}
              <span
                className={`text-xs font-semibold ${
                  isPositive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {isPositive ? "+" : ""}
                {change.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </div>
          <div
            className={`w-11 h-11 ${bgColor} rounded-md flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}
          >
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Clean Mobile Recent Orders
function MobileRecentOrders({
  orders,
  loading,
}: {
  orders: DashboardData["recentOrders"];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-2 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getOrderStatusBadgeVariant = (status: string) => {
    if (!status) return "default";
    switch (status.toLowerCase()) {
      case "pending":
        return "pending";
      case "processing":
        return "processing";
      case "ready_to_ship":
        return "ready_to_ship";
      case "shipped":
        return "shipped";
      case "delivered":
        return "delivered";
      case "cancelled":
        return "cancelled";
      default:
        return "default";
    }
  };

  const formatOrderDate = (dateString: string) => {
    try {
      if (!dateString) return "Unknown date";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Recent Orders</h3>
          <Link
            href="/vendor/orders"
            className="text-xs text-blue-600 font-medium cursor-pointer"
          >
            View all
          </Link>
        </div>
      </div>
      <div className="p-4">
        {!orders || orders.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ShoppingBagIcon className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              No orders yet
            </p>
            <p className="text-xs text-gray-500">Orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order) => (
              <motion.div
                key={order.id}
                whileHover={{ backgroundColor: "#f8fafc" }}
                className="p-3 rounded-lg border border-gray-100 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-semibold text-gray-900">
                      #{order.orderNumber || "Unknown"}
                    </span>
                    <Badge
                      variant={getOrderStatusBadgeVariant(order.status)}
                      size="sm"
                      icon="auto"
                    >
                      {order.status || "Unknown"}
                    </Badge>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    €{(order.total || 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-1">
                  {order.customerName || "Unknown Customer"}
                </p>
                <p className="text-xs text-gray-400">
                  {formatOrderDate(order.createdAt)}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Desktop Recent Orders (unchanged from original)
function DesktopRecentOrders({
  orders,
  loading,
}: {
  orders: DashboardData["recentOrders"];
  loading: boolean;
}) {
  const getOrderStatusBadgeVariant = (status: string) => {
    if (!status) return "default";
    switch (status.toLowerCase()) {
      case "pending":
        return "pending";
      case "processing":
        return "processing";
      case "ready_to_ship":
        return "ready_to_ship";
      case "shipped":
        return "shipped";
      case "delivered":
        return "delivered";
      case "cancelled":
        return "cancelled";
      default:
        return "default";
    }
  };

  const formatOrderDate = (dateString: string) => {
    try {
      if (!dateString) return "Unknown date";
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col">
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-gray-50/50 rounded-md"
              >
                <div className="space-y-1">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-2 w-32" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-2 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Recent Orders
          </CardTitle>
          <Link
            href="/vendor/orders"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer hover:underline transition-colors"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          {!orders || orders.length === 0 ? (
            <div className="text-center py-6 flex-1 flex flex-col justify-center">
              <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center mx-auto mb-2">
                <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-gray-900 mb-1">
                No recent orders
              </p>
              <p className="text-xs text-gray-500">
                Orders will appear here when customers make purchases
              </p>
            </div>
          ) : (
            orders.slice(0, 4).map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 2 }}
                className="flex items-center justify-between p-3 bg-gray-50/50 hover:bg-blue-50/30 rounded-md transition-all cursor-pointer group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-xs font-semibold text-gray-900">
                      #{order.orderNumber || "Unknown"}
                    </p>
                    <Badge
                      variant={getOrderStatusBadgeVariant(order.status)}
                      size="sm"
                      icon="auto"
                    >
                      {order.status || "Unknown"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-700 font-medium mb-0.5 truncate">
                    {order.customerName || "Unknown Customer"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatOrderDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right flex items-center space-x-2 flex-shrink-0">
                  <p className="text-sm font-bold text-gray-900">
                    €{(order.total || 0).toFixed(2)}
                  </p>
                  <ChevronRightIcon className="h-3 w-3 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Clean Mobile Quick Actions
function MobileQuickActions() {
  const actions = [
    {
      name: "Add Product",
      href: "/vendor/products/add",
      icon: PlusIcon,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Orders",
      href: "/vendor/orders",
      icon: ShoppingCartIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      name: "Products",
      href: "/vendor/products",
      icon: Squares2X2Icon,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      name: "Insights",
      href: "/vendor/insights",
      icon: EyeIcon,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action, index) => (
        <motion.div
          key={action.name}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileTap={{ scale: 0.95 }}
          className="h-full"
        >
          <Link
            href={action.href}
            className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow h-full min-h-[80px]"
          >
            <div
              className={`w-10 h-10 ${action.bg} rounded-lg flex items-center justify-center mb-2 flex-shrink-0`}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
            </div>
            <span className="text-xs font-semibold text-gray-900 text-center leading-tight">
              {action.name}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

// Desktop Quick Actions (unchanged)
function DesktopQuickActions() {
  const actions = [
    {
      name: "Add Product",
      href: "/vendor/products/add",
      icon: PlusIcon,
      color: "text-blue-600",
      bg: "bg-blue-50 hover:bg-blue-100",
    },
    {
      name: "View Orders",
      href: "/vendor/orders",
      icon: ShoppingCartIcon,
      color: "text-emerald-600",
      bg: "bg-emerald-50 hover:bg-emerald-100",
    },
    {
      name: "Products",
      href: "/vendor/products",
      icon: Squares2X2Icon,
      color: "text-purple-600",
      bg: "bg-purple-50 hover:bg-purple-100",
    },
    {
      name: "Insights",
      href: "/vendor/insights",
      icon: EyeIcon,
      color: "text-orange-600",
      bg: "bg-orange-50 hover:bg-orange-100",
    },
  ];

  return (
    <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        <div className="grid grid-cols-2 gap-2 h-full">
          {actions.map((action, index) => (
            <motion.div
              key={action.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{
                scale: 1.02,
                boxShadow: "0 2px 8px rgba(59, 130, 246, 0.08)",
              }}
              whileTap={{ scale: 0.98 }}
              className="h-full"
            >
              <Link
                href={action.href}
                className={`flex flex-col items-center justify-center h-full p-3 rounded-md transition-all cursor-pointer ${action.bg} group`}
              >
                <action.icon
                  className={`h-4 w-4 ${action.color} mb-1 group-hover:scale-110 transition-transform`}
                />
                <span className="text-xs font-semibold text-gray-900 text-center">
                  {action.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Desktop Top Products (unchanged from original)
function DesktopTopProducts({
  products,
  loading,
}: {
  products: DashboardData["topProducts"];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
        <CardHeader className="pb-3 flex-shrink-0">
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col">
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center p-2 bg-gray-50/50 rounded-md"
              >
                <Skeleton className="w-8 h-8 rounded-md mr-2" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-3 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-2 w-12" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="text-sm font-semibold text-gray-900">
          Top Selling Products
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          {!products || products.length === 0 ? (
            <div className="text-center py-6 flex-1 flex flex-col justify-center">
              <div className="w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center mx-auto mb-2">
                <CubeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xs font-medium text-gray-900 mb-1">
                No products sold yet
              </p>
              <p className="text-xs text-gray-500">
                Your best-selling products will appear here
              </p>
            </div>
          ) : (
            products.slice(0, 5).map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 2 }}
                className="flex items-center p-2 bg-gray-50/50 hover:bg-blue-50/30 rounded-md transition-all cursor-pointer group"
              >
                <div className="flex-shrink-0 mr-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CubeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <Badge variant="featured" size="sm" icon={false}>
                        #{index + 1}
                      </Badge>
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {product.name || "Unknown Product"}
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">
                      {product.sold || 0} sold
                    </span>
                    <span className="font-semibold text-emerald-600">
                      €{(product.revenue || 0).toFixed(0)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatsSkeleton() {
  return (
    <div className="hidden lg:grid lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white h-full">
          <CardContent className="p-5">
            <div className="flex items-start justify-between h-full">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-11 w-11 rounded-md" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MobileStatsSkeleton() {
  return (
    <div className="lg:hidden grid grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 h-[120px]"
        >
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="space-y-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </div>
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
        setError(null);

        const response = await fetch("/api/vendor/dashboard");

        if (!response.ok) {
          throw new Error(
            `HTTP ${response.status}: Failed to fetch dashboard data`
          );
        }

        const result = await response.json();

        if (result.success) {
          setData({
            stats: {
              totalRevenue: Number(result.data?.stats?.totalRevenue) || 0,
              totalOrders: Number(result.data?.stats?.totalOrders) || 0,
              totalProducts: Number(result.data?.stats?.totalProducts) || 0,
              totalVariants: Number(result.data?.stats?.totalVariants) || 0,
              productViews: Number(result.data?.stats?.productViews) || 0,
              revenueChange: Number(result.data?.stats?.revenueChange) || 0,
              ordersChange: Number(result.data?.stats?.ordersChange) || 0,
              productsChange: Number(result.data?.stats?.productsChange) || 0,
              viewsChange: Number(result.data?.stats?.viewsChange) || 0,
            },
            recentOrders: Array.isArray(result.data?.recentOrders)
              ? result.data.recentOrders
              : [],
            topProducts: Array.isArray(result.data?.topProducts)
              ? result.data.topProducts
              : [],
          });
        } else {
          throw new Error(result.error || "Failed to load dashboard data");
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An unexpected error occurred"
        );
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadDashboardData();
    }
  }, [session]);

  const formatTime = (date: Date) => {
    try {
      return date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "00:00";
    }
  };

  if (error) {
    return (
      <div className="p-4 lg:p-6">
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <XCircleIcon className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-sm font-medium text-gray-900 mb-2">
            Something went wrong
          </p>
          <p className="text-xs text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            className="cursor-pointer bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* MOBILE LAYOUT */}
      <div className="lg:hidden p-4 space-y-4 bg-gray-50 min-h-screen">
        {/* Mobile Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-lg font-bold text-gray-900">Dashboard</h1>
            <p className="text-xs text-gray-600">
              Welcome back, {session?.user?.name?.split(" ")[0] || "Vendor"}
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button asChild size="sm" variant="active">
              <Link href="/vendor/products/add">
                <PlusIcon className="h-4 w-4 mr-1" />
                Add
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Mobile Stats */}
        {loading ? (
          <MobileStatsSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 gap-3"
          >
            <MobileStatCard
              title="Total Revenue"
              value={`€${data?.stats?.totalRevenue?.toFixed(2) || "0.00"}`}
              change={data?.stats?.revenueChange || 0}
              icon={CurrencyEuroIcon}
              iconColor="text-emerald-600"
              bgColor="bg-emerald-50"
            />
            <MobileStatCard
              title="Total Orders"
              value={data?.stats?.totalOrders?.toString() || "0"}
              change={data?.stats?.ordersChange || 0}
              icon={ShoppingBagIcon}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />
            <MobileStatCard
              title="Products"
              value={`${data?.stats?.totalProducts?.toString() || "0"} (${data?.stats?.totalVariants?.toString() || "0"})`}
              change={data?.stats?.productsChange || 0}
              icon={CubeIcon}
              iconColor="text-purple-600"
              bgColor="bg-purple-50"
            />
            <MobileStatCard
              title="Product Views"
              value={data?.stats?.productViews?.toString() || "0"}
              change={data?.stats?.viewsChange || 0}
              icon={EyeIcon}
              iconColor="text-orange-600"
              bgColor="bg-orange-50"
            />
          </motion.div>
        )}

        {/* Mobile Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <MobileQuickActions />
        </motion.div>

        {/* Mobile Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <MobileRecentOrders
            orders={data?.recentOrders || []}
            loading={loading}
          />
        </motion.div>

        {/* Mobile Empty State for New Vendors */}
        <AnimatePresence>
          {!loading && data && data.stats.totalProducts === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-100"
            >
              <div className="py-12 text-center px-4">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CubeIcon className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  Start Building Your Store
                </h3>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Create your first product to start selling on TechVault
                  marketplace.
                </p>
                <div className="space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      asChild
                      className="cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-sm w-full"
                    >
                      <Link href="/vendor/products/add">
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Your First Product
                      </Link>
                    </Button>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      asChild
                      className="cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50 w-full"
                    >
                      <Link href="/vendor/help/getting-started">
                        Getting Started Guide
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:block p-6 space-y-6 bg-gray-50/30 min-h-screen">
        {/* Desktop Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-sm text-gray-600">
              Welcome back, {session?.user?.name?.split(" ")[0] || "Vendor"} •{" "}
              {formatTime(currentTime)}
            </p>
          </div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button asChild size="sm" variant="active">
              <Link href="/vendor/products/add">
                <PlusIcon className="h-4 w-4 mr-1.5" />
                Add Product
              </Link>
            </Button>
          </motion.div>
        </motion.div>

        {/* Desktop Stats */}
        {loading ? (
          <StatsSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-4 gap-4"
          >
            <DesktopStatCard
              title="Total Revenue"
              value={`€${data?.stats?.totalRevenue?.toFixed(2) || "0.00"}`}
              change={data?.stats?.revenueChange || 0}
              icon={CurrencyEuroIcon}
              iconColor="text-emerald-600"
              bgColor="bg-emerald-50"
            />
            <DesktopStatCard
              title="Total Orders"
              value={data?.stats?.totalOrders?.toString() || "0"}
              change={data?.stats?.ordersChange || 0}
              icon={ShoppingBagIcon}
              iconColor="text-blue-600"
              bgColor="bg-blue-50"
            />
            <DesktopStatCard
              title="Products"
              value={`${data?.stats?.totalProducts?.toString() || "0"} (${data?.stats?.totalVariants?.toString() || "0"})`}
              change={data?.stats?.productsChange || 0}
              icon={CubeIcon}
              iconColor="text-purple-600"
              bgColor="bg-purple-50"
            />
            <DesktopStatCard
              title="Product Views"
              value={data?.stats?.productViews?.toString() || "0"}
              change={data?.stats?.viewsChange || 0}
              icon={EyeIcon}
              iconColor="text-orange-600"
              bgColor="bg-orange-50"
            />
          </motion.div>
        )}

        {/* Desktop Content Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 h-80"
        >
          <div className="h-full">
            <DesktopRecentOrders
              orders={data?.recentOrders || []}
              loading={loading}
            />
          </div>

          <div className="h-full">
            <DesktopTopProducts
              products={data?.topProducts || []}
              loading={loading}
            />
          </div>

          <div className="h-full">
            <DesktopQuickActions />
          </div>
        </motion.div>

        {/* Desktop Empty State */}
        <AnimatePresence>
          {!loading && data && data.stats.totalProducts === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
                <CardContent className="py-16 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <CubeIcon className="h-10 w-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Start Building Your Store
                  </h3>
                  <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto leading-relaxed">
                    You haven&apos;t added any products yet. Create your first
                    product with variants to start selling on TechVault
                    marketplace.
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        asChild
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 shadow-sm"
                      >
                        <Link href="/vendor/products/add">
                          <PlusIcon className="h-4 w-4 mr-2" />
                          Add Your First Product
                        </Link>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        variant="outline"
                        asChild
                        className="cursor-pointer border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Link href="/vendor/help/getting-started">
                          Getting Started Guide
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
