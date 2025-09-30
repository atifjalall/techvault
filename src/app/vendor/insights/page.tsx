/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  CurrencyEuroIcon,
  ShoppingBagIcon,
  UsersIcon,
  EyeIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  InformationCircleIcon,
  BanknotesIcon,
  CalendarDaysIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import Image from "next/image";
import { Button } from "@/components/ui/buttonSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";

interface InsightsData {
  overview: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    avgOrderValue: number;
    avgOrderGrowth: number;
    conversionRate: number;
    conversionGrowth: number;
    totalCustomers: number;
    customerGrowth: number;
    totalProducts: number;
    activeProducts: number;
  };
  timeSeriesData: Array<{
    date: string;
    revenue: number;
    orders: number;
    visitors: number;
    conversion: number;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    image: string;
    revenue: number;
    orders: number;
    growth: number;
    stock: number;
  }>;
  customerSegments: Array<{
    segment: string;
    count: number;
    revenue: number;
    percentage: number;
    color: string;
  }>;
  geographicData: Array<{
    country: string;
    orders: number;
    revenue: number;
    percentage: number;
  }>;
  deviceData: Array<{
    device: string;
    visitors: number;
    orders: number;
    conversion: number;
    color: string;
  }>;
  performanceMetrics: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: number;
    returnCustomerRate: number;
    customerLifetimeValue: number;
  };
  recommendations: Array<{
    type: "opportunity" | "warning" | "success";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
    actionable: boolean;
  }>;
}

