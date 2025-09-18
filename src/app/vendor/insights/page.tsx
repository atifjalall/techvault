/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CurrencyEuroIcon,
  ShoppingBagIcon,
  UsersIcon,
  EyeIcon,
  ClockIcon,
  StarIcon,
  MapPinIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  InformationCircleIcon,
  BanknotesIcon,
  PresentationChartLineIcon,
  AdjustmentsHorizontalIcon,
  ChartPieIcon,
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  FireIcon,
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

// Shadcn/UI Components
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
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

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

// Clean Metric Card Component
function MetricCard({
  title,
  value,
  growth,
  icon: Icon,
  color = "slate",
  format = "number",
  delay = 0,
}: {
  title: string;
  value: number;
  growth?: number;
  icon: React.ElementType;
  color?: string;
  format?: "number" | "currency" | "percentage";
  delay?: number;
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

  const isPositiveGrowth = growth && growth > 0;
  const isNegativeGrowth = growth && growth < 0;

  const colorClasses = {
    slate: "bg-gradient-to-br from-slate-50 to-slate-100 text-slate-600",
    emerald:
      "bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600",
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600",
    violet: "bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
              <p className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">
                {formatValue(value)}
              </p>

              {growth !== undefined && (
                <div
                  className={`flex items-center text-sm font-medium ${
                    isPositiveGrowth
                      ? "text-emerald-600"
                      : isNegativeGrowth
                        ? "text-rose-600"
                        : "text-slate-500"
                  }`}
                >
                  {isPositiveGrowth && (
                    <ArrowTrendingUpIcon className="w-3 h-3 mr-1" />
                  )}
                  {isNegativeGrowth && (
                    <ArrowTrendingDownIcon className="w-3 h-3 mr-1" />
                  )}
                  {growth > 0 ? "+" : ""}
                  {growth.toFixed(1)}%
                  <span className="text-slate-400 ml-1 text-xs">
                    vs last month
                  </span>
                </div>
              )}
            </div>

            <div
              className={`p-3 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} shadow-sm`}
            >
              <Icon className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Top Products Component
function TopProductsTable({
  products,
}: {
  products: InsightsData["topProducts"];
}) {
  return (
    <div className="space-y-3">
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl hover:bg-slate-100/50 transition-all duration-200"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="flex items-center space-x-4">
            <Badge
              variant="secondary"
              className="text-xs font-bold w-8 h-6 rounded-md"
            >
              #{index + 1}
            </Badge>
            <div className="relative">
              <Image
                src={product.image}
                alt={product.name}
                width={48}
                height={48}
                className="rounded-lg object-cover"
              />
            </div>
            <div>
              <p className="font-medium text-slate-900 text-sm">
                {product.name}
              </p>
              <p className="text-xs text-slate-500">
                {product.orders} orders • {product.stock} in stock
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="font-bold text-slate-900 text-sm">
              {formatPrice(product.revenue)}
            </p>
            <div
              className={`flex items-center justify-end text-xs ${
                product.growth > 0 ? "text-emerald-600" : "text-rose-600"
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
  );
}

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <Card className="shadow-lg border-slate-200">
        <CardContent className="p-4">
          <p className="font-medium text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
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

  const getVariant = () => {
    switch (recommendation.type) {
      case "opportunity":
        return "default";
      case "warning":
        return "secondary";
      case "success":
        return "outline";
      default:
        return "secondary";
    }
  };

  const getImpactVariant = () => {
    switch (recommendation.impact) {
      case "high":
        return "destructive";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "secondary";
    }
  };

  const Icon = getIcon();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0 text-slate-600" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-sm">{recommendation.title}</h4>
                <Badge variant={getImpactVariant()} className="text-xs">
                  {recommendation.impact} impact
                </Badge>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                {recommendation.description}
              </p>
              {recommendation.actionable && (
                <Button variant="ghost" size="sm" className="text-xs h-8 px-3">
                  Take Action →
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Loading Skeletons
function MetricsSkeletons() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="border-0 shadow-sm bg-white/80">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-12 w-12 rounded-2xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartSkeletons() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
      <Card className="border-0 shadow-sm bg-white/80">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm bg-white/80">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <Skeleton className="h-[200px] w-full rounded-full" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-3 h-3 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <Skeleton className="h-10 w-64 mb-2" />
              <Skeleton className="h-6 w-96" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-36" />
            </div>
          </motion.div>

          <MetricsSkeletons />
          <ChartSkeletons />

          {/* Additional Skeletons */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-2 border-0 shadow-sm bg-white/80">
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl"
                    >
                      <div className="flex items-center space-x-4">
                        <Skeleton className="w-8 h-6" />
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <div className="text-right">
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white/80">
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl"
                    >
                      <div className="flex items-center space-x-3">
                        <Skeleton className="w-5 h-5" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100/50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-32">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ExclamationTriangleIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Unable to load insights
              </h3>
              <p className="text-slate-500 mb-6">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                Try Again
              </Button>
            </motion.div>
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
        {/* Header Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Business Insights
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Real-time analytics and performance metrics for your store
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36 h-9 bg-white/80 border-slate-200 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>

            {/* Export Button */}
            <Button
              size="sm"
              className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-4 text-sm"
            >
              <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Revenue"
            value={data.overview.totalRevenue}
            growth={data.overview.revenueGrowth}
            icon={CurrencyEuroIcon}
            color="emerald"
            format="currency"
            delay={0.1}
          />
          <MetricCard
            title="Total Orders"
            value={data.overview.totalOrders}
            growth={data.overview.ordersGrowth}
            icon={ShoppingBagIcon}
            color="blue"
            delay={0.2}
          />
          <MetricCard
            title="Avg Order Value"
            value={data.overview.avgOrderValue}
            growth={data.overview.avgOrderGrowth}
            icon={BanknotesIcon}
            color="violet"
            format="currency"
            delay={0.3}
          />
          <MetricCard
            title="Total Customers"
            value={data.overview.totalCustomers}
            growth={data.overview.customerGrowth}
            icon={UsersIcon}
            color="slate"
            delay={0.4}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">
          {/* Revenue Trend Chart */}
          <div className="xl:col-span-2">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold text-slate-900">
                    Revenue Trend
                  </CardTitle>
                  <Select
                    value={selectedMetric}
                    onValueChange={setSelectedMetric}
                  >
                    <SelectTrigger className="w-28 h-8 text-sm">
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
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
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
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
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

                  <div className="space-y-3">
                    {data.customerSegments.map((segment, index) => (
                      <div
                        key={segment.segment}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: segment.color }}
                          />
                          <span className="text-xs font-medium text-slate-700">
                            {segment.segment}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-slate-900">
                            {segment.count}
                          </p>
                          <p className="text-[10px] text-slate-500">
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

        {/* Additional Analytics */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 mb-6">
          {/* Top Products */}
          <div className="xl:col-span-3">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Top Performing Products
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {data.topProducts.length > 0 ? (
                  <div className="space-y-2">
                    {data.topProducts.map((product, index) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors"
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
                            <p className="font-medium text-slate-900 text-sm">
                              {product.name}
                            </p>
                            <p className="text-xs text-slate-500">
                              {product.orders} orders
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-slate-900 text-sm">
                            {formatPrice(product.revenue)}
                          </p>
                          <div
                            className={`flex items-center justify-end text-xs ${
                              product.growth > 0
                                ? "text-emerald-600"
                                : "text-rose-600"
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ChartBarIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-slate-500 text-sm">
                      No product data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics */}
          <div>
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-slate-900">
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
                  ].map((metric, index) => (
                    <div
                      key={metric.label}
                      className="flex items-center justify-between p-2 bg-slate-50/50 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <metric.icon className="w-4 h-4 text-slate-600" />
                        <span className="text-xs font-medium text-slate-700">
                          {metric.label}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-900">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Revenue vs Orders Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-slate-900">
                  Revenue vs Orders
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-slate-900 rounded"></div>
                    <span className="text-sm text-slate-600">Revenue</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-slate-400 rounded"></div>
                    <span className="text-sm text-slate-600">Orders</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis
                    yAxisId="revenue"
                    orientation="left"
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis
                    yAxisId="orders"
                    orientation="right"
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    yAxisId="revenue"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#0f172a"
                    strokeWidth={3}
                    dot={{ fill: "#0f172a", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    yAxisId="orders"
                    type="monotone"
                    dataKey="orders"
                    stroke="#94a3b8"
                    strokeWidth={3}
                    dot={{ fill: "#94a3b8", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Geographic Distribution and Device Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Geographic Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">
                  Sales by Country
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.geographicData.map((country, index) => (
                    <motion.div
                      key={country.country}
                      className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex items-center space-x-3">
                        <MapPinIcon className="w-4 h-4 text-slate-600" />
                        <span className="font-medium text-slate-900">
                          {country.country}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">
                          {formatPrice(country.revenue)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {country.orders} orders ({country.percentage}%)
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Device Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">
                  Traffic by Device
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.deviceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="device" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="visitors"
                      fill="#0f172a"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>

                <Separator className="my-4" />

                <div className="grid grid-cols-3 gap-4">
                  {data.deviceData.map((device, index) => {
                    const IconComponent =
                      device.device === "Desktop"
                        ? ComputerDesktopIcon
                        : device.device === "Mobile"
                          ? DevicePhoneMobileIcon
                          : DeviceTabletIcon;

                    return (
                      <motion.div
                        key={device.device}
                        className="text-center p-3 bg-slate-50/50 rounded-xl"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <IconComponent className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                        <p className="text-sm font-medium text-slate-900">
                          {device.device}
                        </p>
                        <p className="text-xs text-slate-500">
                          {device.conversion}% conv.
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Conversion Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm mb-8">
            <CardHeader>
              <CardTitle className="text-lg text-slate-900">
                Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    stage: "Visitors",
                    count: data.performanceMetrics.uniqueVisitors,
                    percentage: 100,
                    color: "bg-slate-200",
                  },
                  {
                    stage: "Product Views",
                    count: Math.floor(
                      data.performanceMetrics.uniqueVisitors * 0.6
                    ),
                    percentage: 60,
                    color: "bg-slate-300",
                  },
                  {
                    stage: "Add to Cart",
                    count: Math.floor(
                      data.performanceMetrics.uniqueVisitors * 0.15
                    ),
                    percentage: 15,
                    color: "bg-slate-400",
                  },
                  {
                    stage: "Checkout",
                    count: Math.floor(
                      data.performanceMetrics.uniqueVisitors * 0.08
                    ),
                    percentage: 8,
                    color: "bg-slate-600",
                  },
                  {
                    stage: "Orders",
                    count: data.overview.totalOrders,
                    percentage: Math.floor(
                      (data.overview.totalOrders /
                        data.performanceMetrics.uniqueVisitors) *
                        100
                    ),
                    color: "bg-slate-900",
                  },
                ].map((step, index) => (
                  <motion.div
                    key={step.stage}
                    className="flex items-center justify-between p-4 bg-slate-50/50 rounded-xl"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-16 text-center">
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">
                          {step.stage}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress
                            value={step.percentage}
                            className="flex-1 h-2"
                          />
                          <span className="text-xs text-slate-500 w-12">
                            {step.percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">
                        {step.count.toLocaleString()}
                      </p>
                      {index > 0 && (
                        <p className="text-xs text-slate-500">
                          -{(100 - step.percentage).toFixed(0)}% drop
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Smart Recommendations */}
        {data.recommendations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm mb-8">
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">
                  Smart Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Quick Actions Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Quick Actions
                  </h3>
                  <p className="text-sm text-slate-600">
                    Optimize your store performance with these tools
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    className="bg-white/80 border-slate-200"
                  >
                    <AdjustmentsHorizontalIcon className="w-4 h-4 mr-2" />
                    Customize
                  </Button>

                  <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                    <PresentationChartLineIcon className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </div>
              </div>

              {/* Key Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                  className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 border border-emerald-200 rounded-xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <BanknotesIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-900">
                        Revenue Growth
                      </p>
                      <p className="text-xs text-emerald-700">
                        {data.overview.revenueGrowth > 0 ? "+" : ""}
                        {data.overview.revenueGrowth.toFixed(1)}% this month
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 border border-blue-200 rounded-xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UsersIcon className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        New Customers
                      </p>
                      <p className="text-xs text-blue-700">
                        {data.overview.totalCustomers} acquired this month
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  className="p-4 bg-gradient-to-r from-violet-50 to-violet-100/50 border border-violet-200 rounded-xl"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 1.2 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-violet-100 rounded-lg">
                      <FireIcon className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-900">
                        Best Seller
                      </p>
                      <p className="text-xs text-violet-700">
                        {data.topProducts[0]?.name || "No data"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
