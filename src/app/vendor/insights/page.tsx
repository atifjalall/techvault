/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyEuroIcon,
  ShoppingBagIcon,
  UsersIcon,
  EyeIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
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

// UI Components
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

// Compact Stats Card Component - matching dashboard style
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
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-600">{title}</p>
              <p className="text-xl font-bold text-gray-900">
                {formatValue(value)}
              </p>
              {growth !== undefined && (
                <div className="flex items-center space-x-1">
                  {isPositive ? (
                    <ArrowUpIcon className="h-3 w-3 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {growth.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>
              )}
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

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="border-0 shadow-sm bg-white">
        <CardContent className="p-3">
          <p className="text-xs font-medium text-gray-900 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}:{" "}
              {entry.name === "Revenue" || entry.name === "revenue"
                ? formatPrice(entry.value)
                : entry.value.toLocaleString()}
            </p>
          ))}
        </CardContent>
      </Card>
    );
  }
  return null;
};

// Recommendation Card
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

  const getImpactColor = () => {
    switch (recommendation.impact) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const Icon = getIcon();

  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardContent className="p-3">
        <div className="flex items-start space-x-2">
          <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-xs font-medium text-gray-900">
                {recommendation.title}
              </h4>
              <Badge className={`text-xs px-1.5 py-0.5 ${getImpactColor()}`}>
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
                className="text-xs h-6 px-2 cursor-pointer"
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

// Consistent Loading Skeletons - matching dashboard style
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="w-10 h-10 rounded-lg" />
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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-7 w-20" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Skeleton className="h-[280px] w-full" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <Card className="border-0 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <Skeleton className="w-6 h-5" />
                <Skeleton className="w-8 h-8 rounded-md" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="text-right space-y-1">
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

export default function VendorInsightsDashboard() {
  const { data: session } = useSession();
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // Load insights data from API
  useEffect(() => {
    const loadInsights = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/vendor/insights?range=${timeRange}`);

        if (!response.ok) {
          // Provide default data if API doesn't exist
          if (response.status === 404) {
            const defaultData: InsightsData = {
              overview: {
                totalRevenue: 45678.9,
                revenueGrowth: 15.3,
                totalOrders: 234,
                ordersGrowth: 8.7,
                avgOrderValue: 195.23,
                avgOrderGrowth: 6.2,
                conversionRate: 3.4,
                conversionGrowth: 0.8,
                totalCustomers: 156,
                customerGrowth: 12.1,
                totalProducts: 89,
                activeProducts: 67,
              },
              timeSeriesData: [
                {
                  date: "Jan 1",
                  revenue: 3400,
                  orders: 18,
                  visitors: 450,
                  conversion: 4.0,
                },
                {
                  date: "Jan 8",
                  revenue: 4200,
                  orders: 22,
                  visitors: 520,
                  conversion: 4.2,
                },
                {
                  date: "Jan 15",
                  revenue: 3800,
                  orders: 20,
                  visitors: 480,
                  conversion: 4.1,
                },
                {
                  date: "Jan 22",
                  revenue: 5100,
                  orders: 28,
                  visitors: 650,
                  conversion: 4.3,
                },
                {
                  date: "Jan 29",
                  revenue: 4600,
                  orders: 24,
                  visitors: 580,
                  conversion: 4.1,
                },
              ],
              topProducts: [
                {
                  id: "1",
                  name: "iPhone 15 Pro Max",
                  image: "/api/placeholder/32/32",
                  revenue: 12450.0,
                  orders: 42,
                  growth: 23.5,
                  stock: 15,
                },
                {
                  id: "2",
                  name: "MacBook Pro M3",
                  image: "/api/placeholder/32/32",
                  revenue: 8900.0,
                  orders: 18,
                  growth: 15.2,
                  stock: 8,
                },
                {
                  id: "3",
                  name: "AirPods Pro",
                  image: "/api/placeholder/32/32",
                  revenue: 5600.0,
                  orders: 28,
                  growth: -5.1,
                  stock: 45,
                },
              ],
              customerSegments: [
                {
                  segment: "New",
                  count: 67,
                  revenue: 15600,
                  percentage: 43,
                  color: "#3b82f6",
                },
                {
                  segment: "Returning",
                  count: 89,
                  revenue: 30078,
                  percentage: 57,
                  color: "#10b981",
                },
              ],
              geographicData: [
                {
                  country: "Germany",
                  orders: 156,
                  revenue: 32450,
                  percentage: 45,
                },
                {
                  country: "Austria",
                  orders: 89,
                  revenue: 18900,
                  percentage: 28,
                },
                {
                  country: "Switzerland",
                  orders: 67,
                  revenue: 15600,
                  percentage: 27,
                },
              ],
              deviceData: [
                {
                  device: "Desktop",
                  visitors: 1250,
                  orders: 89,
                  conversion: 7.1,
                  color: "#3b82f6",
                },
                {
                  device: "Mobile",
                  visitors: 2100,
                  orders: 134,
                  conversion: 6.4,
                  color: "#10b981",
                },
                {
                  device: "Tablet",
                  visitors: 450,
                  orders: 11,
                  conversion: 2.4,
                  color: "#f59e0b",
                },
              ],
              performanceMetrics: {
                pageViews: 15678,
                uniqueVisitors: 3800,
                bounceRate: 42.3,
                avgSessionDuration: 4.2,
                returnCustomerRate: 34.5,
                customerLifetimeValue: 285.5,
              },
              recommendations: [
                {
                  type: "opportunity",
                  title: "Optimize Mobile Experience",
                  description:
                    "Mobile conversion rate is 10% lower than desktop. Consider improving mobile checkout flow.",
                  impact: "high",
                  actionable: true,
                },
                {
                  type: "warning",
                  title: "Low Stock Alert",
                  description:
                    "iPhone 15 Pro Max has only 15 units left in stock but high demand.",
                  impact: "medium",
                  actionable: true,
                },
              ],
            };
            setData(defaultData);
            return;
          }
          throw new Error("Failed to fetch insights data");
        }

        const result = await response.json();

        if (result.success) {
          setData(result.data);
        } else {
          throw new Error(result.error || "Failed to load insights data");
        }
      } catch (error) {
        console.error("Error loading insights:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load insights data"
        );
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Insights</h1>
              <p className="text-sm text-gray-600">
                Analytics and performance metrics for your store
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-20" />
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
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <Skeleton className="h-[160px] w-full rounded-full mx-auto" />
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-2">
                            <Skeleton className="w-2 h-2 rounded-full" />
                            <Skeleton className="h-3 w-16" />
                          </div>
                          <div className="space-y-1">
                            <Skeleton className="h-3 w-8" />
                            <Skeleton className="h-3 w-10" />
                          </div>
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
                  <Skeleton className="h-5 w-24" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-2">
                          <Skeleton className="w-4 h-4" />
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
        <div className="p-6">
          <div className="text-center py-32">
            <ExclamationTriangleIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Unable to load insights
            </h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50">
      <div className="p-6 space-y-6">
        {/* Header - matching dashboard style */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Insights</h1>
            <p className="text-sm text-gray-600">
              Analytics and performance metrics for your store
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-28 h-8 bg-white border-gray-200 text-xs cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
                <SelectItem value="90d">3 months</SelectItem>
                <SelectItem value="1y">1 year</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white h-8 px-3 text-xs cursor-pointer"
            >
              <ArrowDownTrayIcon className="w-3 h-3 mr-1.5" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid - compact style matching dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
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

        {/* Charts Section - compact layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Revenue Trend Chart */}
          <div className="xl:col-span-2">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-gray-900">
                    Revenue Trend
                  </CardTitle>
                  <Select
                    value={selectedMetric}
                    onValueChange={setSelectedMetric}
                  >
                    <SelectTrigger className="w-24 h-7 text-xs cursor-pointer">
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
                <ResponsiveContainer width="100%" height={280}>
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
                          stopColor="#0f172a"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0f172a"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={10} />
                    <YAxis stroke="#64748b" fontSize={10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey={selectedMetric}
                      stroke="#0f172a"
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
                <div className="flex flex-col space-y-4">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={data.customerSegments}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="count"
                      >
                        {data.customerSegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="space-y-2">
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
                            {segment.percentage}%
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

        {/* Top Products and Performance */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Top Products */}
          <div className="xl:col-span-3">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Top Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {data.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {data.topProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        whileHover={{ x: 2 }}
                        className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <Badge
                            variant="secondary"
                            className="text-xs font-bold w-6 h-5 rounded text-center p-0"
                          >
                            {index + 1}
                          </Badge>
                          <div className="relative">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={32}
                              height={32}
                              className="rounded-md object-cover"
                            />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.orders} orders • {product.stock} in stock
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatPrice(product.revenue)}
                          </p>
                          <div
                            className={`flex items-center justify-end text-xs ${
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
                  <div className="text-center py-6">
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
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
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
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <metric.icon className="w-4 h-4 text-gray-600" />
                        <span className="text-xs font-medium text-gray-700">
                          {metric.label}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-gray-900">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Geographic and Device Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Geographic Distribution */}
          <Card className="border-0 shadow-sm bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Sales by Country
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {data.geographicData.map((country) => (
                  <div
                    key={country.country}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-2">
                      <MapPinIcon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-900">
                        {country.country}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        {formatPrice(country.revenue)}
                      </p>
                      <p className="text-xs text-gray-500">
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
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-900">
                Traffic by Device
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.deviceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="device" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="visitors"
                    fill="#0f172a"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>

              <div className="grid grid-cols-3 gap-3 mt-4">
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
                      className="text-center p-2 bg-gray-50 rounded-lg"
                    >
                      <IconComponent className="w-5 h-5 text-gray-600 mx-auto mb-1" />
                      <p className="text-xs font-medium text-gray-900">
                        {device.device}
                      </p>
                      <p className="text-xs text-gray-500">
                        {device.conversion}% conv.
                      </p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        {data.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-900">
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
