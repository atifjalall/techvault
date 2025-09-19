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
  UsersIcon,
  CreditCardIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/buttonSidebar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
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
    price: number;
    sold: number;
    revenue: number;
  }>;
}

// Stat Card Component
interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor,
  bgColor,
}: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600">{title}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
              <div className="flex items-center space-x-1">
                {isPositive ? (
                  <EyeIcon className="h-3 w-3 text-green-500" />
                ) : (
                  <EyeIcon className="h-3 w-3 text-red-500" />
                )}
                <span
                  className={`text-xs font-medium ${
                    isPositive ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {change.toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500">vs last month</span>
              </div>
            </div>
            <div
              className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}
            >
              <Icon className={`h-5 w-5 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Recent Orders Component
function RecentOrders({
  orders,
  loading,
}: {
  orders: DashboardData["recentOrders"];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-16" />
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="text-right space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-gray-900">
            Recent Orders
          </CardTitle>
          <Link
            href="/vendor/orders"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            View all
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="text-center py-6">
              <ShoppingBagIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No recent orders</p>
            </div>
          ) : (
            orders.slice(0, 4).map((order) => (
              <motion.div
                key={order.id}
                whileHover={{ x: 2 }}
                className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-xs font-medium text-gray-900">
                      #{order.orderNumber}
                    </p>
                    <Badge
                      className={`text-xs px-2 py-0.5 ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-600">{order.customerName}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(order.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    €{order.total.toFixed(2)}
                  </p>
                  <ChevronRightIcon className="h-3 w-3 text-gray-400 ml-auto" />
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Top Products Component
function TopProducts({
  products,
  loading,
}: {
  products: DashboardData["topProducts"];
  loading: boolean;
}) {
  if (loading) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-28" />
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="p-3 bg-gray-50 rounded-lg">
              <Skeleton className="h-4 w-full mb-2" />
              <div className="flex justify-between">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900">
          Top Products
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {products.length === 0 ? (
            <div className="text-center py-6">
              <CubeIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No products yet</p>
            </div>
          ) : (
            products.slice(0, 5).map((product, index) => (
              <motion.div
                key={product.id}
                whileHover={{ x: 2 }}
                className="p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-900 flex-1 truncate">
                    #{index + 1} {product.name}
                  </p>
                  <p className="text-xs font-semibold text-gray-900">
                    €{product.price}
                  </p>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{product.sold} sold</span>
                  <span className="font-medium text-green-600">
                    €{product.revenue.toFixed(0)} revenue
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions Component
function QuickActions() {
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
      color: "text-green-600",
      bg: "bg-green-50 hover:bg-green-100",
    },
    {
      name: "Customers",
      href: "/vendor/customers",
      icon: UsersIcon,
      color: "text-purple-600",
      bg: "bg-purple-50 hover:bg-purple-100",
    },
    {
      name: "Wallet",
      href: "/vendor/wallet",
      icon: CreditCardIcon,
      color: "text-orange-600",
      bg: "bg-orange-50 hover:bg-orange-100",
    },
  ];

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-900">
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <motion.div
              key={action.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href={action.href}
                className={`flex flex-col items-center p-3 rounded-lg transition-colors cursor-pointer ${action.bg}`}
              >
                <action.icon className={`h-5 w-5 ${action.color} mb-1`} />
                <span className="text-xs font-medium text-gray-900">
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

// Skeleton Loading Components
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </CardContent>
        </Card>
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
            : "An unexpected error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <XCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            className="cursor-pointer"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Welcome back, {session?.user?.name?.split(" ")[0] || "Vendor"} •{" "}
            {formatTime(currentTime)}
          </p>
        </div>
        <Button asChild size="sm" className="cursor-pointer">
          <Link href="/vendor/products/add">
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Product
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <StatsSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            title="Total Revenue"
            value={`€${data?.stats?.totalRevenue?.toFixed(2) || "0.00"}`}
            change={data?.stats?.revenueChange || 0}
            icon={CurrencyEuroIcon}
            iconColor="text-green-600"
            bgColor="bg-green-50"
          />
          <StatCard
            title="Total Orders"
            value={data?.stats?.totalOrders?.toString() || "0"}
            change={data?.stats?.ordersChange || 0}
            icon={ShoppingBagIcon}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Total Products"
            value={data?.stats?.totalProducts?.toString() || "0"}
            change={data?.stats?.productsChange || 0}
            icon={CubeIcon}
            iconColor="text-purple-600"
            bgColor="bg-purple-50"
          />
          <StatCard
            title="Product Views"
            value={data?.stats?.productViews?.toString() || "0"}
            change={data?.stats?.viewsChange || 0}
            icon={EyeIcon}
            iconColor="text-orange-600"
            bgColor="bg-orange-50"
          />
        </motion.div>
      )}

      {/* Content Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Recent Orders - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentOrders orders={data?.recentOrders || []} loading={loading} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Top Products */}
          <TopProducts products={data?.topProducts || []} loading={loading} />

          {/* Quick Actions */}
          <QuickActions />
        </div>
      </motion.div>
    </div>
  );
}