// Mobile-responsive Stats Card Component with ultra-compact design
function StatCard({
  title,
  value,
  growth,
  icon: Icon,
  iconColor,
  bgColor,
  format = "number",
}: {
  title: string;
  value: number;
  growth?: number;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  format?: "number" | "currency" | "percentage";
}) {
  const formatValue = (val: number) => {
    switch (format) {
      case "currency":
        return formatPrice(val);
      case "percentage":
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString();
    }
  };

  const isPositive = growth !== undefined && growth >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 sm:space-y-1 flex-1 min-w-0">
              <p className="text-[10px] sm:text-xs font-medium text-gray-600 truncate">
                {title}
              </p>
              <p className="text-base sm:text-xl font-bold text-gray-900 truncate">
                {formatValue(value)}
              </p>
              {growth !== undefined && (
                <div className="flex items-center space-x-0.5 sm:space-x-1">
                  {isPositive ? (
                    <ArrowTrendingUpIcon className="h-2 w-2 sm:h-3 sm:w-3 text-green-500 flex-shrink-0" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-2 w-2 sm:h-3 sm:w-3 text-red-500 flex-shrink-0" />
                  )}
                  <span
                    className={`text-[9px] sm:text-xs font-medium ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {growth.toFixed(1)}%
                  </span>
                  <span className="text-[8px] sm:text-xs text-gray-500 hidden sm:inline">
                    vs last month
                  </span>
                </div>
              )}
            </div>
            <div
              className={`w-7 h-7 sm:w-10 sm:h-10 ${bgColor} rounded-lg flex items-center justify-center flex-shrink-0 ml-1 sm:ml-0`}
            >
              <Icon className={`h-3 w-3 sm:h-5 sm:w-5 ${iconColor}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Professional Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border-0 shadow-lg rounded-lg p-3 border border-gray-200">
        <p className="text-xs font-medium text-gray-900 mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}:{" "}
            {entry.name === "Revenue" || entry.name === "revenue"
              ? formatPrice(entry.value)
              : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Professional Recommendation Card
function RecommendationCard({
  recommendation,
}: {
  recommendation: InsightsData["recommendations"][0];
}) {
  const getIcon = () => {
    switch (recommendation.type) {
      case "opportunity":
        return LightBulbIcon;
      case "warning":
        return ExclamationTriangleIcon;
      case "success":
        return CheckCircleIcon;
      default:
        return InformationCircleIcon;
    }
  };

  const getTypeColor = () => {
    switch (recommendation.type) {
      case "opportunity":
        return "text-blue-600";
      case "warning":
        return "text-orange-600";
      case "success":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  const getImpactColor = () => {
    switch (recommendation.impact) {
      case "high":
        return "bg-red-100 text-red-600 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-600 border-green-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const Icon = getIcon();

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-3">
        <div className="flex items-start space-x-2">
          <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${getTypeColor()}`} />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium text-gray-900">
                {recommendation.title}
              </h4>
              <Badge
                className={`text-xs px-1.5 py-0.5 border ${getImpactColor()}`}
              >
                {recommendation.impact}
              </Badge>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-2">
              {recommendation.description}
            </p>
            {recommendation.actionable && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2 cursor-pointer hover:bg-gray-100"
              >
                Take Action →
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Mobile-responsive Loading Skeletons
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white">
          <CardContent className="p-2 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 sm:space-y-2 flex-1">
                <Skeleton className="h-2 sm:h-3 w-14 sm:w-20" />
                <Skeleton className="h-4 sm:h-6 w-10 sm:w-16" />
                <Skeleton className="h-2 sm:h-3 w-16 sm:w-32" />
              </div>
              <Skeleton className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 sm:h-4 w-20 sm:w-28" />
          <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-[140px] sm:h-[220px] w-full" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-2 sm:pb-3">
        <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-1.5 sm:space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-1.5 sm:space-x-2 flex-1">
                <Skeleton className="w-3 h-3 sm:w-4 sm:h-4" />
                <Skeleton className="w-5 h-5 sm:w-6 sm:h-6 rounded-md" />
                <div className="space-y-0.5 sm:space-y-1 flex-1">
                  <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-32" />
                  <Skeleton className="h-2 sm:h-3 w-14 sm:w-20" />
                </div>
              </div>
              <div className="text-right space-y-0.5 sm:space-y-1">
                <Skeleton className="h-2.5 sm:h-3 w-12 sm:w-16" />
                <Skeleton className="h-2 sm:h-3 w-8 sm:w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function VendorInsightsDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // Load insights data from API - fully dynamic
  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/vendor/insights?range=${timeRange}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch insights: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || "Failed to load insights data");
        }
      } catch (error) {
        console.error("Error loading insights:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load insights data";
        setError(errorMessage);
        toast.error("Failed to load insights data");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      loadInsights();
    }
  }, [timeRange, session]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Insights</h1>
              <p className="text-sm text-gray-600">
                Analytics and performance metrics for your store
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-7 w-16" />
            </div>
          </div>

          <StatsSkeleton />

          {/* Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2">
              <ChartSkeleton />
            </div>
            <div>
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <Skeleton className="h-[120px] w-full rounded-full mx-auto" />
                    <div className="space-y-1">
                      {Array.from({ length: 2 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <Skeleton className="w-2 h-2 rounded-full" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <Skeleton className="h-3 w-8" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Products and Performance */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
            <div className="xl:col-span-3">
              <TableSkeleton />
            </div>
            <div>
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-3">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <Skeleton className="w-3 h-3" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-3 w-12" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="p-6">
          <div className="text-center py-20">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to load insights
            </h3>
            <p className="text-gray-600 text-sm mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              className="cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="p-2 sm:p-6 space-y-3 sm:space-y-6">
        {/* Mobile-optimized Header */}
        <div className="flex items-start sm:items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-base sm:text-xl font-bold text-gray-900">
              Insights
            </h1>
            <p className="text-[10px] sm:text-sm text-gray-600 truncate">
              Analytics and performance metrics for your store
            </p>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-16 sm:w-24 h-6 sm:h-7 bg-white border-gray-200 text-[10px] sm:text-xs cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d" className="text-[10px] sm:text-xs">
                  7 days
                </SelectItem>
                <SelectItem value="30d" className="text-[10px] sm:text-xs">
                  30 days
                </SelectItem>
                <SelectItem value="90d" className="text-[10px] sm:text-xs">
                  3 months
                </SelectItem>
                <SelectItem value="1y" className="text-[10px] sm:text-xs">
                  1 year
                </SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="h-6 sm:h-7 px-2 sm:px-3 text-[10px] sm:text-xs cursor-pointer"
            >
              <ArrowDownTrayIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1 sm:mr-1.5" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Mobile-optimized Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4"
        >
          <StatCard
            title="Total Revenue"
            value={data.overview.totalRevenue}
            growth={data.overview.revenueGrowth}
            icon={CurrencyEuroIcon}
            iconColor="text-green-600"
            bgColor="bg-green-50"
            format="currency"
          />
          <StatCard
            title="Total Orders"
            value={data.overview.totalOrders}
            growth={data.overview.ordersGrowth}
            icon={ShoppingBagIcon}
            iconColor="text-blue-600"
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Avg Order Value"
            value={data.overview.avgOrderValue}
            growth={data.overview.avgOrderGrowth}
            icon={BanknotesIcon}
            iconColor="text-purple-600"
            bgColor="bg-purple-50"
            format="currency"
          />
          <StatCard
            title="Total Customers"
            value={data.overview.totalCustomers}
            growth={data.overview.customerGrowth}
            icon={UsersIcon}
            iconColor="text-orange-600"
            bgColor="bg-orange-50"
          />
        </motion.div>

        {/* Professional Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Revenue Trend Chart */}
          <div className="xl:col-span-2">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-900">
                    Performance Trend
                  </CardTitle>
                  <Select
                    value={selectedMetric}
                    onValueChange={setSelectedMetric}
                  >
                    <SelectTrigger className="w-20 h-6 text-xs cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue</SelectItem>
                      <SelectItem value="orders">Orders</SelectItem>
                      <SelectItem value="visitors">Visitors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.timeSeriesData}>
                    <defs>
                      <linearGradient
                        id="colorRevenue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="date"
                      stroke="#64748b"
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={10}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Customer Segments */}
          <div>
            <Card className="border-0 shadow-sm bg-white h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Customer Segments
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col space-y-3">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie
                        data={data.customerSegments}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={50}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {data.customerSegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-1">
                    {data.customerSegments.map((segment) => (
                      <div
                        key={segment.segment}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          />
                          <span className="text-xs font-medium text-gray-700">
                            {segment.segment}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-900">
                            {segment.count}
                          </p>
                          <p className="text-xs text-gray-500">
                            {segment.percentage.toFixed(0)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile-optimized Top Products and Performance */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-3 sm:gap-6">
          {/* Top Products */}
          <div className="xl:col-span-3">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-[11px] sm:text-sm font-semibold text-gray-900">
                  Top Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {data.topProducts.length > 0 ? (
                  <div className="space-y-1.5 sm:space-y-2">
                    {data.topProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        whileHover={{ x: 2 }}
                        className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-1.5 sm:space-x-2 flex-1 min-w-0">
                          <Badge
                            variant="secondary"
                            className="text-[9px] sm:text-xs font-bold w-5 h-4 sm:w-6 sm:h-5 rounded text-center px-1 py-0.5 flex items-center justify-center flex-shrink-0"
                          >
                            {index + 1}
                          </Badge>
                          <div className="relative flex-shrink-0">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={20}
                              height={20}
                              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md object-cover"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] sm:text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-[8px] sm:text-xs text-gray-500 truncate">
                              {product.orders} orders • {product.stock} in stock
                            </p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-[10px] sm:text-sm font-semibold text-gray-900">
                            {formatPrice(product.revenue)}
                          </p>
                          <div
                            className={`flex items-center justify-end text-[9px] sm:text-xs ${
                              product.growth > 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {product.growth > 0 ? (
                              <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                            ) : (
                              <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                            )}
                            {product.growth > 0 ? "+" : ""}
                            {product.growth.toFixed(1)}%
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChartBarIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">
                      No product data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div>
            <Card className="border-0 shadow-sm bg-white h-full">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-[11px] sm:text-sm font-semibold text-gray-900">
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1.5 sm:space-y-2">
                  {[
                    {
                      label: "Page Views",
                      value: data.performanceMetrics.pageViews.toLocaleString(),
                      icon: EyeIcon,
                    },
                    {
                      label: "Visitors",
                      value:
                        data.performanceMetrics.uniqueVisitors.toLocaleString(),
                      icon: UsersIcon,
                    },
                    {
                      label: "Bounce Rate",
                      value: `${data.performanceMetrics.bounceRate}%`,
                      icon: ExclamationTriangleIcon,
                    },
                    {
                      label: "Avg Session",
                      value: `${data.performanceMetrics.avgSessionDuration}m`,
                      icon: ClockIcon,
                    },
                    {
                      label: "Return Rate",
                      value: `${data.performanceMetrics.returnCustomerRate.toFixed(1)}%`,
                      icon: ArrowTrendingUpIcon,
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-1.5 sm:space-x-2 flex-1 min-w-0">
                        <metric.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 flex-shrink-0" />
                        <span className="text-[9px] sm:text-xs font-medium text-gray-700 truncate">
                          {metric.label}
                        </span>
                      </div>
                      <span className="text-[9px] sm:text-xs font-semibold text-gray-900 flex-shrink-0">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Mobile-optimized Geographic and Device Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {/* Geographic Distribution */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-[11px] sm:text-sm font-semibold text-gray-900">
                Sales by Country
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-1.5 sm:space-y-2">
                {data.geographicData.map((country) => (
                  <div
                    key={country.country}
                    className="flex items-center justify-between p-1.5 sm:p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-1.5 sm:space-x-2 flex-1 min-w-0">
                      <MapPinIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-600 flex-shrink-0" />
                      <span className="text-[10px] sm:text-sm font-medium text-gray-900 truncate">
                        {country.country}
                      </span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] sm:text-sm font-semibold text-gray-900">
                        {formatPrice(country.revenue)}
                      </p>
                      <p className="text-[8px] sm:text-xs text-gray-500">
                        {country.orders} orders ({country.percentage}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Device Analytics */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-[11px] sm:text-sm font-semibold text-gray-900">
                Traffic by Device
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={data.deviceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis
                    dataKey="device"
                    stroke="#64748b"
                    fontSize={8}
                    tick={{ fontSize: 8 }}
                  />
                  <YAxis stroke="#64748b" fontSize={8} tick={{ fontSize: 8 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="visitors"
                    fill="#3b82f6"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                {data.deviceData.map((device) => {
                  const IconComponent =
                    device.device === "Desktop"
                      ? ComputerDesktopIcon
                      : device.device === "Mobile"
                        ? DevicePhoneMobileIcon
                        : DeviceTabletIcon;

                  return (
                    <div
                      key={device.device}
                      className="text-center p-1.5 sm:p-2 bg-gray-50 rounded-lg"
                    >
                      <IconComponent className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 mx-auto mb-0.5 sm:mb-1" />
                      <p className="text-[9px] sm:text-xs font-medium text-gray-900">
                        {device.device}
                      </p>
                      <p className="text-[8px] sm:text-xs text-gray-500">
                        {device.conversion.toFixed(1)}% conv.
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mobile-optimized Recommendations */}
        {data.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="text-[11px] sm:text-sm font-semibold text-gray-900">
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {data.recommendations.map((recommendation, index) => (
                    <RecommendationCard
                      key={index}
                      recommendation={recommendation}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
