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
} from "@heroicons/react/24/outline";

// Mock data - replace with real API calls
const mockStats = {
  totalRevenue: 12450.8,
  totalOrders: 156,
  totalProducts: 24,
  totalViews: 3420,
  revenueChange: 12.5,
  ordersChange: -2.3,
  productsChange: 8.7,
  viewsChange: 18.2,
};

const mockRecentOrders = [
  {
    id: "ORD-001",
    customer: "Hans Mueller",
    product: "Wireless Gaming Headset",
    amount: 189.99,
    status: "delivered",
    date: "2025-01-15",
  },
  {
    id: "ORD-002",
    customer: "Anna Schmidt",
    product: 'UltraSlim Laptop 15"',
    amount: 1299.99,
    status: "shipped",
    date: "2025-01-14",
  },
  {
    id: "ORD-003",
    customer: "Thomas Weber",
    product: "Smart Fitness Watch",
    amount: 299.99,
    status: "processing",
    date: "2025-01-14",
  },
  {
    id: "ORD-004",
    customer: "Sarah Klein",
    product: "Bluetooth Speaker",
    amount: 89.99,
    status: "pending",
    date: "2025-01-13",
  },
];

const mockTopProducts = [
  {
    id: 1,
    name: "Wireless Gaming Headset Pro",
    sales: 45,
    revenue: 8549.55,
    views: 890,
  },
  {
    id: 2,
    name: 'UltraSlim Laptop 15"',
    sales: 23,
    revenue: 29899.77,
    views: 456,
  },
  {
    id: 3,
    name: "Smart Fitness Watch",
    sales: 67,
    revenue: 20099.33,
    views: 1234,
  },
];

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  icon: React.ElementType;
  delay?: number;
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  delay = 0,
}: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: "easeOut" }}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-sm transition-shadow duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="p-3 bg-gray-50 rounded-lg">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
          <div
            className={`flex items-center mt-2 text-sm font-medium ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            ) : (
              <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
            )}
            {Math.abs(change)}%
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case "delivered":
      return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
    case "shipped":
      return <TruckIcon className="h-4 w-4 text-blue-500" />;
    case "processing":
      return <ClockIcon className="h-4 w-4 text-yellow-500" />;
    case "pending":
      return <ExclamationTriangleIcon className="h-4 w-4 text-gray-500" />;
    default:
      return <ClockIcon className="h-4 w-4 text-gray-500" />;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-800";
    case "shipped":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-yellow-100 text-yellow-800";
    case "pending":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export default function VendorDashboard() {
  const { data: session } = useSession();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-600 mt-1">
              Welcome back, {session?.user?.name} • {formatTime(currentTime)}
            </p>
          </div>
          <Link
            href="/vendor/products/add"
            className="inline-flex items-center px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Product
          </Link>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(mockStats.totalRevenue)}
          change={mockStats.revenueChange}
          icon={CurrencyEuroIcon}
          delay={0}
        />
        <StatCard
          title="Total Orders"
          value={mockStats.totalOrders.toString()}
          change={mockStats.ordersChange}
          icon={ShoppingBagIcon}
          delay={0.05}
        />
        <StatCard
          title="Total Products"
          value={mockStats.totalProducts.toString()}
          change={mockStats.productsChange}
          icon={ChartBarIcon}
          delay={0.1}
        />
        <StatCard
          title="Product Views"
          value={mockStats.totalViews.toString()}
          change={mockStats.viewsChange}
          icon={EyeIcon}
          delay={0.15}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:col-span-2 bg-white rounded-lg border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
              <Link
                href="/vendor/orders"
                className="text-sm font-medium text-black hover:text-gray-700 transition-colors"
              >
                View all →
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {mockRecentOrders.map((order) => (
              <div
                key={order.id}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-sm font-medium text-gray-900 mr-3">
                        {order.id}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)}
                        <span className="ml-1 capitalize">{order.status}</span>
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {order.customer}
                    </p>
                    <p className="text-sm text-gray-500">{order.product}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.amount)}
                    </p>
                    <p className="text-xs text-gray-500">{order.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Top Products */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
          className="bg-white rounded-lg border border-gray-200"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Top Products
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockTopProducts.map((product) => (
                <div
                  key={product.id}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-gray-500">Sales</p>
                      <p className="font-semibold text-gray-900">
                        {product.sales}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Views</p>
                      <p className="font-semibold text-gray-900">
                        {product.views}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mt-8 bg-white rounded-lg border border-gray-200 p-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Add Product", href: "/vendor/products/add", icon: PlusIcon },
            {
              name: "View Orders",
              href: "/vendor/orders",
              icon: ShoppingBagIcon,
            },
            { name: "Wallet", href: "/vendor/wallet", icon: CurrencyEuroIcon },
            { name: "Settings", href: "/vendor/settings", icon: ChartBarIcon },
          ].map((action) => (
            <Link
              key={action.name}
              href={action.href}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors hover:border-gray-300"
            >
              <action.icon className="h-6 w-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">
                {action.name}
              </span>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
